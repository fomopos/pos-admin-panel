// Export transaction service
export { transactionService, TransactionService } from './transactionService';

// Export ScaledInt utilities
export {
  SCALE_FACTOR,
  fromScaledInt,
  toScaledInt,
  formatScaledInt
} from './transactionService';

// Export enumerations
export type {
  TransactionType,
  TransactionStatus,
  LineItemTypeCode,
  ReturnTypeCode,
  PriceModReasonCode
} from './transactionService';

// Export types
export type {
  TransactionSummary,
  TransactionSummaryResponse,
  TransactionQueryParams,
  TenderSummary,
  ConvertedSale,
  TransactionDetail,
  TransactionLineItem,
  PaymentLineItem,
  TaxModifier,
  PriceModifier,
  TransactionDocument,
  TransactionTable,
  TransactionDiscountLineItem,
  TransactionAdditionalLineItemModifier
} from './transactionService';
