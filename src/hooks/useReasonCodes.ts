// Hook for managing reason codes
import { useState, useEffect, useCallback } from 'react';
import { reasonCodeApiService } from '../services/reason-code/reasonCodeApiService';
import type { ReasonCode } from '../types/reasonCode';

interface UseReasonCodesOptions {
  tenantId?: string;
  storeId?: string;
  autoLoad?: boolean;
}

interface UseReasonCodesReturn {
  // Reason codes data
  reasonCodes: ReasonCode[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Functions
  getReasonCodesByCategory: (categories: string[]) => ReasonCode[];
  createReasonCode: (reasonCodeData: {
    code: string;
    description: string;
    categories: string[];
    parent_code?: string | null;
    req_cmt?: boolean;
    sort_order?: number;
    active: boolean;
  }) => Promise<ReasonCode>;
  updateReasonCode: (
    reasonCodeId: string,
    reasonCodeData: Partial<{
      code: string;
      description: string;
      categories: string[];
      parent_code: string | null;
      req_cmt: boolean;
      sort_order: number;
      active: boolean;
    }>
  ) => Promise<ReasonCode>;
  deleteReasonCode: (reasonCodeId: string) => Promise<void>;
  refreshReasonCodes: () => Promise<void>;
}

/**
 * Custom hook for managing reason codes
 */
export const useReasonCodes = (options: UseReasonCodesOptions = {}): UseReasonCodesReturn => {
  const { tenantId, storeId, autoLoad = true } = options;
  
  const [reasonCodes, setReasonCodes] = useState<ReasonCode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reason codes
  const loadReasonCodes = useCallback(async () => {
    if (!tenantId || !storeId) {
      setReasonCodes([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await reasonCodeApiService.getReasonCodes({
        store_id: storeId,
      });
      
      setReasonCodes(response.reason_codes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reason codes';
      setError(errorMessage);
      console.error('Failed to load reason codes:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tenantId, storeId]);

  // Auto-load reason codes when tenant/store changes
  useEffect(() => {
    if (autoLoad && tenantId && storeId) {
      loadReasonCodes();
    }
  }, [autoLoad, tenantId, storeId, loadReasonCodes]);

  // Get reason codes by category
  const getReasonCodesByCategory = useCallback((categories: string[]): ReasonCode[] => {
    return reasonCodes.filter(rc => 
      rc.active && categories.some(cat => rc.categories.includes(cat))
    );
  }, [reasonCodes]);

  // Create reason code
  const createReasonCode = useCallback(async (reasonCodeData: {
    code: string;
    description: string;
    categories: string[];
    parent_code?: string | null;
    req_cmt?: boolean;
    sort_order?: number;
    active: boolean;
  }): Promise<ReasonCode> => {
    if (!tenantId || !storeId) {
      throw new Error('Tenant ID and Store ID are required');
    }

    try {
      const newReasonCode = await reasonCodeApiService.createReasonCode(
        tenantId,
        storeId,
        reasonCodeData
      );
      
      // Add to local state
      // Note: For production, consider refetching from API to ensure consistency
      // with server state, especially if multiple users are editing simultaneously
      setReasonCodes(prev => [...prev, newReasonCode]);
      
      return newReasonCode;
    } catch (err) {
      console.error('Failed to create reason code:', err);
      throw err;
    }
  }, [tenantId, storeId]);

  // Update reason code
  const updateReasonCode = useCallback(async (
    reasonCodeId: string,
    reasonCodeData: Partial<{
      code: string;
      description: string;
      categories: string[];
      parent_code: string | null;
      req_cmt: boolean;
      sort_order: number;
      active: boolean;
    }>
  ): Promise<ReasonCode> => {
    if (!tenantId || !storeId) {
      throw new Error('Tenant ID and Store ID are required');
    }

    try {
      const updatedReasonCode = await reasonCodeApiService.updateReasonCode(
        tenantId,
        storeId,
        reasonCodeId,
        reasonCodeData
      );
      
      // Update local state
      setReasonCodes(prev => 
        prev.map(rc => rc.code === reasonCodeId ? updatedReasonCode : rc)
      );
      
      return updatedReasonCode;
    } catch (err) {
      console.error('Failed to update reason code:', err);
      throw err;
    }
  }, [tenantId, storeId]);

  // Delete reason code
  const deleteReasonCode = useCallback(async (reasonCodeId: string): Promise<void> => {
    if (!tenantId || !storeId) {
      throw new Error('Tenant ID and Store ID are required');
    }

    try {
      await reasonCodeApiService.deleteReasonCode(tenantId, storeId, reasonCodeId);
      
      // Remove from local state
      setReasonCodes(prev => prev.filter(rc => rc.code !== reasonCodeId));
    } catch (err) {
      console.error('Failed to delete reason code:', err);
      throw err;
    }
  }, [tenantId, storeId]);

  // Refresh reason codes
  const refreshReasonCodes = useCallback(async () => {
    await loadReasonCodes();
  }, [loadReasonCodes]);

  return {
    reasonCodes,
    isLoading,
    error,
    getReasonCodesByCategory,
    createReasonCode,
    updateReasonCode,
    deleteReasonCode,
    refreshReasonCodes,
  };
};

export default useReasonCodes;
