/**
 * SourceCard.jsx — Collapsible source attribution card
 */
import { useState } from 'react';
import './SourceCard.css';

export default function SourceCard({ sources }) {
    const [open, setOpen] = useState(false);

    if (!sources || sources.length === 0) return null;

    return (
        <div className={`source-card ${open ? 'open' : ''}`}>
            <button className="source-card__toggle" onClick={() => setOpen((o) => !o)}>
                <span className="source-card__icon">📚</span>
                <span>{sources.length} source{sources.length > 1 ? 's' : ''} used</span>
                <span className="source-card__chevron">{open ? '▲' : '▼'}</span>
            </button>

            {open && (
                <div className="source-card__body">
                    {sources.map((src, i) => (
                        <div key={i} className="source-card__item">
                            <a
                                className="source-card__title"
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {src.title}
                                <span className="source-card__link-icon">↗</span>
                            </a>
                            {src.excerpt && (
                                <p className="source-card__excerpt">"{src.excerpt}"</p>
                            )}
                            {src.score !== undefined && (
                                <span className="source-card__score">Relevance: {src.score}%</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
