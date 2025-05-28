// Import services
import { storeSettingsService, StoreSettingsService } from './storeSettingsService';

// Store services exports
export { storeSettingsService } from './storeSettingsService';

// Export service classes
export { StoreSettingsService } from './storeSettingsService';

// Re-export types for convenience
export type * from '../types/store.types';

// Combined store service interface for easier usage
export interface StoreServices {
  settings: StoreSettingsService;
}

// Create a combined service object
export const storeServices: StoreServices = {
  settings: storeSettingsService
};
