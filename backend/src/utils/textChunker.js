/**
 * textChunker.js (Optimized)
 * Implements Recursive Character Splitting for better semantic coherence.
 */

const CHUNK_SIZE = 1500;     // Target characters per chunk
const CHUNK_OVERLAP = 200;   // Overlap in characters

/**
 * Splits text recursively based on a list of delimiters.
 * @param {string} text 
 * @param {string[]} delimiters 
 * @returns {string[]} chunks
 */
function recursiveSplit(text, delimiters = ['\n\n', '\n', '. ', ' ']) {
    if (text.length <= CHUNK_SIZE) return [text];

    const separator = delimiters[0];
    const splits = text.split(separator);
    const finalChunks = [];
    let currentChunk = '';

    for (let split of splits) {
        // If adding this split exceeds CHUNK_SIZE, handle it
        if ((currentChunk + (currentChunk ? separator : '') + split).length > CHUNK_SIZE) {
            if (currentChunk) {
                finalChunks.push(currentChunk.trim());
                // Handle overlap by taking the tail of the current chunk
                const overlapStart = Math.max(0, currentChunk.length - CHUNK_OVERLAP);
                currentChunk = currentChunk.slice(overlapStart);
                currentChunk += (currentChunk ? separator : '') + split;
            } else {
                // Split itself is too big, go to next delimiter level
                if (delimiters.length > 1) {
                    finalChunks.push(...recursiveSplit(split, delimiters.slice(1)));
                } else {
                    // Fallback: hard slice
                    finalChunks.push(split.slice(0, CHUNK_SIZE));
                }
            }
        } else {
            currentChunk += (currentChunk ? separator : '') + split;
        }
    }

    if (currentChunk.trim()) {
        finalChunks.push(currentChunk.trim());
    }

    return finalChunks;
}

/**
 * Split a single document into overlapping chunks.
 */
function chunkDocument(doc, docIndex) {
    const rawChunks = recursiveSplit(doc.content);

    return rawChunks
        .filter(text => text.length > 100) // Filter out tiny fragments
        .map((chunkText, chunkIndex) => ({
            id: `doc${docIndex}_chunk${chunkIndex}`,
            chunkText,
            source: doc.url,
            title: doc.title,
            chunkIndex,
        }));
}

/**
 * Process an array of documents into a flat array of chunks.
 */
function chunkDocuments(docs) {
    const allChunks = [];
    docs.forEach((doc, idx) => {
        const chunks = chunkDocument(doc, idx);
        allChunks.push(...chunks);
    });
    console.log(`[Chunker] Recursive Splitting: ${docs.length} docs → ${allChunks.length} chunks`);
    return allChunks;
}

module.exports = { chunkDocuments };
