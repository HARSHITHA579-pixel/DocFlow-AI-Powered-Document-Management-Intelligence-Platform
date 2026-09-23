import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Upload,
  HardDrive,
  Sparkles,
  FolderKanban,
  ArrowRight,
  TrendingUp,
  Clock,
  Folder,
  CheckCircle2,
  Cpu,
  Layers,
  FileBox
} from 'lucide-react';
import { useDocs } from '../context/DocContext';
import { docService } from '../services/api';
import FileCard from '../components/FileCard';
import UploadFile from '../components/UploadFile';

export default function Dashboard({ onOpenUpload }) {
  const navigate = useNavigate();
  const { files, stats, loading, deleteFile, toggleStar, refreshData } = useDocs();

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await deleteFile(fileId);
    }
  };

  const handleToggleStar = async (fileId) => {
    await toggleStar(fileId);
  };

  const handleDownload = async (file) => {
    await docService.downloadFileLocally(file);
  };

  const folders = [
    { name: 'Finance & Invoices', count: files.filter((f) => f.category === 'Finance').length, color: '#38bdf8' },
    { name: 'Engineering Specs', count: files.filter((f) => f.category === 'Engineering').length, color: '#818cf8' },
    { name: 'AI & Research', count: files.filter((f) => f.category === 'AI & Research').length, color: '#c084fc' },
    { name: 'HR & Policies', count: files.filter((f) => f.category === 'HR & Legal').length, color: '#34d399' },
    { name: 'Product Roadmaps', count: files.filter((f) => f.category === 'Product').length, color: '#fbbf24' }
  ];

  return (
    <div className="page-wrapper fade-in">
      {/* Top Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
          DocFlow
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Intelligent Cloud Document Management & Workspace
        </p>
      </div>

      {/* Hero Banner */}
      <section className="dashboard-hero" style={{ marginBottom: '2rem' }}>
        <div className="dashboard-hero-content">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.2)', padding: '4px 10px', borderRadius: '999px', fontSize: '0.78rem', color: '#a5b4fc', fontWeight: '600', marginBottom: '0.75rem' }}>
            <Sparkles size={13} />
            <span>DocFlow Cloud Workspace</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.5rem' }}>
            Upload & Manage Your Enterprise Documents
          </h2>
          <p className="dashboard-hero-subtitle">
            Securely store, organize, and access all your enterprise documents in one place with Supabase cloud storage.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '1rem' }}>
            <Link to="/files" className="btn btn-secondary">
              <FolderKanban size={17} />
              <span>Browse All Files</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Upload File Component Section */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div className="section-header" style={{ marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            <Upload size={20} color="#818cf8" />
            <span>Upload Document</span>
          </h2>
        </div>
        <UploadFile onUploadSuccess={() => refreshData()} />
      </section>

      {/* Stats Grid */}
      <section className="stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.totalFiles}</div>
            <div className="stat-lbl">Stored Documents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
            <HardDrive size={24} />
          </div>
          <div>
            <div className="stat-val">{stats.usedFormatted}</div>
            <div className="stat-lbl">Storage of {stats.totalCapacityFormatted}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>
            <FolderKanban size={24} />
          </div>
          <div>
            <div className="stat-val">{folders.filter((f) => f.count > 0).length}</div>
            <div className="stat-lbl">Active Folders</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="stat-val">100%</div>
            <div className="stat-lbl">Storage Health</div>
          </div>
        </div>
      </section>

      {/* Quick Folders */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div className="section-header">
          <h2 className="section-title">
            <Folder size={20} color="#818cf8" />
            <span>Document Categories</span>
          </h2>
        </div>

        <div className="folder-grid">
          {folders.map((folder, index) => (
            <div
              key={index}
              className="folder-card"
              onClick={() => navigate(`/files?category=${encodeURIComponent(folder.name.split(' ')[0])}`)}
            >
              <Folder size={24} color={folder.color} fill={folder.color} fillOpacity={0.2} />
              <div>
                <div className="folder-name">{folder.name}</div>
                <div className="folder-count">{folder.count} files</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* My Files Section */}
      <section>
        <div className="section-header">
          <h2 className="section-title">
            <FileBox size={20} color="#818cf8" />
            <span>My Files</span>
          </h2>
          <Link to="/files" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>View all ({files.length})</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading documents from Supabase...
          </div>
        ) : files.length === 0 ? (
          <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No documents in your Supabase "documents" bucket yet.</p>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-subtle)' }}>
              Use the upload box above to add your first document.
            </p>
          </div>
        ) : (
          <div className="file-card-grid">
            {files.slice(0, 8).map((file) => (
              <FileCard
                key={file.fileId}
                file={file}
                onDelete={handleDelete}
                onToggleStar={handleToggleStar}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
