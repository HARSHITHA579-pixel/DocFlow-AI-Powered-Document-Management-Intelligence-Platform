import { supabase } from '../lib/supabaseClient';

/**
 * DocFlow Supabase API Service Layer
 * Direct integration with Supabase Storage ("documents" bucket) and "documents" table.
 */

// Helper: detect file type from name or mime
export const detectFileType = (fileName = '', mimeType = '') => {
  const ext = fileName.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext) || mimeType.includes('pdf')) return 'pdf';
  if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif', 'bmp'].includes(ext) || mimeType.startsWith('image/')) return 'image';
  if (['doc', 'docx', 'odt', 'rtf'].includes(ext) || mimeType.includes('word') || mimeType.includes('officedocument.wordprocessingml')) return 'docx';
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext) || mimeType.includes('zip') || mimeType.includes('compressed')) return 'zip';
  if (['js', 'jsx', 'ts', 'tsx', 'json', 'py', 'html', 'css', 'txt', 'md', 'xml', 'yaml', 'yml', 'sh', 'sql'].includes(ext)) return 'code';
  return 'pdf'; // default
};

// Helper: format byte size to human-readable string
export const formatFileSize = (bytes = 0) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const val = parseFloat((bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1));
  return `${val} ${sizes[i]}`;
};

export const docService = {
  /**
   * Fetch all files directly from Supabase Storage ("documents" bucket)
   * and merge metadata from the "documents" table.
   */
  async getFiles() {
    try {
      if (!supabase) {
        console.error('Supabase client is not configured.');
        return { data: [] };
      }

      // 1. Fetch metadata records from the "documents" table
      let dbData = [];
      try {
        const { data, error: dbError } = await supabase
          .from('documents')
          .select('*')
          .order('uploaded_at', { ascending: false });

        if (dbError) {
          console.error('Error fetching documents from database:', dbError);
        } else if (data) {
          dbData = data;
        }
      } catch (err) {
        console.warn('Could not query documents table:', err);
      }

      // 2. Fetch real files list from Supabase Storage bucket 'documents'
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('documents')
        .list('', {
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (storageError) {
        console.error('Error fetching files from Supabase Storage:', storageError);
      }

      const validStorageFiles = (storageFiles || []).filter((f) => f.name && !f.name.startsWith('.'));
      const formattedFiles = [];
      const seenPaths = new Set();

      // Process database rows first
      if (Array.isArray(dbData)) {
        dbData.forEach((row) => {
          if (!row.file_path) return;
          seenPaths.add(row.file_path);

          const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(row.file_path);

          const cleanDisplayName = row.file_name || row.file_path.replace(/^\d+[-_]/, '');
          const sizeBytes = row.file_size || 0;
          const detectedType = row.file_type ? detectFileType(cleanDisplayName, row.file_type) : detectFileType(cleanDisplayName);

          formattedFiles.push({
            fileId: row.id || row.file_path,
            fileName: cleanDisplayName,
            rawFileName: row.file_path,
            filePath: row.file_path,
            type: detectedType,
            size: sizeBytes,
            sizeFormatted: formatFileSize(sizeBytes),
            uploadDate: row.uploaded_at || new Date().toISOString(),
            owner: 'Harshitha R.',
            publicUrl: urlData?.publicUrl || '',
            storagePath: `documents/${row.file_path}`,
            category: 'General',
            tags: [detectedType.toUpperCase(), 'Supabase'],
            starred: false
          });
        });
      }

      // Merge any storage-only files if they haven't been tracked in DB yet
      validStorageFiles.forEach((item) => {
        if (!seenPaths.has(item.name)) {
          seenPaths.add(item.name);
          const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(item.name);

          const cleanDisplayName = item.name.replace(/^\d+[-_]/, '');
          const sizeBytes = item.metadata?.size || 0;
          const detectedType = detectFileType(cleanDisplayName, item.metadata?.mimetype);

          formattedFiles.push({
            fileId: item.id || item.name,
            fileName: cleanDisplayName,
            rawFileName: item.name,
            filePath: item.name,
            type: detectedType,
            size: sizeBytes,
            sizeFormatted: formatFileSize(sizeBytes),
            uploadDate: item.created_at || item.updated_at || new Date().toISOString(),
            owner: 'Harshitha R.',
            publicUrl: urlData?.publicUrl || '',
            storagePath: `documents/${item.name}`,
            category: 'General',
            tags: [detectedType.toUpperCase(), 'Supabase'],
            starred: false
          });
        }
      });

      return { data: formattedFiles };
    } catch (err) {
      console.error('Unexpected error in docService.getFiles:', err);
      return { data: [] };
    }
  },

  /**
   * Get single file metadata by ID / filePath
   */
  async getFileById(fileId) {
    const res = await this.getFiles();
    const found = res.data.find((f) => f.fileId === fileId || f.filePath === fileId || f.fileName === fileId);
    if (found) {
      return { data: found };
    }
    throw new Error('File not found');
  },

  /**
   * Upload actual file to Supabase Storage bucket ("documents")
   * and save metadata in the Supabase "documents" table.
   */
  async uploadFile(fileData, onProgress = null) {
    if (!supabase) {
      throw new Error('Supabase client is not configured.');
    }

    const rawFile = fileData.file;
    if (!rawFile) {
      throw new Error('No valid file object provided for upload.');
    }

    if (onProgress) onProgress(15, 'Uploading to Supabase Storage...');

    // Create safe unique file path in Supabase bucket
    const cleanFileName = (fileData.fileName || rawFile.name).replace(/\s+/g, '_');
    const filePath = `${Date.now()}_${cleanFileName}`;

    // 1. Upload to Supabase Storage Bucket 'documents'
    const { data: storageResult, error: storageError } = await supabase.storage
      .from('documents')
      .upload(filePath, rawFile, {
        contentType: rawFile.type || 'application/octet-stream',
        upsert: false
      });

    if (storageError) {
      console.error('Supabase Storage Upload Error:', storageError);
      throw new Error(`Supabase storage upload failed: ${storageError.message}`);
    }

    if (onProgress) onProgress(65, 'Saving file metadata in Supabase...');

    // 2. Get Public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const publicUrl = urlData?.publicUrl || '';
    const detectedType = detectFileType(cleanFileName, rawFile.type);

    // 3. Save metadata to Supabase "documents" table
    const { error: dbError } = await supabase
      .from('documents')
      .insert({
        file_name: fileData.fileName || rawFile.name,
        file_path: filePath,
        file_type: rawFile.type || 'application/octet-stream',
        file_size: rawFile.size,
      });

    if (dbError) {
      console.error('DATABASE INSERT ERROR:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    if (onProgress) onProgress(100, 'Upload complete!');

    const newDoc = {
      fileId: filePath,
      fileName: fileData.fileName || rawFile.name,
      rawFileName: filePath,
      filePath: filePath,
      type: detectedType,
      size: rawFile.size,
      sizeFormatted: formatFileSize(rawFile.size),
      uploadDate: new Date().toISOString(),
      owner: 'Harshitha R.',
      publicUrl: publicUrl,
      storagePath: `documents/${filePath}`,
      category: fileData.category || 'General',
      tags: fileData.tags || [detectedType.toUpperCase(), 'Supabase'],
      starred: false
    };

    return {
      data: newDoc,
      message: `"${newDoc.fileName}" uploaded to Supabase successfully!`
    };
  },

  /**
   * Delete file from Supabase Storage and Database
   */
  async deleteFile(fileIdOrPath) {
    if (!supabase) return { success: false };

    try {
      // Find file to get exact storage path
      const filesRes = await this.getFiles();
      const target = filesRes.data.find(
        (f) => f.fileId === fileIdOrPath || f.filePath === fileIdOrPath || f.fileName === fileIdOrPath
      );
      const storageKey = target?.filePath || fileIdOrPath;

      // 1. Remove from Storage
      const { error: storageErr } = await supabase.storage
        .from('documents')
        .remove([storageKey]);

      if (storageErr) {
        console.warn('Storage delete warning:', storageErr);
      }

      // 2. Remove from DB table
      try {
        await supabase
          .from('documents')
          .delete()
          .or(`file_path.eq.${storageKey},file_name.eq.${storageKey}`);
      } catch (dbErr) {
        console.warn('DB delete warning:', dbErr);
      }

      return { success: true, message: 'File deleted from Supabase.' };
    } catch (err) {
      console.error('Delete error:', err);
      throw err;
    }
  },

  /**
   * Real browser file download from Supabase Storage
   */
  async downloadFileLocally(file) {
    if (!supabase || !file) return false;

    try {
      const storageKey = file.filePath || file.rawFileName || file.fileName || file.name;
      const { data: blobData, error } = await supabase.storage
        .from('documents')
        .download(storageKey);

      if (error || !blobData) {
        // Fallback: If download API returns error, open public URL directly
        if (file.publicUrl) {
          window.open(file.publicUrl, '_blank');
          return true;
        }
        console.error('Supabase download error:', error);
        return false;
      }

      const url = URL.createObjectURL(blobData);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.fileName || storageKey;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return true;
    } catch (err) {
      console.error('Download execution error:', err);
      return false;
    }
  },

  /**
   * Star / Unstar toggle
   */
  async toggleStar(fileId) {
    try {
      const res = await this.getFileById(fileId);
      const file = res.data;
      const nextStar = !file.starred;

      try {
        await supabase
          .from('documents')
          .update({ starred: nextStar })
          .or(`file_path.eq.${file.filePath},name.eq.${file.fileName}`);
      } catch (e) {
        // ignore if table not created
      }

      return { data: { ...file, starred: nextStar } };
    } catch (err) {
      console.error('Toggle star error:', err);
      return { data: null };
    }
  },

  /**
   * Rename file in Supabase
   */
  async renameFile(fileId, newName) {
    if (!newName || !newName.trim()) {
      throw new Error('File name cannot be empty');
    }
    const trimmed = newName.trim();
    try {
      await supabase
        .from('documents')
        .update({ name: trimmed })
        .or(`file_path.eq.${fileId},name.eq.${fileId}`);
    } catch (e) {}

    return { data: { fileName: trimmed }, message: `Renamed to ${trimmed}` };
  },

  /**
   * Move file category
   */
  async moveFile(fileId, newCategory) {
    try {
      await supabase
        .from('documents')
        .update({ category: newCategory })
        .or(`file_path.eq.${fileId},name.eq.${fileId}`);
    } catch (e) {}

    return { success: true, message: `Moved to ${newCategory}` };
  },

  /**
   * Search real Supabase files
   */
  async searchFiles(query = '', filterType = 'all') {
    try {
      const res = await this.getFiles();
      const files = res.data || [];
      const q = (query || '').toLowerCase().trim();

      const results = files.filter((f) => {
        const matchesQuery =
          !q ||
          f.fileName.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          (f.tags && f.tags.some((t) => t.toLowerCase().includes(q)));

        const matchesType =
          filterType === 'all' ||
          f.type === filterType ||
          (filterType === 'starred' && f.starred);

        return matchesQuery && matchesType;
      });

      return { data: results };
    } catch (err) {
      console.error('Search files error:', err);
      return { data: [] };
    }
  },

  /**
   * Get storage statistics dynamically from real Supabase bucket
   */
  async getStorageStats() {
    try {
      const filesRes = await this.getFiles();
      const files = filesRes.data || [];
      const totalBytes = files.reduce((acc, curr) => acc + (curr.size || 0), 0);
      const maxStorageGB = 15;
      const percentage =
        totalBytes === 0
          ? 0
          : Math.min(100, Math.round((totalBytes / (maxStorageGB * 1024 * 1024 * 1024)) * 100));

      const typeCounts = files.reduce((acc, curr) => {
        acc[curr.type] = (acc[curr.type] || 0) + 1;
        return acc;
      }, {});

      return {
        totalFiles: files.length,
        totalBytes,
        usedFormatted: formatFileSize(totalBytes),
        totalCapacityFormatted: `${maxStorageGB} GB`,
        usedPercentage: percentage,
        typeCounts,
        recentFilesCount: files.length,
        aiSummariesCount: 0
      };
    } catch (err) {
      return {
        totalFiles: 0,
        totalBytes: 0,
        usedFormatted: '0 B',
        totalCapacityFormatted: '15 GB',
        usedPercentage: 0,
        typeCounts: {},
        recentFilesCount: 0,
        aiSummariesCount: 0
      };
    }
  },

  getCurrentUser() {
    const saved = localStorage.getItem('docflow_user') || localStorage.getItem('smart_doc_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return {
      id: 'user-supabase-01',
      name: 'Harshitha R.',
      email: 'harshitha@docflow.io',
      role: 'Workspace Owner'
    };
  }
};
