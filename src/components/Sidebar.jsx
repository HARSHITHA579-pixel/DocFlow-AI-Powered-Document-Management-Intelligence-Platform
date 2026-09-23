import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  LayoutDashboard,
  FolderKanban,
  Search as SearchIcon,
  Star,
  HardDrive,
  Upload,
  Sparkles,
  X,
  Layers,
  Database
} from 'lucide-react';
import { useDocs } from '../context/DocContext';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ mobileOpen, onCloseSidebar, onOpenUpload }) {
  const navigate = useNavigate();
  const { stats } = useDocs();
  const { user } = useAuth();

  const currentUser = user || {
    name: 'Demo User',
    email: 'demo@docflow.com',
    role: 'Workspace Owner'
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${mobileOpen ? 'mobile-open' : ''}`}
        onClick={onCloseSidebar}
      />
      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/files" className="brand-logo" onClick={onCloseSidebar}>
            <div className="brand-icon">
              <Layers size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="brand-text">DocFlow</span>
                <span className="brand-badge">Smart</span>
              </div>
            </div>
          </Link>

          <button
            className="btn-icon"
            onClick={onCloseSidebar}
            style={{ display: mobileOpen ? 'flex' : 'none' }}
            aria-label="Close Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sidebar-action-wrap">
          <button
            className="sidebar-upload-btn"
            onClick={() => {
              onCloseSidebar && onCloseSidebar();
              onOpenUpload();
            }}
            id="sidebar-upload-btn"
          >
            <Upload size={18} />
            <span>Upload Document</span>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Navigation</div>

          <NavLink
            to="/files"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onCloseSidebar}
          >
            <FolderKanban size={18} />
            <span>My Files</span>
            <span className="link-badge">{stats.totalFiles}</span>
          </NavLink>

          <NavLink
            to="/dashboard"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onCloseSidebar}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onCloseSidebar}
          >
            <SearchIcon size={18} />
            <span>Search & Filter</span>
          </NavLink>

          <NavLink
            to="/files?filter=starred"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            onClick={onCloseSidebar}
          >
            <Star size={18} />
            <span>Starred Docs</span>
          </NavLink>

          <div className="sidebar-section-title">Cloud Pipeline</div>

          <div
            className="sidebar-link"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigate('/search?tag=Gemini');
              onCloseSidebar();
            }}
          >
            <Sparkles size={18} color="#c084fc" />
            <span>AI Summaries</span>
            <span className="link-badge" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#d8b4fe' }}>
              Gemini
            </span>
          </div>

          <div className="sidebar-link" style={{ opacity: 0.85 }}>
            <Database size={18} color="#38bdf8" />
            <span>S3 + DynamoDB</span>
            <span className="link-badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              Ready
            </span>
          </div>
        </nav>

        <div className="sidebar-storage">
          <div className="storage-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600' }}>
              <HardDrive size={15} color="#818cf8" />
              <span>S3 Cloud Storage</span>
            </div>
            <span>{stats.usedPercentage}%</span>
          </div>

          <div className="storage-bar-bg">
            <div
              className="storage-bar-fill"
              style={{ width: `${Math.max(stats.usedPercentage, stats.totalFiles > 0 ? 5 : 0)}%` }}
            />
          </div>

          <div className="storage-details">
            <span>{stats.usedFormatted} used</span>
            <span>{stats.totalCapacityFormatted} tier</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile-mini">
            <div className="user-avatar">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser.name || 'Demo User'}</div>
              <div className="user-role">{currentUser.role || 'Workspace Owner'}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
