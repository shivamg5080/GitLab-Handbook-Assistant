/**
 * useChat.js — Custom hook managing chat state and API calls.
 */

import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function useChat() {
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            role: 'assistant',
            content:
                "👋 Hi! I'm the **GitLab Handbook Assistant**. Ask me anything about GitLab's values, culture, engineering practices, product direction, hiring, remote work, and more!",
            sources: [],
            cached: false,
            guardrailed: false,
            timestamp: new Date(),
        },
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const conversationIdRef = useRef(null);

    const sendMessage = useCallback(async (userInput) => {
        if (!userInput?.trim() || isLoading) return;

        const userMsg = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: userInput.trim(),
            timestamp: new Date(),
        };

        // Build history from current messages (exclude welcome message)
        const history = messages
            .filter((m) => m.id !== 'welcome')
            .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', content: m.content }));

        setMessages((prev) => [...prev, userMsg]);
        setIsLoading(true);
        setError(null);

        try {
            const res = await axios.post(`${API_BASE}/chat`, {
                message: userInput.trim(),
                conversationId: conversationIdRef.current,
                history,
            });

            const data = res.data;
            conversationIdRef.current = data.conversationId;

            const assistantMsg = {
                id: data.messageId || `bot-${Date.now()}`,
                role: 'assistant',
                content: data.answer,
                sources: data.sources || [],
                cached: data.cached || false,
                guardrailed: data.guardrailed || false,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMsg]);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to connect to the server. Please check if the backend is running.';
            setError(errorMsg);

            setMessages((prev) => [
                ...prev,
                {
                    id: `err-${Date.now()}`,
                    role: 'assistant',
                    content: `⚠️ ${errorMsg}`,
                    sources: [],
                    cached: false,
                    guardrailed: false,
                    isError: true,
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, isLoading]);

    const submitFeedback = useCallback(async (messageId, rating, query, answer) => {
        try {
            await axios.post(`${API_BASE}/feedback`, { messageId, rating, query, answer });
        } catch (_) {
            // Feedback is non-critical — fail silently
        }
    }, []);

    const clearChat = useCallback(() => {
        conversationIdRef.current = null;
        setMessages([
            {
                id: 'welcome',
                role: 'assistant',
                content:
                    "👋 Hi! I'm the **GitLab Handbook Assistant**. Ask me anything about GitLab's values, culture, engineering practices, product direction, hiring, remote work, and more!",
                sources: [],
                cached: false,
                guardrailed: false,
                timestamp: new Date(),
            },
        ]);
        setError(null);
    }, []);

    return { messages, isLoading, error, sendMessage, submitFeedback, clearChat };
}
