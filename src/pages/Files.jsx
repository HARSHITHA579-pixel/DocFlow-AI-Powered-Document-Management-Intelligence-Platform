import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Grid,
  List as ListIcon,
  Upload,
  ArrowUpDown,
  Filter,
  Star,
  FileText
} from 'lucide-react';
import { useDocs } from '../context/DocContext';
import { docService } from '../services/api';
import FileCard from '../components/FileCard';

export default function Files({ onOpenUpload }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { files, loading, deleteFile, toggleStar } = useDocs();
  const [viewMode, setViewMode] = useState('grid');
  const [activeTypeFilter, setActiveTypeFilter] = useState(searchParams.get('type') || 'all');
  const [sortBy, setSortBy] = useState('date-desc');

  const starredOnly = searchParams.get('filter') === 'starred';
  const categoryParam = searchParams.get('category');

  useEffect(() => {
    if (searchParams.get('type')) {
      setActiveTypeFilter(searchParams.get('type'));
    }
  }, [searchParams]);

  const handleDelete = async (fileId) => {
    if (window.confirm('Delete this file permanently from Supabase?')) {
      await deleteFile(fileId);
    }
  };

  const handleToggleStar = async (fileId) => {
    await toggleStar(fileId);
  };

  const handleDownload = async (file) => {
    await docService.downloadFileLocally(file);
  };

  // Filter logic
  const filteredFiles = files.filter((file) => {
    if (starredOnly && !file.starred) return false;
    if (categoryParam && !file.category.toLowerCase().includes(categoryParam.toLowerCase())) return false;
    if (activeTypeFilter === 'all') return true;
    if (activeTypeFilter === 'starred') return file.starred;
    return file.type === activeTypeFilter;
  });

  // Sort logic
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.uploadDate) - new Date(a.uploadDate);
    if (sortBy === 'date-asc') return new Date(a.uploadDate) - new Date(b.uploadDate);
    if (sortBy === 'name-asc') return a.fileName.localeCompare(b.fileName);
    if (sortBy === 'name-desc') return b.fileName.localeCompare(a.fileName);
    if (sortBy === 'size-desc') return b.size - a.size;
    if (sortBy === 'size-asc') return a.size - b.size;
    return 0;
  });

  const filterTabs = [
    { key: 'all', label: 'All Files' },
    { key: 'pdf', label: 'PDFs' },
    { key: 'docx', label: 'Documents' },
    { key: 'image', label: 'Images' },
    { key: 'spreadsheet', label: 'Sheets' },
    { key: 'code', label: 'Code/JSON' },
    { key: 'zip', label: 'Archives' },
  ];

  return (
    <div className="page-wrapper fade-in">
      {/* Header & Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-subtle)', marginBottom: '0.35rem' }}>
            <span>Workspace</span>
            <span>/</span>
            <span style={{ color: 'var(--text-main)' }}>
              {starredOnly ? 'Starred Documents' : categoryParam ? `Category: ${categoryParam}` : 'All Files'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.6rem' }}>
            {starredOnly ? 'Starred Documents' : categoryParam ? `${categoryParam} Documents` : 'My Files'}
          </h1>
        </div>

        <button className="btn btn-primary" onClick={onOpenUpload}>
          <Upload size={16} />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter Tabs & View Mode Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        {/* Type Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              className={`filter-tab ${activeTypeFilter === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTypeFilter(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View Mode & Sort Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <ArrowUpDown size={14} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="size-desc">Size (Large to Small)</option>
              <option value="size-asc">Size (Small to Large)</option>
            </select>
          </div>

          <div style={{ display: 'flex', background: 'var(--bg-card)', borderRadius: '8px', padding: '2px', border: '1px solid var(--border-color)' }}>
            <button
              className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
              style={{ width: '32px', height: '32px', color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              <Grid size={16} />
            </button>
            <button
              className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
              style={{ width: '32px', height: '32px', color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)' }}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Files Display */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          Loading document repository from Supabase...
        </div>
      ) : sortedFiles.length === 0 ? (
        <div className="glass-card empty-files-container" style={{ padding: '4.5rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
          <div className="empty-files-icon-wrap" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <FolderKanban size={32} color="#818cf8" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
            {files.length === 0 ? 'No documents yet' : 'No documents found'}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', maxWidth: '420px', margin: '0 auto 1.75rem auto', fontSize: '0.95rem', lineHeight: '1.5' }}>
            {files.length === 0
              ? 'Upload your first document to get started.'
              : starredOnly
              ? 'You have not starred any files yet. Click the star icon on any document to save it here.'
              : 'Try selecting a different filter or upload a new document to your workspace.'}
          </p>
          <button className="btn btn-primary" onClick={onOpenUpload} id="empty-state-upload-btn" style={{ padding: '0.8rem 1.75rem', fontSize: '0.95rem' }}>
            <Upload size={17} />
            <span>Upload Document</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="file-card-grid">
          {sortedFiles.map((file) => (
            <FileCard
              key={file.fileId}
              file={file}
              viewMode="grid"
              onDelete={handleDelete}
              onToggleStar={handleToggleStar}
              onDownload={handleDownload}
            />
          ))}
        </div>
      ) : (
        <div className="file-list-view">
          {sortedFiles.map((file) => (
            <FileCard
              key={file.fileId}
              file={file}
              viewMode="list"
              onDelete={handleDelete}
              onToggleStar={handleToggleStar}
              onDownload={handleDownload}
            />
          ))}
        </div>
      )}
    </div>
  );
}
