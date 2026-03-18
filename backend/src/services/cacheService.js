/**
 * cacheService.js
 * Simple query-response cache using node-cache (TTL: 1 hour).
 */

const NodeCache = require('node-cache');

// TTL: 3600 seconds = 1 hour
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Normalize a query string for use as a cache key.
 * @param {string} query
 * @returns {string}
 */
function normalizeKey(query) {
    return query.toLowerCase().trim().replace(/\s+/g, ' ');
}

/**
 * Get a cached response.
 * @param {string} query
 * @returns {{ answer: string, sources: Array } | undefined}
 */
function get(query) {
    return cache.get(normalizeKey(query));
}

/**
 * Store a response in cache.
 * @param {string} query
 * @param {{ answer: string, sources: Array }} response
 */
function set(query, response) {
    cache.set(normalizeKey(query), response);
}

/**
 * Return cache statistics.
 */
function stats() {
    return cache.getStats();
}

module.exports = { get, set, stats };
