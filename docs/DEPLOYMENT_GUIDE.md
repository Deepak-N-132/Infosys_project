# Deployment & Cloud Operations Guide

**AI-Powered Food Freshness Monitoring Platform**

---

## 1. Prerequisites

- **Docker:** Engine 24.0+ and Docker Compose v2.20+
- **Host Specifications (Minimum):** 2 CPU cores, 4 GB RAM, 20 GB Disk
- **Host Specifications (Recommended for Deep Learning):** 4 CPU cores, 8 GB RAM, NVIDIA GPU support (optional for accelerated inference)
- **Networking:** Inbound HTTP port 80 (or port 5173/8000 for direct port access)

---

## 2. Environment Configuration

1. Create the runtime `.env` file at the root of the repository:
   ```bash
   cp .env.example .env
   ```
2. Configure mandatory production variables:
   ```env
   # Application Security
   SECRET_KEY=change_this_to_a_cryptographically_secure_random_string_in_production
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ENVIRONMENT=production

   # Database Configuration
   # Option A: Remote MongoDB Atlas Cluster
   MONGO_DETAILS=mongodb+srv://<user>:<password>@cluster0.example.mongodb.net/food_freshness?retryWrites=true&w=majority

   # Option B: Local Docker-Compose MongoDB Service
   # MONGO_DETAILS=mongodb://db:27017/food_freshness

   # API Base URL for Frontend Build
   VITE_API_URL=http://localhost:8000
   ```

---

## 3. Local & On-Premises Deployment with Docker Compose

The simplest and most resilient way to run the entire stack is via `docker-compose.yml`.

### Step 1: Build & Launch Services
```bash
docker compose up --build -d
```

### Step 2: Verify Running Services
```bash
docker compose ps
```
Expected output:
| Name | Image | Status | Ports |
| :--- | :--- | :--- | :--- |
| `food-freshness-db` | `mongo:7.0` | Up (healthy) | `127.0.0.1:27017->27017/tcp` |
| `food-freshness-backend` | `info_project-backend` | Up (healthy) | `0.0.0.0:8000->8000/tcp` |
| `food-freshness-frontend` | `info_project-frontend` | Up (healthy) | `0.0.0.0:80->80/tcp`, `0.0.0.0:5173->80/tcp` |

### Step 3: Access Application Interfaces
- **Web Application Dashboard:** `http://localhost` (or `http://localhost:5173`)
- **FastAPI OpenAPI Swagger UI:** `http://localhost:8000/docs`
- **Health Check Endpoint:** `http://localhost:8000/health`

### Step 4: Graceful Shutdown
```bash
docker compose down
```
To also purge persistent database volumes:
```bash
docker compose down -v
```

---

## 4. Cloud Deployment Blueprints

### Blueprint A: AWS ECS / Fargate (Serverless Containers)
1. **Container Registry:** Push images to AWS Elastic Container Registry (ECR):
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com
   docker tag info_project-backend:latest <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/freshness-backend:latest
   docker push <aws_account_id>.dkr.ecr.us-east-1.amazonaws.com/freshness-backend:latest
   ```
2. **Task Definition:** Define a multi-container task with `freshness-backend` (port 8000) and `freshness-frontend` (port 80).
3. **Application Load Balancer (ALB):** Point target group to port 80 with path `/health` routed to port 8000 for backend liveness checks.
4. **Database:** Provision MongoDB Atlas on AWS with VPC Peering or AWS DocumentDB.

### Blueprint B: Render / Railway / PaaS
1. **Backend Service:**
   - Source: Repository root with Dockerfile located at `backend/Dockerfile`.
   - Environment variables: `MONGO_DETAILS`, `SECRET_KEY`, `ENVIRONMENT=production`.
   - Health check path: `/health`.
2. **Frontend Service:**
   - Source: Repository root with Dockerfile located at `frontend/Dockerfile`.
   - Build environment variables: `VITE_API_URL=https://<your-backend-render-subdomain>.onrender.com`.

### Blueprint C: DigitalOcean App Platform / Kubernetes
- Deploy using the provided `docker-compose.yml` or translate into Kubernetes manifests (`Deployment`, `Service`, `Ingress`).
- Attach an Ingress Controller with Let's Encrypt TLS termination for automated HTTPS certification.

---

## 5. Security & Hardening Checklist

- [x] Multi-stage Docker builds discard build dependencies and compilers from final production images.
- [x] Application processes run under non-privileged users (`appuser:10001` in backend; `nginx` unprivileged worker in frontend).
- [x] CORS origins restricted to production domain in `backend/app/main.py`.
- [x] Environment files (`.env`) excluded from source control via `.gitignore` and `.dockerignore`.
- [x] Automated container health checks configured on all operational containers.
