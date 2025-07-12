// Sample JSON data that would be returned from your backend API
// This demonstrates the exact format the ReceiptViewer expects

export const sampleTransactionWithReceipts = {
  "transaction_id": "TXN-123456789",
  "created_at": "2024-01-15T14:30:25.000Z",
  "trans_id": "TXN-123456789",
  "status": "completed",
  "total": "25.99",
  "sub_total": "23.60",
  "tax_total": "2.39",
  "store_currency": "USD",
  "documents": [
    {
      "document_id": 1,
      "created_at": "2024-01-15T14:30:25.000Z",
      "created_by": "system",
      "updated_at": null,
      "updated_by": null,
      "deleted_at": null,
      "tenant_id": "tenant_123",
      "store_id": "store_456",
      "terminal_id": "terminal_001",
      "trans_id": "TXN-123456789",
      "data": JSON.stringify([
        {
          "type": "text",
          "text": "FOMOPOS STORE",
          "align": "center"
        },
        {
          "type": "text",
          "text": "123 Main Street, City, State 12345",
          "align": "center"
        },
        {
          "type": "text",
          "text": "Phone: (555) 123-4567",
          "align": "center"
        },
        {
          "type": "horizontalline"
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Receipt #:",
              "flex": 1
            },
            {
              "type": "text",
              "text": "TXN-123456789",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Date:",
              "flex": 1
            },
            {
              "type": "text",
              "text": "2024-01-15 14:30:25",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Cashier:",
              "flex": 1
            },
            {
              "type": "text",
              "text": "Alice Johnson",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "horizontalline"
        },
        {
          "type": "text",
          "text": "ITEMS PURCHASED",
          "align": "center"
        },
        {
          "type": "horizontalline"
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Coffee - Large",
              "flex": 2
            },
            {
              "type": "text",
              "text": "$4.99",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "  Qty: 2",
              "flex": 2
            },
            {
              "type": "text",
              "text": "$9.98",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Muffin - Blueberry",
              "flex": 2
            },
            {
              "type": "text",
              "text": "$3.49",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Sandwich - Turkey",
              "flex": 2
            },
            {
              "type": "text",
              "text": "$8.99",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Chips - BBQ",
              "flex": 2
            },
            {
              "type": "text",
              "text": "$2.14",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "horizontalline"
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Subtotal:",
              "flex": 1
            },
            {
              "type": "text",
              "text": "$23.60",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Tax (8.5%):",
              "flex": 1
            },
            {
              "type": "text",
              "text": "$2.39",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "TOTAL:",
              "flex": 1
            },
            {
              "type": "text",
              "text": "$25.99",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "horizontalline"
        },
        {
          "type": "text",
          "text": "PAYMENT",
          "align": "center"
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Cash:",
              "flex": 1
            },
            {
              "type": "text",
              "text": "$30.00",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Change:",
              "flex": 1
            },
            {
              "type": "text",
              "text": "$4.01",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "horizontalline"
        },
        {
          "type": "text",
          "text": "Thank you for your business!",
          "align": "center"
        },
        {
          "type": "text",
          "text": "Visit us again soon",
          "align": "center"
        },
        {
          "type": "barcode",
          "code": "TXN123456789",
          "barcode_type": "qrcode"
        }
      ])
    },
    {
      "document_id": 2,
      "created_at": "2024-01-15T14:30:25.000Z",
      "created_by": "system",
      "updated_at": null,
      "updated_by": null,
      "deleted_at": null,
      "tenant_id": "tenant_123",
      "store_id": "store_456",
      "terminal_id": "terminal_001",
      "trans_id": "TXN-123456789",
      "data": JSON.stringify([
        {
          "type": "text",
          "text": "CUSTOMER COPY",
          "align": "center"
        },
        {
          "type": "horizontalline"
        },
        {
          "type": "text",
          "text": "FOMOPOS MARKET",
          "align": "center"
        },
        {
          "type": "text",
          "text": "Receipt Summary",
          "align": "center"
        },
        {
          "type": "horizontalline"
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Transaction:",
              "flex": 1
            },
            {
              "type": "text",
              "text": "TXN-123456789",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Items:",
              "flex": 1
            },
            {
              "type": "text",
              "text": "5",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "row",
          "children": [
            {
              "type": "text",
              "text": "Total:",
              "flex": 1
            },
            {
              "type": "text",
              "text": "$25.99",
              "align": "right",
              "flex": 1
            }
          ]
        },
        {
          "type": "horizontalline"
        },
        {
          "type": "text",
          "text": "Scan for details:",
          "align": "center"
        },
        {
          "type": "barcode",
          "code": "https://fomopos.com/receipt/TXN123456789",
          "barcode_type": "qrcode"
        }
      ])
    }
  ],
  // ... other transaction fields
};
