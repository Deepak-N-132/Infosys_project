# API Reference & Endpoint Documentation

**Base URL:** `http://localhost:8000` (or `http://localhost/api` when accessed via reverse proxy)
**OpenAPI Specification:** Accessible interactively at `http://localhost:8000/docs` (Swagger UI) or `/redoc`

---

## 1. System Health & Infrastructure

### `GET /`
- **Description:** Platform root status and service identifier.
- **Response `200 OK`:**
  ```json
  {
    "message": "AI-Powered Food Freshness Monitoring API",
    "version": "1.0.0",
    "docs_url": "/docs"
  }
  ```

### `GET /health`
- **Description:** Liveness probe for Docker container orchestration and load balancers.
- **Response `200 OK`:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-06T18:30:00.000000Z"
  }
  ```

### `GET /db-status`
- **Description:** Verifies database connectivity (MongoDB Atlas vs. Local fallback mode).
- **Response `200 OK`:**
  ```json
  {
    "status": "connected",
    "mode": "mongodb_atlas",
    "database": "food_freshness",
    "timestamp": "2026-10-06T18:30:00.000000Z"
  }
  ```

---

## 2. Authentication & Authorization

### `POST /auth/register`
- **Description:** Registers a new warehouse operator or auditor.
- **Request Body:**
  ```json
  {
    "username": "auditor_john",
    "password": "SecurePassword123!",
    "role": "auditor"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "message": "User registered successfully",
    "username": "auditor_john"
  }
  ```

### `POST /auth/token`
- **Description:** OAuth2 password grant endpoint for JWT bearer token issuance.
- **Request Form Data:** `username`, `password`
- **Response `200 OK`:**
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "role": "auditor"
  }
  ```

---

## 3. Produce Inspection & Computer Vision

### `POST /analyze`
- **Description:** Analyzes produce image, extracts visual features, predicts class, and calculates dynamic shelf life.
- **Request (Multipart Form-Data):**
  - `file`: Image file (`.jpg`, `.jpeg`, `.png`, `.webp`)
  - `storage_temp` (float, optional): Current ambient temperature in °C (default: `22.0`).
  - `storage_humidity` (float, optional): Relative humidity % (default: `60.0`).
  - `batch_id` (string, optional): Inventory lot tracking identifier.
- **Response `200 OK`:**
  ```json
  {
    "filename": "apple_sample_01.jpg",
    "classification": {
      "class": "freshapples",
      "commodity": "apple",
      "status": "fresh",
      "confidence": 0.965
    },
    "visual_analysis": {
      "quality_score": 92.4,
      "browning_area_pct": 2.1,
      "texture_roughness": 14.8,
      "color_uniformity": 88.5
    },
    "shelf_life": {
      "estimated_days": 18.5,
      "base_optimal_days": 30.0,
      "degradation_multiplier": 1.42,
      "chilling_injury_risk": false,
      "optimal_temp_c": 3.0,
      "optimal_humidity_pct": 90.0,
      "recommendation": "Maintain cold storage (0-4°C) to prevent ethylene-induced softening."
    },
    "timestamp": "2026-10-06T18:30:00.000000Z"
  }
  ```

---

## 4. Storage Monitoring & Climate Automation

### `GET /storage/zones`
- **Description:** Lists all active warehouse zones, sensor readings, and compliance status.
- **Response `200 OK`:**
  ```json
  {
    "zones": [
      {
        "zone_id": "zone_a",
        "name": "Zone A - Cold Storage",
        "temperature_c": 3.2,
        "humidity_pct": 89.0,
        "setpoint_temp": 3.0,
        "setpoint_humidity": 90.0,
        "status": "optimal",
        "cooling_active": false
      }
    ]
  }
  ```

### `POST /storage/workflow`
- **Description:** Triggers automated climate mitigation workflows (e.g., emergency cooling boost).
- **Request Body:**
  ```json
  {
    "zone_id": "zone_a",
    "action": "cooling_boost",
    "duration_minutes": 45
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "status": "executed",
    "zone_id": "zone_a",
    "action": "cooling_boost",
    "target_temperature_c": 2.5,
    "timestamp": "2026-10-06T18:30:00.000000Z"
  }
  ```

---

## 5. Inventory Insights & Recommendations

### `GET /inventory/insights`
- **Description:** Summarizes inventory risk breakdown, active SKU counts, and expiring produce alerts.
- **Response `200 OK`:**
  ```json
  {
    "total_batches": 48,
    "fresh_batches": 39,
    "at_risk_batches": 7,
    "critical_batches": 2,
    "spoilage_rate_pct": 4.16,
    "expiring_within_48h": 5
  }
  ```

### `GET /recommendations/inventory`
- **Description:** Prescriptive action engine generating prioritized disposal, clearance sales, and cold storage shifts.
- **Response `200 OK`:**
  ```json
  {
    "recommendations": [
      {
        "id": "rec-101",
        "batch_id": "LOT-8821",
        "commodity": "banana",
        "action_type": "markdown_sale",
        "urgency": "high",
        "message": "Lot LOT-8821 estimated shelf-life < 2 days. Initiate 40% discount clearance.",
        "projected_salvage_value": 340.00
      }
    ]
  }
  ```

---

## 6. Executive Analytics & Audit Reports

### `GET /analytics/executive-summary`
- **Description:** Aggregates portfolio-level financial valuations, prevented waste metrics, and cold chain SLAs.
- **Query Parameters:**
  - `time_range` (string, optional, default: `"30d"`): `"7d"`, `"30d"`, or `"qtd"`.
- **Response `200 OK`:**
  ```json
  {
    "total_asset_value": 142500.0,
    "prevented_loss_value": 28450.0,
    "carbon_avoided_kg": 4120.5,
    "cold_chain_sla_compliance": 96.8,
    "active_batches_monitored": 58,
    "at_risk_capital": 3950.0,
    "time_range": "30d",
    "timestamp": "2026-10-06T18:30:00.000000Z"
  }
  ```

### `GET /analytics/trends`
- **Description:** Time-series trajectory data comparing baseline quality deterioration vs. smart preservation, along with waste savings.
- **Query Parameters:**
  - `time_range` (string, optional, default: `"30d"`): `"7d"`, `"30d"`, or `"qtd"`.
- **Response `200 OK`:**
  ```json
  {
    "time_range": "30d",
    "points": [
      {
        "period": "Week 1",
        "baseline_quality": 88.0,
        "smart_preserved_quality": 94.5,
        "prevented_waste_kg": 240.0,
        "salvage_value": 1850.0
      }
    ]
  }
  ```

### `GET /analytics/reports/executive`
- **Description:** Issues digital HACCP & ISO 22000 compliance certificate and batch freshness inspection ledger.
- **Response `200 OK`:**
  ```json
  {
    "compliance_certificate": {
      "certificate_id": "CERT-2026-HACCP-4921",
      "standard": "ISO 22000 / HACCP Food Safety Code",
      "status": "Compliant",
      "compliance_score": 97.4,
      "audit_grade": "A+",
      "issued_at": "2026-10-06T18:30:00.000000Z"
    },
    "batch_ledger": [
      {
        "batch_id": "LOT-9901",
        "commodity": "Apple",
        "quality_score": 94.2,
        "shelf_life_days": 21.0,
        "haccp_compliant": true,
        "status": "Fresh"
      }
    ],
    "timestamp": "2026-10-06T18:30:00.000000Z"
  }
  ```

### `GET /analytics/reports/export`
- **Description:** Generates structured file downloads of audit inspection logs.
- **Query Parameters:**
  - `format` (string, required): `"csv"` or `"json"`.
- **Response Headers:** `Content-Disposition: attachment; filename=freshness_audit_report.<ext>`
- **Response Content:** CSV text table or formatted JSON array.
