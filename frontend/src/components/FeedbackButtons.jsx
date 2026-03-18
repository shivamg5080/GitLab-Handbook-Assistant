/**
 * FeedbackButtons.jsx — Thumbs up/down feedback on assistant messages
 */
import { useState } from 'react';
import './FeedbackButtons.css';

export default function FeedbackButtons({ messageId, query, answer, onFeedback }) {
    const [voted, setVoted] = useState(null); // 'up' | 'down' | null

    function handleVote(rating) {
        if (voted) return; // already voted
        setVoted(rating);
        onFeedback(messageId, rating, query, answer);
    }

    return (
        <div className="feedback-buttons">
            <span className="feedback-label">Was this helpful?</span>
            <button
                className={`feedback-btn ${voted === 'up' ? 'active-up' : ''}`}
                onClick={() => handleVote('up')}
                disabled={!!voted}
                title="Helpful"
                aria-label="Mark as helpful"
            >
                👍
            </button>
            <button
                className={`feedback-btn ${voted === 'down' ? 'active-down' : ''}`}
                onClick={() => handleVote('down')}
                disabled={!!voted}
                title="Not helpful"
                aria-label="Mark as not helpful"
            >
                👎
            </button>
            {voted && (
                <span className="feedback-thanks">
                    Thanks for your feedback!
                </span>
            )}
        </div>
    );
}
