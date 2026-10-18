# ============================================================
# FreshCheck AI - Backend Production Dockerfile
# ============================================================
FROM python:3.12-slim AS builder

WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Final production stage
FROM python:3.12-slim AS runner

WORKDIR /app

# Install curl for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy python dependencies from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copy backend application
COPY backend/app ./app
COPY backend/sync_to_atlas.py ./

# Create directory for uploads
RUN mkdir -p uploads ml/models ml/data

# Copy pre-trained ML model and class mapping from repository
COPY ml/models/food_freshness_model.keras ./ml/models/
COPY ml/data/class_mapping.csv ./ml/data/

ENV MODEL_PATH=/app/ml/models/food_freshness_model.keras \
    CLASS_MAPPING_PATH=/app/ml/data/class_mapping.csv \
    UPLOAD_DIR=/app/uploads \
    PORT=8000

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
