# GitLab Handbook GenAI Chatbot (Optimized) 🦊

An intelligent, RAG-based assistant built with **Node.js**, **React**, and **Google Gemini 1.5 Flash**. This chatbot is specialized in retrieving and grounding answers from GitLab's documentation, featuring advanced optimizations for high precision and zero hallucinations.

## 🚀 Key Features

- **Recursive Character Chunking**: Smart document splitting that respects semantic boundaries (paragraphs/sentences).
- **Two-Stage RAG Pipeline**: 
  1. **Vector Retrieval**: Fast semantic search using `gemini-embedding-001`.
  2. **LLM Re-ranking**: Gemini scores retrieved chunks to filter out noise before generation.
- **LLM-as-a-Judge Evaluation**: Built-in script (`evaluate.js`) to score Faithfulness and Relevancy.
- **Glassmorphism UI**: Premium dark-mode interface with source attribution and feedback buttons.
- **Context-Aware**: Remembers previous questions in the conversation.

## 🛠️ Quick Start

### 1. Prerequisites
- Node.js v18+
- [Google AI Studio API Key](https://aistudio.google.com)

### 2. Installation
```powershell
# Clone the repository
cd backend && npm install
cd ../frontend && npm install
```

### 3. Setup Environment
Create `.env` in the `backend` folder:
```text
GEMINI_API_KEY=your_key_here
PORT=3002
```

### 4. Ingest GitLab Data
```powershell
cd backend
npm run ingest
```

### 5. Run the Project
**Backend:** `cd backend && npm start` (Port 3002)
**Frontend:** `cd frontend && npm run dev` (Port 5173)

## 📊 Evaluation
Verify the RAG performance:
```powershell
cd backend
node scripts/evaluate.js
```

## 🏗️ Technical Stack
- **Backend**: Express.js, @google/generative-ai, Cheerio (scraping)
- **Frontend**: React, Vite, Framer Motion
- **RAG**: Vector search + LLM Re-ranking
