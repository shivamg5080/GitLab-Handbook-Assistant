/**
 * scraperService.js
 * Fetches and parses GitLab Handbook & Direction pages into clean text.
 */

const axios = require('axios');
const cheerio = require('cheerio');

// Curated list of high-value GitLab pages to ingest
const GITLAB_URLS = [
    // Core Handbook
    { url: 'https://handbook.gitlab.com/handbook/values/', title: 'GitLab Values' },
    { url: 'https://handbook.gitlab.com/handbook/communication/', title: 'Communication' },
    { url: 'https://handbook.gitlab.com/handbook/people-group/', title: 'People Group' },
    { url: 'https://handbook.gitlab.com/handbook/hiring/', title: 'Hiring' },
    { url: 'https://handbook.gitlab.com/handbook/engineering/', title: 'Engineering' },
    { url: 'https://handbook.gitlab.com/handbook/product/', title: 'Product' },
    { url: 'https://handbook.gitlab.com/handbook/marketing/', title: 'Marketing' },
    { url: 'https://handbook.gitlab.com/handbook/finance/', title: 'Finance' },
    { url: 'https://handbook.gitlab.com/handbook/sales/', title: 'Sales' },
    { url: 'https://handbook.gitlab.com/handbook/security/', title: 'Security' },
    { url: 'https://handbook.gitlab.com/handbook/legal/', title: 'Legal' },
    { url: 'https://handbook.gitlab.com/handbook/total-rewards/', title: 'Total Rewards & Benefits' },
    { url: 'https://handbook.gitlab.com/handbook/leadership/', title: 'Leadership' },
    { url: 'https://handbook.gitlab.com/handbook/company/culture/', title: 'Culture' },
    { url: 'https://handbook.gitlab.com/handbook/company/culture/all-remote/', title: 'All-Remote Work' },
    { url: 'https://handbook.gitlab.com/handbook/company/okrs/', title: 'OKRs' },
    { url: 'https://handbook.gitlab.com/handbook/company/strategy/', title: 'Strategy' },
    // Direction
    { url: 'https://about.gitlab.com/direction/', title: 'Product Direction' },
    { url: 'https://about.gitlab.com/direction/dev/', title: 'Dev Direction' },
    { url: 'https://about.gitlab.com/direction/ops/', title: 'Ops Direction' },
];

/**
 * Cleans raw HTML into plain text, stripping nav, footer, scripts, etc.
 * @param {string} html
 * @param {object} $ — cheerio instance
 * @returns {string}
 */
function extractText($) {
    // Remove unwanted elements
    $('script, style, nav, header, footer, .navigation, .sidebar, .breadcrumbs, noscript, iframe').remove();

    // Get the main content area if it exists, otherwise body
    const main = $('main, article, .content, #content, .markdown-body').first();
    const target = main.length ? main : $('body');

    return target
        .text()
        .replace(/\n{3,}/g, '\n\n')   // collapse excess newlines
        .replace(/\t/g, ' ')
        .replace(/  +/g, ' ')
        .trim();
}

/**
 * Fetch and parse a single URL.
 * @param {{ url: string, title: string }} page
 * @returns {Promise<{ url: string, title: string, content: string } | null>}
 */
async function fetchPage({ url, title }) {
    try {
        const res = await axios.get(url, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; GitLabChatbot/1.0)',
            },
        });
        const $ = cheerio.load(res.data);
        const content = extractText($);
        if (content.length < 100) {
            console.warn(`[Scraper] Skipping ${url} — too little content`);
            return null;
        }
        console.log(`[Scraper] ✓ ${title} (${content.length} chars)`);
        return { url, title, content };
    } catch (err) {
        console.error(`[Scraper] ✗ Failed: ${url} — ${err.message}`);
        return null;
    }
}

/**
 * Scrape all configured GitLab pages.
 * Fetches sequentially to be polite to the server.
 * @returns {Promise<Array<{ url, title, content }>>}
 */
async function scrapeGitLabPages() {
    console.log(`[Scraper] Starting scrape of ${GITLAB_URLS.length} pages...`);
    const docs = [];

    for (const page of GITLAB_URLS) {
        const doc = await fetchPage(page);
        if (doc) docs.push(doc);
        // Small delay to avoid hammering the server
        await new Promise((r) => setTimeout(r, 500));
    }

    console.log(`[Scraper] Done — ${docs.length}/${GITLAB_URLS.length} pages scraped`);
    return docs;
}

module.exports = { scrapeGitLabPages, GITLAB_URLS };
