import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

export default function ConfirmationModal({
  isOpen,
  title = 'Move to trash?',
  message = 'Item will be moved to trash and removed from active workspace.',
  confirmText = 'Move to trash',
  confirmVariant = 'danger',
  onClose,
  onConfirm
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trash2 size={20} color="#ef4444" />
            <span>{title}</span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={confirmVariant === 'danger' ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
