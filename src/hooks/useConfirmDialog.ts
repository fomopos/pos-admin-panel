import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface UseConfirmDialogOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'warning' | 'info';
  isLoading: boolean;
  onConfirm?: () => void | Promise<void>;
}

export const useConfirmDialog = () => {
  const { t } = useTranslation();
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: t('common.confirm'),
    cancelText: t('common.cancel'),
    variant: 'danger',
    isLoading: false,
    onConfirm: undefined
  });

  const openDialog = useCallback((
    onConfirm: () => void | Promise<void>,
    options: UseConfirmDialogOptions = {}
  ) => {
    setDialogState({
      isOpen: true,
      title: options.title || t('common.confirmAction'),
      message: options.message || t('common.areYouSure'),
      confirmText: options.confirmText || t('common.confirm'),
      cancelText: options.cancelText || t('common.cancel'),
      variant: options.variant || 'danger',
      isLoading: false,
      onConfirm
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState(prev => ({
      ...prev,
      isOpen: false,
      isLoading: false,
      onConfirm: undefined
    }));
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!dialogState.onConfirm) return;

    try {
      setDialogState(prev => ({ ...prev, isLoading: true }));
      
      const result = dialogState.onConfirm();
      
      // Handle both sync and async functions
      if (result instanceof Promise) {
        await result;
      }
      
      closeDialog();
    } catch (error) {
      console.error('Error in confirm dialog action:', error);
      setDialogState(prev => ({ ...prev, isLoading: false }));
      // You could also show an error message here
      throw error; // Re-throw so calling code can handle it
    }
  }, [dialogState.onConfirm, closeDialog]);

  return {
    dialogState,
    openDialog,
    closeDialog,
    handleConfirm
  };
};

// Convenience functions for common dialog types
export const useDeleteConfirmDialog = () => {
  const { dialogState, openDialog, closeDialog, handleConfirm } = useConfirmDialog();
  const { t } = useTranslation();

  const openDeleteDialog = useCallback((
    itemName: string,
    onDelete: () => void | Promise<void>,
    customMessage?: string
  ) => {
    openDialog(onDelete, {
      title: t('common.deleteConfirmation'),
      message: customMessage || `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
      variant: 'danger'
    });
  }, [openDialog, t]);

  return {
    dialogState,
    openDeleteDialog,
    closeDialog,
    handleConfirm
  };
};

export const useDiscardChangesDialog = () => {
  const { dialogState, openDialog, closeDialog, handleConfirm } = useConfirmDialog();
  const { t } = useTranslation();

  const openDiscardDialog = useCallback((
    onDiscard: () => void | Promise<void>
  ) => {
    openDialog(onDiscard, {
      title: t('common.discardChanges'),
      message: t('common.discardChangesMessage'),
      confirmText: t('common.discardChangesButton'),
      cancelText: t('common.keepEditing'),
      variant: 'warning'
    });
  }, [openDialog, t]);

  return {
    dialogState,
    openDiscardDialog,
    closeDialog,
    handleConfirm
  };
};
