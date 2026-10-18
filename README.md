# AI-Powered Food Freshness Monitoring Platform

An enterprise-grade, end-to-end intelligent platform for automated produce freshness classification, dynamic kinetic shelf-life prediction, cold-chain storage monitoring, executive decision analytics, and automated regulatory compliance reporting.

Built with Deep Learning (TensorFlow/Keras), FastAPI, MongoDB Atlas, Docker, and a modern React executive dashboard.

---

## 🌟 Key Capabilities & Features

- **Deep Learning Produce Classifier:** Evaluates incoming produce across multi-class fresh and rotten categories with high accuracy using CNN & MobileNet transfer learning.
- **Dynamic Kinetic Shelf-Life Engine:** Simulates real-time produce decay using Arrhenius reaction kinetics and $Q_{10}$ temperature coefficients, adjusting for microclimate temperature, relative humidity, and chilling injury risks.
- **Executive Decision Intelligence (Milestone 4):** Real-time macroeconomic dashboards tracking active asset valuation ($), capital at risk, prevented spoilage loss, cold-chain SLA compliance, and ESG carbon avoidance (kg CO₂e).
- **HACCP & ISO 22000 Compliance Reporting (Milestone 4):** Automated digital audit certificates with cryptographic certificate IDs, batch freshness ledgers, and one-click audit data export in **CSV** and **JSON** formats.
- **IoT Storage Telemetry & Automated Climate Control:** Real-time sensor monitoring across warehouse cold storage zones with one-click automated cooling boost and climate excursion mitigation workflows.
- **Automated Testing Suite (Milestone 4):** 20 automated unit and integration tests covering REST APIs, kinetic math, storage automation, and computer vision scoring (100% pass rate).
- **Containerized Cloud Deployment (Milestone 4):** Production multi-stage Dockerfiles for backend and frontend with Nginx reverse proxying, health checks, and single-command `docker-compose` orchestration.

---

## 📁 Repository Structure

```text
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI application routes & REST endpoints
│   │   ├── database.py                # Dual MongoDB Atlas & SQLite fallback models
│   │   ├── image_analyzer.py          # OpenCV computer vision & texture entropy analyzer
│   │   ├── shelf_life_engine.py       # Arrhenius & Q10 kinetic shelf-life algorithms
│   │   ├── executive_analytics.py     # Macroeconomic KPIs, trends & HACCP audit reports
│   │   ├── inventory_insights.py      # Inventory risk metrics & spoilage categorization
│   │   ├── recommendation_engine.py   # Prescriptive clearance & mitigation workflows
│   │   └── storage_monitoring.py      # IoT zone telemetry & cooling boost automation
│   ├── tests/                         # Pytest automated test suite (20 tests)
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
│   │   ├── App.jsx                    # React 18 single page application with executive dashboard
│   │   ├── App.css                    # Responsive styling, chart layouts, and print stylesheets
│   │   └── main.jsx                   # React DOM entry point
│   ├── Dockerfile                     # Multi-stage build (Node 20 -> Nginx 1.27-alpine)
│   ├── nginx.conf                     # Production Nginx reverse proxy configuration
│   ├── package.json                   # Frontend dependencies
│   └── vite.config.js                 # Vite bundler configuration
├── ml/
│   ├── data/                          # Dataset splits, mappings, and evaluation metrics
│   ├── models/                        # Pretrained model binaries (food_freshness_model.keras)
│   └── src/                           # Model training, evaluation & preprocessing scripts
├── docs/                              # Milestone 4 Comprehensive Documentation Suite
│   ├── MILESTONE_4_REPORT.md          # Complete Milestone 4 execution report
│   ├── SYSTEM_ARCHITECTURE.md         # Deep-dive system architecture & data flow
│   ├── API_DOCUMENTATION.md           # REST API specification & JSON schemas
│   ├── DEPLOYMENT_GUIDE.md            # Production Docker & cloud deployment manual
│   └── EXECUTIVE_PRESENTATION.md      # Stakeholder presentation deck & demo script
├── docker-compose.yml                 # Multi-container orchestration (DB + API + Web)
├── .env.example                       # Template for environment configuration
├── .gitignore                         # Git exclusion rules
└── README.md                          # Project documentation
```

---

## ⚡ Quick Start: Docker Deployment (Recommended)

Run the entire platform (Frontend, Backend, and MongoDB) with a single command:

```bash
# 1. Copy environment configuration
cp .env.example .env

# 2. Build and launch all container services
docker compose up --build -d

# 3. Check service health
docker compose ps
```

The application is now accessible at:
- **Executive Web Dashboard:** [http://localhost](http://localhost) (or `http://localhost:5173`)
- **FastAPI Interactive Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Container Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

To stop services:
```bash
docker compose down
```

---

## 💻 Manual Local Development Setup

### 1. Prerequisites
- Python 3.10+ (or 3.11 / 3.12)
- Node.js 18+ and npm
- MongoDB (Local instance or MongoDB Atlas cluster)

### 2. Backend Setup & Running Tests
```bash
cd backend
pip install -r requirements.txt

# Run the automated pytest suite (20 tests)
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

## 🧪 Testing & Validation

The test suite validates API response schemas, Arrhenius kinetics, computer vision extraction, and automated cooling workflows:

```bash
cd backend
pytest tests/ -v
```

**Results:**
- Total tests: **20**
- Passing: **20 (100% pass rate)**
- Execution time: **~1.07 seconds**

---

## 📚 Documentation Suite

Comprehensive architecture, API reference, deployment guides, and presentation decks are available in the [`docs/`](file:///d:/info_project/docs/) directory:
- [Milestone 4 Final Report](file:///d:/info_project/docs/MILESTONE_4_REPORT.md)
- [System Architecture & Kinetics](file:///d:/info_project/docs/SYSTEM_ARCHITECTURE.md)
- [API Reference & Schema Documentation](file:///d:/info_project/docs/API_DOCUMENTATION.md)
- [Production Deployment Guide](file:///d:/info_project/docs/DEPLOYMENT_GUIDE.md)
- [Executive Presentation & Demonstration Deck](file:///d:/info_project/docs/EXECUTIVE_PRESENTATION.md)

---

## 🛡️ License

Developed for the Infosys Project / Academic Capstone. All rights reserved.
