// Receipt Element Types - Based on Flutter doc_elements.dart
export interface BaseReceiptElement {
  type: string;
  flex?: number;
}

export interface TextElement extends BaseReceiptElement {
  type: 'text';
  text: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  style?: string;
  flex?: number;
}

export interface PictureElement extends BaseReceiptElement {
  type: 'picture';
  url: string;
}

export interface BarcodeElement extends BaseReceiptElement {
  type: 'barcode';
  code: string;
  barcode_type: 'code39' | 'qrcode' | 'pdf417';
}

export interface PageBreakElement extends BaseReceiptElement {
  type: 'pagebreak';
}

export interface HorizontalLineElement extends BaseReceiptElement {
  type: 'horizontalline';
}

export interface RowElement extends BaseReceiptElement {
  type: 'row';
  children: ReceiptElement[];
}

export interface SectionRefElement extends BaseReceiptElement {
  type: 'sectionref';
  ref: string;
}

export interface IteratorRefElement extends BaseReceiptElement {
  type: 'iterator';
  path: string;
  rows: ReceiptElement[];
}

export type ReceiptElement = 
  | TextElement 
  | PictureElement 
  | BarcodeElement 
  | PageBreakElement 
  | HorizontalLineElement 
  | RowElement 
  | SectionRefElement 
  | IteratorRefElement;

export interface ReceiptDocument {
  document_id: number;
  data: ReceiptElement[];
  metadata?: {
    title?: string;
    description?: string;
    created_at?: string;
    document_type?: string;
  };
}

export interface ReceiptRenderOptions {
  width?: number;
  fontSize?: number;
  fontFamily?: string;
  showBorders?: boolean;
  backgroundColor?: string;
  padding?: number;
}
