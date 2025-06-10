import React from 'react';
import { Button, PageHeader } from '../components/ui';
import { useDeleteConfirmDialog, useDiscardChangesDialog, useConfirmDialog } from '../hooks/useConfirmDialog';
import { ConfirmDialog } from '../components/ui';

const AlertDemo: React.FC = () => {
  const deleteDialog = useDeleteConfirmDialog();
  const discardDialog = useDiscardChangesDialog();
  const customDialog = useConfirmDialog();

  const handleDeleteExample = () => {
    deleteDialog.openDeleteDialog(
      'Sample Category',
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Category deleted successfully!');
      }
    );
  };

  const handleDiscardExample = () => {
    discardDialog.openDiscardDialog(
      async () => {
        // Simulate discarding changes
        await new Promise(resolve => setTimeout(resolve, 800));
        console.log('Changes discarded successfully!');
      }
    );
  };

  const handleCustomExample = () => {
    customDialog.openDialog(
      async () => {
        // Simulate custom action
        await new Promise(resolve => setTimeout(resolve, 1200));
        console.log('Custom action completed!');
      },
      {
        title: 'Custom Confirmation',
        message: 'This is a custom confirmation dialog. Are you sure you want to proceed with this action?',
        confirmText: 'Yes, Proceed',
        cancelText: 'No, Cancel',
        variant: 'info'
      }
    );
  };

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Alert & Dialog Components Demo"
        description="Interactive demonstration of the new ConfirmDialog component and useConfirmDialog hooks"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Delete Confirmation */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Confirmation</h3>
          <p className="text-sm text-gray-600 mb-4">
            Standard delete confirmation dialog with danger styling.
          </p>
          <Button
            onClick={handleDeleteExample}
            variant="outline"
            className="w-full text-red-600 border-red-300 hover:bg-red-50"
          >
            Delete Item
          </Button>
        </div>

        {/* Discard Changes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Discard Changes</h3>
          <p className="text-sm text-gray-600 mb-4">
            Warning dialog for discarding unsaved changes.
          </p>
          <Button
            onClick={handleDiscardExample}
            variant="outline"
            className="w-full text-yellow-600 border-yellow-300 hover:bg-yellow-50"
          >
            Discard Changes
          </Button>
        </div>

        {/* Custom Dialog */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Dialog</h3>
          <p className="text-sm text-gray-600 mb-4">
            Customizable dialog with different styling and messages.
          </p>
          <Button
            onClick={handleCustomExample}
            variant="outline"
            className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            Custom Action
          </Button>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits of the New Dialog System</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">🎨 Better User Experience</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Modern, accessible design</li>
              <li>• Consistent styling across the app</li>
              <li>• Loading states for async operations</li>
              <li>• Keyboard navigation support</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">⚡ Developer Experience</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Reusable hooks for common patterns</li>
              <li>• TypeScript support</li>
              <li>• Easy customization</li>
              <li>• Centralized dialog management</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Examples</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Delete Confirmation:</h4>
            <pre className="bg-gray-50 p-3 rounded text-sm text-gray-800 overflow-x-auto">
{`const deleteDialog = useDeleteConfirmDialog();

deleteDialog.openDeleteDialog(
  'Category Name',
  async () => {
    await categoryApiService.deleteCategory(id);
    // Handle success
  }
);`}
            </pre>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Custom Dialog:</h4>
            <pre className="bg-gray-50 p-3 rounded text-sm text-gray-800 overflow-x-auto">
{`const customDialog = useConfirmDialog();

customDialog.openDialog(
  async () => { /* action */ },
  {
    title: 'Custom Title',
    message: 'Custom message',
    variant: 'info'
  }
);`}
            </pre>
          </div>
        </div>
      </div>

      {/* Dialog Components */}
      <ConfirmDialog
        isOpen={deleteDialog.dialogState.isOpen}
        onClose={deleteDialog.closeDialog}
        onConfirm={deleteDialog.handleConfirm}
        title={deleteDialog.dialogState.title}
        message={deleteDialog.dialogState.message}
        confirmText={deleteDialog.dialogState.confirmText}
        cancelText={deleteDialog.dialogState.cancelText}
        variant={deleteDialog.dialogState.variant}
        isLoading={deleteDialog.dialogState.isLoading}
      />

      <ConfirmDialog
        isOpen={discardDialog.dialogState.isOpen}
        onClose={discardDialog.closeDialog}
        onConfirm={discardDialog.handleConfirm}
        title={discardDialog.dialogState.title}
        message={discardDialog.dialogState.message}
        confirmText={discardDialog.dialogState.confirmText}
        cancelText={discardDialog.dialogState.cancelText}
        variant={discardDialog.dialogState.variant}
        isLoading={discardDialog.dialogState.isLoading}
      />

      <ConfirmDialog
        isOpen={customDialog.dialogState.isOpen}
        onClose={customDialog.closeDialog}
        onConfirm={customDialog.handleConfirm}
        title={customDialog.dialogState.title}
        message={customDialog.dialogState.message}
        confirmText={customDialog.dialogState.confirmText}
        cancelText={customDialog.dialogState.cancelText}
        variant={customDialog.dialogState.variant}
        isLoading={customDialog.dialogState.isLoading}
      />
    </div>
  );
};

export default AlertDemo;
