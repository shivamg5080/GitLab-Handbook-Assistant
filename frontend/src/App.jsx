import { useState, useEffect } from 'react';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import { useChat } from './hooks/useChat';
import './App.css';

export default function App() {
  const { messages, isLoading, sendMessage, submitFeedback, clearChat } = useChat();
  const [showInfo, setShowInfo] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  // Apply theme to root and persist
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-brand">
          <div className="header-logo">
            <svg viewBox="0 0 380 380" fill="none" xmlns="http://www.w3.org/2000/svg" className="gitlab-logo">
              <path d="M190 340.1L253.8 147H126.2L190 340.1Z" fill="#e24329" />
              <path d="M190 340.1L126.2 147H42.5L190 340.1Z" fill="#fc6d26" />
              <path d="M42.5 147L20.3 215.2C18.4 221.1 20.6 227.5 25.7 231L190 340.1L42.5 147Z" fill="#fca326" />
              <path d="M42.5 147H126.2L90.3 34.9C88.1 27.9 78.4 27.9 76.2 34.9L42.5 147Z" fill="#e24329" />
              <path d="M190 340.1L253.8 147H337.5L190 340.1Z" fill="#fc6d26" />
              <path d="M337.5 147L359.7 215.2C361.6 221.1 359.4 227.5 354.3 231L190 340.1L337.5 147Z" fill="#fca326" />
              <path d="M337.5 147H253.8L289.7 34.9C291.9 27.9 301.6 27.9 303.8 34.9L337.5 147Z" fill="#e24329" />
            </svg>
          </div>
          <div className="header-text">
            <h1 className="header-title">GitLab Handbook Assistant</h1>
            <p className="header-subtitle">Powered by Gemini AI · Grounded in GitLab's public docs</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="header-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            className="header-btn"
            onClick={() => setShowInfo((v) => !v)}
            title="About this chatbot"
            aria-label="Toggle info panel"
          >
            ℹ️
          </button>
          <button
            className="header-btn"
            onClick={clearChat}
            title="Start new conversation"
            aria-label="Clear chat"
          >
            🗑️
          </button>
        </div>
      </header>

      {/* ── Info panel ── */}
      {showInfo && (
        <div className="info-panel" role="alert">
          <div className="info-panel__inner">
            <p>
              <strong>🤖 GitLab Handbook Assistant</strong> uses Retrieval-Augmented Generation (RAG) to answer
              questions grounded in GitLab's public <a href="https://handbook.gitlab.com" target="_blank" rel="noreferrer">Handbook</a> and{' '}
              <a href="https://about.gitlab.com/direction/" target="_blank" rel="noreferrer">Direction</a> pages.
            </p>
            <p>Answers are based only on retrieved context — not hallucinated. Sources are always shown.</p>
            <ul>
              <li>🛡️ Guardrails prevent off-topic answers</li>
              <li>⚡ Repeated questions are cached for speed</li>
              <li>📚 Sources are cited with relevance scores</li>
            </ul>
            <button className="info-close" onClick={() => setShowInfo(false)}>Close ✕</button>
          </div>
        </div>
      )}

      {/* ── Chat area ── */}
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onFeedback={submitFeedback}
      />

      {/* ── Input ── */}
      <InputBar
        onSend={sendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}
