import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Upload,
  Sparkles,
  LogOut,
  User,
  Shield,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ onToggleSidebar, onOpenUpload, title = 'DocFlow' }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  const currentUser = user || {
    name: 'Demo User',
    email: 'demo@docflow.com',
    role: 'Workspace Owner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  };

  const handleLogout = () => {
    setShowProfileMenu(false);
    logout();
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  const avatarUrl = currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80';

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Menu"
          title="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>
        <div className="navbar-title">{title}</div>
      </div>

      <div className="navbar-center">
        <SearchBar />
      </div>

      <div className="navbar-right">
        {/* Light / Dark Mode Toggle */}
        <ThemeToggle />

        <div className="ai-status-indicator" title="DocFlow AI Pipeline: Textract + Gemini Engine Ready">
          <span className="ai-dot"></span>
          <Sparkles size={14} />
          <span>AI Engine</span>
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={onOpenUpload}
          id="navbar-upload-btn"
        >
          <Upload size={16} />
          <span>Upload</span>
        </button>

        {/* Profile Menu & Logout Dropdown */}
        <div style={{ position: 'relative' }} ref={profileMenuRef}>
          <div
            className="gdrive-account-avatar-btn"
            onClick={() => setShowProfileMenu((prev) => !prev)}
            title={`${currentUser.name} (${currentUser.email})`}
            aria-label="User Account Menu"
            id="navbar-profile-avatar-btn"
            style={{ cursor: 'pointer' }}
          >
            <img
              src={avatarUrl}
              alt={currentUser.name}
              className="gdrive-account-avatar-img"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="gdrive-account-avatar-fallback" style={{ display: 'none' }}>
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'D'}
            </div>
          </div>

          {showProfileMenu && (
            <div className="profile-dropdown-menu fade-in" id="profile-dropdown-menu">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-avatar">
                  <img src={avatarUrl} alt={currentUser.name} />
                </div>
                <div className="profile-dropdown-info">
                  <div className="profile-dropdown-name">{currentUser.name}</div>
                  <div className="profile-dropdown-email">{currentUser.email}</div>
                  <span className="profile-dropdown-role">{currentUser.role || 'Workspace Owner'}</span>
                </div>
              </div>

              <div className="profile-dropdown-divider"></div>

              <div className="profile-dropdown-section">
                <div className="profile-dropdown-item" style={{ cursor: 'default', opacity: 0.8 }}>
                  <Shield size={15} color="#34d399" />
                  <span>Session: Authenticated</span>
                </div>
              </div>

              <div className="profile-dropdown-divider"></div>

              <button
                className="profile-dropdown-logout-btn"
                onClick={handleLogout}
                id="profile-logout-button"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
