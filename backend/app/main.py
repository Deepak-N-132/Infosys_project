from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status, Response, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

import os
import time
import shutil
import secrets
import smtplib
from pathlib import Path
from uuid import uuid4
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import pandas as pd
import tensorflow as tf

from .database import (
    Prediction,
    User,
    Inventory,
    OTPRecord,
    SpoilageAlert,
    StorageSettings,
    get_db_info,
    init_indexes
)
from .image_analyzer import (
    analyze_image_features,
    compute_food_quality_score,
    evaluate_spoilage_risk,
    get_workflow_pipeline_metadata
)
from .shelf_life_engine import (
    calculate_dynamic_shelf_life,
    get_produce_profile
)
from .storage_monitoring import (
    get_all_storage_zones_telemetry,
    update_zone_telemetry,
    execute_storage_workflow,
    get_workflow_audit_history
)
from .recommendation_engine import (
    generate_comprehensive_recommendations
)
from .inventory_insights import (
    compute_inventory_insights
)
from .executive_analytics import (
    compute_executive_summary,
    generate_analytics_trend_data,
    generate_executive_compliance_report
)
from .storage_chatbot import (
    query_storage_advisor,
    is_gemini_configured,
    get_gemini_api_key,
    save_gemini_api_key,
    test_gemini_api_key,
    detect_food_item
)

# ============================================================
# CONFIG
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # backend/
PROJECT_DIR = os.path.dirname(BASE_DIR)                                 # project root
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(PROJECT_DIR, ".env"))

MODEL_PATH = os.getenv(
    "MODEL_PATH",
    os.path.join(PROJECT_DIR, "ml", "models", "food_freshness_model.keras"),
)
DATA_PATH = os.getenv(
    "CLASS_MAPPING_PATH",
    os.path.join(PROJECT_DIR, "ml", "data", "class_mapping.csv"),
)
UPLOAD_DIR = os.getenv("UPLOAD_DIR", os.path.join(BASE_DIR, "uploads"))

IMG_SIZE = (224, 224)


# ============================================================
# AUTHENTICATION CONFIG & UTILS
# ============================================================

SECRET_KEY = (os.getenv("SECRET_KEY") or "").strip()
if not SECRET_KEY or SECRET_KEY.startswith("<"):
    print("[SECURITY-WARN] SECRET_KEY not configured or contains placeholder. Using secure development fallback key.")
    SECRET_KEY = "dev-secret-key-freshcheck-ai-secure-random-token-32b"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str

class UserLogin(BaseModel):
    email: str
    password: str

class VerifyOTPRequest(BaseModel):
    email: str
    otp_code: str

class ResendOTPRequest(BaseModel):
    email: str

class InventoryCreate(BaseModel):
    name: str
    category: str
    qty: str
    status: str
    storage: str
    expiry: Optional[str] = "N/A"
    image: Optional[str] = None

class InventoryUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    qty: Optional[str] = None
    status: Optional[str] = None
    storage: Optional[str] = None
    expiry: Optional[str] = None

class StorageSettingsUpdate(BaseModel):
    fridge_temp: Optional[float] = None
    humidity: Optional[float] = None
    air_circulation: Optional[str] = None
    light_exposure: Optional[str] = None
    auto_alert_expiry_days: Optional[int] = None
    quarantine_temp: Optional[float] = None

class SpoilageActionRequest(BaseModel):
    action: str  # "quarantine", "dispose", "acknowledge"
    notes: Optional[str] = None

class ShelfLifeSimulationRequest(BaseModel):
    food_name: str
    freshness_label: str = "Fresh"
    quality_score: float = 85.0
    storage_temp_c: float = 4.0
    storage_rh_pct: float = 80.0
    ethylene_exposure_ppm: float = 0.05
    min_days_baseline: Optional[int] = None
    max_days_baseline: Optional[int] = None
    air_circulation: str = "Medium"
    light_exposure: str = "Low Light"
    packaging_type: str = "Breathable Film"
    storage_duration_days: float = 0.0

class StorageTelemetryUpdate(BaseModel):
    current_temp: Optional[float] = None
    current_rh: Optional[float] = None
    ethylene_ppm: Optional[float] = None
    co2_ppm: Optional[int] = None
    airflow_cfm: Optional[int] = None
    compressor_active: Optional[bool] = None
    air_scrubber_active: Optional[bool] = None

class StorageWorkflowTriggerRequest(BaseModel):
    zone_id: str
    action: str  # "COOLING_BOOST", "AIR_PURGE", "HUMIDITY_OPTIMIZE", "RESET_NORMAL"
    notes: Optional[str] = None


def format_iso_utc(dt: Optional[datetime]) -> Optional[str]:
    if not dt:
        return None
    if dt.tzinfo is None:
        return f"{dt.isoformat()}Z"
    return dt.isoformat()


class ChatAdvisorRequest(BaseModel):
    message: str
    food_item: Optional[str] = None
    food_name: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []


class SaveApiKeyRequest(BaseModel):
    api_key: Optional[str] = None
    gemini_api_key: Optional[str] = None


def send_otp_email(email: str, otp_code: str) -> bool:
    smtp_host = os.getenv("SMTP_HOST", "")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_pass = os.getenv("SMTP_PASSWORD", "")
    sender_email = os.getenv("SMTP_FROM", smtp_user or "noreply@freshcheck.ai")

    if not smtp_host or not smtp_user or not smtp_pass:
        print(f"[DEMO MODE] OTP for {email} is: {otp_code}")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your Login Verification OTP Code: {otp_code}"
        msg["From"] = sender_email
        msg["To"] = email

        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px; color: #333;">
            <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <h2 style="color: #10b981; margin-top: 0;">FreshCheck AI Login</h2>
              <p>Hello,</p>
              <p>You requested to log in to FreshCheck AI. Use the verification code below to complete your login:</p>
              <div style="text-align: center; margin: 25px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; background-color: #ecfdf5; color: #059669; padding: 12px 24px; border-radius: 6px; border: 1px dashed #10b981;">
                  {otp_code}
                </span>
              </div>
              <p style="font-size: 14px; color: #6b7280;">This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin-top: 25px;" />
              <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-bottom: 0;">&copy; FreshCheck AI. All rights reserved.</p>
            </div>
          </body>
        </html>
        """
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(sender_email, [email], msg.as_string())
        return True
    except Exception as e:
        print(f"Failed to send email to {email}: {e}")
        print(f"[DEMO FALLBACK] OTP for {email} is: {otp_code}")
        return False


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},


    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str | None = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = User.find_by_email(username)
    if user is None:
        raise credentials_exception
    return user


# ============================================================
# GLOBAL VARIABLES & LIFESPAN
# ============================================================

model = None
mapping = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    global mapping

    print("Loading AI food freshness model...")

    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )

    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Class mapping not found: {DATA_PATH}"
        )

    model = tf.keras.models.load_model(MODEL_PATH)  # type: ignore
    mapping = pd.read_csv(DATA_PATH)
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    print("Model loaded successfully.")
    print("Class mapping loaded successfully.")

    # Initialize MongoDB Indexes safely
    try:
        init_indexes()
    except Exception as e:
        print(f"Index initialization notice: {e}")

    yield


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="AI Food Freshness Detection API",
    description="Backend API for AI-based food freshness assessment",
    version="1.0.0",
    lifespan=lifespan
)


# ============================================================
# CORS
# ============================================================

ALLOWED_ORIGINS = [
    o.strip()
    for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost,http://127.0.0.1:5173,http://127.0.0.1,http://frontend:80").split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|.*\.onrender\.com)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROOT & STATUS ENDPOINTS
# ============================================================

@app.get("/")
def root():

    return {
        "message": "AI Food Freshness Detection API is running",
        "status": "success"
    }


# ============================================================
# HEALTH CHECK & DATABASE STATUS
# ============================================================

@app.get("/health")
def health_check():

    return {
        "status": "healthy",
        "service": "food-freshness-backend",
        "model_loaded": model is not None,
        "mapping_loaded": mapping is not None,
        "database": get_db_info()
    }


@app.get("/db-status")
def database_status():
    """Returns detailed real-time MongoDB status and document tallies."""
    return {
        "success": True,
        "db": get_db_info()
    }


# ============================================================
# FOOD FRESHNESS PREDICTION
# ============================================================

# ============================================================
# FOOD FRESHNESS PREDICTION
# ============================================================

@app.post("/predict")
async def predict_food(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):

    if model is None:
        raise HTTPException(
            status_code=500,
            detail="AI model is not loaded."
        )

    if mapping is None:
        raise HTTPException(
            status_code=500,
            detail="Class mapping is not loaded."
        )


    # --------------------------------------------------------
    # Validate image
    # --------------------------------------------------------

    allowed_types = [
        "image/jpeg",
        "image/jpg",
        "image/png"
    ]

    if file.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail="Please upload a JPG, JPEG or PNG image."
        )


    try:

        # ----------------------------------------------------
        # Save uploaded image
        # ----------------------------------------------------

        original_filename = file.filename or "uploaded_food.jpg"
        extension = Path(original_filename).suffix.lower()
        if extension not in {".jpg", ".jpeg", ".png"}:
            raise HTTPException(
                status_code=400,
                detail="Please upload a JPG, JPEG or PNG image."
            )

        # Never use client-controlled path components for filesystem writes.
        safe_filename = f"{uuid4().hex}{extension}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        with open(file_path, "wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )


        # ----------------------------------------------------
        # PREPROCESS IMAGE
        #
        # EXACTLY MATCHES src\predict.py
        # ----------------------------------------------------

        image = tf.io.read_file(
            file_path
        )

        image = tf.image.decode_image(
            image,
            channels=3,
            expand_animations=False
        )

        image.set_shape(  # type: ignore
            [None, None, 3]
        )

        image = tf.image.resize(
            image,
            IMG_SIZE
        )

        image = tf.cast(
            image,
            tf.float32
        )

        image = tf.keras.applications.mobilenet_v2.preprocess_input(  # type: ignore
            image
        )

        image = tf.expand_dims(
            image,
            axis=0
        )


        # ----------------------------------------------------
        # MODEL PREDICTION
        # ----------------------------------------------------

        predictions = model.predict(
            image,
            verbose=0
        )

        class_id = int(
            tf.argmax(
                predictions[0]
            )
        )

        confidence = float(
            predictions[0][class_id]
        ) * 100


        # ----------------------------------------------------
        # CLASS MAPPING
        # ----------------------------------------------------

        result = mapping[
            mapping["class_id"] == class_id
        ]

        if len(result) == 0:

            raise HTTPException(
                status_code=500,
                detail=f"Class mapping not found for class ID {class_id}"
            )

        result = result.iloc[0]


        food = result["food"]
        freshness = result["freshness"]

        min_days = int(
            result["min_days"]
        )

        max_days = int(
            result["max_days"]
        )

        # ----------------------------------------------------
        # IMAGE ANALYSIS & FEATURE EXTRACTION (MILESTONE 2)
        # ----------------------------------------------------
        visual_features = analyze_image_features(file_path)

        # ----------------------------------------------------
        # FOOD QUALITY SCORING (MILESTONE 2)
        # ----------------------------------------------------
        quality_assessment = compute_food_quality_score(
            freshness_label=str(freshness),
            confidence=round(confidence, 2),
            surface_integrity=visual_features["surface_integrity"],
            browning_ratio=visual_features["browning_ratio"],
            min_days=min_days,
            max_days=max_days
        )

        # ----------------------------------------------------
        # SPOILAGE DETECTION & RISK EVALUATION (MILESTONE 2)
        # ----------------------------------------------------
        spoilage_assessment = evaluate_spoilage_risk(
            freshness_label=str(freshness),
            confidence=round(confidence, 2),
            browning_ratio=visual_features["browning_ratio"],
            min_days=min_days,
            max_days=max_days
        )

        # ----------------------------------------------------
        # SHELF-LIFE PREDICTION & KINETIC MODELING (MILESTONE 3)
        # ----------------------------------------------------
        user_storage = StorageSettings.get_for_user(current_user.id or "")
        shelf_life_eval = calculate_dynamic_shelf_life(
            food_name=str(food),
            freshness_label=str(freshness),
            quality_score=quality_assessment["quality_score"],
            storage_temp_c=user_storage.fridge_temp,
            storage_rh_pct=user_storage.humidity,
            ethylene_exposure_ppm=0.04,
            min_days_baseline=min_days,
            max_days_baseline=max_days,
            air_circulation=user_storage.air_circulation,
            light_exposure=user_storage.light_exposure
        )

        # ----------------------------------------------------
        # SAVE PREDICTION TO DATABASE
        # ----------------------------------------------------
        prediction_doc = Prediction.create(
            user_id=current_user.id or "",
            filename=safe_filename,
            food=str(food),
            freshness=str(freshness),
            days=f"{min_days}-{max_days}",
            min_days=min_days,
            max_days=max_days,
            confidence=round(confidence, 2),
            class_id=class_id,
            quality_score=quality_assessment["quality_score"],
            grade=quality_assessment["grade"],
            spoilage_risk=spoilage_assessment["severity"],
            spoilage_risk_pct=spoilage_assessment["spoilage_risk_percent"],
            browning_ratio=visual_features["browning_ratio"],
            surface_integrity=visual_features["surface_integrity"],
            color_distribution=visual_features["color_distribution"],
            storage_recommendations=quality_assessment["storage_recommendations"],
            shelf_life_prediction=shelf_life_eval
        )

        # Log active hazard alert directly into MongoDB if risk is Critical or produce is Rotten
        if spoilage_assessment["severity"] in ["Critical", "High"] or str(freshness).lower() in ["rotten", "spoiled"]:
            try:
                SpoilageAlert.create_or_update(
                    user_id=current_user.id or "",
                    source="Scanner Diagnostic",
                    source_id=f"scan-{prediction_doc.id}",
                    title=str(food),
                    category="Produce Scan",
                    qty="1 batch",
                    status=str(freshness),
                    storage="Incoming Inspection",
                    days_left=0,
                    severity=spoilage_assessment["severity"],
                    action_required=spoilage_assessment["action_directive"]
                )
            except Exception as alert_err:
                print(f"Warning: Failed to log spoilage alert in MongoDB: {alert_err}")

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------
        return {
            "success": True,
            "id": prediction_doc.id,
            "food": str(food),
            "freshness": str(freshness),
            "days": f"{min_days}-{max_days}",
            "min_days": min_days,
            "max_days": max_days,
            "confidence": round(confidence, 2),
            "class_id": class_id,
            "filename": original_filename,
            "quality_score": quality_assessment["quality_score"],
            "grade": quality_assessment["grade"],
            "grade_description": quality_assessment["grade_description"],
            "quality_components": quality_assessment["components"],
            "spoilage_risk": spoilage_assessment["severity"],
            "spoilage_risk_percent": spoilage_assessment["spoilage_risk_percent"],
            "spoilage_action": spoilage_assessment["action_directive"],
            "cross_contamination_risk": spoilage_assessment["cross_contamination_risk"],
            "visual_features": visual_features,
            "weighted_scoring_model": quality_assessment.get("weighted_scoring_model"),
            "storage_recommendations": quality_assessment["storage_recommendations"],
            "shelf_life_prediction": shelf_life_eval,
            "workflow_stages": get_workflow_pipeline_metadata()
        }


    except HTTPException:

        raise


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )

# ============================================================
# PREDICTION HISTORY
# ============================================================

@app.get("/history")
def get_prediction_history(
    current_user: User = Depends(get_current_user)
):

    try:
        records = Prediction.find_by_user(current_user.id or "")

        return {
            "success": True,
            "count": len(records),
            "history": [
                {
                    "id": record.id,
                    "filename": record.filename,
                    "food": record.food,
                    "freshness": record.freshness,
                    "days": record.days,
                    "min_days": record.min_days,
                    "max_days": record.max_days,
                    "confidence": record.confidence,
                    "class_id": record.class_id,
                    "quality_score": getattr(record, "quality_score", 0.0),
                    "grade": getattr(record, "grade", "N/A"),
                    "spoilage_risk": getattr(record, "spoilage_risk", "N/A"),
                    "spoilage_risk_pct": getattr(record, "spoilage_risk_pct", 0.0),
                    "browning_ratio": getattr(record, "browning_ratio", 0.0),
                    "surface_integrity": getattr(record, "surface_integrity", 100.0),
                    "storage_recommendations": getattr(record, "storage_recommendations", {}),
                    "shelf_life_prediction": getattr(record, "shelf_life_prediction", {}),
                    "color_distribution": getattr(record, "color_distribution", {}),
                    "created_at": format_iso_utc(record.created_at)
                }
                for record in records
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch history: {str(e)}"
        )


@app.delete("/history/{prediction_id}")
def delete_prediction_record(
    prediction_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        success = Prediction.delete(prediction_id, user_id=current_user.id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Prediction record not found or unauthorized"
            )
        return {
            "success": True,
            "message": "Scan prediction record deleted successfully",
            "id": prediction_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete history record: {str(e)}"
        )


@app.delete("/history")
def clear_all_prediction_history(
    current_user: User = Depends(get_current_user)
):
    try:
        deleted_count = Prediction.clear_for_user(current_user.id or "")
        return {
            "success": True,
            "message": f"Cleared {deleted_count} scan prediction records",
            "deleted_count": deleted_count
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear history: {str(e)}"
        )


# ============================================================
# FRESHNESS AUDIT REPORT GENERATION (MILESTONE 2)
# ============================================================

@app.get("/report/{prediction_id}")
def generate_freshness_report(
    prediction_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        record = Prediction.find_by_id(prediction_id)
        if not record:
            raise HTTPException(status_code=404, detail="Prediction record not found.")

        return {
            "success": True,
            "report_id": f"REP-{str(record.id)[-6:].upper()}",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "inspector": {
                "name": current_user.name,
                "role": current_user.role,
                "email": current_user.email
            },
            "item_summary": {
                "id": record.id,
                "food": record.food,
                "freshness": record.freshness,
                "quality_score": getattr(record, "quality_score", 0.0),
                "grade": getattr(record, "grade", "N/A"),
                "confidence": record.confidence,
                "shelf_life_days": record.days,
                "filename": record.filename
            },
            "spoilage_analysis": {
                "risk_level": getattr(record, "spoilage_risk", "Low"),
                "risk_percent": getattr(record, "spoilage_risk_pct", 0.0),
                "browning_ratio": getattr(record, "browning_ratio", 0.0),
                "surface_integrity": getattr(record, "surface_integrity", 100.0)
            },
            "visual_metrics": getattr(record, "color_distribution", {}),
            "storage_directives": getattr(record, "storage_recommendations", {}),
            "shelf_life_analysis": getattr(record, "shelf_life_prediction", {}),
            "workflow_audit_log": get_workflow_pipeline_metadata()
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )


# ============================================================
# SPOILAGE ALERTS DASHBOARD (MILESTONE 2)
# ============================================================

ORGANIZATIONAL_ROLES = {
    "Administrator", "Admin", "Enterprise Manager",
    "Food Quality Inspector", "Warehouse Operator", "Retail Manager"
}

@app.get("/spoilage-alerts")
def get_spoilage_alerts(
    current_user: User = Depends(get_current_user)
):
    try:
        is_elevated = getattr(current_user, "role", "Consumer") in ORGANIZATIONAL_ROLES
        # Synchronizes live hazards into MongoDB collection and returns active alerts
        alerts = SpoilageAlert.sync_for_user(current_user.id or "", is_all=is_elevated)
        active_inventory = Inventory.find_all() if is_elevated else Inventory.find_by_user(current_user.id or "")

        formatted_alerts = [
            {
                "id": str(a.id),
                "source": a.source,
                "source_id": a.source_id,
                "title": a.title,
                "category": a.category,
                "qty": a.qty,
                "status": a.status,
                "storage": a.storage,
                "days_left": a.days_left,
                "severity": a.severity,
                "action_required": a.action_required,
                "status_state": a.status_state,
                "notes": a.notes,
                "created_at": a.created_at.isoformat() if a.created_at else None,
                "updated_at": a.updated_at.isoformat() if a.updated_at else None
            }
            for a in alerts
        ]

        return {
            "success": True,
            "total_alerts": len(formatted_alerts),
            "critical_count": sum(1 for a in formatted_alerts if a["severity"] == "Critical" and a["status_state"] == "Active"),
            "high_count": sum(1 for a in formatted_alerts if a["severity"] == "High" and a["status_state"] == "Active"),
            "quarantined_count": sum(1 for a in formatted_alerts if a["status_state"] == "Quarantined"),
            "active_batches_count": len(active_inventory),
            "alerts": formatted_alerts
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch spoilage alerts: {str(e)}"
        )


@app.post("/spoilage-alerts/{alert_id}/action")
def take_spoilage_action(
    alert_id: str,
    action_req: SpoilageActionRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        alert = SpoilageAlert.find_by_id(alert_id)
        is_elevated = getattr(current_user, "role", "Consumer") in ORGANIZATIONAL_ROLES
        if not alert or (alert.user_id != current_user.id and not is_elevated):
            raise HTTPException(status_code=404, detail="Spoilage alert record not found")

        action = action_req.action.lower()
        notes = action_req.notes or f"Action '{action}' executed by {current_user.name}"

        if action == "quarantine":
            SpoilageAlert.update_action(alert_id, "Quarantined", notes=notes)
            if alert.source_id and alert.source_id.startswith("inv-"):
                inv_id = alert.source_id.replace("inv-", "")
                Inventory.update_status(inv_id, new_status="Quarantined", new_storage="Quarantine Zone (Cold-Chain 2°C)")
            msg = f"Produce batch '{alert.title}' placed into isolated Quarantine"

        elif action == "dispose":
            SpoilageAlert.update_action(alert_id, "Disposed", notes=notes)
            if alert.source_id and alert.source_id.startswith("inv-"):
                inv_id = alert.source_id.replace("inv-", "")
                Inventory.update_status(inv_id, new_status="Disposed (Written Off)", new_storage="Disposed")
            msg = f"Produce batch '{alert.title}' marked as Disposed/Written-off"

        elif action == "acknowledge":
            SpoilageAlert.update_action(alert_id, "Acknowledged", notes=notes)
            msg = f"Spoilage warning for '{alert.title}' marked as Acknowledged"

        else:
            raise HTTPException(status_code=400, detail="Invalid action type. Expected 'quarantine', 'dispose', or 'acknowledge'.")

        return {
            "success": True,
            "message": msg,
            "alert_id": alert_id,
            "action": action
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to execute spoilage action: {str(e)}"
        )


# ============================================================
# INVENTORY MANAGEMENT
# ============================================================

@app.get("/inventory")
def get_inventory(current_user: User = Depends(get_current_user)):
    try:
        is_elevated = getattr(current_user, "role", "Consumer") in ORGANIZATIONAL_ROLES
        records = Inventory.find_all() if is_elevated else Inventory.find_by_user(current_user.id or "")
        return {
            "success": True,
            "count": len(records),
            "inventory": [
                {
                    "id": record.id,
                    "name": record.name,
                    "category": record.category,
                    "qty": record.qty,
                    "status": record.status,
                    "storage": record.storage,
                    "expiry": record.expiry,
                    "image": getattr(record, "image", None),
                    "created_at": format_iso_utc(record.created_at)
                }
                for record in records
            ]
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch inventory: {str(e)}"
        )

@app.post("/inventory")
def add_inventory_item(
    item_data: InventoryCreate,
    current_user: User = Depends(get_current_user)
):
    try:
        new_item = Inventory.create(
            user_id=current_user.id or "",
            name=item_data.name,
            category=item_data.category,
            qty=item_data.qty,
            status=item_data.status,
            storage=item_data.storage,
            expiry=item_data.expiry or "N/A",
            image=item_data.image
        )
        return {
            "success": True,
            "message": "Inventory item added successfully",
            "item": {
                "id": new_item.id,
                "name": new_item.name,
                "category": new_item.category,
                "qty": new_item.qty,
                "status": new_item.status,
                "storage": new_item.storage,
                "expiry": new_item.expiry,
                "image": new_item.image
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to add inventory item: {str(e)}"
        )


@app.patch("/inventory/{item_id}")
def update_inventory_item(
    item_id: str,
    item_data: InventoryUpdate,
    current_user: User = Depends(get_current_user)
):
    try:
        updates = {k: v for k, v in item_data.model_dump().items() if v is not None}
        if not updates:
            raise HTTPException(status_code=400, detail="No fields provided for update.")

        is_elevated = getattr(current_user, "role", "Consumer") in ORGANIZATIONAL_ROLES
        success = Inventory.update_item(item_id, user_id=None if is_elevated else current_user.id, **updates)
        if not success:
            raise HTTPException(status_code=404, detail="Inventory item not found or unauthorized.")

        # Re-sync live hazard alerts if status or storage changed
        if "status" in updates or "storage" in updates:
            try:
                SpoilageAlert.sync_for_user(current_user.id or "", is_all=is_elevated)
            except Exception:
                pass

        updated = Inventory.find_by_id(item_id)
        return {
            "success": True,
            "message": "Inventory item updated successfully",
            "item": {
                "id": updated.id if updated else item_id,
                "name": updated.name if updated else "",
                "category": updated.category if updated else "",
                "qty": updated.qty if updated else "",
                "status": updated.status if updated else "",
                "storage": updated.storage if updated else "",
                "expiry": updated.expiry if updated else "",
                "image": getattr(updated, "image", None)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update inventory item: {str(e)}"
        )


@app.delete("/inventory/{item_id}")
def delete_inventory_item(
    item_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        is_elevated = getattr(current_user, "role", "Consumer") in ORGANIZATIONAL_ROLES
        success = Inventory.delete(item_id, user_id=None if is_elevated else current_user.id)
        if not success:
            raise HTTPException(
                status_code=404,
                detail="Inventory item not found or unauthorized"
            )
        return {
            "success": True,
            "message": "Inventory item deleted successfully",
            "id": item_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete inventory item: {str(e)}"
        )


@app.post("/inventory/{item_id}/record-sale")
def record_inventory_sale(
    item_id: str,
    sale_data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Retail Manager Action: Review stock risks, record sales, and update item status.
    """
    role = getattr(current_user, "role", "")
    if role not in ["Retail Manager", "Administrator", "Enterprise Manager"]:
        raise HTTPException(
            status_code=403,
            detail="Recording sales is restricted to Retail Managers and Administrators."
        )
    try:
        item = Inventory.find_by_id(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Inventory item not found.")

        sold_qty = sale_data.get("sold_qty", item.qty or "1")
        sale_price = sale_data.get("sale_price", 0.0)
        markdown_pct = sale_data.get("markdown_pct", 0)
        new_status = sale_data.get("new_status", "Sold")

        Inventory.update_status(item_id, new_status)
        return {
            "success": True,
            "message": f"Sale recorded successfully for {item.name} ({new_status})",
            "transaction": {
                "item_id": item_id,
                "item_name": item.name,
                "sold_qty": sold_qty,
                "sale_price": sale_price,
                "markdown_pct": markdown_pct,
                "status": new_status,
                "recorded_by": current_user.name
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record sale: {str(e)}")


@app.patch("/inventory/{item_id}/status")
def update_inventory_status(
    item_id: str,
    status_data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Retail Manager & Warehouse Operator Action: Update produce status
    (Fresh, Semi-Fresh, Markdown, Quarantined, Disposed, Sold) and storage location.
    """
    new_status = status_data.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="New status must be provided.")
    new_storage = status_data.get("storage")

    success = Inventory.update_status(item_id, new_status, new_storage=new_storage)
    if not success:
        raise HTTPException(status_code=404, detail="Failed to update inventory status.")

    try:
        SpoilageAlert.sync_for_user(current_user.id or "")
    except Exception:
        pass

    return {
        "success": True,
        "message": f"Item status updated to '{new_status}'",
        "item_id": item_id,
        "new_status": new_status,
        "new_storage": new_storage
    }


# ============================================================
# ADMINISTRATOR: USER MANAGEMENT (MILESTONE 4)
# ============================================================

@app.get("/admin/users")
def get_admin_users(
    current_user: User = Depends(get_current_user)
):
    """
    Administrator Action: Manage platform users and review user roles.
    """
    if getattr(current_user, "role", "") not in {"Administrator", "Admin", "Enterprise Manager"}:
        raise HTTPException(
            status_code=403,
            detail="User management is restricted to Administrators."
        )
    try:
        users = User.find_all()
        return {
            "success": True,
            "total_users": len(users),
            "users": [
                {
                    "id": str(u.id),
                    "name": u.name,
                    "email": u.email,
                    "role": u.role,
                    "created_at": format_iso_utc(u.created_at)
                }
                for u in users
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve platform users: {str(e)}")


@app.patch("/admin/users/{user_id}/role")
def update_user_role(
    user_id: str,
    role_payload: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Administrator Action: Update user role permissions.
    """
    if getattr(current_user, "role", "") not in {"Administrator", "Admin", "Enterprise Manager"}:
        raise HTTPException(
            status_code=403,
            detail="User role administration is restricted to Administrators."
        )
    new_role = role_payload.get("role")
    valid_roles = ["Consumer", "Retail Manager", "Warehouse Operator", "Food Quality Inspector", "Administrator", "Enterprise Manager"]
    if not new_role or new_role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of {valid_roles}")

    success = User.update_role(user_id, new_role)
    if not success:
        raise HTTPException(status_code=404, detail="User not found or role update failed.")

    return {
        "success": True,
        "message": f"User role updated to '{new_role}' successfully.",
        "user_id": user_id,
        "new_role": new_role
    }


# ============================================================
# STORAGE COMPLIANCE & ENVIRONMENTAL SETTINGS
# ============================================================

@app.get("/settings/storage")
def get_storage_settings(current_user: User = Depends(get_current_user)):
    try:
        settings = StorageSettings.get_for_user(current_user.id or "")
        return {
            "success": True,
            "settings": settings.to_dict()
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch storage settings: {str(e)}"
        )


@app.post("/settings/storage")
def update_storage_settings(
    settings_data: StorageSettingsUpdate,
    current_user: User = Depends(get_current_user)
):
    try:
        updates = {k: v for k, v in settings_data.model_dump().items() if v is not None}
        settings = StorageSettings.update_for_user(current_user.id or "", updates)
        return {
            "success": True,
            "message": "Cold-chain storage parameters saved successfully",
            "settings": settings.to_dict()
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save storage parameters: {str(e)}"
        )


# ============================================================
# SHELF-LIFE PREDICTION & KINETIC MODELING (MILESTONE 3)
# ============================================================

@app.post("/shelf-life/simulate")
def simulate_shelf_life(
    sim_data: ShelfLifeSimulationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Computes dynamic shelf-life decay using Arrhenius kinetics and Q10 modeling
    under user-defined storage temperature, humidity, and ethylene exposure.
    """
    try:
        user_role = getattr(current_user, "role", "Consumer")
        is_operator = user_role in ["Warehouse Operator", "Administrator", "Enterprise Manager", "Retail Manager"]
        eval_result = calculate_dynamic_shelf_life(
            food_name=sim_data.food_name,
            freshness_label=sim_data.freshness_label,
            quality_score=sim_data.quality_score,
            storage_temp_c=sim_data.storage_temp_c,
            storage_rh_pct=sim_data.storage_rh_pct,
            ethylene_exposure_ppm=sim_data.ethylene_exposure_ppm,
            min_days_baseline=sim_data.min_days_baseline,
            max_days_baseline=sim_data.max_days_baseline,
            air_circulation=sim_data.air_circulation,
            light_exposure=sim_data.light_exposure,
            packaging_type=sim_data.packaging_type,
            storage_duration_days=sim_data.storage_duration_days
        )
        return {
            "success": True,
            "food_name": sim_data.food_name,
            "simulation": eval_result,
            "role_mode": "operator_active" if is_operator else "consumer_calibrated",
            "operator_authorized": is_operator
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Shelf-life simulation failed: {str(e)}"
        )


@app.get("/shelf-life/profile/{food_name}")
def get_produce_shelf_life_profile(
    food_name: str,
    current_user: User = Depends(get_current_user)
):
    """Returns biological storage profile, optimal parameters, and sensitivity for a food item."""
    try:
        profile = get_produce_profile(food_name)
        return {
            "success": True,
            "profile": profile
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# STORAGE MONITORING WORKFLOWS (MILESTONE 3)
# ============================================================

@app.get("/storage/zones")
def get_storage_zones_status(
    current_user: User = Depends(get_current_user)
):
    """Returns real-time environmental telemetry, excursions, and compliance status for all 5 zones."""
    try:
        zones = get_all_storage_zones_telemetry()
        # Count inventory items mapped to each zone
        user_inventory = Inventory.find_by_user(current_user.id or "")
        zone_item_counts = {}
        for item in user_inventory:
            st = (item.storage or "").lower()
            if "chill" in st or "refrig" in st or "zone a" in st:
                zone_item_counts["zone_chiller"] = zone_item_counts.get("zone_chiller", 0) + 1
            elif "pantry" in st or "cellar" in st or "zone b" in st:
                zone_item_counts["zone_pantry"] = zone_item_counts.get("zone_pantry", 0) + 1
            elif "freez" in st or "zone d" in st:
                zone_item_counts["zone_freezer"] = zone_item_counts.get("zone_freezer", 0) + 1
            elif "quarant" in st or "zone e" in st:
                zone_item_counts["zone_quarantine"] = zone_item_counts.get("zone_quarantine", 0) + 1
            else:
                zone_item_counts["zone_ambient"] = zone_item_counts.get("zone_ambient", 0) + 1

        for z in zones:
            z["active_items_count"] = zone_item_counts.get(z["zone_id"], 0)

        return {
            "success": True,
            "total_zones": len(zones),
            "zones": zones
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch storage zones: {str(e)}")


@app.post("/storage/zones/{zone_id}/telemetry")
def update_zone_sensor_readings(
    zone_id: str,
    telemetry_data: StorageTelemetryUpdate,
    current_user: User = Depends(get_current_user)
):
    """Allows manual calibration or simulated sensor telemetry update for a zone (Operator only)."""
    if getattr(current_user, "role", "") == "Consumer":
        raise HTTPException(
            status_code=403,
            detail="Zone sensor calibration is restricted to Warehouse Operators and Administrators."
        )
    try:
        updates = {k: v for k, v in telemetry_data.model_dump().items() if v is not None}
        new_telem = update_zone_telemetry(zone_id, updates)
        return {
            "success": True,
            "zone_id": zone_id,
            "updated_telemetry": new_telem
        }
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update telemetry: {str(e)}")


@app.post("/storage/workflows/execute")
def trigger_storage_mitigation_workflow(
    wf_req: StorageWorkflowTriggerRequest,
    current_user: User = Depends(get_current_user)
):
    """Executes an environmental mitigation workflow (Cooling Boost, Air Purge, Humidity, Reset)."""
    if getattr(current_user, "role", "") == "Consumer":
        raise HTTPException(
            status_code=403,
            detail="Storage workflow execution is restricted to Warehouse Operators and Administrators."
        )
    try:
        res = execute_storage_workflow(
            zone_id=wf_req.zone_id,
            workflow_action=wf_req.action,
            user_name=current_user.name
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to execute storage workflow: {str(e)}")


@app.get("/storage/workflows/audit")
def get_storage_workflow_audit_log(
    current_user: User = Depends(get_current_user)
):
    """Returns persistent audit log of automated and manual storage workflow executions."""
    try:
        logs = get_workflow_audit_history()
        return {
            "success": True,
            "total_records": len(logs),
            "audit_logs": logs
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch audit log: {str(e)}")


# ============================================================
# RECOMMENDATION ENGINE WORKFLOWS (MILESTONE 3)
# ============================================================

@app.get("/recommendations/inventory")
def get_inventory_recommendations(
    current_user: User = Depends(get_current_user)
):
    """Generates complete FEFO priority queue, retail markdowns, culinary repurposing, and ethylene alerts."""
    try:
        is_elevated = getattr(current_user, "role", "Consumer") in ORGANIZATIONAL_ROLES
        raw_items = Inventory.find_all() if is_elevated else Inventory.find_by_user(current_user.id or "")
        dict_items = [
            {
                "id": str(i.id),
                "name": i.name,
                "category": i.category,
                "qty": i.qty,
                "status": i.status,
                "storage": i.storage,
                "expiry": i.expiry
            }
            for i in raw_items
        ]
        recs = generate_comprehensive_recommendations(dict_items)
        return recs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")


# ============================================================
# INVENTORY INSIGHTS & FRESHNESS ANALYTICS (MILESTONE 3)
# ============================================================

@app.get("/inventory/insights")
def get_inventory_freshness_insights(
    current_user: User = Depends(get_current_user)
):
    """Computes global inventory health score, waste risk exposure, financial impact, and category metrics."""
    try:
        is_elevated = getattr(current_user, "role", "Consumer") in ORGANIZATIONAL_ROLES
        raw_items = Inventory.find_all() if is_elevated else Inventory.find_by_user(current_user.id or "")
        dict_items = [
            {
                "id": str(i.id),
                "name": i.name,
                "category": i.category,
                "qty": i.qty,
                "status": i.status,
                "storage": i.storage,
                "expiry": i.expiry
            }
            for i in raw_items
        ]
        history_scans = Prediction.find_all() if is_elevated else Prediction.find_by_user(current_user.id or "")
        insights = compute_inventory_insights(dict_items, history_scans)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate inventory insights: {str(e)}")



# ============================================================
# EXECUTIVE ANALYTICS & AUDIT REPORTING (MILESTONE 4)
# ============================================================

@app.get("/analytics/executive-summary")
def get_executive_summary(
    time_range: str = Query("30d", pattern="^(7d|30d|qtd|all)$"),
    current_user: User = Depends(get_current_user)
):
    """Computes executive-level KPIs: protected capital value, CO2 offset, loss mitigation rate, and compliance."""
    try:
        is_admin = getattr(current_user, "role", "") in {"Administrator", "Admin", "Enterprise Manager"}
        raw_items = Inventory.find_all() if is_admin else Inventory.find_by_user(current_user.id or "")
        dict_items = [
            {
                "id": str(i.id),
                "name": i.name,
                "category": i.category,
                "qty": i.qty,
                "status": i.status,
                "storage": i.storage,
                "expiry": i.expiry,
                "created_at": getattr(i, "created_at", None)
            }
            for i in raw_items
        ]
        history_scans = Prediction.find_all() if is_admin else Prediction.find_by_user(current_user.id or "")
        summary = compute_executive_summary(dict_items, history_scans, time_range=time_range)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate executive summary: {str(e)}")


@app.get("/analytics/trends")
def get_analytics_trends(
    days: int = Query(14, ge=7, le=90),
    current_user: User = Depends(get_current_user)
):
    """Returns multi-day time-series trajectory of quality scores, compliance rates, and financial savings."""
    try:
        is_admin = getattr(current_user, "role", "") in {"Administrator", "Admin", "Enterprise Manager"}
        raw_items = Inventory.find_all() if is_admin else Inventory.find_by_user(current_user.id or "")
        dict_items = [
            {
                "id": str(i.id),
                "name": i.name,
                "category": i.category,
                "qty": i.qty,
                "status": i.status,
                "storage": i.storage,
                "expiry": i.expiry,
                "created_at": getattr(i, "created_at", None)
            }
            for i in raw_items
        ]
        history_scans = Prediction.find_all() if is_admin else Prediction.find_by_user(current_user.id or "")
        trends = generate_analytics_trend_data(days_back=days, scans=history_scans, inventory=dict_items)
        return {
            "success": True,
            "days_analyzed": days,
            "trends": trends
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics trends: {str(e)}")


@app.get("/analytics/reports/executive")
def get_executive_compliance_audit_report(
    current_user: User = Depends(get_current_user)
):
    """Generates formal ISO / HACCP-aligned digital audit compliance certificate and batch records."""
    try:
        is_admin = getattr(current_user, "role", "") in {"Administrator", "Admin", "Enterprise Manager", "Food Quality Inspector"}
        raw_items = Inventory.find_all() if is_admin else Inventory.find_by_user(current_user.id or "")
        history_scans = Prediction.find_all() if is_admin else Prediction.find_by_user(current_user.id or "")

        all_users = User.find_all()
        user_map = {str(u.id): {"name": u.name, "email": u.email, "role": u.role} for u in all_users if u.id}

        dict_items = []
        for i in raw_items:
            owner = user_map.get(str(getattr(i, "user_id", ""))) or {
                "name": current_user.name,
                "email": current_user.email,
                "role": current_user.role
            }
            dict_items.append({
                "id": str(i.id),
                "name": i.name,
                "category": i.category,
                "qty": i.qty,
                "status": i.status,
                "storage": i.storage,
                "expiry": i.expiry,
                "created_at": getattr(i, "created_at", None),
                "user_name": owner.get("name") or current_user.name,
                "user_email": owner.get("email") or current_user.email,
                "role": owner.get("role") or current_user.role,
            })

        dict_scans = []
        for s in history_scans:
            owner = user_map.get(str(getattr(s, "user_id", ""))) or {
                "name": current_user.name,
                "email": current_user.email,
                "role": current_user.role
            }
            dict_scans.append({
                "id": str(s.id),
                "food": s.food,
                "freshness": s.freshness,
                "days": s.days,
                "confidence": s.confidence,
                "quality_score": getattr(s, "quality_score", 0.0),
                "grade": getattr(s, "grade", "N/A"),
                "spoilage_risk": getattr(s, "spoilage_risk", "Low"),
                "created_at": getattr(s, "created_at", None),
                "user_name": owner.get("name") or current_user.name,
                "user_email": owner.get("email") or current_user.email,
                "role": owner.get("role") or current_user.role,
            })

        role_counts = {}
        for u in all_users:
            r = getattr(u, "role", "Consumer") or "Consumer"
            role_counts[r] = role_counts.get(r, 0) + 1

        inspector = {
            "name": current_user.name,
            "role": current_user.role,
            "email": current_user.email,
            "is_admin": is_admin,
            "registered_users": len(all_users),
            "active_users": len(all_users),
            "inactive_users": 0,
            "role_distribution": role_counts
        }
        report = generate_executive_compliance_report(dict_items, dict_scans, inspector)
        return {
            "success": True,
            "report": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate executive compliance report: {str(e)}")


@app.get("/analytics/reports/export")
def export_executive_data(
    format: str = Query("json", pattern="^(json|csv|excel|xlsx)$"),
    current_user: User = Depends(get_current_user)
):
    """Exports structured batch compliance data in JSON or downloadable CSV format."""
    try:
        is_admin = getattr(current_user, "role", "") in {"Administrator", "Admin", "Enterprise Manager", "Food Quality Inspector"}
        raw_items = Inventory.find_all() if is_admin else Inventory.find_by_user(current_user.id or "")
        history_scans = Prediction.find_all() if is_admin else Prediction.find_by_user(current_user.id or "")

        all_users = User.find_all()
        user_map = {str(u.id): {"name": u.name, "email": u.email, "role": u.role} for u in all_users if u.id}

        dict_items = []
        for i in raw_items:
            owner = user_map.get(str(getattr(i, "user_id", ""))) or {
                "name": current_user.name,
                "email": current_user.email,
                "role": current_user.role
            }
            dict_items.append({
                "id": str(i.id),
                "name": i.name,
                "category": i.category,
                "qty": i.qty,
                "status": i.status,
                "storage": i.storage,
                "expiry": i.expiry,
                "created_at": getattr(i, "created_at", None),
                "user_name": owner.get("name") or current_user.name,
                "user_email": owner.get("email") or current_user.email,
                "role": owner.get("role") or current_user.role,
            })

        dict_scans = []
        for s in history_scans:
            owner = user_map.get(str(getattr(s, "user_id", ""))) or {
                "name": current_user.name,
                "email": current_user.email,
                "role": current_user.role
            }
            dict_scans.append({
                "id": str(s.id),
                "food": s.food,
                "freshness": s.freshness,
                "days": s.days,
                "confidence": s.confidence,
                "quality_score": getattr(s, "quality_score", 0.0),
                "grade": getattr(s, "grade", "N/A"),
                "spoilage_risk": getattr(s, "spoilage_risk", "Low"),
                "created_at": getattr(s, "created_at", None),
                "user_name": owner.get("name") or current_user.name,
                "user_email": owner.get("email") or current_user.email,
                "role": owner.get("role") or current_user.role,
            })

        inspector = {
            "name": current_user.name,
            "role": current_user.role,
            "email": current_user.email,
            "is_admin": is_admin,
            "registered_users": len(all_users),
            "active_users": len(all_users),
            "inactive_users": 0
        }
        report = generate_executive_compliance_report(dict_items, dict_scans, inspector)

        if format == "csv":
            import csv
            import io
            output = io.StringIO()
            writer = csv.writer(output)
            if is_admin:
                writer.writerow([
                    "Batch ID", "User / Owner", "Role", "Produce Item", "Category",
                    "Account", "AI Score", "Health (%)", "Quality Status", "Shelf Life",
                    "Risk", "Confidence (%)", "Manufactured Date", "Expiry Date", "Added Date", "Storage Zone"
                ])
                for row in report.get("batch_records", []):
                    writer.writerow([
                        row.get("batch_id", ""),
                        row.get("user_name", ""),
                        row.get("role", ""),
                        row.get("produce_name", ""),
                        row.get("category", ""),
                        row.get("account", "Active"),
                        row.get("ai_score", ""),
                        f"{row.get('health', '')}%",
                        row.get("quality", row.get("status", "")),
                        row.get("shelf_life", ""),
                        row.get("risk", ""),
                        f"{row.get('confidence', '')}%",
                        row.get("manufactured", ""),
                        row.get("expiry", ""),
                        row.get("added", ""),
                        row.get("storage_zone", "")
                    ])
                filename = f"FreshCheck_Administrator_Audit_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"
            else:
                writer.writerow([
                    "Batch ID", "Produce Item", "Category", "AI Score", "Health (%)",
                    "Quality Status", "Shelf Life", "Risk", "Confidence (%)",
                    "Manufactured Date", "Expiry Date", "Added Date", "Storage Method"
                ])
                for row in report.get("batch_records", []):
                    writer.writerow([
                        row.get("batch_id", ""),
                        row.get("produce_name", ""),
                        row.get("category", ""),
                        row.get("ai_score", ""),
                        f"{row.get('health', '')}%",
                        row.get("quality", row.get("status", "")),
                        row.get("shelf_life", ""),
                        row.get("risk", ""),
                        f"{row.get('confidence', '')}%",
                        row.get("manufactured", ""),
                        row.get("expiry", ""),
                        row.get("added", ""),
                        row.get("storage_zone", "")
                    ])
                filename = f"FreshCheck_Personal_Food_Freshness_Audit_{datetime.now(timezone.utc).strftime('%Y%m%d')}.csv"
            csv_content = output.getvalue()
            return Response(
                content=csv_content,
                media_type="text/csv",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )

        if format in ["excel", "xlsx"]:
            import io
            import pandas as pd
            records = []
            if is_admin:
                for row in report.get("batch_records", []):
                    records.append({
                        "Batch ID": row.get("batch_id", ""),
                        "User / Owner": row.get("user_name", ""),
                        "Role": row.get("role", ""),
                        "Produce Item": row.get("produce_name", ""),
                        "Category": row.get("category", ""),
                        "Account Status": row.get("account", "Active"),
                        "AI Score": row.get("ai_score", 0.0),
                        "Health (%)": row.get("health", 0.0),
                        "Quality Status": row.get("quality", row.get("status", "")),
                        "Shelf Life": row.get("shelf_life", ""),
                        "Risk Level": row.get("risk", ""),
                        "Confidence (%)": row.get("confidence", 0.0),
                        "Manufactured Date": row.get("manufactured", ""),
                        "Expiry Date": row.get("expiry", ""),
                        "Added Date": row.get("added", ""),
                        "Storage Zone": row.get("storage_zone", "")
                    })
                sheet_title = "Admin Platform Food Ledger"
                filename = f"FreshCheck_Administrator_Audit_{datetime.now(timezone.utc).strftime('%Y%m%d')}.xlsx"
            else:
                for row in report.get("batch_records", []):
                    records.append({
                        "Batch ID": row.get("batch_id", ""),
                        "Produce Item": row.get("produce_name", ""),
                        "Category": row.get("category", ""),
                        "AI Score": row.get("ai_score", 0.0),
                        "Health (%)": row.get("health", 0.0),
                        "Quality Status": row.get("quality", row.get("status", "")),
                        "Shelf Life": row.get("shelf_life", ""),
                        "Risk Level": row.get("risk", ""),
                        "Confidence (%)": row.get("confidence", 0.0),
                        "Manufactured Date": row.get("manufactured", ""),
                        "Expiry Date": row.get("expiry", ""),
                        "Added Date": row.get("added", ""),
                        "Storage Method": row.get("storage_zone", "")
                    })
                sheet_title = "Personal Food Quality Ledger"
                filename = f"FreshCheck_Personal_Food_Freshness_Audit_{datetime.now(timezone.utc).strftime('%Y%m%d')}.xlsx"
            df = pd.DataFrame(records)
            excel_buffer = io.BytesIO()
            with pd.ExcelWriter(excel_buffer, engine="openpyxl") as writer:
                df.to_excel(writer, index=False, sheet_name=sheet_title)
            return Response(
                content=excel_buffer.getvalue(),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )

        return {
            "success": True,
            "export_format": "json",
            "data": report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to export report: {str(e)}")


# ============================================================
# USER MANAGEMENT & AUTHENTICATION ENDPOINTS
# ============================================================

@app.post("/register")
def register_user(user_data: UserRegister):
    try:
        # Check if email already exists
        user_by_email = User.find_by_email(user_data.email)
        if user_by_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        hashed_pw = get_password_hash(user_data.password)
        new_user = User.create(
            name=user_data.name,
            email=user_data.email,
            hashed_password=hashed_pw,
            role=user_data.role
        )

        return {
            "success": True,
            "message": "User registered successfully",
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email,
                "role": new_user.role
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Registration failed: {str(e)}"
        )


@app.post("/login")
def login_user(login_data: UserLogin):
    try:
        user = User.find_by_email(login_data.email)

        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect email or password"
            )

        # Generate 6-digit OTP code
        otp_code = f"{secrets.randbelow(900000) + 100000}"
        OTPRecord.save_otp(user.email, otp_code, expires_in_seconds=300)

        sent_email = send_otp_email(user.email, otp_code)

        res = {
            "status": "otp_required",
            "email": user.email,
            "message": f"Verification code sent to {user.email}",
            "expires_in_seconds": 300
        }
        if not sent_email:
            res["demo_otp"] = otp_code
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        )


@app.post("/verify-otp")
def verify_otp(otp_data: VerifyOTPRequest):
    try:
        user = User.find_by_email(otp_data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )

        record = OTPRecord.find_by_email(otp_data.email)
        if not record or not record.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired OTP verification code"
            )

        now_ts = time.time()
        record_expires = record.expires_at or 0.0
        # Compatibility fix for OTPs previously saved with naive datetime.utcnow().timestamp() in IST (+5:30)
        if (now_ts - record_expires) > 18000 and (now_ts - record_expires) < 22000:
            record_expires += 19800

        if now_ts > record_expires:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="OTP code has expired. Please request a new code."
            )

        if record.code.strip() != otp_data.otp_code.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid OTP code. Please check and try again."
            )

        # OTP is valid! Clean up OTP record
        OTPRecord.delete_by_email(user.email)

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OTP verification failed: {str(e)}"
        )


@app.post("/resend-otp")
def resend_otp(resend_data: ResendOTPRequest):
    try:
        user = User.find_by_email(resend_data.email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User not found"
            )

        otp_code = f"{secrets.randbelow(900000) + 100000}"
        OTPRecord.save_otp(user.email, otp_code, expires_in_seconds=300)

        sent_email = send_otp_email(user.email, otp_code)

        res = {
            "success": True,
            "message": f"A new verification code has been sent to {user.email}",
            "expires_in_seconds": 300
        }
        if not sent_email:
            res["demo_otp"] = otp_code
        return res
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Resending OTP failed: {str(e)}"
        )



@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        user = User.find_by_email(form_data.username)

        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect email or password"
            )

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Token exchange failed: {str(e)}"
        )


@app.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role
        }
    }


@app.get("/admin/users")
def get_admin_users(current_user: User = Depends(get_current_user)):
    """User management endpoint for Admin / Inspector roles."""
    all_users = User.find_all()
    users_list = [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at.isoformat() if hasattr(u.created_at, "isoformat") else str(u.created_at)
        }
        for u in all_users
    ]
    return {
        "success": True,
        "total_users": len(users_list),
        "users": users_list
    }


@app.get("/admin/system")
def get_admin_system(current_user: User = Depends(get_current_user)):
    """System monitoring and platform diagnostics."""
    db_metrics = get_db_info()
    return {
        "success": True,
        "system": {
            "status": "OPERATIONAL",
            "uptime_status": "Healthy",
            "model_engine": "MobileNetV2 + Arrhenius Kinetics",
            "cv_model_loaded": (model is not None),
            "database": db_metrics,
            "roles_supported": [
                "Consumer",
                "Retail Manager",
                "Warehouse Operator",
                "Food Quality Inspector",
                "Administrator"
            ],
            "haccp_protocol": "ISO 22000 / HACCP Level 4 Compliant"
        }
    }


# ============================================================
# AI FOOD STORAGE & PRESERVATION CHATBOT (GEMINI POWERED)
# ============================================================

@app.get("/chat/status")
def get_chat_advisor_status():
    """
    Returns AI configuration status, active model, and curated starter prompts.
    """
    has_gemini = is_gemini_configured()
    return {
        "success": True,
        "configured": has_gemini,
        "gemini_configured": has_gemini,
        "has_key": bool(get_gemini_api_key()),
        "model": "gemini-3-flash-preview" if has_gemini else "FoodScience-Offline-Engine",
        "active_model": "gemini-3-flash-preview" if has_gemini else "FoodScience-Offline-Engine",
        "sample_prompts": [
            "How do I store bananas to prevent premature browning?",
            "What is the best technique to keep leafy greens and spinach crisp?",
            "How do I store fresh strawberries so they don't mold in 3 days?",
            "Why shouldn't potatoes and onions be stored together?",
            "How do I store avocados so they don't spoil after cutting?",
            "Can I freeze fresh bread and what's the best way to reheat it?",
            "Which fruits produce ethylene gas that damages nearby produce?"
        ]
    }


@app.post("/chat")
def chat_storage_advisor_endpoint(request: ChatAdvisorRequest):
    """
    Processes storage & preservation inquiries using Google Gemini AI,
    with automatic offline food science knowledge engine fallback.
    """
    try:
        if not request.message or not request.message.strip():
            raise HTTPException(status_code=400, detail="Message cannot be empty.")

        target_food = (request.food_item or request.food_name or "").strip() or None

        response_data = query_storage_advisor(
            message=request.message.strip(),
            food_item=target_food,
            history=request.history or []
        )

        # Ensure dual aliases for maximum client compatibility
        reply_text = response_data.get("reply") or response_data.get("advice") or ""
        response_data["reply"] = reply_text
        response_data["advice"] = reply_text

        # Standardize specs / recommended_envelope only when explicitly provided
        specs = response_data.get("specs") or {}
        if specs:
            envelope = {
                "temperature": specs.get("optimal_temp"),
                "humidity": specs.get("humidity"),
                "storage_type": "Precision Storage Envelope",
                "expected_shelf_life_gain": specs.get("shelf_life_extended"),
                "ethylene": specs.get("ethylene")
            }
            response_data["recommended_envelope"] = envelope
        else:
            response_data["recommended_envelope"] = None

        hacks = response_data.get("quick_hacks") or response_data.get("preservation_hacks") or []
        response_data["quick_hacks"] = hacks
        response_data["preservation_hacks"] = hacks

        return response_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Storage Advisor error: {str(e)}"
        )


@app.post("/chat/save-key")
def save_gemini_api_key_endpoint(request: SaveApiKeyRequest):
    """
    Dynamically saves and activates the user's Gemini API key without restarting.
    """
    cleaned_key = (request.api_key or request.gemini_api_key or "").strip()
    if not cleaned_key or len(cleaned_key) < 8:
        raise HTTPException(status_code=400, detail="Invalid API key format.")

    saved = save_gemini_api_key(cleaned_key)
    if not saved:
        raise HTTPException(status_code=500, detail="Failed to write API key to .env file.")

    masked = f"{cleaned_key[:6]}...{cleaned_key[-4:]}" if len(cleaned_key) > 10 else "***"

    return {
        "success": True,
        "message": f"Gemini API key successfully saved ({masked})! AI Storage Advisor is now active.",
        "configured": True,
        "masked_key": masked,
        "model": "gemini-3-flash-preview"
    }


@app.post("/chat/test-key")
def test_gemini_api_key_endpoint(request: SaveApiKeyRequest):
    """
    Directly tests the specified Gemini API key against Google GenAI models.
    Returns status and model connection diagnostics.
    """
    key_to_test = (request.api_key or request.gemini_api_key or get_gemini_api_key()).strip()
    result = test_gemini_api_key(key_to_test)
    return result
