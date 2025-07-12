import React, { useState } from 'react';
import { 
  PrinterIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { ReceiptElementRenderer } from './ReceiptElementRenderer';
import type { ReceiptElement, ReceiptRenderOptions } from '../../types/receipt';

interface ReceiptViewerProps {
  documents: Array<{
    document_id: number;
    data: string; // JSON string
  }>;
  className?: string;
  renderOptions?: ReceiptRenderOptions;
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  documents,
  className = '',
  renderOptions = {}
}) => {
  const [expandedReceipts, setExpandedReceipts] = useState<Set<number>>(new Set());
  const [selectedReceipt, setSelectedReceipt] = useState<number | null>(null);

  const defaultOptions: ReceiptRenderOptions = {
    width: 300,
    fontSize: 12,
    fontFamily: 'monospace',
    showBorders: false,
    backgroundColor: 'white',
    padding: 16,
    ...renderOptions
  };

  const parseReceiptData = (jsonString: string): ReceiptElement[] => {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Handle different possible JSON structures
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed.elements && Array.isArray(parsed.elements)) {
        return parsed.elements;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        return parsed.data;
      } else {
        console.warn('Unexpected receipt data structure:', parsed);
        return [];
      }
    } catch (error) {
      console.error('Failed to parse receipt JSON:', error, jsonString);
      return [];
    }
  };

  const toggleReceiptExpansion = (documentId: number) => {
    const newExpanded = new Set(expandedReceipts);
    if (newExpanded.has(documentId)) {
      newExpanded.delete(documentId);
    } else {
      newExpanded.add(documentId);
    }
    setExpandedReceipts(newExpanded);
  };

  const handlePrintReceipt = (documentId: number) => {
    const receipt = documents.find(doc => doc.document_id === documentId);
    if (receipt) {
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Receipt ${documentId}</title>
            <style>
              body {
                font-family: monospace;
                font-size: 12px;
                line-height: 1.2;
                margin: 0;
                padding: 16px;
                width: ${defaultOptions.width}px;
                background: white;
              }
              .receipt-container {
                width: 100%;
              }
              @media print {
                body { margin: 0; padding: 8px; }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container" id="receipt-content">
              Loading receipt...
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              };
            </script>
          </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleCopyReceipt = async (documentId: number) => {
    const receipt = documents.find(doc => doc.document_id === documentId);
    if (receipt) {
      try {
        await navigator.clipboard.writeText(receipt.data);
        alert('Receipt data copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy receipt data:', error);
        alert('Failed to copy receipt data');
      }
    }
  };

  const getReceiptTitle = (documentId: number, index: number) => {
    // Try to extract a meaningful title from the receipt data
    const receipt = documents.find(doc => doc.document_id === documentId);
    if (receipt) {
      const elements = parseReceiptData(receipt.data);
      const firstTextElement = elements.find(el => el.type === 'text') as any;
      if (firstTextElement && firstTextElement.text) {
        const title = firstTextElement.text.trim();
        if (title.length > 0 && title.length < 50) {
          return title;
        }
      }
    }
    return `Receipt ${index + 1}`;
  };

  if (!documents || documents.length === 0) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded-lg p-8 text-center ${className}`}>
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Receipts Available</h3>
        <p className="text-gray-500">No receipt documents found for this transaction.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Receipt Documents ({documents.length})
        </h3>
        {documents.length === 1 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePrintReceipt(documents[0].document_id)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </button>
            <button
              onClick={() => handleCopyReceipt(documents[0].document_id)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Copy JSON
            </button>
          </div>
        )}
      </div>

      {documents.map((document, index) => {
        const isExpanded = expandedReceipts.has(document.document_id);
        const receiptElements = parseReceiptData(document.data);
        const title = getReceiptTitle(document.document_id, index);

        return (
          <div
            key={document.document_id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
          >
            {/* Receipt Header */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleReceiptExpansion(document.document_id)}
                    className="flex items-center space-x-2 text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                    <span>{title}</span>
                  </button>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ID: {document.document_id}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedReceipt(selectedReceipt === document.document_id ? null : document.document_id)}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <EyeIcon className="h-3 w-3 mr-1" />
                    Preview
                  </button>
                  <button
                    onClick={() => handlePrintReceipt(document.document_id)}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PrinterIcon className="h-3 w-3 mr-1" />
                    Print
                  </button>
                  <button
                    onClick={() => handleCopyReceipt(document.document_id)}
                    className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs leading-4 font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <DocumentDuplicateIcon className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Receipt Content - Expanded View */}
            {isExpanded && (
              <div className="p-4">
                <div className="bg-gray-50 border border-gray-200 rounded p-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Receipt Elements:</h4>
                  <p className="text-xs text-gray-500">
                    {receiptElements.length} elements found
                  </p>
                </div>
                
                {/* Receipt Preview */}
                <div 
                  className="receipt-container border border-gray-300 bg-white p-4 rounded-lg"
                  style={{
                    width: `${defaultOptions.width}px`,
                    fontFamily: defaultOptions.fontFamily,
                    fontSize: `${defaultOptions.fontSize}px`,
                    backgroundColor: defaultOptions.backgroundColor,
                    margin: '0 auto'
                  }}
                >
                  {receiptElements.map((element, elementIndex) => (
                    <ReceiptElementRenderer
                      key={`${document.document_id}-element-${elementIndex}`}
                      element={element}
                      width={defaultOptions.width}
                      fontSize={defaultOptions.fontSize}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Receipt Preview Modal/Overlay */}
            {selectedReceipt === document.document_id && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-auto">
                  <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
                    <h3 className="text-lg font-medium">{title}</h3>
                    <button
                      onClick={() => setSelectedReceipt(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="p-4">
                    <div 
                      className="receipt-container bg-white border border-gray-200 p-4 rounded"
                      style={{
                        fontFamily: defaultOptions.fontFamily,
                        fontSize: `${defaultOptions.fontSize}px`,
                      }}
                    >
                      {receiptElements.map((element, elementIndex) => (
                        <ReceiptElementRenderer
                          key={`preview-${document.document_id}-element-${elementIndex}`}
                          element={element}
                          width={defaultOptions.width}
                          fontSize={defaultOptions.fontSize}
                        />
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        onClick={() => handlePrintReceipt(document.document_id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PrinterIcon className="h-4 w-4 mr-2" />
                        Print
                      </button>
                      <button
                        onClick={() => setSelectedReceipt(null)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ReceiptViewer;
