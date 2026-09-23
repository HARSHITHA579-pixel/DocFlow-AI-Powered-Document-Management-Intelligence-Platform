import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useDocs } from '../context/DocContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useDocs();

  return (
    <div className="theme-toggle-pill" role="group" aria-label="Theme mode switcher">
      <button
        type="button"
        className={`theme-toggle-option ${theme === 'light' ? 'active' : ''}`}
        onClick={() => setTheme('light')}
        title="Switch to Light Mode"
        aria-pressed={theme === 'light'}
      >
        <Sun size={13} className="theme-icon sun-icon" />
        <span className="theme-label">Light</span>
      </button>

      <button
        type="button"
        className={`theme-toggle-option ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => setTheme('dark')}
        title="Switch to Dark Mode"
        aria-pressed={theme === 'dark'}
      >
        <Moon size={13} className="theme-icon moon-icon" />
        <span className="theme-label">Dark</span>
      </button>
    </div>
  );
}
