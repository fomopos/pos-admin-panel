import React, { useState } from 'react';
import { ReceiptViewer } from '../components/receipt';
import { Card, Button } from '../components/ui';

const ReceiptDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<number>(1);

  // Sample receipt data based on Flutter examples
  const sampleReceipts = [
    {
      document_id: 1,
      data: JSON.stringify([
        {
          type: 'text',
          text: 'FOMOPOS STORE',
          align: 'center'
        },
        {
          type: 'text',
          text: '123 Main Street, City, State 12345',
          align: 'center'
        },
        {
          type: 'text',
          text: 'Phone: (555) 123-4567',
          align: 'center'
        },
        {
          type: 'horizontalline'
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'Receipt #:',
              flex: 1
            },
            {
              type: 'text',
              text: 'TXN-001234',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'Date:',
              flex: 1
            },
            {
              type: 'text',
              text: '2024-01-15 14:30:25',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'Cashier:',
              flex: 1
            },
            {
              type: 'text',
              text: 'Alice Johnson',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'horizontalline'
        },
        {
          type: 'text',
          text: 'ITEMS PURCHASED',
          align: 'center'
        },
        {
          type: 'horizontalline'
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'Coffee - Large',
              flex: 2
            },
            {
              type: 'text',
              text: '$4.99',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: '  Qty: 2',
              flex: 2
            },
            {
              type: 'text',
              text: '$9.98',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'Muffin - Blueberry',
              flex: 2
            },
            {
              type: 'text',
              text: '$3.49',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'horizontalline'
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'Subtotal:',
              flex: 1
            },
            {
              type: 'text',
              text: '$13.47',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'Tax (8.5%):',
              flex: 1
            },
            {
              type: 'text',
              text: '$1.14',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'TOTAL:',
              flex: 1
            },
            {
              type: 'text',
              text: '$14.61',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'horizontalline'
        },
        {
          type: 'text',
          text: 'PAYMENT',
          align: 'center'
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'Cash:',
              flex: 1
            },
            {
              type: 'text',
              text: '$20.00',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'Change:',
              flex: 1
            },
            {
              type: 'text',
              text: '$5.39',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'horizontalline'
        },
        {
          type: 'text',
          text: 'Thank you for your business!',
          align: 'center'
        },
        {
          type: 'text',
          text: 'Visit us again soon',
          align: 'center'
        },
        {
          type: 'barcode',
          code: 'TXN001234',
          barcode_type: 'qrcode'
        }
      ])
    },
    {
      document_id: 2,
      data: JSON.stringify([
        {
          type: 'text',
          text: 'CUSTOMER COPY',
          align: 'center'
        },
        {
          type: 'horizontalline'
        },
        {
          type: 'text',
          text: 'FOMOPOS MARKET',
          align: 'center'
        },
        {
          type: 'text',
          text: 'Receipt Summary',
          align: 'center'
        },
        {
          type: 'horizontalline'
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'Transaction:',
              flex: 1
            },
            {
              type: 'text',
              text: 'TXN-001234',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'Items:',
              flex: 1
            },
            {
              type: 'text',
              text: '3',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'row',
          children: [
            {
              type: 'text',
              text: 'Total:',
              flex: 1
            },
            {
              type: 'text',
              text: '$14.61',
              align: 'right',
              flex: 1
            }
          ]
        },
        {
          type: 'horizontalline'
        },
        {
          type: 'text',
          text: 'Scan for details:',
          align: 'center'
        },
        {
          type: 'barcode',
          code: 'https://fomopos.com/receipt/TXN001234',
          barcode_type: 'qrcode'
        }
      ])
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Receipt Renderer Demo</h1>
          <p className="text-gray-600">Testing receipt document rendering from JSON data</p>
        </div>

        <div className="flex justify-center space-x-4 mb-8">
          <Button
            variant={activeDemo === 1 ? 'primary' : 'outline'}
            onClick={() => setActiveDemo(1)}
          >
            Full Receipt Demo
          </Button>
          <Button
            variant={activeDemo === 2 ? 'primary' : 'outline'}
            onClick={() => setActiveDemo(2)}
          >
            Multiple Receipts Demo
          </Button>
        </div>

        <Card className="p-6">
          {activeDemo === 1 && (
            <ReceiptViewer 
              documents={[sampleReceipts[0]]}
              renderOptions={{
                width: 320,
                fontSize: 12,
                fontFamily: 'monospace',
                showBorders: true
              }}
            />
          )}

          {activeDemo === 2 && (
            <ReceiptViewer 
              documents={sampleReceipts}
              renderOptions={{
                width: 300,
                fontSize: 11,
                fontFamily: 'monospace'
              }}
            />
          )}
        </Card>

        <Card className="p-6 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4">How it works:</h3>
          <ul className="space-y-2 text-sm">
            <li>• Receipt data is stored as JSON in the `documents` field of transactions</li>
            <li>• Each document contains an array of receipt elements (text, rows, barcodes, etc.)</li>
            <li>• The ReceiptViewer component parses and renders these elements</li>
            <li>• Supports multiple receipt types: customer copy, merchant copy, etc.</li>
            <li>• Includes print functionality and QR code generation</li>
            <li>• Fully responsive and customizable styling</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default ReceiptDemo;
