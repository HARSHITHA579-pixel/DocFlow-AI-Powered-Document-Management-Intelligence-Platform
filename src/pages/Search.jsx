import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search as SearchIcon,
  Filter,
  Sparkles,
  Tag,
  FileQuestion,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useDocs } from '../context/DocContext';
import { docService } from '../services/api';
import SearchBar from '../components/SearchBar';
import FileCard from '../components/FileCard';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { deleteFile, toggleStar } = useDocs();
  const currentQuery = searchParams.get('q') || '';
  const currentTag = searchParams.get('tag') || '';
  const [selectedType, setSelectedType] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const popularTags = ['AWS', 'Gemini', 'Quarterly', 'Architecture', 'Textract', 'Policy', 'Roadmap', 'Cost'];

  const executeSearch = async (q, type, tag) => {
    setLoading(true);
    try {
      const searchTerm = tag ? tag : q;
      const res = await docService.searchFiles(searchTerm, type);
      setResults(res.data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeSearch(currentQuery, selectedType, currentTag);
  }, [currentQuery, selectedType, currentTag]);

  const handleQueryChange = (newQuery) => {
    setSearchParams(newQuery ? { q: newQuery } : {});
  };

  const handleTagClick = (tag) => {
    if (currentTag === tag) {
      setSearchParams(currentQuery ? { q: currentQuery } : {});
    } else {
      setSearchParams({ tag });
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Delete this file?')) {
      await deleteFile(fileId);
      executeSearch(currentQuery, selectedType, currentTag);
    }
  };

  const handleToggleStar = async (fileId) => {
    await toggleStar(fileId);
    executeSearch(currentQuery, selectedType, currentTag);
  };

  return (
    <div className="page-wrapper fade-in">
      <div className="search-page-header">
        <div style={{ marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>
            Intelligent Document Search
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Semantic search across file names, tags, categories, and AI-extracted summaries.
          </p>
        </div>

        <div className="search-page-bar">
          <SearchBar
            initialQuery={currentQuery || currentTag}
            onSearch={handleQueryChange}
            placeholder="Type document name, AI topic, or keyword..."
            autoFocus={true}
          />
        </div>

        {/* Quick Tag Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Tag size={13} /> Tags:
          </span>
          {popularTags.map((tag) => (
            <button
              key={tag}
              className={`badge ${currentTag.toLowerCase() === tag.toLowerCase() ? 'badge-ai' : 'badge-code'}`}
              style={{ cursor: 'pointer', opacity: currentTag && currentTag.toLowerCase() !== tag.toLowerCase() ? 0.6 : 1 }}
              onClick={() => handleTagClick(tag)}
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="search-chips-row">
          {['all', 'pdf', 'docx', 'image', 'spreadsheet', 'code', 'starred'].map((type) => (
            <button
              key={type}
              className={`filter-pill ${selectedType === type ? 'active' : ''}`}
              onClick={() => setSelectedType(type)}
            >
              {type === 'all' ? 'All Types' : type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="section-header" style={{ marginTop: '2rem' }}>
        <h2 className="section-title" style={{ fontSize: '1.1rem' }}>
          <Sparkles size={18} color="#818cf8" />
          <span>
            {loading ? 'Searching...' : `Found ${results.length} result${results.length === 1 ? '' : 's'}`}
          </span>
        </h2>
        {(currentQuery || currentTag) && (
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Matching "{currentTag ? `#${currentTag}` : currentQuery}"
          </span>
        )}
      </div>

      {/* Results Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Scanning metadata and AI embeddings...
        </div>
      ) : results.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <FileQuestion size={44} color="#818cf8" style={{ marginBottom: '1rem', opacity: 0.8 }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No matching documents</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            We couldn't find any documents matching your query. Try searching for "Financial", "Architecture", "Gemini", or "AWS".
          </p>
        </div>
      ) : (
        <div className="file-card-grid">
          {results.map((file) => (
            <FileCard
              key={file.fileId}
              file={file}
              onDelete={handleDelete}
              onToggleStar={handleToggleStar}
            />
          ))}
        </div>
      )}
    </div>
  );
}
