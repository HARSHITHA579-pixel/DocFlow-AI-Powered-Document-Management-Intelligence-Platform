import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';

export default function SearchBar({
  placeholder = 'Search documents, summaries, tags...',
  initialQuery = '',
  onSearch = null,
  autoFocus = false
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(initialQuery || searchParams.get('q') || '');

  useEffect(() => {
    if (initialQuery !== undefined) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form className="search-bar-container" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <SearchIcon size={17} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (onSearch) onSearch(e.target.value);
          }}
          autoFocus={autoFocus}
        />
        {query && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            title="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </form>
  );
}
