import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Trash2,
  Star,
  Sparkles,
  FileText,
  HardDrive,
  Calendar,
  User,
  CheckCircle2,
  Layers,
  Send,
  Copy,
  Check,
  Cpu,
  Bot
} from 'lucide-react';
import { docService } from '../services/api';

export default function FileDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chatQuestion, setChatQuestion] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am DocFlow AI (Gemini). Ask me any question about this document, its findings, or data points.'
    }
  ]);
  const [isAsking, setIsAsking] = useState(false);

  useEffect(() => {
    const fetchFile = async () => {
      setLoading(true);
      try {
        const res = await docService.getFileById(id);
        setFile(res.data);
      } catch (err) {
        console.error('File not found:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Delete ${file.fileName} permanently from S3 & DynamoDB?`)) {
      await docService.deleteFile(file.fileId);
      navigate('/files');
    }
  };

  const handleToggleStar = async () => {
    const updated = await docService.toggleStar(file.fileId);
    setFile({ ...file, starred: updated.data.starred });
  };

  const handleDownload = async () => {
    alert(`Generating secure S3 Presigned URL for ${file.fileName}...`);
  };

  const handleCopyS3Key = () => {
    if (file?.s3Key) {
      navigator.clipboard.writeText(`s3://${file.s3Key}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatQuestion.trim()) return;

    const userQ = chatQuestion.trim();
    setChatMessages((prev) => [...prev, { sender: 'user', text: userQ }]);
    setChatQuestion('');
    setIsAsking(true);

    setTimeout(() => {
      let aiAnswer = `Based on "${file.fileName}", ${file.keyPoints && file.keyPoints[0]
          ? file.keyPoints[0]
          : 'the document outlines core cloud architecture guidelines and metadata specifications.'
        }`;

      if (userQ.toLowerCase().includes('revenue') || userQ.toLowerCase().includes('finance')) {
        aiAnswer = 'According to the financial metrics, the ARR grew by 24% YoY with gross margins strengthening to 74.2%.';
      } else if (userQ.toLowerCase().includes('aws') || userQ.toLowerCase().includes('s3')) {
        aiAnswer = 'The AWS cloud infrastructure uses S3 Standard storage with serverless Lambda triggers and DynamoDB single-table indexing.';
      }

      setChatMessages((prev) => [...prev, { sender: 'ai', text: aiAnswer }]);
      setIsAsking(false);
    }, 600);
  };

  if (loading) {
    return (
      <div className="page-wrapper fade-in" style={{ textAlign: 'center', padding: '5rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading document details...</p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="page-wrapper fade-in">
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2>Document not found</h2>
          <p style={{ color: 'var(--text-muted)', margin: '1rem 0' }}>
            The requested document could not be located in S3 or DynamoDB metadata.
          </p>
          <Link to="/files" className="btn btn-primary">
            Back to My Files
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper fade-in">
      {/* Top Bar Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className={`btn-icon ${file.starred ? 'starred' : ''}`}
            onClick={handleToggleStar}
            title={file.starred ? 'Unstar' : 'Star'}
          >
            <Star size={17} fill={file.starred ? '#f59e0b' : 'none'} color={file.starred ? '#f59e0b' : 'var(--text-muted)'} />
          </button>

          <button className="btn btn-primary btn-sm" onClick={handleDownload}>
            <Download size={16} />
            <span>Download</span>
          </button>

          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            <Trash2 size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="file-details-container">
        {/* Left Column: AI Summary & Document Preview */}
        <div className="details-main-panel">
          {/* AI Summary Card */}
          <div className="ai-summary-card">
            <div className="ai-summary-header">
              <div className="ai-summary-title">
                <Sparkles size={20} />
                <span>DocFlow AI Summary (Gemini + Textract)</span>
              </div>
              <span className="badge badge-ai">Pipeline: Active</span>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
              {file.summary || 'Summary is being processed by Amazon Textract and Gemini AI.'}
            </p>

            {file.keyPoints && file.keyPoints.length > 0 && (
              <div className="ai-key-points">
                <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Key Findings & Takeaways
                </div>
                {file.keyPoints.map((point, index) => (
                  <div key={index} className="ai-key-point-item">
                    <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Chat with Document Teaser */}
          <div className="chat-teaser-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Bot size={20} color="#818cf8" />
              <h3 style={{ fontSize: '1rem' }}>Ask Document / Chat with PDF</h3>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                maxHeight: '220px',
                overflowY: 'auto',
                marginBottom: '1rem',
                paddingRight: '0.5rem'
              }}
            >
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: msg.sender === 'user' ? 'var(--primary)' : 'var(--bg-secondary)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                    padding: '0.6rem 0.9rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    maxWidth: '85%',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)'
                  }}
                >
                  {msg.text}
                </div>
              ))}
              {isAsking && (
                <div style={{ fontSize: '0.8rem', color: '#a5b4fc', fontStyle: 'italic' }}>
                  Gemini is analyzing document text...
                </div>
              )}
            </div>

            <form onSubmit={handleSendChat} className="chat-input-row">
              <input
                type="text"
                className="form-input"
                style={{ flex: 1 }}
                placeholder={`Ask about ${file.fileName}...`}
                value={chatQuestion}
                onChange={(e) => setChatQuestion(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-sm" disabled={isAsking}>
                <Send size={15} />
              </button>
            </form>
          </div>

          {/* OCR Extracted Text Preview */}
          <div className="preview-pane">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="#818cf8" />
                <h3 style={{ fontSize: '0.95rem' }}>Extracted Text Stream (Textract OCR)</h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>UTF-8 Encoded</span>
            </div>

            <div className="preview-text-box">
              {file.extractedTextPreview || 'Raw document stream ready for parsing.'}
            </div>
          </div>
        </div>

        {/* Right Column: Metadata Sidebar */}
        <div className="details-sidebar-panel">
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Document Metadata
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '2px' }}>File Name</div>
                <div style={{ fontWeight: '600', color: 'var(--text-main)', wordBreak: 'break-word' }}>
                  {file.fileName}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '2px' }}>Format & Size</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className={`badge badge-${file.type}`}>{file.type.toUpperCase()}</span>
                  <span>{file.sizeFormatted}</span>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '2px' }}>DynamoDB Record ID</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#818cf8' }}>
                  {file.fileId}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '2px' }}>S3 Object Key</div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'var(--bg-secondary)',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    wordBreak: 'break-all'
                  }}
                >
                  <span>{file.s3Key}</span>
                  <button
                    onClick={handleCopyS3Key}
                    title="Copy S3 URI"
                    style={{ color: copied ? '#10b981' : 'var(--text-subtle)', marginLeft: '6px' }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '2px' }}>Uploaded Date</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                  <Calendar size={14} color="var(--text-subtle)" />
                  <span>{new Date(file.uploadDate).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '2px' }}>Document Owner</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-main)' }}>
                  <User size={14} color="var(--text-subtle)" />
                  <span>{file.owner}</span>
                </div>
              </div>

              {file.tags && file.tags.length > 0 && (
                <div>
                  <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginBottom: '6px' }}>Tags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {file.tags.map((t, idx) => (
                      <span key={idx} className="file-tag-chip">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
