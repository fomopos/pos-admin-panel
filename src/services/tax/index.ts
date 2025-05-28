// Import services
import { taxAuthorityService, TaxAuthorityService } from './taxAuthorityService';
import { taxGroupService, TaxGroupService } from './taxGroupService';
import { taxConfigurationService, TaxConfigurationService } from './taxConfigurationService';

// Tax services exports
export { taxAuthorityService } from './taxAuthorityService';
export { taxGroupService } from './taxGroupService';
export { taxConfigurationService } from './taxConfigurationService';

// Export service classes
export { TaxAuthorityService } from './taxAuthorityService';
export { TaxGroupService } from './taxGroupService';
export { TaxConfigurationService } from './taxConfigurationService';

// Re-export types for convenience
export type * from '../types/tax.types';

// Combined tax service interface for easier usage
export interface TaxServices {
  authority: TaxAuthorityService;
  group: TaxGroupService;
  configuration: TaxConfigurationService;
}

// Create a combined service object
export const taxServices: TaxServices = {
  authority: taxAuthorityService,
  group: taxGroupService,
  configuration: taxConfigurationService,
};
