import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  File,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useDocs } from '../context/DocContext';
import { detectFileType, formatFileSize } from '../services/api';

export default function UploadFile({ onUploadSuccess }) {
  const { refreshData } = useDocs();

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [category, setCategory] = useState('General');
  const [tags, setTags] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const categories = [
    'General',
    'Finance',
    'Engineering',
    'AI & Research',
    'HR & Legal',
    'Product'
  ];

  const renderTypeIcon = (type) => {
    switch (type) {
      case 'pdf':
        return <FileText size={22} color="#ef4444" />;
      case 'image':
        return <ImageIcon size={22} color="#10b981" />;
      case 'docx':
        return <FileText size={22} color="#3b82f6" />;
      case 'spreadsheet':
        return <FileSpreadsheet size={22} color="#059669" />;
      case 'code':
        return <FileCode size={22} color="#f59e0b" />;
      case 'zip':
        return <FileArchive size={22} color="#8b5cf6" />;
      default:
        return <File size={22} color="#6366f1" />;
    }
  };

  const handleFileSelect = (file) => {
    if (!file) return;

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
      type: detectedType
    });

    setTags(`${detectedType.toUpperCase()}, Supabase`);
    setError('');
    setUploadSuccess(false);
    setProgress(0);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileDetails(null);
    setProgress(0);
    setStatusMessage('');
    setIsUploading(false);
    setUploadSuccess(false);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return;
    }

    if (!supabase) {
      setError('Supabase client is not configured.');
      return;
    }

    setIsUploading(true);
    setProgress(25);
    setStatusMessage('Uploading file to Supabase Storage ("documents" bucket)...');
    setError('');

    try {
      const cleanFileName = selectedFile.name.replace(/\s+/g, '_');
      const filePath = `${Date.now()}_${cleanFileName}`;

      // 1. Upload the actual file to Supabase Storage bucket "documents"
      const { data: storageData, error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type || 'application/octet-stream',
          upsert: false
        });

      if (storageError) {
        console.error('STORAGE UPLOAD ERROR:', storageError);
        setError('Storage error: ' + storageError.message);
        setIsUploading(false);
        return;
      }

      // 2. Wait for the Storage upload to succeed, then show progress
      setProgress(70);
      setStatusMessage('Saving metadata in Supabase database...');

      // 3. Then insert the file metadata into public.documents
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          file_name: selectedFile.name,
          file_path: filePath,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
        });

      // 4. Check and display the actual database error if the insert fails
      if (dbError) {
        console.error('DATABASE INSERT ERROR:', dbError);
        setError('Database error: ' + dbError.message);
        setIsUploading(false);
        return;
      }

      setProgress(100);
      setUploadSuccess(true);
      setIsUploading(false);
      setStatusMessage(`"${selectedFile.name}" uploaded to Supabase successfully!`);

      if (refreshData) {
        await refreshData();
      }

      if (onUploadSuccess) {
        onUploadSuccess({ filePath, fileName: selectedFile.name });
      }

      // Auto-reset after short delay so user can upload another
      setTimeout(() => {
        handleReset();
      }, 2500);
    } catch (err) {
      console.error('Upload error in component:', err);
      setIsUploading(false);
      setError(err.message || 'Upload failed. Please check Supabase connection.');
    }
  };

  return (
    <div className="upload-file-widget glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      {/* Upload Zone */}
      {!selectedFile && (
        <div
          className={`upload-drop-area ${isDragging ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragging ? '#6366f1' : 'rgba(255, 255, 255, 0.15)'}`,
            borderRadius: '12px',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragging ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
            transition: 'all 0.2s ease'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', marginBottom: '0.75rem' }}>
            <UploadCloud size={30} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
            Click to upload or drag & drop files here
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            Supports PDF, DOCX, PNG, JPG, XLSX, ZIP (Max 50MB)
          </p>
        </div>
      )}

      {/* Selected File Details & Options */}
      {selectedFile && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
              {renderTypeIcon(fileDetails?.type)}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: '600', fontSize: '0.95rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {fileDetails?.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {fileDetails?.sizeFormatted} • {fileDetails?.type.toUpperCase()}
                </div>
              </div>
            </div>

            {!isUploading && !uploadSuccess && (
              <button
                type="button"
                onClick={handleReset}
                className="btn-icon"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                title="Remove file"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Category selection */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Document Category
              </label>
              <select
                className="form-input"
                value={category}
                disabled={isUploading || uploadSuccess}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '500', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                Tags (Comma separated)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Invoices, Report, Contract"
                value={tags}
                disabled={isUploading || uploadSuccess}
                onChange={(e) => setTags(e.target.value)}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
              />
            </div>
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                <span>{statusMessage}</span>
                <span>{progress}%</span>
              </div>
              <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: 'linear-gradient(90deg, #6366f1, #38bdf8)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Success Banner */}
          {uploadSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', color: '#34d399', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <CheckCircle2 size={18} />
              <span>{statusMessage || 'Uploaded successfully to Supabase Storage!'}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            {!uploadSuccess && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleReset}
                disabled={isUploading}
              >
                Cancel
              </button>
            )}

            {!uploadSuccess && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleUploadSubmit}
                disabled={isUploading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {isUploading ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    <span>Upload to Supabase</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
