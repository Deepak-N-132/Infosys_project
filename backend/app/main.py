from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import bcrypt
from pydantic import BaseModel
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Optional

import os
import time
import shutil
import random
import smtplib
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
    get_produce_profile,
    PRODUCE_KINETIC_PROFILES
)
from .storage_monitoring import (
    get_all_storage_zones_telemetry,
    update_zone_telemetry,
    execute_storage_workflow,
    get_workflow_audit_history
)
from .recommendation_engine import (
    generate_comprehensive_recommendations,
    generate_fefo_priority_queue,
    check_ethylene_conflicts,
    get_culinary_repurposing_recommendations
)
from .inventory_insights import (
    compute_inventory_insights
)

# ============================================================
# CONFIG
# ============================================================

MODEL_PATH = r"D:\info_project\ml\models\food_freshness_model.keras"

DATA_PATH = r"D:\info_project\ml\data\class_mapping.csv"

UPLOAD_DIR = r"D:\info_project\backend\uploads"

IMG_SIZE = (224, 224)


# ============================================================
# AUTHENTICATION CONFIG & UTILS
# ============================================================

SECRET_KEY = "freshcheck-ai-super-secret-key-change-in-production"
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
    expiry: str
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

        safe_filename = file.filename or "uploaded_food.jpg"
        file_path = os.path.join(
            UPLOAD_DIR,
            safe_filename
        )

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
            "filename": file.filename,
            "quality_score": quality_assessment["quality_score"],
            "grade": quality_assessment["grade"],
            "grade_description": quality_assessment["grade_description"],
            "quality_components": quality_assessment["components"],
            "spoilage_risk": spoilage_assessment["severity"],
            "spoilage_risk_percent": spoilage_assessment["spoilage_risk_percent"],
            "spoilage_action": spoilage_assessment["action_directive"],
            "cross_contamination_risk": spoilage_assessment["cross_contamination_risk"],
            "visual_features": visual_features,
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
                    "created_at": (
                        record.created_at.isoformat()
                        if record.created_at
                        else None
                    )
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

@app.get("/spoilage-alerts")
def get_spoilage_alerts(
    current_user: User = Depends(get_current_user)
):
    try:
        # Synchronizes live hazards into MongoDB collection and returns active alerts
        alerts = SpoilageAlert.sync_for_user(current_user.id or "")
        active_inventory = Inventory.find_by_user(current_user.id or "")

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
        if not alert or alert.user_id != current_user.id:
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
        records = Inventory.find_by_user(current_user.id or "")
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
                    "created_at": record.created_at.isoformat() if record.created_at else None
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
            expiry=item_data.expiry,
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

        success = Inventory.update_item(item_id, user_id=current_user.id, **updates)
        if not success:
            raise HTTPException(status_code=404, detail="Inventory item not found or unauthorized.")

        # Re-sync live hazard alerts if status or storage changed
        if "status" in updates or "storage" in updates:
            try:
                SpoilageAlert.sync_for_user(current_user.id or "")
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
        success = Inventory.delete(item_id, user_id=current_user.id)
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
            light_exposure=sim_data.light_exposure
        )
        return {
            "success": True,
            "food_name": sim_data.food_name,
            "simulation": eval_result
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
    """Allows manual calibration or simulated sensor telemetry update for a zone."""
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
        raw_items = Inventory.find_by_user(current_user.id or "")
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
        raw_items = Inventory.find_by_user(current_user.id or "")
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
        history_scans = Prediction.find_by_user(current_user.id or "")
        insights = compute_inventory_insights(dict_items, history_scans)
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate inventory insights: {str(e)}")


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
        otp_code = f"{random.randint(100000, 999999)}"
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

        otp_code = f"{random.randint(100000, 999999)}"
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