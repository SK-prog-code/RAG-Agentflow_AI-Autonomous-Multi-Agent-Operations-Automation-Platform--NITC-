# RAG-Based College Chatbot — Specification Sheet

## 1. Project Overview

| Field | Detail |
|---|---|
| Project Name | College RAG Assistant |
| Type | AI-powered Q&A chatbot using Retrieval-Augmented Generation |
| Difficulty | Medium |
| Goal | Answer student questions accurately using only the college's own documents, with sources cited |
| Core Constraint | Must implement a real retrieval pipeline (embeddings + vector DB), not just an LLM wrapper |

---

## 2. System Architecture

```
┌─────────────┐      ┌──────────────┐      ┌────────────────┐
│   Frontend   │ ───▶ │   Backend    │ ───▶ │   Vector DB     │
│  (Chat UI)   │ ◀─── │  (API layer) │ ◀─── │ (Embeddings)    │
└─────────────┘      └──────┬───────┘      └────────────────┘
                             │
                    ┌────────┴────────┐
                    │   LLM Provider   │
                    │ (Claude/OpenAI)  │
                    └─────────────────┘
                             │
                    ┌────────┴────────┐
                    │  Relational DB   │
                    │ (Users/Chats/Docs)│
                    └─────────────────┘
```

**Layers:**
1. **Frontend** — chat UI, auth pages, admin document panel
2. **Backend/API** — orchestrates auth, document processing, RAG pipeline, chat logic
3. **Vector Database** — stores chunk embeddings, does similarity search
4. **Relational/Document DB** — stores users, chat history, document metadata
5. **LLM** — generates final answer from retrieved context
6. **Object Storage** — stores raw uploaded PDFs/files

---

## 3. Recommended Tech Stack

| Layer | Options (pick one per row) |
|---|---|
| Frontend | React / Next.js, Tailwind CSS |
| Backend | Node.js (Express/Fastify) or Python (FastAPI) |
| Auth | JWT + bcrypt, or Auth0/Clerk/Firebase Auth |
| Vector DB | Pinecone, Weaviate, Qdrant, Chroma (local/free), pgvector (Postgres extension) |
| Embeddings | OpenAI `text-embedding-3-small`, Cohere embed, or Sentence-Transformers (self-hosted, free) |
| LLM | Claude API, OpenAI GPT, or open-source (Llama via Groq/Ollama) |
| Relational DB | PostgreSQL / MongoDB |
| File Storage | AWS S3, Cloudinary, or local disk (dev only) |
| PDF/Text Extraction | `pdf-parse` / `pypdf` / `unstructured` / `PyMuPDF` |
| Deployment | Frontend: Vercel/Netlify · Backend: Render/Railway/AWS EC2/Fly.io |

> Beginner-friendly combo: **Next.js + FastAPI + Chroma (local) + Sentence-Transformers + Claude/OpenAI API + PostgreSQL + Render/Vercel**

---

## 4. Functional Requirements (Core / Must-Have)

### 4.1 Authentication
- Student and Admin roles
- Sign up / login / logout
- JWT-based session handling
- Route protection (students can't access admin document management)

### 4.2 Document Upload & Processing
- Admin uploads PDFs/docs (multi-file support)
- Text extraction (handle multi-column PDFs, tables where possible)
- Chunking strategy: fixed-size (e.g., 500–800 tokens) with overlap (~10–15%)
- Store chunk metadata: `document_id`, `page_number`, `source_filename`, `chunk_index`

### 4.3 Embedding & Vector Storage
- Generate embeddings for each chunk on upload
- Store vectors + metadata in vector DB
- Re-embed / re-index on document update

### 4.4 RAG Pipeline
- User query → embed query → top-k similarity search (k=3–5)
- Optional: re-rank retrieved chunks
- Construct prompt: system instructions + retrieved context + user question + chat history
- Send to LLM, stream or return final answer

### 4.5 Chat Interface
- Real-time chat UI (message bubbles, typing indicator)
- Maintains conversation context (last N turns passed to LLM)
- Persists chat history per user (retrievable on next login)

### 4.6 Answer Quality Controls
- **Source display**: show document name + page/section per answer
- **Unknown-question handling**: if retrieval confidence/similarity is below threshold, respond "I don't have information on that" instead of hallucinating
- Answers must be grounded — system prompt should instruct LLM not to use outside knowledge

### 4.7 Admin Panel
- Upload / view / delete documents
- View list of indexed documents with status (processing/indexed/failed)
- (Bonus) view chat logs, analytics

### 4.8 Database Schema (suggested)

```
users
 ├─ id, name, email, password_hash, role (student/admin), created_at

documents
 ├─ id, filename, uploaded_by, upload_date, status, department (optional)

chunks
 ├─ id, document_id, chunk_text, page_number, embedding_id (ref to vector DB)

chats
 ├─ id, user_id, title, created_at

messages
 ├─ id, chat_id, sender (user/bot), content, sources (json), created_at
```

---

## 5. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Query response < 5s end-to-end (including retrieval + LLM) |
| Scalability | Support multiple concurrent chats; vector DB should handle 10k+ chunks |
| Security | Passwords hashed, JWT expiry, admin-only routes protected, file-type validation on upload |
| Reliability | Graceful error handling if LLM/vector DB call fails |
| Usability | Mobile-responsive chat UI |
| Observability | Basic logging of queries, retrieval hits, errors |

---

## 6. API Endpoint Spec (example, REST)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/documents/upload` | Admin uploads doc → triggers processing pipeline |
| GET | `/api/documents` | List all documents |
| DELETE | `/api/documents/:id` | Remove doc + its vectors |
| POST | `/api/chat/message` | Send user query → returns answer + sources |
| GET | `/api/chat/history/:userId` | Fetch past conversations |
| POST | `/api/feedback` | (Bonus) 👍/👎 on an answer |

---

## 7. RAG Pipeline Detail

1. **Text Extraction** — parse PDF/docx into raw text (preserve page numbers)
2. **Chunking** — split into ~500-token chunks, 50–100 token overlap, keep metadata
3. **Embedding** — batch-embed chunks via embedding model
4. **Indexing** — upsert vectors into vector DB with metadata (doc id, page, filename)
5. **Query Time**:
   - Embed user query
   - Similarity search (cosine similarity), retrieve top-k chunks
   - Optional: filter by department/collection, re-rank by relevance score
   - Build prompt: `[system instructions] + [retrieved chunks] + [chat history] + [user question]`
   - Call LLM → generate answer
   - Attach source metadata to response
   - If top similarity score < threshold → return fallback "no information found" message

---

## 8. Suggested UI Pages

1. **Login / Signup**
2. **Chat Page** — main chatbot interface, source citations shown under each answer
3. **Chat History Sidebar** — list of past conversations
4. **Admin Dashboard** — document upload/list/delete, (bonus) analytics
5. **Settings/Profile** (optional)

---

## 9. Milestone-Based Build Plan

| Phase | Deliverable |
|---|---|
| 1 | Auth (signup/login), basic chat UI shell (no AI yet) |
| 2 | Document upload + text extraction + chunking working end-to-end |
| 3 | Embedding generation + vector DB indexing |
| 4 | RAG pipeline: retrieval + LLM answer generation, tested via API |
| 5 | Connect chat UI to RAG pipeline, show sources |
| 6 | Unknown-question fallback + chat history persistence |
| 7 | Admin document management (view/delete/reindex) |
| 8 | Polish UI, error handling, deploy frontend + backend |
| 9 (Bonus) | Feedback (👍/👎), streaming responses, analytics, multilingual support |

---

## 10. Bonus Features (Prioritized)

**High impact, low effort:**
- Streaming AI responses (better UX)
- Suggested questions (based on common FAQs)
- Answer feedback (👍/👎)

**Medium effort:**
- Department-wise knowledge base collections
- Confidence/relevance score display
- Hybrid keyword + semantic search (BM25 + vector)
- Conversation export (PDF/text)

**Higher effort:**
- Admin analytics dashboard
- Document re-ranking (cross-encoder)
- OCR for scanned documents
- Role-based access control (multiple admin tiers)
- Voice input/output
- Multilingual chatbot
- Automatic document summarization / AI-generated FAQs

---

## 11. Evaluation Checklist (for grading/demo)

- [ ] Can upload a PDF and see it processed into chunks
- [ ] Can ask a question and get an answer grounded in the uploaded docs
- [ ] Answer displays the correct source document/page
- [ ] Asking something not in the docs triggers a clear "don't know" response
- [ ] Chat history persists across sessions
- [ ] Admin can delete a document and it's removed from retrieval
- [ ] App is deployed and publicly accessible
- [ ] Frontend and backend are fully integrated (no mock data)

---

*Use this as a living document — check items off in section 9 and 11 as you build.*