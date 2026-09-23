import React, { useState } from 'react';
import { X, Folder, FolderPlus, ArrowRight, Check } from 'lucide-react';

export default function MoveFileModal({ file, isOpen, onClose, onMove }) {
  const folders = [
    { name: 'Finance & Invoices', key: 'Finance', color: '#38bdf8' },
    { name: 'Engineering Specs', key: 'Engineering', color: '#818cf8' },
    { name: 'AI & Research', key: 'AI & Research', color: '#c084fc' },
    { name: 'HR & Policies', key: 'HR & Legal', color: '#34d399' },
    { name: 'Product Roadmaps', key: 'Product', color: '#fbbf24' },
    { name: 'General Documents', key: 'General', color: '#94a3b8' }
  ];

  const [selectedFolder, setSelectedFolder] = useState(file?.category || 'General');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);

  if (!isOpen || !file) return null;

  const handleConfirmMove = async () => {
    let target = selectedFolder;
    if (showNewFolder && newFolderName.trim()) {
      target = newFolderName.trim();
    }
    if (onMove) {
      await onMove(file.fileId, target);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Folder size={20} color="#6366f1" />
            <span>Move "{file.fileName}"</span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Current location: <strong style={{ color: 'var(--text-main)' }}>{file.category || 'General'}</strong>
          </div>

          <label className="form-label">Select destination folder:</label>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginTop: '6px',
              maxHeight: '220px',
              overflowY: 'auto'
            }}
          >
            {folders.map((f) => {
              const isSelected = selectedFolder === f.key && !showNewFolder;
              return (
                <div
                  key={f.key}
                  onClick={() => {
                    setSelectedFolder(f.key);
                    setShowNewFolder(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Folder size={18} color={f.color} fill={f.color} fillOpacity={0.2} />
                    <span style={{ fontSize: '0.88rem', fontWeight: isSelected ? '600' : '400', color: 'var(--text-main)' }}>
                      {f.name}
                    </span>
                  </div>
                  {isSelected && <Check size={16} color="var(--primary)" />}
                </div>
              );
            })}
          </div>

          {showNewFolder ? (
            <div style={{ marginTop: '12px' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Enter new folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
              />
            </div>
          ) : (
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => setShowNewFolder(true)}
              style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#818cf8' }}
            >
              <FolderPlus size={15} />
              <span>+ Create new folder</span>
            </button>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleConfirmMove}
            disabled={showNewFolder && !newFolderName.trim()}
          >
            <span>Move here</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
