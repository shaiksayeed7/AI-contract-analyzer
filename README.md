# LexiScan AI – Smart Contract Analyzer

> **Understand any contract in under 2 minutes.**

AI-powered SaaS platform that reads contracts, highlights risks visually, extracts key clauses, and lets users chat with the document using RAG (Retrieval-Augmented Generation).

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Contract Upload** | PDF, DOCX, TXT, and image files (OCR via Tesseract) |
| 🤖 **AI Analysis** | Risk scoring (0–100), clause detection, party extraction |
| 🗺️ **Visual Risk Map** | Color-coded risk breakdown: 🔴 High · 🟡 Medium · 🟢 Safe |
| 💬 **Contract Chatbot** | RAG-based Q&A — ask anything about your contract |
| 📊 **Dashboard** | Contract list, risk scores, obligations tracker |
| 🔍 **Clause Highlights** | Expandable clauses with AI explanations and suggestions |
| ⚖️ **Contract Comparison** | Side-by-side diff of two contracts with AI analysis |
| 🔐 **Auth** | JWT-based user authentication with plan management |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 16 + Tailwind CSS)                       │
│  Landing · Dashboard · Upload · Contract Detail · Chat       │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
┌──────────────────────────▼──────────────────────────────────┐
│  Backend (FastAPI + Python 3.12)                            │
│  Upload · Analysis · Chat · Auth · Comparison               │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ SQLite/PG   │  │  OpenAI API  │  │  ChromaDB (RAG)  │  │
│  │ (contracts) │  │  GPT-4o-mini │  │  (embeddings)    │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Processing Pipeline:**
```
Contract Upload → Text Extraction → AI Analysis → Vector Indexing
     ↓                  ↓                ↓               ↓
  File saved        OCR/PDF/DOCX    GPT-4o-mini     ChromaDB
                     extraction     risk scoring    embeddings
```

**Chatbot (RAG):**
```
User Question → Search ChromaDB → Retrieve Clauses → GPT Answer
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.12+
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### 1. Clone & Configure

```bash
git clone https://github.com/shaiksayeed7/AI-contract-analyzer
cd AI-contract-analyzer
```

### 2. Backend Setup

```bash
cd backend

# Create environment file
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend

# Create environment file
cp .env.example .env.local

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open http://localhost:3000 🎉

---

## 🐳 Docker Deployment

```bash
# Copy and configure environment
cp backend/.env.example backend/.env
# Edit backend/.env and set OPENAI_API_KEY and SECRET_KEY

# Build and run
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 📡 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Register user |
| `POST` | `/api/auth/login` | Login |
| `POST` | `/api/contracts/upload` | Upload contract |
| `GET` | `/api/contracts/` | List contracts |
| `GET` | `/api/contracts/{id}` | Get contract + clauses |
| `GET` | `/api/contracts/{id}/status` | Poll processing status |
| `DELETE` | `/api/contracts/{id}` | Delete contract |
| `POST` | `/api/contracts/compare` | Compare two contracts |
| `POST` | `/api/chat/` | Send chat message |
| `GET` | `/api/chat/{id}/history` | Get chat history |
| `DELETE` | `/api/chat/{id}/history` | Clear chat history |

Full interactive docs: http://localhost:8000/docs

---

## 🧪 Running Tests

```bash
cd backend
python -m pytest tests/ -v
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI API key (required for AI) | — |
| `OPENAI_MODEL` | OpenAI model | `gpt-4o-mini` |
| `DATABASE_URL` | Database connection string | SQLite |
| `SECRET_KEY` | JWT signing key (change in production!) | — |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000/api` |

---

## 📦 Tech Stack

**Frontend**
- Next.js 16 (App Router)
- React 19
- Tailwind CSS
- react-dropzone
- lucide-react

**Backend**
- FastAPI
- SQLAlchemy (async) + SQLite/PostgreSQL
- OpenAI SDK (GPT-4o-mini)
- ChromaDB (vector embeddings)
- pdfplumber + PyPDF2 (PDF extraction)
- python-docx (DOCX extraction)
- pytesseract (OCR for images)
- JWT authentication (python-jose)

---

## 💰 Pricing Plans

| Plan | Price | Contracts | Features |
|---|---|---|---|
| Free | $0 | 5/month | Basic analysis, Dashboard |
| Pro | $25/mo | 100/month | + AI Chatbot, Clause highlights, Comparison |
| Team | $99/mo | Unlimited | + Collaboration, API access |

---

## 🗺️ Roadmap

- [ ] AI negotiation assistant (auto-redlining)
- [ ] Contract generator
- [ ] Slack/Gmail integration
- [ ] Shareable contract risk reports
- [ ] Multi-language support
- [ ] PostgreSQL production database
- [ ] S3 file storage

---

## License

MIT
