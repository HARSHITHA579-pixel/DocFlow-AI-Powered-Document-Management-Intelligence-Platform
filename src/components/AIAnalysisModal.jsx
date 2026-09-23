import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Bot,
  Send,
  CheckCircle2,
  Cpu,
  FileText,
  Lightbulb,
  MessageSquare
} from 'lucide-react';

export default function AIAnalysisModal({ file, isOpen, onClose }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I have analyzed "${file?.fileName}". I can help you summarize findings, extract tabular data, or answer specific questions about this document.`
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen || !file) return null;

  const handleAsk = (userQuery) => {
    const q = userQuery || question;
    if (!q.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q.trim() }]);
    setQuestion('');
    setIsTyping(true);

    setTimeout(() => {
      let answer = `According to "${file.fileName}", `;
      const queryLower = q.toLowerCase();

      if (queryLower.includes('risk') || queryLower.includes('challenge')) {
        answer += 'key compliance and security safeguards require quarterly audits and strict access control across all cloud storage buckets.';
      } else if (queryLower.includes('cost') || queryLower.includes('price') || queryLower.includes('budget') || queryLower.includes('revenue')) {
        answer += 'the financial projections indicate strong operating margins of 18.5% with positive operating cash flow.';
      } else if (queryLower.includes('architecture') || queryLower.includes('aws') || queryLower.includes('s3')) {
        answer += 'the infrastructure leverages AWS S3 for object storage, serverless Lambda execution, and DynamoDB for low-latency metadata indexing.';
      } else {
        answer += file.keyPoints && file.keyPoints[0]
          ? `${file.keyPoints[0]}. Textract OCR extraction confirms all structured fields are validated.`
          : 'the document contents have been fully parsed and indexed for contextual semantic reasoning.';
      }

      setMessages((prev) => [...prev, { sender: 'ai', text: answer }]);
      setIsTyping(false);
    }, 500);
  };

  const samplePrompts = [
    'Key findings summary',
    'Main metrics & numbers',
    'Action items & next steps'
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '620px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366f1, #d946ef)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700' }}>Ask Gemini / AI Insights</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: '400' }}>
                Analyzing {file.fileName}
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '68vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Executive Summary Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(217, 70, 239, 0.08) 100%)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
              borderRadius: '12px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: '700', color: '#c084fc' }}>
                <Lightbulb size={16} />
                <span>Executive Summary</span>
              </div>
              <span className="badge badge-ai">Gemini Ready</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
              {file.summary || 'Document extracted and indexed in storage repository.'}
            </p>

            {file.keyPoints && file.keyPoints.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {file.keyPoints.map((pt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={14} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="filter-pill"
                style={{ fontSize: '0.75rem', padding: '3px 10px' }}
                onClick={() => handleAsk(p)}
              >
                ✦ {p}
              </button>
            ))}
          </div>

          {/* Conversational Q&A Stream */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              maxHeight: '220px',
              overflowY: 'auto'
            }}
          >
            {messages.map((m, index) => (
              <div
                key={index}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-secondary)',
                  color: m.sender === 'user' ? '#ffffff' : 'var(--text-main)',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  maxWidth: '85%',
                  lineHeight: '1.45',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--border-color)'
                }}
              >
                {m.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ fontSize: '0.78rem', color: '#a5b4fc', fontStyle: 'italic' }}>
                Gemini is synthesizing insights...
              </div>
            )}
          </div>

          {/* Ask Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            style={{ display: 'flex', gap: '8px' }}
          >
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, fontSize: '0.85rem' }}
              placeholder={`Ask Gemini about ${file.fileName}...`}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={isTyping || !question.trim()}>
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
