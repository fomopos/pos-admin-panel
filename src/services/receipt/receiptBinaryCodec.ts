import type {
  ReceiptElement,
  TextElement,
  PictureElement,
  BarcodeElement,
  PageBreakElement,
  HorizontalLineElement,
  RowElement,
  SectionRefElement,
  IteratorRefElement,
} from '../../types/receipt';

// =============================================================================
// Binary codec for receipt elements – TypeScript port of the Dart implementation.
//
// Format Overview (Version 1)
// ─────────────────────────────
// Header : [magic(2)] [version(1)]
// Body   : [element_count(varint)] [elements…]
//
// Element: [opcode(varint)] [total_length(varint)] [field_count(varint)] [fields…]
// Field  : [tag(varint)] [length(varint)] [value(bytes)]   (TLV)
//
// All integers use unsigned LEB128 (same as Protocol Buffers).
// =============================================================================

// ── Constants ────────────────────────────────────────────────────────────────

const MAGIC1 = 0x52; // 'R'
const MAGIC2 = 0x43; // 'C'

// Element opcodes
const OP_TEXT = 0x01;
const OP_PICTURE = 0x02;
const OP_BARCODE = 0x03;
const OP_PAGE_BREAK = 0x04;
const OP_HORIZONTAL_LINE = 0x05;
const OP_ROW = 0x06;
const OP_SECTION_REF = 0x07;
const OP_ITERATOR = 0x08;

// Field tags
const TAG_TEXT = 1;
const TAG_ALIGN = 2;
const TAG_STYLE = 3;
const TAG_FLEX = 4;
const TAG_IMAGE_URL = 5;
const TAG_CODE = 6;
const TAG_BARCODE_TYPE = 7;
const TAG_REF = 8;
const TAG_PATH = 9;
const TAG_CONDITIONS = 10;
const TAG_CHILDREN = 11;
const TAG_ROWS = 12;

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Mutable offset wrapper so we can pass-by-reference. */
interface OffsetRef {
  value: number;
}

function createOffsetRef(value: number): OffsetRef {
  return { value };
}

/** UTF-8 text encoder / decoder (browser-native). */
const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8');

// ── VarInt (unsigned LEB128) ─────────────────────────────────────────────────

function writeVarInt(bytes: number[], value: number): void {
  if (value < 0) throw new ReceiptCodecError(`Negative varint not supported: ${value}`);
  do {
    let byte = value & 0x7f;
    value >>>= 7;
    if (value > 0) byte |= 0x80;
    bytes.push(byte);
  } while (value > 0);
}

function readVarInt(data: Uint8Array, ref: OffsetRef): number {
  let result = 0;
  let shift = 0;

  while (ref.value < data.length) {
    const byte = data[ref.value++];
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) return result;
    shift += 7;
    if (shift > 35) throw new ReceiptCodecError('VarInt too long');
  }

  throw new ReceiptCodecError('Unexpected end of data reading varint');
}

// ── Primitive encode / decode helpers ────────────────────────────────────────

function encodeString(s: string): Uint8Array {
  return encoder.encode(s);
}

function decodeString(data: Uint8Array): string {
  return decoder.decode(data);
}

function encodeVarIntBytes(value: number): Uint8Array {
  const buf: number[] = [];
  writeVarInt(buf, value);
  return new Uint8Array(buf);
}

function decodeVarIntBytes(data: Uint8Array): number {
  return readVarInt(data, createOffsetRef(0));
}

function encodeJson(obj: unknown): Uint8Array {
  return encodeString(JSON.stringify(obj));
}

// ── TLV field helpers ────────────────────────────────────────────────────────

function writeField(bytes: number[], tag: number, value: Uint8Array): void {
  writeVarInt(bytes, tag);
  writeVarInt(bytes, value.length);
  for (let i = 0; i < value.length; i++) bytes.push(value[i]);
}

function readFields(data: Uint8Array, ref: OffsetRef): Map<number, Uint8Array> {
  const fields = new Map<number, Uint8Array>();
  if (ref.value >= data.length) return fields;

  const fieldCount = readVarInt(data, ref);

  for (let i = 0; i < fieldCount && ref.value < data.length; i++) {
    const tag = readVarInt(data, ref);
    const length = readVarInt(data, ref);
    const value = data.subarray(ref.value, ref.value + length);
    ref.value += length;
    fields.set(tag, value);
  }

  return fields;
}

// ── Element encoding ─────────────────────────────────────────────────────────

function writeElementWithLength(bytes: number[], opcode: number, elementBytes: number[]): void {
  writeVarInt(bytes, opcode);
  writeVarInt(bytes, elementBytes.length);
  for (let i = 0; i < elementBytes.length; i++) bytes.push(elementBytes[i]);
}

function encodeElement(bytes: number[], element: ReceiptElement): void {
  const eb: number[] = [];

  switch (element.type) {
    case 'text':
      encodeTextElement(eb, element);
      writeElementWithLength(bytes, OP_TEXT, eb);
      break;
    case 'picture':
      encodePictureElement(eb, element);
      writeElementWithLength(bytes, OP_PICTURE, eb);
      break;
    case 'barcode':
      encodeBarcodeElement(eb, element);
      writeElementWithLength(bytes, OP_BARCODE, eb);
      break;
    case 'pagebreak':
      writeElementWithLength(bytes, OP_PAGE_BREAK, eb);
      break;
    case 'horizontalline':
      writeElementWithLength(bytes, OP_HORIZONTAL_LINE, eb);
      break;
    case 'row':
      encodeRowElement(eb, element);
      writeElementWithLength(bytes, OP_ROW, eb);
      break;
    case 'sectionref':
      encodeSectionRefElement(eb, element);
      writeElementWithLength(bytes, OP_SECTION_REF, eb);
      break;
    case 'iterator':
      encodeIteratorElement(eb, element);
      writeElementWithLength(bytes, OP_ITERATOR, eb);
      break;
    default:
      throw new ReceiptCodecError(`Unsupported element type: ${(element as ReceiptElement).type}`);
  }
}

function encodeTextElement(bytes: number[], e: TextElement): void {
  let fieldCount = 2;
  if (e.style) fieldCount++;
  if (e.flex != null) fieldCount++;

  writeVarInt(bytes, fieldCount);
  writeField(bytes, TAG_TEXT, encodeString(e.text));
  writeField(bytes, TAG_ALIGN, encodeString(e.align ?? 'left'));
  if (e.style) writeField(bytes, TAG_STYLE, encodeString(e.style));
  if (e.flex != null) writeField(bytes, TAG_FLEX, encodeVarIntBytes(e.flex));
}

function encodePictureElement(bytes: number[], e: PictureElement): void {
  let fieldCount = 1;
  if (e.flex != null) fieldCount++;

  writeVarInt(bytes, fieldCount);
  writeField(bytes, TAG_IMAGE_URL, encodeString(e.url));
  if (e.flex != null) writeField(bytes, TAG_FLEX, encodeVarIntBytes(e.flex));
}

function encodeBarcodeElement(bytes: number[], e: BarcodeElement): void {
  let fieldCount = 2;
  if (e.flex != null) fieldCount++;

  writeVarInt(bytes, fieldCount);
  writeField(bytes, TAG_CODE, encodeString(e.code));
  writeField(bytes, TAG_BARCODE_TYPE, encodeString(e.barcode_type));
  if (e.flex != null) writeField(bytes, TAG_FLEX, encodeVarIntBytes(e.flex));
}

function encodeRowElement(bytes: number[], e: RowElement): void {
  let fieldCount = 1;
  if (e.flex != null) fieldCount++;

  writeVarInt(bytes, fieldCount);
  writeField(bytes, TAG_CHILDREN, encodeElementList(e.children));
  if (e.flex != null) writeField(bytes, TAG_FLEX, encodeVarIntBytes(e.flex));
}

function encodeSectionRefElement(bytes: number[], e: SectionRefElement): void {
  let fieldCount = 1;
  if (e.flex != null) fieldCount++;

  writeVarInt(bytes, fieldCount);
  writeField(bytes, TAG_REF, encodeString(e.ref));
  if (e.flex != null) writeField(bytes, TAG_FLEX, encodeVarIntBytes(e.flex));
}

function encodeIteratorElement(bytes: number[], e: IteratorRefElement): void {
  let fieldCount = 2;
  if ((e as any).conditions != null) fieldCount++;
  if (e.flex != null) fieldCount++;

  writeVarInt(bytes, fieldCount);
  writeField(bytes, TAG_PATH, encodeString(e.path));
  writeField(bytes, TAG_ROWS, encodeElementList(e.rows));
  if ((e as any).conditions != null) {
    writeField(bytes, TAG_CONDITIONS, encodeJson((e as any).conditions));
  }
  if (e.flex != null) writeField(bytes, TAG_FLEX, encodeVarIntBytes(e.flex));
}

function encodeElementList(elements: ReceiptElement[]): Uint8Array {
  const buf: number[] = [];
  writeVarInt(buf, elements.length);
  for (const e of elements) encodeElement(buf, e);
  return new Uint8Array(buf);
}

// ── Element decoding ─────────────────────────────────────────────────────────

function decodeElementsV1(data: Uint8Array, ref: OffsetRef): ReceiptElement[] {
  const count = readVarInt(data, ref);
  const list: ReceiptElement[] = [];

  for (let i = 0; i < count; i++) {
    const element = decodeElement(data, ref);
    if (element) list.push(element);
  }

  return list;
}

function decodeElement(data: Uint8Array, ref: OffsetRef): ReceiptElement | null {
  const opcode = readVarInt(data, ref);
  const length = readVarInt(data, ref);
  const endOffset = ref.value + length;

  const elementData = data.subarray(ref.value, endOffset);
  const elementRef = createOffsetRef(0);

  let result: ReceiptElement | null = null;

  try {
    switch (opcode) {
      case OP_TEXT:
        result = decodeTextElement(elementData, elementRef);
        break;
      case OP_PICTURE:
        result = decodePictureElement(elementData, elementRef);
        break;
      case OP_BARCODE:
        result = decodeBarcodeElement(elementData, elementRef);
        break;
      case OP_PAGE_BREAK:
        result = { type: 'pagebreak' } as PageBreakElement;
        break;
      case OP_HORIZONTAL_LINE:
        result = { type: 'horizontalline' } as HorizontalLineElement;
        break;
      case OP_ROW:
        result = decodeRowElement(elementData, elementRef);
        break;
      case OP_SECTION_REF:
        result = decodeSectionRefElement(elementData, elementRef);
        break;
      case OP_ITERATOR:
        result = decodeIteratorElement(elementData, elementRef);
        break;
      default:
        // Unknown element – skip gracefully
        result = null;
    }
  } catch {
    // If decoding fails, skip this element
    result = null;
  }

  // Always advance to end of element (even if skipped)
  ref.value = endOffset;
  return result;
}

function decodeTextElement(data: Uint8Array, ref: OffsetRef): TextElement {
  const fields = readFields(data, ref);

  const text = decodeString(fields.get(TAG_TEXT) ?? new Uint8Array(0));
  const align = decodeString(fields.get(TAG_ALIGN) ?? new Uint8Array(0));
  const style = fields.has(TAG_STYLE) ? decodeString(fields.get(TAG_STYLE)!) : undefined;
  const flex = fields.has(TAG_FLEX) ? decodeVarIntBytes(fields.get(TAG_FLEX)!) : undefined;

  return {
    type: 'text',
    text,
    align: (align || 'left') as TextElement['align'],
    style,
    flex,
  };
}

function decodePictureElement(data: Uint8Array, ref: OffsetRef): PictureElement {
  const fields = readFields(data, ref);

  const url = decodeString(fields.get(TAG_IMAGE_URL) ?? new Uint8Array(0));
  const flex = fields.has(TAG_FLEX) ? decodeVarIntBytes(fields.get(TAG_FLEX)!) : undefined;

  return { type: 'picture', url, flex };
}

function decodeBarcodeElement(data: Uint8Array, ref: OffsetRef): BarcodeElement {
  const fields = readFields(data, ref);

  const code = decodeString(fields.get(TAG_CODE) ?? new Uint8Array(0));
  const barcodeType = decodeString(fields.get(TAG_BARCODE_TYPE) ?? new Uint8Array(0));
  const flex = fields.has(TAG_FLEX) ? decodeVarIntBytes(fields.get(TAG_FLEX)!) : undefined;

  return {
    type: 'barcode',
    code,
    barcode_type: barcodeType as BarcodeElement['barcode_type'],
    flex,
  };
}

function decodeRowElement(data: Uint8Array, ref: OffsetRef): RowElement {
  const fields = readFields(data, ref);

  const children = fields.has(TAG_CHILDREN)
    ? decodeElementList(fields.get(TAG_CHILDREN)!)
    : [];
  const flex = fields.has(TAG_FLEX) ? decodeVarIntBytes(fields.get(TAG_FLEX)!) : undefined;

  return { type: 'row', children, flex };
}

function decodeSectionRefElement(data: Uint8Array, ref: OffsetRef): SectionRefElement {
  const fields = readFields(data, ref);

  const refName = decodeString(fields.get(TAG_REF) ?? new Uint8Array(0));
  const flex = fields.has(TAG_FLEX) ? decodeVarIntBytes(fields.get(TAG_FLEX)!) : undefined;

  return { type: 'sectionref', ref: refName, flex };
}

function decodeIteratorElement(data: Uint8Array, ref: OffsetRef): IteratorRefElement {
  const fields = readFields(data, ref);

  const path = decodeString(fields.get(TAG_PATH) ?? new Uint8Array(0));
  const rows = fields.has(TAG_ROWS)
    ? decodeElementList(fields.get(TAG_ROWS)!)
    : [];
  const flex = fields.has(TAG_FLEX) ? decodeVarIntBytes(fields.get(TAG_FLEX)!) : undefined;

  return { type: 'iterator', path, rows, flex };
}

function decodeElementList(data: Uint8Array): ReceiptElement[] {
  const ref = createOffsetRef(0);
  const count = readVarInt(data, ref);
  const list: ReceiptElement[] = [];

  for (let i = 0; i < count; i++) {
    const element = decodeElement(data, ref);
    if (element) list.push(element);
  }

  return list;
}

// ── Public API ───────────────────────────────────────────────────────────────

export class ReceiptCodecError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReceiptCodecError';
  }
}

export const receiptBinaryCodec = {
  /**
   * Encode a list of receipt elements to binary format.
   */
  encodeElements(elements: ReceiptElement[]): Uint8Array {
    const bytes: number[] = [];

    // Header
    bytes.push(MAGIC1, MAGIC2, 0x01); // version 1

    // Element count
    writeVarInt(bytes, elements.length);

    // Elements
    for (const e of elements) {
      encodeElement(bytes, e);
    }

    return new Uint8Array(bytes);
  },

  /**
   * Decode binary data to a list of receipt elements.
   * Skips unknown elements/fields gracefully for forward compatibility.
   */
  decodeElements(data: Uint8Array): ReceiptElement[] {
    if (data.length < 3) {
      throw new ReceiptCodecError('Data too short for header');
    }

    const ref = createOffsetRef(0);

    const m1 = data[ref.value++];
    const m2 = data[ref.value++];

    if (m1 !== MAGIC1 || m2 !== MAGIC2) {
      throw new ReceiptCodecError('Invalid magic bytes');
    }

    const version = data[ref.value++];

    switch (version) {
      case 0x01:
        return decodeElementsV1(data, ref);
      default:
        throw new ReceiptCodecError(`Unsupported version: ${version}`);
    }
  },

  /**
   * Encode elements to a base64 string.
   */
  toBase64(elements: ReceiptElement[]): string {
    const bytes = this.encodeElements(elements);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  /**
   * Decode a base64 string to receipt elements.
   */
  fromBase64(base64String: string): ReceiptElement[] {
    const binary = atob(base64String);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return this.decodeElements(bytes);
  },

  /**
   * Check whether a string looks like base64-encoded receipt binary data.
   * Returns true if the decoded bytes start with the magic header 'RC'.
   */
  isReceiptBinary(data: string): boolean {
    try {
      // Quick check: must be base64 (no whitespace / special JSON chars at start)
      if (data.startsWith('[') || data.startsWith('{')) return false;

      const binary = atob(data);
      if (binary.length < 3) return false;
      return binary.charCodeAt(0) === MAGIC1 && binary.charCodeAt(1) === MAGIC2;
    } catch {
      return false;
    }
  },
};
