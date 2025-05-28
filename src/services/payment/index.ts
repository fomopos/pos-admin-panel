// Import services
import { paymentConfigurationService, PaymentConfigurationService } from './paymentConfigurationService';
import { tenderService, TenderService } from './tenderService';
import { paymentProcessorService, PaymentProcessorService } from './paymentProcessorService';
import { paymentAnalyticsService, PaymentAnalyticsService } from './paymentAnalyticsService';

// Payment services exports
export { paymentConfigurationService } from './paymentConfigurationService';
export { tenderService } from './tenderService';
export { paymentProcessorService } from './paymentProcessorService';
export { paymentAnalyticsService } from './paymentAnalyticsService';

// Export service classes
export { PaymentConfigurationService } from './paymentConfigurationService';
export { TenderService } from './tenderService';
export { PaymentProcessorService } from './paymentProcessorService';
export { PaymentAnalyticsService } from './paymentAnalyticsService';

// Re-export types for convenience
export type * from '../types/payment.types';

// Combined payment service interface for easier usage
export interface PaymentServices {
  configuration: PaymentConfigurationService;
  tender: TenderService;
  processor: PaymentProcessorService;
  analytics: PaymentAnalyticsService;
}

// Create a combined service object
export const paymentServices: PaymentServices = {
  configuration: paymentConfigurationService,
  tender: tenderService,
  processor: paymentProcessorService,
  analytics: paymentAnalyticsService,
};
