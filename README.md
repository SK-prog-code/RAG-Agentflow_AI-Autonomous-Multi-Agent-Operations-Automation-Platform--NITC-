# Agentflow_AI — Autonomous Multi-Agent Operations Automation Platform
### Developed for: **National Institute of Technology Calicut (NIT CALICUT)**

![NIT Calicut Badge](https://img.shields.io/badge/Institution-NIT%20CALICUT-059669?style=for-the-badge&logo=mortarboard)
![Platform](https://img.shields.io/badge/Platform-Agentflow__AI-2563EB?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Operational-10B981?style=for-the-badge)
![LangGraph](https://img.shields.io/badge/Substrate-LangGraph%20Ready-8B5CF6?style=for-the-badge)

---

## 📖 Project Overview

**Agentflow_AI** is an enterprise-grade AI Operations Automation Platform built according to the platform specification (`spec.md`). It empowers operators to describe complex workflows in plain English, converts them automatically into directed acyclic graphs (DAGs), renders them on a high-performance interactive canvas, and executes each step across a chain of **5 cooperating AI agents**:

1. 🧠 **Planner Agent**: Performs graph topological sorting (Kahn's Algorithm), resolves dependencies, and scores execution confidence.
2. ⚡ **Execution Agent**: Dispatches actions to third-party tools (Gmail, Slack, Discord, Google Sheets) or AI models with runtime variable interpolation.
3. 🛡️ **Validation Agent**: Enforces data integrity, output schemas, and field completeness checks before pipeline progression.
4. 🔄 **Recovery Agent**: Classifies errors (`AUTH_EXPIRED`, `RATE_LIMIT`, `TRANSIENT`, `MISSING_FIELDS`, `API_FAILURE`) and manages exponential backoff retries or operator escalations.
5. 📡 **Monitoring Agent**: Emits live WebSocket telemetry to the browser and maintains a persistent audit trail.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (Pages Router), React 18/19, Tailwind CSS, Zustand, Axios, `@xyflow/react` (React Flow), `socket.io-client`, `lucide-react` |
| **Backend** | Node.js, Express, MongoDB (Mongoose with automatic in-memory fallback), BullMQ & Redis (with automatic in-memory queue fallback), Socket.IO, `helmet`, `morgan`, `compression`, `express-validator`, `bcryptjs`, `jsonwebtoken` |
| **AI Integration** | OpenRouter API, Google Generative AI SDK, LangChain / LangGraph orchestration substrate, Deterministic Rule Compiler |
| **Security & Crypto** | AES-256-GCM token encryption at rest with application-level key, bcrypt cost factor 12 password hashing, rate limiting, JWT session verification |

---

## ⚡ Zero-Configuration Local Execution

> [!NOTE]
> **No external MongoDB or Redis installation is required!** 
> The backend comes pre-configured with automated **In-Memory database and queue fallbacks** (`mongodb-memory-server` and in-memory event queue). When run locally, everything works 100% out of the box. Real MongoDB and Redis instances can be connected anytime via `.env`.

---

## 🚀 Quickstart: Running the Project Locally

### 1. Prerequisites
Ensure you have **Node.js (v18 or higher)** and **npm** installed on your system.
Verify in your terminal:
```bash
node -v
npm -v
```

---

### 2. Install All Dependencies
From the project root directory (`RAG-College/`), run:

```bash
npm run install:all
```
*(This automatically installs root, backend `server/`, and frontend `client/` packages).*

---

### 3. Configure Environment Variables (Optional)
The default configuration is ready to run immediately. You can inspect or customize `.env` files:

#### Backend (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
JWT_SECRET=super_secret_jwt_key_for_agentflow_ai_nit_calicut_2026
CREDENTIAL_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Optional real databases (leave empty to use automated in-memory fallbacks)
MONGODB_URI=
REDIS_URL=

# Optional AI provider keys (falls back to deterministic compiler if empty)
OPENROUTER_API_KEY=
GEMINI_API_KEY=
```

#### Frontend (`client/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
NEXT_PUBLIC_INSTITUTE_NAME="NIT CALICUT"
NEXT_PUBLIC_APP_NAME="Agentflow_AI"
```

---

### 4. Start the Application
To launch both the backend server and frontend client concurrently with a single command:

```bash
npm run dev
```

The servers will start on:
- 🌐 **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- 🚀 **Backend API**: [http://localhost:5000](http://localhost:5000)
- 🩺 **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Default Operator Credentials

The system automatically initializes a pre-seeded operator account for **NIT Calicut**:

- **Email**: `operator@nitc.ac.in`
- **Password**: `Password123!`
- **Role**: `admin`
- *(You can also use the one-click "Quick Login as NIT Calicut Operator Demo" button on the login screen).*

---

## 🌟 Key Application Features & Navigation

### 1. 📊 Operator Console (`/dashboard`)
- Metric cards: Total Workflows, Success Rate, Execution Latency, and Active Runs.
- Live agent health status indicators.
- Quick execution triggers and recent run summaries.

### 2. 🪄 Natural Language Prompt-to-Workflow Builder (`/workflows/builder`)
- Enter any automation description (e.g. *"When a critical server alert arrives, summarize with AI, post to Slack, log to Google Sheets, and notify admin via Gmail"*).
- Instant multi-agent graph compilation and live interactive preview.
- One-click save to canvas editor.

### 3. 🎨 Interactive Visual Canvas (`/workflows/[id]`)
- Powered by `@xyflow/react` (React Flow).
- Drag-and-drop node palette on the left (Triggers, AI Agents, Gmail, Slack, Discord, Google Sheets, Condition Branches).
- Right-hand side node configuration inspector with real-time payload parameter binding.
- Animated edges, mini-map, and one-click execution runner.

### 4. ⏱️ Live Execution Timeline (`/executions/[id]`)
- Real-time Socket.IO event streaming.
- Color-coded badges for all 5 cooperating agents (**Planner**, **Execution**, **Validation**, **Recovery**, **Monitoring**).
- Granular event metadata and JSON payload inspection.
- Lifecycle controls: **Pause**, **Resume**, and **Cancel**.

### 5. 🔌 Third-Party Tool Integrations (`/integrations`)
- OAuth 2.0 connection flows for **Gmail**, **Slack**, **Discord**, and **Google Sheets**.
- Connection health diagnostics and AES-256-GCM encrypted token storage.

---

## 📚 API Endpoints Reference

### Authentication & Heartbeat
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health, LangGraph status, and uptime |
| `POST` | `/api/auth/register` | Register new operator account |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT |
| `GET` | `/api/auth/me` | Current operator profile (Protected) |

### Workflows
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/workflows/dashboard` | Aggregated metrics and execution stats |
| `GET` | `/api/workflows` | List workflows with filtering and pagination |
| `POST` | `/api/workflows` | Create a new workflow manually |
| `POST` | `/api/workflows/generate` | Synthesize workflow graph from AI prompt |
| `GET` | `/api/workflows/:id` | Get workflow details |
| `PUT` | `/api/workflows/:id` | Update workflow nodes, edges, and config |
| `POST` | `/api/workflows/:id/duplicate`| Clone existing workflow |
| `POST` | `/api/workflows/:id/execute` | Trigger execution run |
| `DELETE` | `/api/workflows/:id` | Delete workflow |

### Executions
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/executions` | List all workflow runs |
| `GET` | `/api/executions/:id` | Execution run snapshot and status |
| `GET` | `/api/executions/:id/timeline` | Detailed agent timeline events |
| `POST` | `/api/executions/:id/pause` | Pause an active execution run |
| `POST` | `/api/executions/:id/resume` | Resume a paused execution run |
| `POST` | `/api/executions/:id/cancel` | Cancel an active execution run |

### Integrations & Notifications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/integrations` | List user integration connections |
| `GET` | `/api/integrations/status` | Provider token validity and health checks |
| `GET` | `/api/integrations/oauth/:provider/start` | Initiate OAuth flow |
| `GET` | `/api/integrations/oauth/:provider/callback` | OAuth redirect callback handler |
| `POST` | `/api/integrations` | Manual credential setup |
| `GET` | `/api/notifications` | List user alerts and notifications |
| `PUT` | `/api/notifications/:id/read` | Mark alert(s) as read |

---

## 🏛️ Institutional Information

- **Institution**: National Institute of Technology Calicut (NIT CALICUT)
- **Department**: Operations & Intelligent Automation Systems
- **Platform**: Agentflow_AI Multi-Agent Operations Automation Platform
- **Year**: 2026
