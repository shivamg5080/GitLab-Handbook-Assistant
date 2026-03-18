/**
 * ingest.js — One-time data ingestion script.
 *
 * Run: node scripts/ingest.js
 *
 * Steps:
 *  1. Scrape GitLab Handbook + Direction pages
 *  2. Split into overlapping text chunks
 *  3. Generate embeddings via Gemini API
 *  4. Save to data/chunks.json
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { scrapeGitLabPages } = require('../src/services/scraperService');
const { chunkDocuments } = require('../src/utils/textChunker');
const { generateEmbedding } = require('../src/services/geminiService');
const vectorStore = require('../src/services/vectorStore');

// Rate limit: Gemini free tier allows ~1500 calls/day
// We add a delay between embedding calls to stay safe
const EMBED_DELAY_MS = 500;

async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}

async function main() {
    console.log('══════════════════════════════════════════');
    console.log('  GitLab Chatbot — Data Ingestion Script  ');
    console.log('══════════════════════════════════════════\n');

    if (!process.env.GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY is not set in .env file!');
        process.exit(1);
    }

    // Step 1: Scrape
    console.log('Step 1: Scraping GitLab pages...\n');
    const docs = await scrapeGitLabPages();

    if (docs.length === 0) {
        console.error('❌ No documents scraped. Check your internet connection.');
        process.exit(1);
    }

    // Step 2: Chunk
    console.log('\nStep 2: Splitting documents into chunks...');
    const chunks = chunkDocuments(docs);

    // Step 3: Embed
    console.log(`\nStep 3: Generating embeddings for ${chunks.length} chunks...`);
    console.log(`  (This may take ~${Math.ceil((chunks.length * EMBED_DELAY_MS) / 60000)} minutes)\n`);

    const embeddedChunks = [];
    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        process.stdout.write(`  [${i + 1}/${chunks.length}] Embedding chunk ${chunk.id}...`);

        try {
            const embedding = await generateEmbedding(chunk.chunkText);
            embeddedChunks.push({ ...chunk, embedding });
            succeeded++;
            process.stdout.write(' ✓\n');
        } catch (err) {
            failed++;
            process.stdout.write(` ✗ (${err.message})\n`);
        }

        // Respect rate limits
        if (i < chunks.length - 1) {
            await sleep(EMBED_DELAY_MS);
        }
    }

    console.log(`\n  ✅ ${succeeded} embedded | ❌ ${failed} failed`);

    if (embeddedChunks.length === 0) {
        console.error('\n❌ No chunks were embedded. Check your API key.');
        process.exit(1);
    }

    // Step 4: Save to disk
    console.log('\nStep 4: Saving vector store to data/chunks.json...');
    vectorStore.addChunks(embeddedChunks);
    vectorStore.save();

    console.log('\n══════════════════════════════════════════');
    console.log(`  ✅ Ingestion complete!`);
    console.log(`     ${embeddedChunks.length} chunks ready for search.`);
    console.log(`     Start the server: npm start`);
    console.log('══════════════════════════════════════════\n');
}

main().catch((err) => {
    console.error('Fatal error during ingestion:', err);
    process.exit(1);
});
