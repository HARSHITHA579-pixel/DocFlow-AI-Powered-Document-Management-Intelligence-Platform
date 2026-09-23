import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { docService } from '../services/api';
import Toast from '../components/Toast';

const DocContext = createContext();

export function DocProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({
    totalFiles: 0,
    usedFormatted: '0 MB',
    totalCapacityFormatted: '15 GB',
    usedPercentage: 0,
    aiSummariesCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Light / Dark Theme State with LocalStorage Persistence
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('docflow_theme');
      return saved === 'light' || saved === 'dark' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('docflow_theme', theme);
    } catch (e) {
      console.warn('LocalStorage not accessible', e);
    }

    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.body.classList.add('theme-light');
      document.documentElement.classList.remove('theme-dark');
      document.body.classList.remove('theme-dark');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.body.classList.remove('theme-light');
      document.documentElement.classList.add('theme-dark');
      document.body.classList.add('theme-dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Show auto-dismissing toast notification
  const showToast = useCallback((message, type = 'success', actionText = null, onAction = null) => {
    setToast({ message, type, actionText, onAction });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const refreshData = useCallback(async () => {
    try {
      const [filesRes, statsRes] = await Promise.all([
        docService.getFiles(),
        docService.getStorageStats()
      ]);
      setFiles(filesRes.data);
      setStats(statsRes);
    } catch (err) {
      console.error('Error refreshing document data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleUpload = async (fileData, onProgress) => {
    const result = await docService.uploadFile(fileData, onProgress);
    await refreshData();
    showToast(`Uploaded ${result.data.fileName} successfully!`);
    return result;
  };

  const handleDelete = async (fileId) => {
    const result = await docService.deleteFile(fileId);
    await refreshData();
    showToast('File permanently deleted');
    return result;
  };

  const handleToggleStar = async (fileId) => {
    const result = await docService.toggleStar(fileId);
    await refreshData();
    const isStarred = result.data?.starred;
    showToast(isStarred ? 'Added to Starred' : 'Removed from Starred');
    return result;
  };

  const handleRename = async (fileId, newName) => {
    try {
      const result = await docService.renameFile(fileId, newName);
      await refreshData();
      showToast(`Renamed to "${newName}"`);
      return result;
    } catch (err) {
      showToast(err.message || 'Rename failed', 'error');
      throw err;
    }
  };

  const handleCopy = async (fileId) => {
    try {
      const result = await docService.copyFile(fileId);
      await refreshData();
      showToast(`Copy created: ${result.data.fileName}`);
      return result;
    } catch (err) {
      showToast('Failed to create copy', 'error');
      throw err;
    }
  };

  const handleMove = async (fileId, newCategory) => {
    try {
      const result = await docService.moveFile(fileId, newCategory);
      await refreshData();
      showToast(`Moved to ${newCategory}`);
      return result;
    } catch (err) {
      showToast('Failed to move file', 'error');
      throw err;
    }
  };

  const handleMoveToTrash = async (fileId) => {
    try {
      await docService.moveToTrash(fileId);
      await refreshData();
      showToast('Moved to trash', 'info', 'Undo', async () => {
        await docService.restoreFromTrash(fileId);
        await refreshData();
        showToast('Restored from trash');
      });
    } catch (err) {
      showToast('Failed to move to trash', 'error');
    }
  };

  const handleHideSuggestion = async (fileId) => {
    try {
      await docService.hideSuggestion(fileId);
      await refreshData();
      showToast('Item removed from suggestions');
    } catch (err) {
      showToast('Failed to hide item', 'error');
    }
  };

  const handleShare = async (fileId, shareDetails) => {
    try {
      const result = await docService.shareFile(fileId, shareDetails);
      await refreshData();
      showToast(`Access granted to ${shareDetails.email}`);
      return result;
    } catch (err) {
      showToast('Sharing failed', 'error');
      throw err;
    }
  };

  const handleDownload = (file) => {
    const success = docService.downloadFileLocally(file);
    if (success) {
      showToast(`Download started: ${file.fileName}`);
    } else {
      showToast('Download started');
    }
  };

  const openUpload = () => setIsUploadOpen(true);
  const closeUpload = () => setIsUploadOpen(false);

  return (
    <DocContext.Provider
      value={{
        files,
        stats,
        loading,
        refreshData,
        uploadFile: handleUpload,
        deleteFile: handleDelete,
        toggleStar: handleToggleStar,
        renameFile: handleRename,
        copyFile: handleCopy,
        moveFile: handleMove,
        moveToTrash: handleMoveToTrash,
        hideSuggestion: handleHideSuggestion,
        shareFile: handleShare,
        downloadFile: handleDownload,
        showToast,
        isUploadOpen,
        openUpload,
        closeUpload,
        theme,
        setTheme,
        toggleTheme
      }}
    >
      {children}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </DocContext.Provider>
  );
}

export function useDocs() {
  const context = useContext(DocContext);
  if (!context) {
    throw new Error('useDocs must be used within a DocProvider');
  }
  return context;
}
