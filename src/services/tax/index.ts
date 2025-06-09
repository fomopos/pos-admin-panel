// Import services
import { taxConfigurationService, TaxConfigurationService } from './taxConfigurationService';

// Tax services exports
export { taxConfigurationService } from './taxConfigurationService';

// Export service classes
export { TaxConfigurationService } from './taxConfigurationService';

// Re-export types for convenience
export type * from '../types/tax.types';

// Combined tax service interface for easier usage
export interface TaxServices {
  configuration: TaxConfigurationService;
}

// Create a combined service object
export const taxServices: TaxServices = {
  configuration: taxConfigurationService,
};
