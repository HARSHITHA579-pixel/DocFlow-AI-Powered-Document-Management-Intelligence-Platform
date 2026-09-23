import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  File,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useDocs } from '../context/DocContext';
import { detectFileType, formatFileSize } from '../services/api';

export default function UploadModal({ isOpen, onClose }) {
  const { uploadFile } = useDocs();

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const renderTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText size={28} color="#ef4444" />;
      case 'image':
        return <ImageIcon size={28} color="#10b981" />;
      case 'docx':
        return <FileText size={28} color="#3b82f6" />;
      case 'spreadsheet':
        return <FileSpreadsheet size={28} color="#059669" />;
      case 'code':
        return <FileCode size={28} color="#f59e0b" />;
      case 'zip':
        return <FileArchive size={28} color="#8b5cf6" />;
      default:
        return <File size={28} color="#6366f1" />;
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate size limit (50 MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('File exceeds maximum size limit of 50 MB.');
      return;
    }

    const detectedType = detectFileType(file.name, file.type);
    const formattedSize = formatFileSize(file.size);

    setSelectedFile(file);
    setFileDetails({
      name: file.name,
      size: file.size,
      sizeFormatted: formattedSize,
      type: detectedType,
      lastModified: file.lastModified ? new Date(file.lastModified).toLocaleDateString() : 'Today',
      mimeType: file.type || 'application/octet-stream'
    });

    // Auto-suggest tags based on file extension
    setTags(`${detectedType.toUpperCase()}, Cloud Upload`);
    setError('');
    setUploadSuccess(false);
    setProgress(0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileDetails(null);
    setUploadSuccess(false);
    setUploadedDoc(null);
    setProgress(0);
    setStatusMessage('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleModalClose = () => {
    if (isUploading) return;
    handleReset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a valid document to upload.');
      return;
    }

    setIsUploading(true);
    setError('');
    setProgress(10);
    setStatusMessage('Preparing upload payload...');

    try {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const fileData = {
        fileName: selectedFile.name,
        size: selectedFile.size,
        category,
        tags: parsedTags.length > 0 ? parsedTags : [category, fileDetails.type.toUpperCase()],
        file: selectedFile
      };

      const res = await uploadFile(fileData, (percent, msg) => {
        setProgress(percent);
        setStatusMessage(msg);
      });

      setUploadedDoc(res.data);
      setUploadSuccess(true);
      setIsUploading(false);
    } catch (err) {
      setIsUploading(false);
      setError('Upload failed. Please check file format and try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={handleModalClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title">
            <UploadCloud size={22} color="#6366f1" />
            <span>Upload Document</span>
          </div>
          <button
            className="btn-icon"
            onClick={handleModalClose}
            disabled={isUploading}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        {uploadSuccess ? (
          /* Success Screen */
          <div className="modal-body fade-in" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                boxShadow: '0 0 24px rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', color: 'var(--text-main)' }}>
              Upload Complete!
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              <strong>{uploadedDoc?.fileName}</strong> is now securely indexed in your Smart Doc workspace.
            </p>

            {/* Quick Document Summary Preview */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1rem',
                textAlign: 'left',
                marginBottom: '1.75rem',
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <span className={`badge badge-${uploadedDoc?.type}`}>
                  {uploadedDoc?.type.toUpperCase()}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>{uploadedDoc?.sizeFormatted}</span>
                <span style={{ color: 'var(--text-subtle)', marginLeft: 'auto' }}>
                  {uploadedDoc?.category}
                </span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.45' }}>
                {uploadedDoc?.summary}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
              >
                <Plus size={16} />
                <span>Upload Another</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleModalClose}
              >
                <span>View in Workspace</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          /* Upload Form */
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#f87171',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg,.svg,.webp,.xlsx,.xls,.csv,.zip,.json,.md"
              />

              {!selectedFile ? (
                /* Dropzone Area */
                <div
                  className={`dropzone-area ${isDragging ? 'drag-active' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="dropzone-icon">
                    <UploadCloud size={28} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '4px' }}>
                      Click to choose a file or drag & drop here
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                      Supports PDF, DOCX, Images, Spreadsheets, Code, and ZIP (up to 50 MB)
                    </div>
                  </div>
                </div>
              ) : (
                /* Selected File Preview Card */
                <div
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {renderTypeIcon(fileDetails.type)}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div
                        style={{
                          fontWeight: '600',
                          color: 'var(--text-main)',
                          fontSize: '0.92rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '280px'
                        }}
                        title={fileDetails.name}
                      >
                        {fileDetails.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '4px' }}>
                        <span className={`badge badge-${fileDetails.type}`}>
                          {fileDetails.type.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {fileDetails.sizeFormatted}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isUploading && (
                    <button
                      type="button"
                      className="btn-ghost btn-sm"
                      onClick={handleReset}
                      style={{ color: 'var(--text-subtle)', flexShrink: 0 }}
                      title="Select different file"
                    >
                      Change
                    </button>
                  )}
                </div>
              )}

              {/* Progress State */}
              {isUploading && (
                <div style={{ background: 'rgba(22, 31, 51, 0.6)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '500', color: '#a5b4fc' }}>{statusMessage}</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{progress}%</span>
                  </div>
                  <div className="storage-bar-bg" style={{ height: '8px' }}>
                    <div
                      className="storage-bar-fill"
                      style={{
                        width: `${progress}%`,
                        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Category & Tags Configuration */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isUploading}
                >
                  <option value="General">General Documents</option>
                  <option value="Finance">Finance & Reports</option>
                  <option value="Engineering">Engineering & Architecture</option>
                  <option value="AI & Research">AI & Research</option>
                  <option value="HR & Legal">HR & Legal</option>
                  <option value="Product">Product Specifications</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Q3, Invoices, Gemini, Draft"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={isUploading}
                />
              </div>

              {/* Informational Pipeline Note */}
              <div
                style={{
                  background: 'rgba(99, 102, 241, 0.08)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '8px',
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  fontSize: '0.78rem',
                  color: '#a5b4fc'
                }}
              >
                <Sparkles size={16} color="#c084fc" />
                <span>
                  Files are securely stored in Supabase Storage ("documents" bucket) and indexed in Supabase database.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleModalClose}
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedFile || isUploading}
                id="submit-upload-btn"
              >
                {isUploading ? (
                  <>
                    <RefreshCw size={16} className="pulse-glow" style={{ animation: 'spin 1.5s linear infinite' }} />
                    <span>Processing ({progress}%)...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    <span>Upload Document</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
