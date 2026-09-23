import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  UserPlus,
  Shield,
  Link as LinkIcon,
  Globe,
  User
} from 'lucide-react';
import { useDocs } from '../context/DocContext';

export default function ShareModal({ file, isOpen, onClose, onShare }) {
  const { showToast } = useDocs();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Viewer');
  const [copied, setCopied] = useState(false);
  const [accessList, setAccessList] = useState([
    { name: file?.owner || 'Harshitha R.', email: 'harshitha@docflow.io', role: 'Owner', isOwner: true },
    { name: 'Alex Morgan', email: 'alex@docflow.io', role: 'Editor', isOwner: false }
  ]);

  if (!isOpen || !file) return null;

  const handleCopyLink = () => {
    const url = `https://docflow.app/d/${file.fileId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddPerson = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    const newPerson = {
      name: trimmed.split('@')[0],
      email: trimmed,
      role,
      isOwner: false
    };

    setAccessList((prev) => [...prev, newPerson]);
    if (onShare) {
      await onShare(file.fileId, newPerson);
    }
    setEmail('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Share2 size={20} color="#6366f1" />
            <span>Share "{file.fileName}"</span>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Add People Form */}
          <form onSubmit={handleAddPerson}>
            <label className="form-label">Add people and groups</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <input
                type="email"
                className="form-input"
                style={{ flex: 1 }}
                placeholder="Enter email address (e.g. colleague@company.com)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <select
                className="form-select"
                style={{ width: '120px' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Viewer">Viewer</option>
                <option value="Commenter">Commenter</option>
                <option value="Editor">Editor</option>
              </select>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={!email.trim()}
              >
                <UserPlus size={15} />
                <span>Invite</span>
              </button>
            </div>
          </form>

          {/* People with Access */}
          <div style={{ marginTop: '1.25rem' }}>
            <label className="form-label">People with access</label>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '6px',
                maxHeight: '180px',
                overflowY: 'auto'
              }}
            >
              {accessList.map((person, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: person.isOwner ? '#4f46e5' : '#10b981',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: '700'
                      }}
                    >
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{person.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{person.email}</div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: person.isOwner ? '#818cf8' : 'var(--text-muted)',
                      fontWeight: '600',
                      background: 'rgba(255,255,255,0.04)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {person.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* General Access / Link Sharing */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '1.25rem',
              padding: '10px 12px',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={18} color="#818cf8" />
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)' }}>
                  Anyone with the link
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Anyone on the internet with this link can view
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#a5b4fc', fontWeight: '600' }}>Viewer</span>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCopyLink}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {copied ? <Check size={15} color="#10b981" /> : <LinkIcon size={15} />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button type="button" className="btn btn-primary btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
