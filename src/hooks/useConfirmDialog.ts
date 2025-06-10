import { useState, useCallback } from 'react';

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
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
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
      title: options.title || 'Confirm Action',
      message: options.message || 'Are you sure you want to continue?',
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
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

  const openDeleteDialog = useCallback((
    itemName: string,
    onDelete: () => void | Promise<void>,
    customMessage?: string
  ) => {
    openDialog(onDelete, {
      title: 'Delete Confirmation',
      message: customMessage || `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
  }, [openDialog]);

  return {
    dialogState,
    openDeleteDialog,
    closeDialog,
    handleConfirm
  };
};

export const useDiscardChangesDialog = () => {
  const { dialogState, openDialog, closeDialog, handleConfirm } = useConfirmDialog();

  const openDiscardDialog = useCallback((
    onDiscard: () => void | Promise<void>
  ) => {
    openDialog(onDiscard, {
      title: 'Discard Changes',
      message: 'Are you sure you want to discard all unsaved changes? This action cannot be undone.',
      confirmText: 'Discard Changes',
      cancelText: 'Keep Editing',
      variant: 'warning'
    });
  }, [openDialog]);

  return {
    dialogState,
    openDiscardDialog,
    closeDialog,
    handleConfirm
  };
};
