# AI-Powered Food Freshness & Quality Detection Platform

An end-to-end intelligent system for automated produce freshness classification, dynamic shelf-life estimation, inventory monitoring, and spoilage risk analytics. Built with Deep Learning, FastAPI, MongoDB, and a modern React frontend.

---

## 🌟 Key Features

- **Deep Learning Classification:** Evaluates produce items across fresh and rotten categories with high-accuracy CNN / Transfer Learning models (`.keras`).
- **Dynamic Shelf-Life Engine:** Calculates estimated remaining shelf-life considering visual condition, storage temperature, humidity, and produce decay kinetics.
- **Smart Inventory Insights:** Track inventory freshness status, monitor spoilage risks, and receive automated recommendations for storage and sales urgency.
- **Real-Time Image Analysis:** Extract color variance, texture uniformity, and visual decay indicators from uploaded produce images.
- **Modern Dashboard UI:** Interactive React application with charts, real-time alerts, image upload previews, and quality analytics.
- **Secure Backend API:** FastAPI architecture with JWT authentication, MongoDB Atlas integration, and automated database indexing.

---

## 📁 Repository Structure

```text
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI application routes & endpoints
│   │   ├── database.py                # MongoDB / SQLite models and helpers
│   │   ├── image_analyzer.py          # Feature extraction & visual scoring
│   │   ├── shelf_life_engine.py       # Shelf life calculation algorithms
│   │   ├── inventory_insights.py      # Inventory analysis & metrics
│   │   ├── recommendation_engine.py   # Spoilage prevention recommendations
│   │   └── storage_monitoring.py      # Ambient condition simulation & alerts
│   ├── uploads/                       # Temp storage for analyzed images
│   ├── sync_to_atlas.py               # Data sync utility for MongoDB Atlas
│   └── requirements.txt               # Backend dependencies
├── frontend/
│   ├── src/                           # React components, views & state
│   ├── index.html                     # Entry HTML template
│   ├── vite.config.js                 # Vite configuration
│   └── package.json                   # Frontend dependencies & scripts
├── ml/
│   ├── data/                          # Train/test/val splits, mappings, and evaluation metrics
│   ├── models/                        # Trained model binaries (food_freshness_model.keras)
│   └── src/                           # Model training, evaluation & preprocessing scripts
├── .env.example                       # Template for environment configuration
├── .gitignore                         # Git exclusion rules
└── README.md                          # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+ (or 3.11 / 3.12)
- Node.js 18+ and npm
- MongoDB (Local instance or MongoDB Atlas cluster)

### 2. Environment Configuration
Copy the example environment file and configure your credentials:

```bash
cp .env.example .env
```

Configure your MongoDB connection string in `.env`:
```env
MONGO_DETAILS=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/food_freshness?retryWrites=true&w=majority
```

### 3. Backend Setup
Navigate to the backend directory, install dependencies, and start the API server:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
The FastAPI docs will be accessible at: `http://localhost:8000/docs`.

### 4. Frontend Setup
In a separate terminal, navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```
The application will launch at: `http://localhost:5173`.

---

## 🧠 Machine Learning Pipeline

- **Model Architecture:** Transfer learning with MobileNet / CNN feature extractor.
- **Model File:** Located at `ml/models/food_freshness_model.keras`.
- **Classes:** Multi-class classification covering various fresh and rotten produce types (Apples, Bananas, Oranges, Tomatoes, Pineapples, etc.).
- **Evaluation:** Precision, recall, confusion matrix, and class distribution artifacts stored under `ml/data/`.

---

## 🛡️ License

This project was developed for the Infosys Project / Academic Capstone. All rights reserved.
