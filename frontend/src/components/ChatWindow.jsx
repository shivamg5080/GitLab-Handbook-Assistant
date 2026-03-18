/**
 * ChatWindow.jsx — Scrollable message list container
 */
import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import LoadingDots from './LoadingDots';
import './ChatWindow.css';

export default function ChatWindow({ messages, isLoading, onFeedback }) {
    const bottomRef = useRef(null);

    // Auto-scroll to latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Find the preceding user message for each assistant message (for feedback context)
    function getPrevUserMessage(index) {
        for (let i = index - 1; i >= 0; i--) {
            if (messages[i].role === 'user') return messages[i].content;
        }
        return '';
    }

    return (
        <div className="chat-window" role="log" aria-live="polite" aria-label="Chat messages">
            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <MessageBubble
                        key={msg.id}
                        message={msg}
                        onFeedback={onFeedback}
                        prevUserMessage={getPrevUserMessage(idx)}
                    />
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="bubble-wrapper assistant loading-wrapper">
                        <div className="bubble-avatar bot-avatar">🦊</div>
                        <div className="bubble bot-bubble loading-bubble">
                            <LoadingDots />
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>
        </div>
    );
}
