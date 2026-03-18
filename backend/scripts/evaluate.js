require('dotenv').config();
const { ragQuery } = require('../src/services/ragService');
const { generateAnswer } = require('../src/services/geminiService');

const TEST_QUERIES = [
    "What are GitLab's core values?",
    "How does GitLab approach all-remote work?",
    "What is the hiring process at GitLab?"
];

async function evaluateResponse(query, answer, sources) {
    const prompt = `You are a RAG evaluation judge. Rate the following AI answer based on the provided context.
Query: "${query}"
Answer: "${answer}"
Context Used: ${sources.map(s => s.excerpt).join('\n---\n')}

Rate from 1-5 on these metrics:
1. Faithfulness: Does the answer only use information from the context? (1 = hallucinations, 5 = perfect grounding)
2. Relevancy: Does the answer directly address the user query? (1 = off-topic, 5 = perfect answer)

Format your response as:
Faithfulness: [score]
Relevancy: [score]
Reasoning: [brief explanation]`;

    try {
        const evaluation = await generateAnswer("You are a strict evaluation judge.", [], prompt);
        return evaluation;
    } catch (err) {
        return "Evaluation failed: " + err.message;
    }
}

async function runEvaluation() {
    console.log("══════════════════════════════════════════");
    console.log("   GitLab RAG — Pipeline Evaluation      ");
    console.log("══════════════════════════════════════════\n");

    for (const query of TEST_QUERIES) {
        console.log(`Query: ${query}`);
        console.log("Processing...");

        const { answer, sources } = await ragQuery(query);
        const evalResult = await evaluateResponse(query, answer, sources);

        console.log("\n--- Results ---");
        console.log(evalResult);
        console.log("──────────────────────────────────────────\n");
    }
}

runEvaluation();
