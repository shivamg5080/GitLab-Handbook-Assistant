/**
 * InputBar.jsx — Message input field with send button
 */
import { useState, useRef } from 'react';
import './InputBar.css';

const SAMPLE_QUESTIONS = [
    "What are GitLab's core values?",
    "How does GitLab approach all-remote work?",
    "What is GitLab's hiring process?",
    "Tell me about GitLab's engineering culture",
    "What is GitLab's product direction?",
];

export default function InputBar({ onSend, isLoading, disabled }) {
    const [value, setValue] = useState('');
    const textareaRef = useRef(null);

    function handleSubmit() {
        const trimmed = value.trim();
        if (!trimmed || isLoading) return;
        onSend(trimmed);
        setValue('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    }

    function handleTextareaChange(e) {
        setValue(e.target.value);
        // Auto-resize
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    }

    function handleSampleClick(question) {
        onSend(question);
    }

    return (
        <div className="input-bar-wrapper">
            {/* Sample questions */}
            <div className="sample-questions" role="list">
                {SAMPLE_QUESTIONS.map((q, i) => (
                    <button
                        key={i}
                        className="sample-chip"
                        onClick={() => handleSampleClick(q)}
                        disabled={isLoading}
                        role="listitem"
                    >
                        {q}
                    </button>
                ))}
            </div>

            {/* Input row */}
            <div className={`input-row ${isLoading ? 'loading' : ''}`}>
                <textarea
                    ref={textareaRef}
                    id="chat-input"
                    className="chat-textarea"
                    rows={1}
                    placeholder="Ask anything about GitLab's handbook or product direction…"
                    value={value}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled || isLoading}
                    aria-label="Chat message input"
                    autoComplete="off"
                />
                <div className="input-actions">
                    <button
                        id="send-button"
                        className={`send-btn ${value.trim() ? 'active' : ''}`}
                        onClick={handleSubmit}
                        disabled={!value.trim() || isLoading}
                        aria-label="Send message"
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>

            <p className="input-hint">Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line</p>
        </div>
    );
}
