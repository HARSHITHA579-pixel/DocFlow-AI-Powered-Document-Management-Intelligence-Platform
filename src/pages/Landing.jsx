import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  FolderKanban,
  Search as SearchIcon,
  HardDrive,
  FileText,
  UploadCloud,
  CheckCircle2,
  Lock,
  Share2,
  Cpu,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page-wrapper">
      {/* Top Navigation */}
      <header className="landing-navbar">
        <div className="landing-nav-container">
          <Link to="/" className="brand-logo" style={{ textDecoration: 'none' }}>
            <div className="brand-icon">
              <Layers size={22} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="brand-text">DocFlow</span>
              <span className="brand-badge">Cloud</span>
            </div>
          </Link>

          <div className="landing-nav-actions">
            <ThemeToggle />

            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-sm">
                <span>Go to Dashboard</span>
                <ArrowRight size={15} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm" id="landing-signin-nav-btn">
                  <span>Sign In</span>
                </Link>
                <Link to="/login" className="btn btn-primary btn-sm" id="landing-getstarted-nav-btn">
                  <span>Get Started</span>
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="landing-main">
        <section className="landing-hero-section">
          <div className="landing-badge-pill">
            <Sparkles size={14} color="#a5b4fc" />
            <span>Next-Generation Intelligent Cloud Workspace</span>
          </div>

          <h1 className="landing-title">
            Your intelligent <br />
            <span className="landing-gradient-text">document workspace</span>
          </h1>

          <p className="landing-description">
            DocFlow allows you to effortlessly upload, organize, search, and manage all your documents
            in one high-speed workspace — supercharged with automated OCR and Gemini AI intelligence.
          </p>

          <div className="landing-cta-group">
            <button
              className="btn btn-primary landing-primary-btn"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
              id="landing-hero-get-started"
            >
              <span>Get Started Free</span>
              <ArrowRight size={18} />
            </button>
            <button
              className="btn btn-secondary landing-secondary-btn"
              onClick={() => navigate('/login')}
              id="landing-hero-sign-in"
            >
              <Lock size={16} />
              <span>Sign In to DocFlow</span>
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="landing-trust-row">
            <div className="landing-trust-item">
              <ShieldCheck size={16} color="#34d399" />
              <span>AES-256 Cloud Encryption</span>
            </div>
            <div className="landing-trust-item">
              <Zap size={16} color="#fbbf24" />
              <span>Sub-second Metadata Indexing</span>
            </div>
            <div className="landing-trust-item">
              <Sparkles size={16} color="#c084fc" />
              <span>Multimodal AI Summarization</span>
            </div>
          </div>

          {/* SaaS Workspace Showcase Visual */}
          <div className="landing-showcase-container">
            <div className="landing-showcase-window">
              <div className="landing-window-bar">
                <div className="landing-window-dots">
                  <span className="dot-red"></span>
                  <span className="dot-yellow"></span>
                  <span className="dot-green"></span>
                </div>
                <div className="landing-window-title">docflow.app / workspace / my-files</div>
                <div style={{ width: '40px' }}></div>
              </div>

              <div className="landing-window-body">
                {/* Mock Sidebar Visual */}
                <div className="landing-mock-sidebar">
                  <div className="landing-mock-sidebar-brand">
                    <div className="brand-icon" style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
                      <Layers size={16} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>DocFlow</span>
                  </div>

                  <div className="landing-mock-nav-item active">
                    <FolderKanban size={15} />
                    <span>My Files</span>
                  </div>
                  <div className="landing-mock-nav-item">
                    <SearchIcon size={15} />
                    <span>Search & AI</span>
                  </div>
                  <div className="landing-mock-nav-item">
                    <HardDrive size={15} />
                    <span>S3 Storage</span>
                  </div>

                  <div className="landing-mock-storage-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                      <span>S3 Storage Tier</span>
                      <span style={{ color: '#818cf8' }}>15 GB</span>
                    </div>
                    <div className="storage-bar-bg" style={{ height: '5px' }}>
                      <div className="storage-bar-fill" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Mock Content Visual */}
                <div className="landing-mock-content">
                  <div className="landing-mock-header">
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Workspace / Documents</div>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Cloud File Repository</div>
                    </div>
                    <div className="btn btn-primary btn-sm" style={{ pointerEvents: 'none' }}>
                      <UploadCloud size={14} />
                      <span>Upload</span>
                    </div>
                  </div>

                  {/* Mock Cards Grid */}
                  <div className="landing-mock-grid">
                    <div className="landing-mock-card">
                      <div className="landing-mock-card-top">
                        <div className="landing-mock-type pdf">PDF</div>
                        <div className="landing-mock-card-title">Executive_Summary_Q3.pdf</div>
                      </div>
                      <div className="landing-mock-card-preview">
                        <div className="preview-line-long"></div>
                        <div className="preview-line-med"></div>
                        <div className="preview-line-short"></div>
                        <div className="landing-ai-tag">
                          <Sparkles size={10} />
                          <span>AI Summarized</span>
                        </div>
                      </div>
                      <div className="landing-mock-card-footer">
                        <span>4.2 MB</span>
                        <span>Just now</span>
                      </div>
                    </div>

                    <div className="landing-mock-card">
                      <div className="landing-mock-card-top">
                        <div className="landing-mock-type image">PNG</div>
                        <div className="landing-mock-card-title">Cloud_Architecture_S3.png</div>
                      </div>
                      <div className="landing-mock-card-preview">
                        <div className="preview-line-long"></div>
                        <div className="preview-line-med"></div>
                        <div className="landing-ai-tag" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                          <Bot size={10} />
                          <span>Vision OCR</span>
                        </div>
                      </div>
                      <div className="landing-mock-card-footer">
                        <span>2.1 MB</span>
                        <span>2 mins ago</span>
                      </div>
                    </div>

                    <div className="landing-mock-card">
                      <div className="landing-mock-card-top">
                        <div className="landing-mock-type docx">DOCX</div>
                        <div className="landing-mock-card-title">NLP_Pipeline_Spec.docx</div>
                      </div>
                      <div className="landing-mock-card-preview">
                        <div className="preview-line-long"></div>
                        <div className="preview-line-med"></div>
                        <div className="preview-line-short"></div>
                      </div>
                      <div className="landing-mock-card-footer">
                        <span>1.8 MB</span>
                        <span>1 hour ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="landing-features-section">
          <div className="landing-section-header">
            <div className="landing-badge-pill" style={{ margin: '0 auto 0.75rem auto' }}>
              <span>Engineered for Modern Teams</span>
            </div>
            <h2>Everything you need for seamless document workflows</h2>
            <p>From local mock workflows to serverless cloud deployment with AWS S3, Textract, and Gemini AI.</p>
          </div>

          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                <UploadCloud size={24} />
              </div>
              <h3>Instant Document Ingestion</h3>
              <p>
                Drag & drop PDFs, Word files, spreadsheets, images, code, and zip archives with immediate local parsing.
              </p>
            </div>

            <div className="landing-feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>
                <Sparkles size={24} />
              </div>
              <h3>AI-Powered Summaries</h3>
              <p>
                Extract key bullet points, structured entities, and executive overviews in seconds with integrated Gemini AI.
              </p>
            </div>

            <div className="landing-feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                <SearchIcon size={24} />
              </div>
              <h3>Intelligent Semantic Search</h3>
              <p>
                Search across file names, categories, smart tags, and full-text AI embeddings with sub-second response times.
              </p>
            </div>

            <div className="landing-feature-card">
              <div className="feature-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                <ShieldCheck size={24} />
              </div>
              <h3>Enterprise Grade Security</h3>
              <p>
                Granular file permissions, secure presigned S3 downloads, and complete multi-tenant authentication guarding your data.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="landing-bottom-cta">
          <div className="bottom-cta-inner">
            <h2>Ready to streamline your documents?</h2>
            <p>Get started in seconds with DocFlow. No complicated setup required.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
                onClick={() => navigate('/login')}
              >
                <span>Get Started Now</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-icon" style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
              <Layers size={16} />
            </div>
            <span style={{ fontWeight: '700' }}>DocFlow</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>— Intelligent Cloud Document Management</span>
          </div>
          <div style={{ color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
            &copy; {new Date().getFullYear()} DocFlow. Built for high-performance enterprise document workspaces.
          </div>
        </div>
      </footer>
    </div>
  );
}
