import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { message, type = 'success', actionText, onAction } = toast;

  const renderIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle size={18} color="#f87171" />;
      case 'info':
        return <Info size={18} color="#38bdf8" />;
      default:
        return <CheckCircle2 size={18} color="#10b981" />;
    }
  };

  return (
    <div className="docflow-toast fade-in">
      <div className="toast-icon">{renderIcon()}</div>
      <div className="toast-message">{message}</div>
      {actionText && onAction && (
        <button
          type="button"
          className="toast-action-btn"
          onClick={() => {
            onAction();
            onClose();
          }}
        >
          {actionText}
        </button>
      )}
      <button
        type="button"
        className="toast-close-btn"
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}
