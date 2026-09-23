import React, { useState, useEffect } from 'react';
import {
  X,
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Volume2,
  FastForward,
  CheckCircle2
} from 'lucide-react';

export default function AudioOverviewModal({ file, isOpen, onClose }) {
  const [isGenerating, setIsGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Extracting key themes with Gemini AI...');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1.0);

  const duration = 185; // 3 mins 05 secs

  useEffect(() => {
    if (isOpen) {
      setIsGenerating(true);
      setProgress(15);
      setStatusText('Extracting key themes with Gemini AI...');
      setIsPlaying(false);
      setCurrentTime(0);

      const t1 = setTimeout(() => {
        setProgress(45);
        setStatusText('Synthesizing conversational dialogue between 2 AI hosts...');
      }, 700);

      const t2 = setTimeout(() => {
        setProgress(85);
        setStatusText('Rendering HD neural voice stream...');
      }, 1400);

      const t3 = setTimeout(() => {
        setProgress(100);
        setIsGenerating(false);
      }, 2100);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isOpen]);

  // Audio timer simulation
  useEffect(() => {
    let interval;
    if (isPlaying && !isGenerating) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isGenerating, speed]);

  if (!isOpen || !file) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const chapters = [
    { time: 0, title: 'Introduction & Core Subject' },
    { time: 54, title: 'Deep Dive: Key Metrics & Data' },
    { time: 120, title: 'Strategic Takeaways & Action Items' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <Headphones size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700' }}>AI Audio Overview</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: '400' }}>
                NotebookLM-style Deep Dive
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {isGenerating ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(236, 72, 153, 0.15)',
                  color: '#ec4899',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem auto',
                  animation: 'pulseGlow 1.5s infinite ease-in-out'
                }}
              >
                <Headphones size={28} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '6px' }}>Generating Audio Overview</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                {statusText}
              </p>

              <div className="storage-bar-bg" style={{ height: '8px' }}>
                <div
                  className="storage-bar-fill"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                    transition: 'width 0.4s ease'
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Document Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                  border: '1px solid rgba(236, 72, 153, 0.25)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)' }}>
                    {file.fileName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#f472b6', marginTop: '2px' }}>
                    Conversational Audio Discussion • 2 Hosts
                  </div>
                </div>
                <span className="badge" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#f472b6' }}>
                  Ready
                </span>
              </div>

              {/* Waveform & Player Widget */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Visual Sound Wave */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '40px' }}>
                  {[12, 28, 16, 36, 22, 40, 30, 18, 32, 24, 38, 14, 26, 34, 20, 38, 28, 16, 30, 22, 36, 18, 24].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: '4px',
                        height: isPlaying ? `${Math.max(6, (h * (0.6 + Math.random() * 0.6)))}px` : `${Math.min(10, h * 0.4)}px`,
                        background: i / 23 <= currentTime / duration ? '#ec4899' : 'rgba(255,255,255,0.15)',
                        borderRadius: '2px',
                        transition: 'height 0.15s ease, background 0.15s ease'
                      }}
                    />
                  ))}
                </div>

                {/* Duration Slider */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>

                {/* Player Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <button
                    type="button"
                    className="btn-icon"
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                    title="Rewind 10s"
                  >
                    <RotateCcw size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                      border: 'none',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)'
                    }}
                  >
                    {isPlaying ? <Pause size={22} /> : <Play size={22} style={{ marginLeft: '2px' }} />}
                  </button>

                  <button
                    type="button"
                    className="filter-pill"
                    style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    onClick={() => {
                      const speeds = [1.0, 1.25, 1.5, 2.0];
                      const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
                      setSpeed(next);
                    }}
                    title="Playback Speed"
                  >
                    {speed}x
                  </button>
                </div>
              </div>

              {/* Chapters */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Chapters
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {chapters.map((ch, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setCurrentTime(ch.time);
                        setIsPlaying(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ color: 'var(--text-main)' }}>{ch.title}</span>
                      <span style={{ color: '#ec4899', fontWeight: '600' }}>{formatTime(ch.time)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
