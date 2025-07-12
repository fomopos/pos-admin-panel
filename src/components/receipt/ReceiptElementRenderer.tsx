import React from 'react';
import type { ReceiptElement, TextElement, RowElement, BarcodeElement, PictureElement } from '../../types/receipt';
import { QRCodeSVG } from 'qrcode.react';

interface ReceiptElementRendererProps {
  element: ReceiptElement;
  width?: number;
  fontSize?: number;
}

export const ReceiptElementRenderer: React.FC<ReceiptElementRendererProps> = ({
  element,
  width = 300,
  fontSize = 12
}) => {
  const getTextAlign = (align?: string): React.CSSProperties['textAlign'] => {
    switch (align?.toLowerCase()) {
      case 'r':
      case 'right':
        return 'right';
      case 'c':
      case 'center':
        return 'center';
      case 'j':
      case 'justify':
        return 'justify';
      default:
        return 'left';
    }
  };

  const renderTextElement = (textElement: TextElement) => {
    return (
      <div
        key={`text-${Math.random()}`}
        className={`${textElement.flex ? 'flex-1' : ''}`}
        style={{
          textAlign: getTextAlign(textElement.align),
          fontSize: `${fontSize}px`,
          lineHeight: 1.2,
          wordBreak: 'break-word',
          flex: textElement.flex || undefined,
        }}
      >
        {textElement.text}
      </div>
    );
  };

  const renderRowElement = (rowElement: RowElement) => {
    return (
      <div
        key={`row-${Math.random()}`}
        className="flex w-full"
        style={{ gap: '4px' }}
      >
        {rowElement.children.map((child: ReceiptElement, index: number) => (
          <ReceiptElementRenderer
            key={`row-child-${index}`}
            element={child}
            width={width}
            fontSize={fontSize}
          />
        ))}
      </div>
    );
  };

  const renderBarcodeElement = (barcodeElement: BarcodeElement) => {
    if (barcodeElement.barcode_type === 'qrcode') {
      return (
        <div key={`barcode-${Math.random()}`} className="flex justify-center my-2">
          <QRCodeSVG
            value={barcodeElement.code}
            size={120}
            level="M"
            includeMargin={false}
          />
        </div>
      );
    }

    // For other barcode types, we'll render a placeholder or use a barcode library
    return (
      <div
        key={`barcode-${Math.random()}`}
        className="flex justify-center my-2 p-2 border border-gray-300 bg-gray-50"
        style={{ fontSize: '10px' }}
      >
        <div className="text-center">
          <div className="font-mono text-xs mb-1">{barcodeElement.barcode_type.toUpperCase()}</div>
          <div className="font-mono bg-white px-2 py-1 border">
            {barcodeElement.code}
          </div>
        </div>
      </div>
    );
  };

  const renderPictureElement = (pictureElement: PictureElement) => {
    return (
      <div key={`picture-${Math.random()}`} className="flex justify-center my-2">
        <img
          src={pictureElement.url}
          alt="Receipt Image"
          className="max-w-full h-auto"
          style={{ maxHeight: '100px' }}
          onError={(e) => {
            // Show placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.nextSibling) return;
            const placeholder = document.createElement('div');
            placeholder.className = 'bg-gray-200 border border-gray-300 p-4 text-center text-gray-500 text-sm';
            placeholder.textContent = 'Image not available';
            target.parentNode?.appendChild(placeholder);
          }}
        />
      </div>
    );
  };

  const renderHorizontalLine = () => {
    return (
      <div
        key={`line-${Math.random()}`}
        className="my-2"
        style={{
          borderTop: '1px dashed #666',
          width: '100%',
        }}
      />
    );
  };

  const renderPageBreak = () => {
    return (
      <div
        key={`pagebreak-${Math.random()}`}
        className="my-4 border-t-2 border-gray-400"
        style={{
          pageBreakAfter: 'always',
        }}
      />
    );
  };

  // Main render logic
  switch (element.type) {
    case 'text':
      return renderTextElement(element as TextElement);
    
    case 'row':
      return renderRowElement(element as RowElement);
    
    case 'barcode':
      return renderBarcodeElement(element as BarcodeElement);
    
    case 'picture':
      return renderPictureElement(element as PictureElement);
    
    case 'horizontalline':
      return renderHorizontalLine();
    
    case 'pagebreak':
      return renderPageBreak();
    
    case 'sectionref':
      // For section references, we might need to look up the section
      // For now, render a placeholder
      return (
        <div key={`sectionref-${Math.random()}`} className="text-gray-500 italic text-sm">
          [Section: {(element as any).ref}]
        </div>
      );
    
    case 'iterator':
      // For iterators, we'd need to process the data path
      // For now, render the rows directly
      const iteratorElement = element as any;
      return (
        <div key={`iterator-${Math.random()}`}>
          {iteratorElement.rows?.map((row: ReceiptElement, index: number) => (
            <ReceiptElementRenderer
              key={`iterator-row-${index}`}
              element={row}
              width={width}
              fontSize={fontSize}
            />
          ))}
        </div>
      );
    
    default:
      console.warn('Unknown receipt element type:', (element as any).type);
      return (
        <div key={`unknown-${Math.random()}`} className="text-red-500 text-sm">
          Unknown element type: {(element as any).type}
        </div>
      );
  }
};
