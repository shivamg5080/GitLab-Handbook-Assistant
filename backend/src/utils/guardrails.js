/**
 * guardrails.js
 * Filters out off-topic or potentially harmful queries before hitting the LLM.
 */

// Keywords that suggest a GitLab / company / remote-work related query
const GITLAB_KEYWORDS = [
    'gitlab', 'handbook', 'direction', 'values', 'culture', 'remote', 'workflow',
    'engineering', 'product', 'design', 'marketing', 'sales', 'finance', 'hr',
    'people', 'hiring', 'onboarding', 'iteration', 'transparency', 'collaboration',
    'open source', 'devops', 'ci/cd', 'pipeline', 'security', 'compliance',
    'okr', 'kpi', 'strategy', 'roadmap', 'vision', 'mission', 'goals',
    'team', 'manager', 'employee', 'benefits', 'compensation', 'equity',
    'all-remote', 'asynchronous', 'async', 'communication', 'meeting', 'merge',
    'issue', 'project', 'repository', 'code review', 'deploy', 'release',
    'customer', 'revenue', 'growth', 'invest', 'partner', 'community',
    'diversity', 'inclusion', 'belonging', 'dib', 'results', 'efficiency',
    'what is', 'how does', 'explain', 'tell me', 'describe', 'what are',
    'how to', 'policy', 'process', 'guideline', 'principle'
];

// Patterns that are clearly off-topic
const OFF_TOPIC_PATTERNS = [
    /^\s*\d+[\s\+\-\*\/]\d+\s*$/,       // pure math expressions like "2+2"
    /^(hi|hello|hey|yo|sup)[\s!.]*$/i,   // just greetings with no context
    /weather|recipe|cook|movie|sport|cricket|football|nfl|nba|stock|crypto|bitcoin/i,
];

/**
 * Returns true if the query seems related to GitLab topics.
 * Uses a lenient approach — rejects only clear misses.
 * @param {string} query
 * @returns {{ relevant: boolean, reason: string }}
 */
function isRelevantQuery(query) {
    if (!query || query.trim().length < 3) {
        return { relevant: false, reason: 'Query is too short.' };
    }

    const lower = query.toLowerCase();

    // Check obvious off-topic patterns first
    for (const pattern of OFF_TOPIC_PATTERNS) {
        if (pattern.test(lower)) {
            return {
                relevant: false,
                reason: "I'm specialized in GitLab's Handbook and Direction content. This query appears to be outside my scope.",
            };
        }
    }

    // Check for at least one GitLab keyword
    const hasKeyword = GITLAB_KEYWORDS.some((kw) => lower.includes(kw));
    if (hasKeyword) {
        return { relevant: true, reason: '' };
    }

    // Allow short, ambiguous queries (user might be asking follow-ups)
    if (query.trim().split(/\s+/).length <= 5) {
        return { relevant: true, reason: '' };
    }

    // Longer queries with no GitLab keywords — flag as off-topic
    return {
        relevant: false,
        reason:
            "I can only answer questions about GitLab's Handbook and product direction. Please ask something related to GitLab.",
    };
}

module.exports = { isRelevantQuery };
