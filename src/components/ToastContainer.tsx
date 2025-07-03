import React from 'react';
import { ToastContainer as ReactToastifyContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * Customized Toast Container with POS Admin Panel styling
 */
export const ToastContainer: React.FC = () => {
  return (
    <ReactToastifyContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      toastClassName="relative flex p-3 min-h-12 rounded-md justify-between overflow-hidden cursor-pointer"
      style={{
        fontSize: '14px',
      }}
    />
  );
};

/**
 * Custom toast styles (you can import this CSS or add to your global styles)
 */
export const toastStyles = `
  /* Custom toast styling to match your design system */
  .Toastify__toast--info {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  }
  
  .Toastify__toast--success {
    background: linear-gradient(135deg, #10b981 0%, #047857 100%);
  }
  
  .Toastify__toast--warning {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  }
  
  .Toastify__toast--error {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  }
  
  .Toastify__toast--default {
    background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  }
  
  .Toastify__progress-bar--info {
    background: rgba(59, 130, 246, 0.8);
  }
  
  .Toastify__progress-bar--success {
    background: rgba(16, 185, 129, 0.8);
  }
  
  .Toastify__progress-bar--warning {
    background: rgba(245, 158, 11, 0.8);
  }
  
  .Toastify__progress-bar--error {
    background: rgba(239, 68, 68, 0.8);
  }
  
  .Toastify__close-button {
    color: white;
    opacity: 0.8;
  }
  
  .Toastify__close-button:hover {
    opacity: 1;
  }
  
  /* Responsive adjustments */
  @media (max-width: 480px) {
    .Toastify__toast-container {
      width: 100vw;
      padding: 0;
      left: 0;
      margin: 0;
    }
    
    .Toastify__toast {
      margin-bottom: 0;
      border-radius: 0;
    }
  }
`;

export default ToastContainer;
