import React, { useState } from 'react';
import { 
  PrinterIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
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

  const handlePrintReceipt = async (documentId: number) => {
    const receipt = documents.find(doc => doc.document_id === documentId);
    if (receipt) {
      try {
        const receiptElements = parseReceiptData(receipt.data);
        
        // Create a temporary container to render the receipt content
        const tempContainer = document.createElement('div');
        tempContainer.style.fontFamily = defaultOptions.fontFamily || 'monospace';
        tempContainer.style.fontSize = `${defaultOptions.fontSize}px`;
        tempContainer.style.lineHeight = '1.2';
        tempContainer.style.width = `${defaultOptions.width}px`;
        
        // Render each element as HTML
        const renderElementToHTML = async (element: any): Promise<string> => {
          switch (element.type) {
            case 'text':
              const textAlign = element.align === 'center' ? 'center' : 
                              element.align === 'right' ? 'right' : 
                              element.align === 'justify' ? 'justify' : 'left';
              return `<div style="text-align: ${textAlign}; ${element.flex ? `flex: ${element.flex};` : ''}">${element.text || ''}</div>`;
            
            case 'row':
              const childrenHTML = await Promise.all(
                (element.children || []).map(async (child: any) => 
                  `<div style="${child.flex ? `flex: ${child.flex};` : ''}">${await renderElementToHTML(child)}</div>`
                )
              );
              return `<div style="display: flex; gap: 4px;">${childrenHTML.join('')}</div>`;
            
            case 'horizontalline':
              return '<div style="border-top: 1px dashed #666; margin: 8px 0; width: 100%;"></div>';
            
            case 'pagebreak':
              return '<div style="page-break-after: always; margin: 16px 0; border-top: 2px solid #444;"></div>';
            
            case 'barcode':
              if (element.barcode_type === 'qrcode') {
                try {
                  // Generate QR code as data URL
                  const qrDataURL = await QRCode.toDataURL(element.code, {
                    width: 120,
                    margin: 1,
                    color: {
                      dark: '#000000',
                      light: '#FFFFFF'
                    }
                  });
                  return `<div style="text-align: center; margin: 8px 0;">
                    <img src="${qrDataURL}" alt="QR Code" style="width: 120px; height: 120px;" />
                  </div>`;
                } catch (qrError) {
                  console.error('Failed to generate QR code:', qrError);
                  // Fallback to text representation
                  return `<div style="text-align: center; margin: 8px 0; padding: 10px; border: 1px solid #ccc; background: #f9f9f9;">
                    <div style="font-size: 10px; margin-bottom: 4px;">QR Code (Failed to Generate)</div>
                    <div style="font-family: monospace; font-size: 8px;">${element.code}</div>
                  </div>`;
                }
              } else {
                try {
                  // Generate other barcode types using jsbarcode
                  const canvas = document.createElement('canvas');
                  
                  // Map barcode types to jsbarcode formats
                  const formatMap: { [key: string]: string } = {
                    'code128': 'CODE128',
                    'code39': 'CODE39',
                    'ean13': 'EAN13',
                    'ean8': 'EAN8',
                    'upc': 'UPC',
                    'upca': 'UPC',
                    'upce': 'UPCE',
                    'itf': 'ITF',
                    'itf14': 'ITF14',
                    'msi': 'MSI',
                    'pharmacode': 'pharmacode',
                    'codabar': 'codabar'
                  };

                  const format = formatMap[element.barcode_type.toLowerCase()] || 'CODE128';

                  JsBarcode(canvas, element.code, {
                    format: format,
                    width: 2,
                    height: 50,
                    displayValue: true,
                    fontSize: 14,
                    textAlign: 'center',
                    textPosition: 'bottom',
                    textMargin: 2,
                    fontOptions: '',
                    font: 'monospace',
                    background: '#ffffff',
                    lineColor: '#000000',
                    margin: 5
                  });

                  const barcodeDataURL = canvas.toDataURL();
                  return `<div style="text-align: center; margin: 8px 0;">
                    <img src="${barcodeDataURL}" alt="${element.barcode_type} Barcode" style="max-width: 250px; height: auto;" />
                  </div>`;
                } catch (barcodeError) {
                  console.error('Failed to generate barcode:', barcodeError);
                  // Fallback to text representation
                  return `<div style="text-align: center; margin: 8px 0; padding: 8px; border: 1px solid #ccc; background: #f9f9f9;">
                    <div style="font-size: 10px; margin-bottom: 4px;">${element.barcode_type.toUpperCase()} (Failed to Generate)</div>
                    <div style="font-family: monospace; background: white; padding: 4px; border: 1px solid #ddd;">${element.code}</div>
                  </div>`;
                }
              }
            
            case 'picture':
              return `<div style="text-align: center; margin: 8px 0;">
                <img src="${element.url}" alt="Receipt Image" style="max-width: 100%; max-height: 100px;" onerror="this.style.display='none'; this.nextSibling.style.display='block';" />
                <div style="display: none; padding: 16px; background: #f3f4f6; border: 1px solid #d1d5db; text-align: center; color: #6b7280; font-size: 12px;">Image not available</div>
              </div>`;
            
            case 'sectionref':
              return `<div style="color: #6b7280; font-style: italic; font-size: 12px;">[Section: ${element.ref}]</div>`;
            
            case 'iterator':
              const iteratorHTML = await Promise.all(
                (element.rows || []).map(async (row: any) => await renderElementToHTML(row))
              );
              return `<div>${iteratorHTML.join('')}</div>`;
            
            default:
              return `<div style="color: #ef4444; font-size: 12px;">Unknown element type: ${element.type}</div>`;
          }
        };
        
        // Process all elements with async support
        const receiptHTMLElements = await Promise.all(
          receiptElements.map(async (element) => await renderElementToHTML(element))
        );
        const receiptHTML = receiptHTMLElements.join('');
        
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
                  font-family: ${defaultOptions.fontFamily || 'monospace'};
                  font-size: ${defaultOptions.fontSize}px;
                  line-height: 1.2;
                  margin: 0;
                  padding: 16px;
                  width: ${defaultOptions.width}px;
                  background: white;
                  word-break: break-word;
                }
                .receipt-container {
                  width: 100%;
                }
                @media print {
                  body { 
                    margin: 0; 
                    padding: 8px; 
                  }
                  @page {
                    margin: 0.5in;
                  }
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                ${receiptHTML}
              </div>
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.close();
                  }, 500);
                };
              </script>
            </body>
            </html>
          `);
          printWindow.document.close();
        }
      } catch (error) {
        console.error('Error generating receipt for printing:', error);
        alert('Error generating receipt for printing. Please try again.');
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
