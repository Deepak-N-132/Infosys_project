# FreshCheck AI - Enterprise Food Freshness & Storage Monitoring Platform

[![Live Frontend](https://img.shields.io/badge/Render-Live%20Frontend-00c7b7?logo=render&logoColor=white)](https://freshcheck-frontend.onrender.com)
[![Live Backend](https://img.shields.io/badge/Render-Live%20Backend-46e3b7?logo=render&logoColor=white)](https://freshcheck-backend.onrender.com)
[![FastAPI Docs](https://img.shields.io/badge/FastAPI-Swagger%20Docs-009688?logo=fastapi&logoColor=white)](https://freshcheck-backend.onrender.com/docs)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://python.org)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3--Flash--Preview-4285F4?logo=google&logoColor=white)](https://aistudio.google.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB%20Atlas-Cloud%20M0-47A248?logo=mongodb&logoColor=white)](https://cloud.mongodb.com/)
[![Sentry](https://img.shields.io/badge/Sentry-AI%20Autofix%20Enabled-362D59?logo=sentry&logoColor=white)](https://deepak-nandi.sentry.io/)
[![Pytest](https://img.shields.io/badge/Pytest-25%20Passed%20(100%25)-brightgreen?logo=pytest&logoColor=white)](https://pytest.org)

An enterprise-grade, end-to-end intelligent platform for automated produce freshness classification, dynamic kinetic shelf-life prediction, IoT cold-chain storage monitoring, executive decision analytics, regulatory HACCP/ISO 22000 compliance auditing, and an integrated **Google Gemini AI Food Storage Advisor**.

---

## 🌐 Live Production Deployments

| Component | Platform | Status | URL |
| :--- | :--- | :--- | :--- |
| **Executive Web Dashboard** | Render CDN (Static Site) | 🟢 **Live** | [**`https://freshcheck-frontend.onrender.com`**](https://freshcheck-frontend.onrender.com) |
| **Backend REST & Inference API** | Render Cloud (Docker) | 🟢 **Live** | [**`https://freshcheck-backend.onrender.com`**](https://freshcheck-backend.onrender.com) |
| **Interactive OpenAPI Documentation** | Swagger UI | 🟢 **Live** | [**`https://freshcheck-backend.onrender.com/docs`**](https://freshcheck-backend.onrender.com/docs) |
| **Cloud Database** | MongoDB Atlas Cluster | 🟢 **Active** | `food_freshness` (whitelisted `0.0.0.0/0`) |
| **Error Monitoring & AI Autofix** | Sentry Seer AI Agent | 🟢 **Active** | [**`https://deepak-nandi.sentry.io/issues/`**](https://deepak-nandi.sentry.io/issues/) |

---

## 🌟 Key Capabilities & Architecture

### 1. Deep Learning Produce Classification (Milestone 1 & 2)
- Evaluates incoming produce across multi-class fresh and rotten categories with high accuracy.
- Features CNN & MobileNetV2 transfer learning trained on multi-spectral produce datasets.
- Computer vision surface integrity extraction, edge entropy, and browning ratio quantification using OpenCV.

### 2. Kinetic Shelf-Life Prediction Engine (Milestone 3)
- Models biological decay using real-time **Arrhenius reaction kinetics** and **$Q_{10}$ temperature coefficients**.
- Dynamically adjusts predicted expiration according to real microclimate metrics: storage temperature (°C), relative humidity (% RH), ethylene gas exposure (ppm), and chilling injury threshold boundaries.

### 3. AI Food Storage & Preservation Advisor (Google Gemini Powered)
- **High-Speed Model Cascade:** Connects to **`gemini-3-flash-preview`** with automatic failover to `gemini-flash-latest` and `gemini-3.8-flash`.
- **Zero-Downtime Offline Knowledge Base:** Automatically falls back to a curated 25-food food science engine if the external API is unreachable or rate-limited.
- Delivers precision storage envelopes, ethylene gas isolation guidelines, pro longevity hacks, and freezing safety protocols.
- Dedicated REST endpoints: `/chat`, `/chat/status`, `/chat/save-key`, and `/chat/test-key`.

### 4. Executive Decision Intelligence & Macroeconomic Analytics (Milestone 4)
- Real-time macroeconomic dashboards tracking active inventory valuation ($), capital at risk, prevented spoilage loss, cold-chain SLA compliance, and ESG carbon avoidance (kg CO₂e).
- Prescriptive inventory clearance workflows and FEFO (First-Expired, First-Out) prioritization.

### 5. HACCP & ISO 22000 Automated Compliance Auditing (Milestone 4)
- Cryptographic digital audit certificates with unique hash certificate IDs (`CERT-2026-XXXX`).
- Comprehensive batch freshness ledgers with one-click export in **CSV** and **JSON** formats.

### 6. IoT Storage Telemetry & Climate Control Automation
- Multi-zone warehouse climate monitoring (Cold Vault, Chilled Cellar, Humidity Crisper).
- Real-time automated cooling boost and climate excursion mitigation workflows.

### 7. Automated Production Error Intelligence (Sentry + Seer AI)
- Production exceptions, stack traces, and request payloads are captured in real-time.
- **Sentry Seer AI Agent** automatically analyzes root causes and proposes automated GitHub Pull Requests for code fixes.

---

## 📁 Repository Structure

```text
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI application routes & REST endpoints
│   │   ├── database.py                # Dual MongoDB Atlas & SQLite fallback models
│   │   ├── storage_chatbot.py         # Gemini AI storage advisor & offline science engine
│   │   ├── image_analyzer.py          # OpenCV computer vision & texture entropy analyzer
│   │   ├── shelf_life_engine.py       # Arrhenius & Q10 kinetic shelf-life algorithms
│   │   ├── executive_analytics.py     # Macroeconomic KPIs, trends & HACCP audit reports
│   │   ├── inventory_insights.py      # Inventory risk metrics & spoilage categorization
│   │   ├── recommendation_engine.py   # Prescriptive clearance & mitigation workflows
│   │   └── storage_monitoring.py      # IoT zone telemetry & cooling boost automation
│   ├── tests/                         # Pytest automated test suite (25 tests, 100% pass)
│   │   ├── conftest.py                # Test fixtures & TestClient configuration
│   │   ├── test_api_endpoints.py      # REST endpoint validation & status codes
│   │   ├── test_shelf_life_engine.py  # Arrhenius kinetics & decay validation
│   │   ├── test_storage_monitoring.py # Storage zone telemetry & workflow tests
│   │   └── test_image_analyzer.py     # Quality score & spoilage risk tests
│   ├── Dockerfile                     # Multi-stage production Python 3.12-slim image
│   ├── requirements.txt               # Backend Python dependencies
│   └── sync_to_atlas.py               # Database sync utility for MongoDB Atlas
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # React 19 single page application with executive dashboard
│   │   ├── App.css                    # Modern glassmorphism styling, responsive layouts
│   │   └── main.jsx                   # React DOM entry point
│   ├── Dockerfile                     # Multi-stage build (Node 20 -> Nginx 1.27-alpine)
│   ├── nginx.conf                     # Production Nginx reverse proxy configuration
│   ├── package.json                   # Frontend dependencies
│   └── vite.config.js                 # Vite bundler configuration
├── ml/
│   ├── data/                          # Dataset splits, mappings, and evaluation metrics
│   ├── models/                        # Pretrained model binaries (food_freshness_model.keras)
│   └── src/                           # Model training, evaluation & preprocessing scripts
├── docs/                              # Comprehensive Documentation Suite
│   ├── MILESTONE_4_REPORT.md          # Complete Milestone 4 execution report
│   ├── SYSTEM_ARCHITECTURE.md         # Deep-dive system architecture & data flow
│   ├── API_DOCUMENTATION.md           # REST API specification & JSON schemas
│   ├── DEPLOYMENT_GUIDE.md            # Production Docker & cloud deployment manual
│   └── EXECUTIVE_PRESENTATION.md      # Stakeholder presentation deck & demo script
├── docker-compose.yml                 # Multi-container orchestration (MongoDB + API + Web)
├── render.yaml                        # Render Infrastructure as Code (Docker + Static Site)
├── .dockerignore                      # Context exclusion rules for clean Docker builds
├── .env.example                       # Template for environment configuration
├── .gitignore                         # Git exclusion rules
└── README.md                          # Project documentation
```

---

## ⚡ Quick Start: Cloud Deployment (Render)

The project includes a ready-to-use [`render.yaml`](render.yaml) blueprint with **Continuous Deployment (Auto-Deploy)**:

1. Fork or clone this repository to GitHub.
2. Log in to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Blueprint**.
3. Select your repository (`Infosys_project`).
4. Set the following environment variables:
   - `MONGO_DETAILS`: Your MongoDB Atlas connection URI (`mongodb+srv://...`).
   - `GEMINI_API_KEY`: Your Google Gemini API key.
   - `SENTRY_DSN`: Your Sentry project DSN URL.
5. Click **Apply** — Render automatically builds and hosts both services with automated SSL!

---

## 🐳 Quick Start: Docker Compose (Local / On-Premise)

Run the complete multi-container stack (Frontend, Backend, and MongoDB) with a single command:

```bash
# 1. Copy environment template
cp .env.example .env

# 2. Build and launch all services in detached mode
docker compose up --build -d

# 3. Check service health
docker compose ps
```

The application will be accessible at:
- **Executive Web Dashboard:** [http://localhost:5173](http://localhost:5173) (or `http://localhost`)
- **FastAPI Interactive Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Container Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

To stop services:
```bash
docker compose down
```

---

## 💻 Manual Local Development Setup

### 1. Prerequisites
- Python 3.10+ (recommended: 3.12)
- Node.js 18+ and npm
- MongoDB (Local instance or MongoDB Atlas cluster)

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Run the automated pytest suite (25 tests)
pytest tests/ -v

# Start the development API server
uvicorn app.main:app --reload --port 8000
```
Interactive API documentation will be available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd frontend
npm install

# Run the development server
npm run dev

# Or build the production bundle
npm run build
```
The React application will launch at `http://localhost:5173`.

---

## 🧪 Testing & Quality Assurance

The automated pytest suite validates API schemas, kinetic decay algorithms, computer vision extraction, and automated cooling workflows:

```bash
cd backend
pytest tests/ -v
```

**Results:**
- Total tests: **25**
- Passing: **25 (100% pass rate)**
- Execution time: **~1.45 seconds**

```text
tests\test_api_endpoints.py ..............                               [ 56%]
tests\test_image_analyzer.py ...                                         [ 68%]
tests\test_shelf_life_engine.py .....                                    [ 88%]
tests\test_storage_monitoring.py ...                                     [100%]
======================== 25 passed in 1.45s ========================
```

---

## 🔑 Environment Configuration Reference

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `MONGO_DETAILS` | MongoDB Atlas or Local connection URI | `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/food_freshness` |
| `SECRET_KEY` | JWT signing secret for auth tokens | 64-character random hex string |
| `ALLOWED_ORIGINS` | Permitted CORS origins | `http://localhost:5173,http://localhost` |
| `GEMINI_API_KEY` | Google Gemini API key for Chatbot | `AIzaSy...` or `AQ....` |
| `SENTRY_DSN` | Sentry Error Monitoring DSN | `https://xxxx@o1234.ingest.sentry.io/5678` |
| `SMTP_HOST` | Optional SMTP server for OTP emails | `smtp.gmail.com` |
| `SMTP_PORT` | Optional SMTP port | `587` |
| `SMTP_USER` | Optional SMTP email account | `your_email@gmail.com` |
| `SMTP_PASSWORD` | Optional 16-character App Password | `xxxx xxxx xxxx xxxx` |

---

## 📚 Milestone 4 Documentation Suite

Comprehensive technical reports, diagrams, API schemas, and deployment guides are available in the [`docs/`](docs/) directory:
- [Milestone 4 Final Report](docs/MILESTONE_4_REPORT.md)
- [System Architecture & Kinetics](docs/SYSTEM_ARCHITECTURE.md)
- [API Reference & Schema Documentation](docs/API_DOCUMENTATION.md)
- [Production Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- [Executive Presentation & Demonstration Deck](docs/EXECUTIVE_PRESENTATION.md)

---

## 🛡️ License

Developed for the Infosys Project / Academic Capstone. All rights reserved.
