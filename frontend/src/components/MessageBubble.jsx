/**
 * MessageBubble.jsx — Renders a single chat message (user or assistant)
 */
import SourceCard from './SourceCard';
import FeedbackButtons from './FeedbackButtons';
import './MessageBubble.css';

// Simple markdown-like renderer: bold, code, line breaks
function renderContent(text) {
    if (!text) return null;

    // Process the text with simple markdown transformations
    const lines = text.split('\n');
    const elements = [];
    let keyCounter = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Empty line → spacer
        if (line.trim() === '') {
            elements.push(<br key={keyCounter++} />);
            continue;
        }

        // Bullet list
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
            const content = line.trim().slice(2);
            elements.push(<li key={keyCounter++}>{inlineFormat(content)}</li>);
            continue;
        }

        // Numbered list
        if (/^\d+\.\s/.test(line.trim())) {
            const content = line.trim().replace(/^\d+\.\s/, '');
            elements.push(<li key={keyCounter++} className="numbered">{inlineFormat(content)}</li>);
            continue;
        }

        // Heading-like lines starting with ##
        if (line.startsWith('## ')) {
            elements.push(<h3 key={keyCounter++} className="msg-heading">{line.slice(3)}</h3>);
            continue;
        }
        if (line.startsWith('# ')) {
            elements.push(<h2 key={keyCounter++} className="msg-heading2">{line.slice(2)}</h2>);
            continue;
        }

        // Normal paragraph
        elements.push(<p key={keyCounter++}>{inlineFormat(line)}</p>);
    }

    return <div className="msg-content-body">{elements}</div>;
}

// Handle **bold** and `code` inline
function inlineFormat(text) {
    // Split on bold markers and code markers
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={i} className="inline-code">{part.slice(1, -1)}</code>;
        }
        return part;
    });
}

export default function MessageBubble({ message, onFeedback, prevUserMessage }) {
    const isUser = message.role === 'user';
    const isError = message.isError;

    return (
        <div className={`bubble-wrapper ${isUser ? 'user' : 'assistant'}`}>
            {/* Avatar */}
            <div className={`bubble-avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`}>
                {isUser ? '👤' : '🦊'}
            </div>

            <div className="bubble-content">
                {/* Guardrail badge */}
                {message.guardrailed && (
                    <div className="guardrail-badge">
                        🛡️ Out of scope
                    </div>
                )}

                {/* Cached badge */}
                {message.cached && !message.guardrailed && (
                    <div className="cached-badge">
                        ⚡ Cached response
                    </div>
                )}

                {/* Message bubble */}
                <div className={`bubble ${isUser ? 'user-bubble' : 'bot-bubble'} ${isError ? 'error-bubble' : ''}`}>
                    {isUser ? (
                        <span>{message.content}</span>
                    ) : (
                        renderContent(message.content)
                    )}
                </div>

                {/* Timestamp */}
                <span className="bubble-time">
                    {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {/* Source attribution (assistant only) */}
                {!isUser && !message.guardrailed && (
                    <SourceCard sources={message.sources} />
                )}

                {/* Feedback buttons (assistant only, not error, not welcome) */}
                {!isUser && !isError && message.id !== 'welcome' && (
                    <FeedbackButtons
                        messageId={message.id}
                        query={prevUserMessage || ''}
                        answer={message.content}
                        onFeedback={onFeedback}
                    />
                )}
            </div>
        </div>
    );
}
