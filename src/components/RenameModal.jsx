import React, { useState, useEffect, useRef } from 'react';
import { X, Edit3, Check, AlertCircle } from 'lucide-react';

export default function RenameModal({ file, isOpen, onClose, onRename }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (file && isOpen) {
      setName(file.fileName || '');
      setError('');
      setIsSaving(false);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Select only the name part before extension
          const lastDotIndex = file.fileName.lastIndexOf('.');
          if (lastDotIndex > 0) {
            inputRef.current.setSelectionRange(0, lastDotIndex);
          } else {
            inputRef.current.select();
          }
        }
      }, 50);
    }
  }, [file, isOpen]);

  if (!isOpen || !file) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter a valid file name.');
      return;
    }

    // If user removed extension, preserve original extension
    const origExtMatch = file.fileName.match(/(\.[^.]+)$/);
    const origExt = origExtMatch ? origExtMatch[1] : '';
    let finalName = trimmed;
    if (origExt && !trimmed.toLowerCase().endsWith(origExt.toLowerCase()) && !trimmed.includes('.')) {
      finalName = `${trimmed}${origExt}`;
    }

    if (finalName === file.fileName) {
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await onRename(file.fileId, finalName);
      setIsSaving(false);
      onClose();
    } catch (err) {
      setIsSaving(false);
      setError(err.message || 'Failed to rename file.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Edit3 size={20} color="#6366f1" />
            <span>Rename</span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: '#f87171',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Enter a new name for the item:</label>
              <input
                type="text"
                ref={inputRef}
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving || !name.trim()}
            >
              {isSaving ? 'Saving...' : 'OK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
