import React, { useState, useRef, useEffect } from 'react';
import {
  ExternalLink,
  Download,
  Edit3,
  Copy,
  Sparkles,
  Headphones,
  Share2,
  Folder,
  Info,
  Trash2,
  ThumbsDown,
  ChevronRight,
  Star,
  Link as LinkIcon,
  Clock,
  FileText,
  Eye,
  FolderPlus,
  EyeOff,
  Code
} from 'lucide-react';

export default function FileContextMenu({
  file,
  isOpen,
  onClose,
  anchorRef,
  onOpenWith,
  onDownload,
  onRename,
  onCopy,
  onAskAI,
  onAudioOverview,
  onShare,
  onCopyLink,
  onToggleStar,
  onMove,
  onFileInfo,
  onMoveToTrash,
  onHideSuggestion
}) {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [openUpward, setOpenUpward] = useState(false);
  const [openSubmenuLeft, setOpenSubmenuLeft] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If near the bottom of the viewport, open upwards
      if (spaceBelow < 390 && spaceAbove > 300) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }

      // Check if submenus would overflow the right edge of the screen
      // If the right edge of the card/button + 220px submenu width > window width, open submenus to the left
      if (rect.right + 220 > window.innerWidth || window.innerWidth < 850) {
        setOpenSubmenuLeft(true);
      } else {
        setOpenSubmenuLeft(false);
      }
    }
  }, [isOpen, anchorRef]);

  // Click outside and Escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        (!anchorRef?.current || !anchorRef.current.contains(e.target))
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen || !file) return null;

  // Render open with options based on file type
  const getOpenWithOptions = () => {
    if (file.type === 'pdf') {
      return [
        { label: 'DocFlow PDF Reader', icon: <FileText size={15} color="#ea4335" />, action: () => onOpenWith('pdf-viewer') },
        { label: 'Document Details', icon: <Eye size={15} color="#4285f4" />, action: () => onOpenWith('details') }
      ];
    }
    if (file.type === 'docx') {
      return [
        { label: 'Document Viewer', icon: <FileText size={15} color="#4285f4" />, action: () => onOpenWith('doc-viewer') },
        { label: 'Document Details', icon: <Eye size={15} color="#4285f4" />, action: () => onOpenWith('details') }
      ];
    }
    if (file.type === 'spreadsheet') {
      return [
        { label: 'Spreadsheet Viewer', icon: <FileText size={15} color="#0f9d58" />, action: () => onOpenWith('sheet-viewer') },
        { label: 'Document Details', icon: <Eye size={15} color="#4285f4" />, action: () => onOpenWith('details') }
      ];
    }
    if (file.type === 'code') {
      return [
        { label: 'Code Inspector', icon: <Code size={15} color="#f59e0b" />, action: () => onOpenWith('code-viewer') },
        { label: 'Document Details', icon: <Eye size={15} color="#4285f4" />, action: () => onOpenWith('details') }
      ];
    }
    return [
      { label: 'DocFlow Quick View', icon: <Eye size={15} color="#6366f1" />, action: () => onOpenWith('details') }
    ];
  };

  return (
    <div
      ref={menuRef}
      className="gdrive-context-menu-popover fade-in"
      style={{
        position: 'absolute',
        top: openUpward ? 'auto' : '100%',
        bottom: openUpward ? '100%' : 'auto',
        right: 0,
        marginTop: openUpward ? 0 : '4px',
        marginBottom: openUpward ? '4px' : 0,
        zIndex: 150
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 1. Open With Submenu */}
      <div
        className="gdrive-menu-row has-submenu"
        onMouseEnter={() => setActiveSubmenu('openWith')}
        onMouseLeave={() => setActiveSubmenu(null)}
        onClick={() => setActiveSubmenu(activeSubmenu === 'openWith' ? null : 'openWith')}
      >
        <div className="gdrive-menu-row-content">
          <ExternalLink size={16} className="menu-icon" />
          <span>Open with</span>
        </div>
        <ChevronRight size={14} className="submenu-arrow" />

        {activeSubmenu === 'openWith' && (
          <div
            className="gdrive-nested-submenu fade-in"
            style={{
              right: openSubmenuLeft ? '100%' : 'auto',
              left: openSubmenuLeft ? 'auto' : '100%',
              marginRight: openSubmenuLeft ? '4px' : 0,
              marginLeft: openSubmenuLeft ? 0 : '4px'
            }}
          >
            {getOpenWithOptions().map((opt, i) => (
              <button
                key={i}
                type="button"
                className="gdrive-menu-btn"
                onClick={() => {
                  opt.action();
                  onClose();
                }}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Download */}
      <button
        type="button"
        className="gdrive-menu-btn"
        onClick={() => {
          onDownload(file);
          onClose();
        }}
      >
        <Download size={16} className="menu-icon" />
        <span>Download</span>
        <span className="shortcut-label">⌘D</span>
      </button>

      {/* 3. Rename */}
      <button
        type="button"
        className="gdrive-menu-btn"
        onClick={() => {
          onRename(file);
          onClose();
        }}
      >
        <Edit3 size={16} className="menu-icon" />
        <span>Rename</span>
        <span className="shortcut-label">F2</span>
      </button>

      {/* 4. Make a Copy */}
      <button
        type="button"
        className="gdrive-menu-btn"
        onClick={() => {
          onCopy(file.fileId);
          onClose();
        }}
      >
        <Copy size={16} className="menu-icon" />
        <span>Make a copy</span>
      </button>

      <div className="gdrive-menu-divider" />

      {/* 5. Ask AI / Ask Gemini */}
      <button
        type="button"
        className="gdrive-menu-btn ai-highlight-item"
        onClick={() => {
          onAskAI(file);
          onClose();
        }}
      >
        <Sparkles size={16} color="#c084fc" className="menu-icon" />
        <span style={{ fontWeight: '600', color: '#c084fc' }}>Ask AI / Ask Gemini</span>
        <span className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', fontSize: '0.62rem', padding: '1px 5px', borderRadius: '4px' }}>
          AI
        </span>
      </button>

      {/* 6. Create Audio Overview */}
      <button
        type="button"
        className="gdrive-menu-btn"
        onClick={() => {
          onAudioOverview(file);
          onClose();
        }}
      >
        <Headphones size={16} color="#db2777" className="menu-icon" />
        <span>Create an audio overview</span>
      </button>

      <div className="gdrive-menu-divider" />

      {/* 7. Share Submenu */}
      <div
        className="gdrive-menu-row has-submenu"
        onMouseEnter={() => setActiveSubmenu('share')}
        onMouseLeave={() => setActiveSubmenu(null)}
        onClick={() => setActiveSubmenu(activeSubmenu === 'share' ? null : 'share')}
      >
        <div className="gdrive-menu-row-content">
          <Share2 size={16} className="menu-icon" />
          <span>Share</span>
        </div>
        <ChevronRight size={14} className="submenu-arrow" />

        {activeSubmenu === 'share' && (
          <div
            className="gdrive-nested-submenu fade-in"
            style={{
              right: openSubmenuLeft ? '100%' : 'auto',
              left: openSubmenuLeft ? 'auto' : '100%',
              marginRight: openSubmenuLeft ? '4px' : 0,
              marginLeft: openSubmenuLeft ? 0 : '4px'
            }}
          >
            <button
              type="button"
              className="gdrive-menu-btn"
              onClick={() => {
                onShare(file);
                onClose();
              }}
            >
              <Share2 size={15} />
              <span>Share with people</span>
            </button>
            <button
              type="button"
              className="gdrive-menu-btn"
              onClick={() => {
                onCopyLink(file);
                onClose();
              }}
            >
              <LinkIcon size={15} />
              <span>Copy link</span>
            </button>
          </div>
        )}
      </div>

      {/* 8. Organize Submenu */}
      <div
        className="gdrive-menu-row has-submenu"
        onMouseEnter={() => setActiveSubmenu('organize')}
        onMouseLeave={() => setActiveSubmenu(null)}
        onClick={() => setActiveSubmenu(activeSubmenu === 'organize' ? null : 'organize')}
      >
        <div className="gdrive-menu-row-content">
          <Folder size={16} className="menu-icon" />
          <span>Organize</span>
        </div>
        <ChevronRight size={14} className="submenu-arrow" />

        {activeSubmenu === 'organize' && (
          <div
            className="gdrive-nested-submenu fade-in"
            style={{
              right: openSubmenuLeft ? '100%' : 'auto',
              left: openSubmenuLeft ? 'auto' : '100%',
              marginRight: openSubmenuLeft ? '4px' : 0,
              marginLeft: openSubmenuLeft ? 0 : '4px'
            }}
          >
            <button
              type="button"
              className="gdrive-menu-btn"
              onClick={() => {
                onToggleStar(file.fileId);
                onClose();
              }}
            >
              <Star size={15} fill={file.starred ? '#f59e0b' : 'none'} color={file.starred ? '#f59e0b' : 'currentColor'} />
              <span>{file.starred ? 'Remove from Starred' : 'Add to Starred'}</span>
            </button>
            <button
              type="button"
              className="gdrive-menu-btn"
              onClick={() => {
                onMove(file);
                onClose();
              }}
            >
              <FolderPlus size={15} />
              <span>Move to folder</span>
            </button>
          </div>
        )}
      </div>

      {/* 9. File Information Submenu */}
      <div
        className="gdrive-menu-row has-submenu"
        onMouseEnter={() => setActiveSubmenu('fileInfo')}
        onMouseLeave={() => setActiveSubmenu(null)}
        onClick={() => setActiveSubmenu(activeSubmenu === 'fileInfo' ? null : 'fileInfo')}
      >
        <div className="gdrive-menu-row-content">
          <Info size={16} className="menu-icon" />
          <span>File information</span>
        </div>
        <ChevronRight size={14} className="submenu-arrow" />

        {activeSubmenu === 'fileInfo' && (
          <div
            className="gdrive-nested-submenu fade-in"
            style={{
              right: openSubmenuLeft ? '100%' : 'auto',
              left: openSubmenuLeft ? 'auto' : '100%',
              marginRight: openSubmenuLeft ? '4px' : 0,
              marginLeft: openSubmenuLeft ? 0 : '4px'
            }}
          >
            <button
              type="button"
              className="gdrive-menu-btn"
              onClick={() => {
                onFileInfo(file);
                onClose();
              }}
            >
              <Info size={15} />
              <span>Details & Metadata</span>
            </button>
            <button
              type="button"
              className="gdrive-menu-btn"
              onClick={() => {
                onOpenWith('details');
                onClose();
              }}
            >
              <Clock size={15} />
              <span>Activity & Versions</span>
            </button>
          </div>
        )}
      </div>

      <div className="gdrive-menu-divider" />

      {/* 10. Move to Trash */}
      <button
        type="button"
        className="gdrive-menu-btn delete-btn"
        onClick={() => {
          onMoveToTrash(file);
          onClose();
        }}
      >
        <Trash2 size={16} className="menu-icon" color="#f87171" />
        <span style={{ color: '#f87171' }}>Move to trash</span>
        <span className="shortcut-label">⌫</span>
      </button>

      {/* 11. Not a Helpful Suggestion */}
      <button
        type="button"
        className="gdrive-menu-btn"
        onClick={() => {
          onHideSuggestion(file.fileId);
          onClose();
        }}
      >
        <EyeOff size={16} className="menu-icon" />
        <span>Not a helpful suggestion</span>
      </button>
    </div>
  );
}
