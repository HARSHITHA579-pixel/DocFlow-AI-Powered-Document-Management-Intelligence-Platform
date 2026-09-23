import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Star,
  Download,
  Trash2,
  MoreVertical,
  File
} from 'lucide-react';
import { useDocs } from '../context/DocContext';
import { docService } from '../services/api';
import { supabase } from '../lib/supabaseClient';
import FileContextMenu from './FileContextMenu';
import RenameModal from './RenameModal';
import ShareModal from './ShareModal';
import FileInfoModal from './FileInfoModal';
import MoveFileModal from './MoveFileModal';
import ConfirmationModal from './ConfirmationModal';

export default function FileCard({
  file,
  viewMode = 'grid'
}) {
  const navigate = useNavigate();
  const threeDotsRef = useRef(null);
  const currentUser = docService.getCurrentUser();

  const {
    toggleStar,
    deleteFile,
    renameFile,
    copyFile,
    moveFile,
    moveToTrash,
    hideSuggestion,
    shareFile,
    downloadFile,
    showToast
  } = useDocs();

  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'rename' | 'share' | 'info' | 'move' | 'trash'

  if (file.trashed) return null;

  // Render File-type icon
  const renderDriveIcon = (type, size = 18) => {
    switch (type) {
      case 'pdf':
        return (
          <div className="gdrive-icon-wrap pdf" title="PDF Document">
            <FileText size={size} color="#ea4335" />
          </div>
        );
      case 'docx':
      case 'doc':
        return (
          <div className="gdrive-icon-wrap docx" title="Word Document">
            <FileText size={size} color="#4285f4" />
          </div>
        );
      case 'spreadsheet':
      case 'xlsx':
      case 'xls':
        return (
          <div className="gdrive-icon-wrap spreadsheet" title="Spreadsheet">
            <FileSpreadsheet size={size} color="#0f9d58" />
          </div>
        );
      case 'image':
      case 'png':
      case 'jpg':
        return (
          <div className="gdrive-icon-wrap image" title="Image File">
            <ImageIcon size={size} color="#ea4335" />
          </div>
        );
      case 'code':
      case 'json':
        return (
          <div className="gdrive-icon-wrap code" title="Code / Data">
            <FileCode size={size} color="#f59e0b" />
          </div>
        );
      case 'zip':
        return (
          <div className="gdrive-icon-wrap zip" title="Archive">
            <FileArchive size={size} color="#a142f4" />
          </div>
        );
      default:
        return (
          <div className="gdrive-icon-wrap default" title="Document">
            <File size={size} color="#5f6368" />
          </div>
        );
    }
  };

  // Activity date formatting
  const formattedActivity = (() => {
    const dateObj = new Date(file.uploadDate);
    const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
    const day = dateObj.getDate();
    return `Uploaded · ${month} ${day}`;
  })();

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('.gdrive-context-menu-popover')) return;

    // Open the REAL file in Supabase Storage directly in a new browser tab
    if (file.publicUrl) {
      window.open(file.publicUrl, '_blank');
      return;
    }

    const storagePath = file.filePath || file.rawFileName || file.fileName || file.name;
    if (supabase) {
      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(storagePath);

      if (data?.publicUrl) {
        window.open(data.publicUrl, '_blank');
        return;
      }
    }

    // If no public URL found, trigger direct download
    downloadFile(file);
  };

  const handleCopyLink = (targetFile) => {
    const targetUrl = targetFile.publicUrl || (supabase && supabase.storage.from('documents').getPublicUrl(targetFile.filePath || targetFile.fileName).data?.publicUrl);
    if (targetUrl) {
      navigator.clipboard.writeText(targetUrl);
      showToast('Public document link copied to clipboard');
    }
  };

  const renderPreviewThumbnail = () => {
    if (file.type === 'pdf') {
      return (
        <div className="gdrive-preview-sheet pdf-sheet">
          <div className="sheet-top-bar pdf-bar" />
          <div className="sheet-body">
            <div className="sheet-title-line" />
            <div className="sheet-text-line" style={{ width: '85%' }} />
            <div className="sheet-text-line" style={{ width: '92%' }} />
            <div className="sheet-text-line" style={{ width: '70%' }} />
            <div className="sheet-badge-row">
              <span className="pdf-mini-tag">PDF</span>
              <span className="pdf-size-tag">{file.sizeFormatted}</span>
            </div>
          </div>
        </div>
      );
    }

    if (file.type === 'docx') {
      return (
        <div className="gdrive-preview-sheet docx-sheet">
          <div className="sheet-top-bar docx-bar" />
          <div className="sheet-body">
            <div className="sheet-title-line" style={{ background: '#4285f4' }} />
            <div className="sheet-text-line" style={{ width: '90%' }} />
            <div className="sheet-text-line" style={{ width: '80%' }} />
            <div className="sheet-text-line" style={{ width: '65%' }} />
            <div className="sheet-text-line" style={{ width: '88%' }} />
          </div>
        </div>
      );
    }

    if (file.type === 'spreadsheet') {
      return (
        <div className="gdrive-preview-sheet sheet-grid-mock">
          <div className="grid-mock-header">
            <div className="grid-cell-h" />
            <div className="grid-cell-h" />
            <div className="grid-cell-h" />
          </div>
          <div className="grid-mock-row">
            <div className="grid-cell" />
            <div className="grid-cell fill-1" />
            <div className="grid-cell" />
          </div>
          <div className="grid-mock-row">
            <div className="grid-cell" />
            <div className="grid-cell fill-2" />
            <div className="grid-cell fill-3" />
          </div>
          <div className="grid-mock-row">
            <div className="grid-cell fill-1" />
            <div className="grid-cell" />
            <div className="grid-cell" />
          </div>
        </div>
      );
    }

    if (file.type === 'image') {
      return (
        <div className="gdrive-preview-image-mock">
          <div className="image-mock-shape">
            <ImageIcon size={32} color="#ea4335" />
          </div>
          <span className="image-mock-label">{file.fileName.split('.').pop()?.toUpperCase()} IMAGE</span>
        </div>
      );
    }

    if (file.type === 'code') {
      return (
        <div className="gdrive-preview-code-mock">
          <div className="code-dots">
            <span className="dot dot-r" />
            <span className="dot dot-y" />
            <span className="dot dot-g" />
          </div>
          <div className="code-line"><span className="kw">import</span> supabase;</div>
          <div className="code-line"><span className="fn">storage</span>(<span className="str">"documents"</span>);</div>
          <div className="code-line indent"><span className="kw">return</span> <span className="val">200</span>;</div>
        </div>
      );
    }

    return (
      <div className="gdrive-preview-sheet zip-sheet">
        <div className="sheet-top-bar zip-bar" />
        <div className="sheet-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <FileArchive size={28} color="#a142f4" />
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', fontWeight: '600' }}>
            {file.sizeFormatted} Archive
          </span>
        </div>
      </div>
    );
  };

  return (
    <>
      {viewMode === 'list' ? (
        /* List View Row */
        <div
          className={`gdrive-row-card ${menuOpen ? 'menu-open' : ''}`}
          onClick={handleCardClick}
          style={{ zIndex: menuOpen ? 999 : 1, position: 'relative', cursor: 'pointer' }}
          title="Click to open file in new tab"
        >
          <div className="gdrive-row-icon">
            {renderDriveIcon(file.type, 20)}
          </div>

          <div className="gdrive-row-title" title={file.fileName}>
            {file.fileName}
          </div>

          <div className="gdrive-row-owner">
            <div className="gdrive-mini-avatar">
              <div className="avatar-fallback">H</div>
            </div>
            <span>{file.owner || currentUser?.name || 'Harshitha R.'}</span>
          </div>

          <div className="gdrive-row-date">
            {new Date(file.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>

          <div className="gdrive-row-size">
            {file.sizeFormatted}
          </div>

          <div className="gdrive-row-actions" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={`gdrive-action-btn ${file.starred ? 'starred' : ''}`}
              onClick={() => toggleStar(file.fileId)}
              title={file.starred ? 'Unstar' : 'Star'}
            >
              <Star size={16} fill={file.starred ? '#f59e0b' : 'none'} color={file.starred ? '#f59e0b' : '#94a3b8'} />
            </button>

            <button
              type="button"
              className="gdrive-action-btn"
              onClick={() => downloadFile(file)}
              title="Download file"
            >
              <Download size={16} color="#94a3b8" />
            </button>

            <div className="gdrive-menu-trigger-container" style={{ position: 'relative', display: 'inline-flex', zIndex: menuOpen ? 1000 : 1 }}>
              <button
                type="button"
                ref={threeDotsRef}
                className="gdrive-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                title="More actions"
              >
                <MoreVertical size={16} color="#94a3b8" />
              </button>

              {menuOpen && (
                <FileContextMenu
                  file={file}
                  isOpen={menuOpen}
                  onClose={() => setMenuOpen(false)}
                  anchorRef={threeDotsRef}
                  onOpenWith={() => handleCardClick({ target: {} })}
                  onDownload={() => downloadFile(file)}
                  onRename={() => setActiveModal('rename')}
                  onCopy={() => copyFile(file.fileId)}
                  onShare={() => setActiveModal('share')}
                  onCopyLink={() => handleCopyLink(file)}
                  onToggleStar={() => toggleStar(file.fileId)}
                  onMove={() => setActiveModal('move')}
                  onFileInfo={() => setActiveModal('info')}
                  onMoveToTrash={() => setActiveModal('trash')}
                  onHideSuggestion={() => hideSuggestion(file.fileId)}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Grid View Card */
        <div
          className={`gdrive-file-card fade-in ${menuOpen ? 'menu-open' : ''}`}
          onClick={handleCardClick}
          style={{ zIndex: menuOpen ? 999 : 1, position: 'relative', cursor: 'pointer' }}
          title="Click to open file in new tab"
        >
          <div className="gdrive-card-header">
            <div className="gdrive-header-left">
              {renderDriveIcon(file.type, 18)}
              <span className="gdrive-file-title" title={file.fileName}>
                {file.fileName}
              </span>
            </div>

            <div className="gdrive-menu-trigger-container" style={{ position: 'relative', display: 'inline-flex', zIndex: menuOpen ? 1000 : 1 }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                ref={threeDotsRef}
                className="gdrive-three-dots-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                title="More actions"
                aria-label="More actions"
              >
                <MoreVertical size={18} />
              </button>

              {menuOpen && (
                <FileContextMenu
                  file={file}
                  isOpen={menuOpen}
                  onClose={() => setMenuOpen(false)}
                  anchorRef={threeDotsRef}
                  onOpenWith={() => handleCardClick({ target: {} })}
                  onDownload={() => downloadFile(file)}
                  onRename={() => setActiveModal('rename')}
                  onCopy={() => copyFile(file.fileId)}
                  onShare={() => setActiveModal('share')}
                  onCopyLink={() => handleCopyLink(file)}
                  onToggleStar={() => toggleStar(file.fileId)}
                  onMove={() => setActiveModal('move')}
                  onFileInfo={() => setActiveModal('info')}
                  onMoveToTrash={() => setActiveModal('trash')}
                  onHideSuggestion={() => hideSuggestion(file.fileId)}
                />
              )}
            </div>
          </div>

          <div className="gdrive-preview-area">
            {renderPreviewThumbnail()}
          </div>

          <div className="gdrive-card-footer">
            <div className="gdrive-footer-activity">
              <div className="gdrive-mini-avatar">
                <div className="avatar-fallback">H</div>
              </div>
              <span className="gdrive-activity-text">
                {formattedActivity}
              </span>
            </div>

            {file.starred && (
              <div className="gdrive-star-indicator" title="Starred document">
                <Star size={14} fill="#f59e0b" color="#f59e0b" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals triggered by Menu Options */}
      <RenameModal
        file={file}
        isOpen={activeModal === 'rename'}
        onClose={() => setActiveModal(null)}
        onRename={renameFile}
      />

      <ShareModal
        file={file}
        isOpen={activeModal === 'share'}
        onClose={() => setActiveModal(null)}
        onShare={shareFile}
      />

      <FileInfoModal
        file={file}
        isOpen={activeModal === 'info'}
        onClose={() => setActiveModal(null)}
      />

      <MoveFileModal
        file={file}
        isOpen={activeModal === 'move'}
        onClose={() => setActiveModal(null)}
        onMove={moveFile}
      />

      <ConfirmationModal
        isOpen={activeModal === 'trash'}
        title="Move to trash?"
        message={`"${file.fileName}" will be moved to trash and hidden from your active workspace.`}
        confirmText="Move to trash"
        confirmVariant="danger"
        onClose={() => setActiveModal(null)}
        onConfirm={() => moveToTrash(file.fileId)}
      />
    </>
  );
}
