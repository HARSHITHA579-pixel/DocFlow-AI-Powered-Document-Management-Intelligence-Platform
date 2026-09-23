import React, { useState } from 'react';
import {
  X,
  Info,
  Calendar,
  User,
  HardDrive,
  FileText,
  Star,
  Download,
  Copy,
  Check,
  Tag,
  ExternalLink
} from 'lucide-react';
import { useDocs } from '../context/DocContext';

export default function FileInfoModal({ file, isOpen, onClose }) {
  const { showToast, toggleStar, downloadFile } = useDocs();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !file) return null;

  const storageLocation = file.publicUrl || `supabase://documents/${file.filePath || file.fileName}`;

  const handleCopyLocation = () => {
    navigator.clipboard.writeText(storageLocation);
    setCopied(true);
    showToast('Storage link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Info size={20} color="#6366f1" />
            <span>File Information</span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* File Header Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <FileText size={24} color="#818cf8" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                {file.fileName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                <span className={`badge badge-${file.type}`}>{file.type.toUpperCase()}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{file.sizeFormatted}</span>
                {file.starred && (
                  <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.75rem', fontWeight: '600' }}>
                    <Star size={12} fill="#f59e0b" /> Starred
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details Properties Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', marginTop: '12px' }}>
            <div>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '2px' }}>Supabase Storage Location</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'var(--bg-card)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)'
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {storageLocation}
                </span>
                <button
                  type="button"
                  onClick={handleCopyLocation}
                  style={{ color: copied ? '#10b981' : 'var(--text-subtle)', marginLeft: '6px' }}
                  title="Copy link"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '2px' }}>Storage Bucket & Path</div>
              <div style={{ fontFamily: 'var(--font-mono)', color: '#a5b4fc', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                documents / {file.filePath || file.fileName}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '2px' }}>Owner</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)' }}>
                  <User size={14} color="var(--text-subtle)" />
                  <span>{file.owner || 'Harshitha R.'}</span>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '2px' }}>Category</div>
                <div style={{ color: 'var(--text-main)', fontWeight: '500' }}>
                  {file.category || 'General'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '2px' }}>Uploaded</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)', fontSize: '0.8rem' }}>
                  <Calendar size={13} color="var(--text-subtle)" />
                  <span>{new Date(file.uploadDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '2px' }}>Storage Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: '600', fontSize: '0.8rem' }}>
                  <HardDrive size={13} />
                  <span>Supabase Active</span>
                </div>
              </div>
            </div>

            {file.tags && file.tags.length > 0 && (
              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '4px' }}>Tags</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {file.tags.map((t, idx) => (
                    <span key={idx} className="file-tag-chip">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          {file.publicUrl && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => window.open(file.publicUrl, '_blank')}
              style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <ExternalLink size={14} />
              <span>Open in Tab</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => downloadFile(file)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Download size={14} />
            <span>Download</span>
          </button>

          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
