// Import services
import { storeSettingsService, StoreSettingsService } from './storeSettingsService';
import { storeService, StoreService } from './storeService';

// Store services exports
export { storeSettingsService } from './storeSettingsService';
export { storeService } from './storeService';

// Export service classes
export { StoreSettingsService } from './storeSettingsService';
export { StoreService } from './storeService';

// Re-export types for convenience
export type * from '../types/store.types';

// Combined store service interface for easier usage
export interface StoreServices {
  settings: StoreSettingsService;
  store: StoreService;
}

// Create a combined service object
export const storeServices: StoreServices = {
  settings: storeSettingsService,
  store: storeService
};
