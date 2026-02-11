import React, { useState, useCallback, useEffect } from 'react';
import { 
  CogIcon, 
  DocumentTextIcon, 
  PlayIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
import { JsonViewerEditor, ResizablePanels, DropdownSearch, Button } from '../components/ui';
import { ReceiptViewer } from '../components/receipt';
import type { ReceiptElement } from '../types/receipt';

interface ReceiptBuilderProps {}

// Receipt builder helper functions (TypeScript version of Dart logic)
class ReceiptBuilderHelper {
  private static parseTemplate(template: string, data: any): string {
    const regex = /\{\{\s*([\w\.]+)((?:\s*\|\s*[\w]+(?::[^|}]+)?)*)\s*\}\}/g;

    return template.replace(regex, (match, path, operations) => {
      let value = this.resolvePath(data, path.split('.'));
      value = value ?? path;

      if (operations && operations.trim()) {
        const ops = operations
          .split('|')
          .map((op: string) => op.trim())
          .filter((op: string) => op);

        for (const op of ops) {
          const parts = op.split(':');
          const opName = parts[0];
          const opArg = parts.length > 1 ? parts[1] : null;

          switch (opName) {
            case 'default':
              if (value == null || value.toString() === '') {
                value = opArg;
              }
              break;

            case 'padLeft':
              const leftArgs = (opArg || '').split(',');
              const leftWidth = parseInt(leftArgs[0]);
              const leftPadChar = leftArgs.length > 1 ? leftArgs[1] : ' ';
              if (!isNaN(leftWidth) && value != null) {
                value = value.toString().padStart(leftWidth, leftPadChar);
              }
              break;

            case 'padRight':
              const rightArgs = (opArg || '').split(',');
              const rightWidth = parseInt(rightArgs[0]);
              const rightPadChar = rightArgs.length > 1 ? rightArgs[1] : ' ';
              if (!isNaN(rightWidth) && value != null) {
                value = value.toString().padEnd(rightWidth, rightPadChar);
              }
              break;

            case 'fit':
              const fitArgs = (opArg || '').split(',');
              const fitWidth = parseInt(fitArgs[0]);
              const align = fitArgs.length > 1 ? fitArgs[1] : 'left';
              if (!isNaN(fitWidth) && value != null) {
                let str = value.toString();
                if (str.length > fitWidth) {
                  value = str.substring(0, fitWidth);
                } else {
                  const pad = fitWidth - str.length;
                  switch (align) {
                    case 'right':
                      value = str.padStart(fitWidth);
                      break;
                    case 'center':
                      const left = Math.floor(pad / 2);
                      const right = pad - left;
                      value = ' '.repeat(left) + str + ' '.repeat(right);
                      break;
                    default: // left
                      value = str.padEnd(fitWidth);
                  }
                }
              }
              break;

            case 'format':
              if (opArg === 'datetime' && value) {
                try {
                  const date = new Date(value);
                  value = date.toLocaleString();
                } catch (e) {
                  // Keep original value if parsing fails
                }
              }
              break;
          }
        }
      }

      return value?.toString() || match;
    });
  }

  private static resolvePath(data: any, pathSegments: string[]): any {
    let current = data;
    for (const segment of pathSegments) {
      if (current && typeof current === 'object') {
        current = current[segment];
      } else {
        return null;
      }
    }
    return current;
  }

  static buildReceiptData(
    receiptConfig: any,
    data: any,
    allConfigs: Record<string, any> = {}
  ): ReceiptElement[] {
    const receiptElements: ReceiptElement[] = [];

    if (!receiptConfig.rows) {
      return receiptElements;
    }

    for (const element of receiptConfig.rows) {
      if (element.type === 'sectionref') {
        if (allConfigs[element.ref]) {
          const subSection = this.buildReceiptData(
            allConfigs[element.ref],
            data,
            allConfigs
          );
          receiptElements.push(...subSection);
        }
      } else if (element.type === 'text') {
        const evaluatedText = this.parseTemplate(element.text, data);
        receiptElements.push({
          type: 'text',
          text: evaluatedText,
          align: element.align,
          flex: element.flex,
        });
      } else if (element.type === 'iterator') {
        const dataList = this.resolvePath(data, element.path.split('.')) || [];
        if (Array.isArray(dataList)) {
          for (const item of dataList) {
            const elements = this.buildReceiptData(
              {
                type: 'section',
                conditions: [],
                rows: element.rows,
              },
              item,
              allConfigs
            );
            receiptElements.push(...elements);
          }
        }
      } else if (element.type === 'barcode') {
        const evaluatedCode = this.parseTemplate(element.code, data);
        receiptElements.push({
          type: 'barcode',
          code: evaluatedCode,
          barcode_type: element.barcode_type,
        });
      } else if (element.type === 'row') {
        const childElements = this.buildReceiptData(
          {
            type: 'section',
            conditions: [],
            rows: element.children,
          },
          data,
          allConfigs
        );
        receiptElements.push({
          type: 'row',
          children: childElements,
        });
      } else {
        receiptElements.push(element);
      }
    }
    return receiptElements;
  }

  static buildReceipt(
    receiptConfigKey: string,
    receiptConfigs: Record<string, any>,
    data: any
  ): ReceiptElement[] {
    if (!receiptConfigs[receiptConfigKey]) {
      console.warn(`Receipt config not found for key: ${receiptConfigKey}`);
      return [];
    }

    const receiptConfig = receiptConfigs[receiptConfigKey];
    return this.buildReceiptData(receiptConfig, data, receiptConfigs);
  }
}

const ReceiptBuilder: React.FC<ReceiptBuilderProps> = () => {
  const [receiptConfigJson, setReceiptConfigJson] = useState('');
  const [receiptDataJson, setReceiptDataJson] = useState('');
  const [selectedSection, setSelectedSection] = useState('StoreCopy');
  const [generatedReceipt, setGeneratedReceipt] = useState<ReceiptElement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isJsonValid, setIsJsonValid] = useState({ config: true, data: true });
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Load sample data on mount
  useEffect(() => {
    const loadSampleData = async () => {
      try {
        // Load sample receipt config
        const configResponse = await fetch('/receipt-config.json');
        const configData = await configResponse.json();
        setReceiptConfigJson(JSON.stringify(configData, null, 2));

        // Load sample receipt data
        const dataResponse = await fetch('/receipt-data.json');
        const dataData = await dataResponse.json();
        setReceiptDataJson(JSON.stringify(dataData, null, 2));
      } catch (error) {
        console.error('Failed to load sample data:', error);
        setError('Failed to load sample data');
      }
    };

    loadSampleData();
  }, []);

  // Validate JSON
  const validateJson = useCallback((jsonString: string, type: 'config' | 'data') => {
    try {
      JSON.parse(jsonString);
      setIsJsonValid(prev => ({ ...prev, [type]: true }));
      return true;
    } catch (e) {
      setIsJsonValid(prev => ({ ...prev, [type]: false }));
      return false;
    }
  }, []);

  // Handle JSON changes
  const handleConfigChange = useCallback((value: string) => {
    setReceiptConfigJson(value);
    validateJson(value, 'config');
  }, [validateJson]);

  const handleDataChange = useCallback((value: string) => {
    setReceiptDataJson(value);
    validateJson(value, 'data');
  }, [validateJson]);

  // Generate receipt
  const generateReceipt = useCallback(() => {
    setError(null);
    
    try {
      if (!isJsonValid.config || !isJsonValid.data) {
        throw new Error('Invalid JSON in config or data');
      }

      const receiptConfig = JSON.parse(receiptConfigJson);
      const receiptData = JSON.parse(receiptDataJson);

      const receipt = ReceiptBuilderHelper.buildReceipt(
        selectedSection,
        receiptConfig,
        receiptData
      );

      setGeneratedReceipt(receipt);
    } catch (error) {
      console.error('Failed to generate receipt:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate receipt');
      setGeneratedReceipt([]);
    }
  }, [receiptConfigJson, receiptDataJson, selectedSection, isJsonValid]);

  // Auto-generate when inputs change
  useEffect(() => {
    if (receiptConfigJson && receiptDataJson && isJsonValid.config && isJsonValid.data) {
      generateReceipt();
    }
  }, [receiptConfigJson, receiptDataJson, selectedSection, generateReceipt, isJsonValid]);

  // Get available sections from config
  const getAvailableSections = () => {
    try {
      if (!isJsonValid.config) return [];
      const config = JSON.parse(receiptConfigJson);
      return Object.keys(config);
    } catch {
      return [];
    }
  };

  // Get section options for DropdownSearch
  const getSectionOptions = () => {
    return getAvailableSections().map(section => ({
      id: section,
      label: section
    }));
  };

  // Toggle full screen mode
  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(prev => !prev);
  }, []);

  // Handle escape key to exit full screen
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullScreen) {
        setIsFullScreen(false);
      }
    };

    if (isFullScreen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when in full screen
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullScreen]);

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      <div className={`space-y-4 ${isFullScreen ? 'h-full flex flex-col p-4' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Receipt Builder</h1>
          <p className="text-sm text-gray-600">
            Build and preview receipts using JSON configuration
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <DropdownSearch
              label=""
              value={selectedSection}
              placeholder="Select section"
              options={getSectionOptions()}
              onSelect={(option) => setSelectedSection(option?.id || 'StoreCopy')}
              buttonClassName="!w-[512px] min-w-[512px] max-w-[512px]"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullScreen}
          >
            {isFullScreen ? (
              <>
                <ArrowsPointingInIcon className="h-4 w-4 mr-2" />
                Exit Full Screen
              </>
            ) : (
              <>
                <ArrowsPointingOutIcon className="h-4 w-4 mr-2" />
                Full Screen
              </>
            )}
          </Button>
          <button
            onClick={generateReceipt}
            disabled={!isJsonValid.config || !isJsonValid.data}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlayIcon className="h-4 w-4 mr-2" />
            Generate
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${isFullScreen ? 'lg:grid-cols-2 h-full' : 'lg:grid-cols-2'} gap-4 ${isFullScreen ? 'flex-1 overflow-hidden' : ''}`}>
        {/* JSON Editors Section */}
        <div className={`${isFullScreen ? 'flex-1 overflow-hidden flex flex-col' : ''}`}>
          {/* Resizable JSON Editors */}
          <ResizablePanels
            className={isFullScreen ? 'flex-1' : 'h-[700px]'}
            defaultSizes={[50, 50]}
            minSizes={[25, 25]}
            direction="vertical"
            isFullScreen={isFullScreen}
          >
            {/* Receipt Config */}
            <JsonViewerEditor
              value={receiptConfigJson}
              onChange={handleConfigChange}
              title="Receipt Configuration"
              icon={CogIcon}
              isFullScreen={isFullScreen}
              className="h-full"
              showActionsInHeader={true}
            />

            {/* Receipt Data */}
            <JsonViewerEditor
              value={receiptDataJson}
              onChange={handleDataChange}
              title="Receipt Data"
              icon={DocumentTextIcon}
              isFullScreen={isFullScreen}
              className="h-full"
              showActionsInHeader={true}
            />
          </ResizablePanels>
        </div>

        {/* Receipt Preview Section */}
        <div className={`bg-white shadow rounded-lg ${isFullScreen ? 'flex-1 flex flex-col' : ''}`}>
          <div className={`px-4 py-5 sm:p-6 ${isFullScreen ? 'flex-1 flex flex-col' : ''}`}>
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Receipt Preview ({selectedSection})
            </h3>
            
            {generatedReceipt.length > 0 ? (
              <div className={`border border-gray-200 rounded-lg p-4 overflow-auto ${isFullScreen ? 'flex-1' : 'max-h-screen'}`}>
                <ReceiptViewer
                  documents={[{
                    doc_id: '1',
                    doc_type: 'receipt',
                    data: JSON.stringify(generatedReceipt)
                  }]}
                  showCopyButton={true}
                  className="receipt-preview"
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Receipt Generated</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Configure your JSON and click Generate to preview the receipt.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated JSON Display */}
      {generatedReceipt.length > 0 && !isFullScreen && (
        <JsonViewerEditor
          value={JSON.stringify(generatedReceipt, null, 2)}
          onChange={() => {}} // Read-only
          title="Generated Receipt JSON"
          icon={DocumentTextIcon}
          isFullScreen={false}
          readOnly={true}
        />
      )}
      </div>
    </div>
  );
};

export default ReceiptBuilder;
