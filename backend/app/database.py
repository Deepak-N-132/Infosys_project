from pymongo import MongoClient
from bson import ObjectId
from typing import Optional, Dict, Any
import os
import time
from datetime import datetime, timezone
from dotenv import load_dotenv

# Load environment variables from .env file if present
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(base_dir, ".env"))
load_dotenv(os.path.join(os.path.dirname(base_dir), ".env"))

MONGO_DETAILS = os.getenv("MONGO_DETAILS", "mongodb://localhost:27017")

try:
    import certifi
    ca_file = certifi.where()
except ImportError:
    ca_file = None


def connect_mongo():
    primary_uri = MONGO_DETAILS
    fallback_uri = "mongodb://localhost:27017"

    # Connection options for primary
    primary_kwargs: Dict[str, Any] = {"serverSelectionTimeoutMS": 3000}
    if ca_file and ("mongodb+srv://" in primary_uri or "ssl=true" in primary_uri.lower()):
        primary_kwargs["tlsCAFile"] = ca_file
        primary_kwargs["tlsAllowInvalidCertificates"] = True

    try:
        c = MongoClient(primary_uri, **primary_kwargs)
        c.admin.command("ping")
        is_atlas = "mongodb.net" in primary_uri
        mode = "MongoDB Atlas (Cloud)" if is_atlas else "Custom MongoDB"
        print(f"[MongoDB] Successfully connected via {mode}")
        return c, mode, primary_uri
    except Exception as err:
        print(f"[MongoDB-WARN] Primary connection unreachable ({err}).")
        if primary_uri != fallback_uri:
            try:
                print(f"[MongoDB-INFO] Connecting to local fallback ({fallback_uri})...")
                c = MongoClient(fallback_uri, serverSelectionTimeoutMS=3000)
                c.admin.command("ping")
                print("[MongoDB] Successfully connected to Local MongoDB fallback!")
                return c, "Local MongoDB (Fallback)", fallback_uri
            except Exception as err_local:
                print(f"[MongoDB-ERROR] Local fallback also unreachable: {err_local}")

        # Fall back to client instance so application doesn't crash on import
        return MongoClient(primary_uri, serverSelectionTimeoutMS=3000), "Disconnected", primary_uri


client, connection_mode, connected_uri = connect_mongo()
db = client.food_freshness

# Collections
users_collection = db.get_collection("users")
predictions_collection = db.get_collection("predictions")
inventory_collection = db.get_collection("inventory")
otps_collection = db.get_collection("otps")
spoilage_alerts_collection = db.get_collection("spoilage_alerts")
storage_settings_collection = db.get_collection("storage_settings")


def init_indexes():
    """Ensures indexes exist without crashing or hanging startup."""
    try:
        users_collection.create_index("email", unique=True)
        predictions_collection.create_index("user_id")
        inventory_collection.create_index("user_id")
        otps_collection.create_index("email", unique=True)
        spoilage_alerts_collection.create_index([("user_id", 1), ("source_id", 1)])
        spoilage_alerts_collection.create_index("status_state")
        storage_settings_collection.create_index("user_id", unique=True)
        print("[MongoDB] All indexes verified successfully.")
    except Exception as ex:
        print(f"[MongoDB-WARN] Index initialization notice: {ex}")


def get_db_info() -> Dict[str, Any]:
    """Returns real-time database connection metrics and counts."""
    is_live = False
    try:
        client.admin.command("ping")
        is_live = True
    except Exception:
        is_live = False

    counts = {
        "users": 0,
        "predictions": 0,
        "inventory": 0,
        "spoilage_alerts": 0,
        "storage_settings": 0
    }
    if is_live:
        try:
            counts["users"] = users_collection.count_documents({})
            counts["predictions"] = predictions_collection.count_documents({})
            counts["inventory"] = inventory_collection.count_documents({})
            counts["spoilage_alerts"] = spoilage_alerts_collection.count_documents({})
            counts["storage_settings"] = storage_settings_collection.count_documents({})
        except Exception:
            pass

    return {
        "connected": is_live,
        "mode": connection_mode,
        "database": db.name,
        "uri_redacted": (connected_uri.split("@")[-1] if "@" in connected_uri else connected_uri),
        "counts": counts
    }



class User:
    def __init__(self, data):
        self._id = data.get("_id")
        self.id = str(self._id) if self._id else None
        self.name = data.get("name")
        self.email = data.get("email")
        self.hashed_password = data.get("hashed_password")
        self.role = data.get("role", "Consumer")
        self.created_at = data.get("created_at") or datetime.utcnow()

    @classmethod
    def find_by_email(cls, email: str):
        data = users_collection.find_one({"email": email})
        return cls(data) if data else None

    @classmethod
    def create(cls, name: str, email: str, hashed_password: str, role: str):
        data = {
            "name": name,
            "email": email,
            "hashed_password": hashed_password,
            "role": role,
            "created_at": datetime.utcnow()
        }
        result = users_collection.insert_one(data)
        data["_id"] = result.inserted_id
        return cls(data)


class Prediction:
    def __init__(self, data):
        self._id = data.get("_id")
        self.id = str(self._id) if self._id else None
        self.user_id = data.get("user_id")
        self.filename = data.get("filename")
        self.food = data.get("food")
        self.freshness = data.get("freshness")
        self.days = data.get("days")
        self.min_days = data.get("min_days")
        self.max_days = data.get("max_days")
        self.confidence = data.get("confidence")
        self.class_id = data.get("class_id")
        self.quality_score = data.get("quality_score", 0.0)
        self.grade = data.get("grade", "N/A")
        self.spoilage_risk = data.get("spoilage_risk", "N/A")
        self.spoilage_risk_pct = data.get("spoilage_risk_pct", 0.0)
        self.browning_ratio = data.get("browning_ratio", 0.0)
        self.surface_integrity = data.get("surface_integrity", 0.0)
        self.color_distribution = data.get("color_distribution") or {}
        self.storage_recommendations = data.get("storage_recommendations") or {}
        self.shelf_life_prediction = data.get("shelf_life_prediction") or {}
        self.created_at = data.get("created_at") or datetime.utcnow()

    @classmethod
    def create(
        cls,
        user_id: str,
        filename: str,
        food: str,
        freshness: str,
        days: str,
        min_days: int,
        max_days: int,
        confidence: float,
        class_id: int,
        quality_score: float = 0.0,
        grade: str = "N/A",
        spoilage_risk: str = "Low",
        spoilage_risk_pct: float = 0.0,
        browning_ratio: float = 0.0,
        surface_integrity: float = 100.0,
        color_distribution: Optional[dict] = None,
        storage_recommendations: Optional[dict] = None,
        shelf_life_prediction: Optional[dict] = None
    ):
        data = {
            "user_id": user_id,
            "filename": filename,
            "food": food,
            "freshness": freshness,
            "days": days,
            "min_days": min_days,
            "max_days": max_days,
            "confidence": confidence,
            "class_id": class_id,
            "quality_score": quality_score,
            "grade": grade,
            "spoilage_risk": spoilage_risk,
            "spoilage_risk_pct": spoilage_risk_pct,
            "browning_ratio": browning_ratio,
            "surface_integrity": surface_integrity,
            "color_distribution": color_distribution or {},
            "storage_recommendations": storage_recommendations or {},
            "shelf_life_prediction": shelf_life_prediction or {},
            "created_at": datetime.utcnow()
        }
        result = predictions_collection.insert_one(data)
        data["_id"] = result.inserted_id
        return cls(data)

    @classmethod
    def find_by_user(cls, user_id: str):
        cursor = predictions_collection.find({"user_id": user_id}).sort("created_at", -1)
        return [cls(doc) for doc in cursor]

    @classmethod
    def find_by_id(cls, prediction_id: str):
        try:
            data = predictions_collection.find_one({"_id": ObjectId(prediction_id)})
            return cls(data) if data else None
        except Exception:
            return None

    @classmethod
    def delete(cls, prediction_id: str, user_id: Optional[str] = None) -> bool:
        try:
            query: Dict[str, Any] = {"_id": ObjectId(prediction_id)}
            if user_id:
                query["user_id"] = user_id
            result = predictions_collection.delete_one(query)
            if result.deleted_count > 0:
                # Also delete associated diagnostic alert if any
                spoilage_alerts_collection.delete_one({"source_id": f"scan-{prediction_id}"})
                return True
            return False
        except Exception:
            return False

    @classmethod
    def clear_for_user(cls, user_id: str) -> int:
        try:
            result = predictions_collection.delete_many({"user_id": user_id})
            # Clean up all scanner alerts for this user
            spoilage_alerts_collection.delete_many({"user_id": user_id, "source": "Scanner Diagnostic"})
            return result.deleted_count
        except Exception:
            return 0


class Inventory:
    def __init__(self, data):
        self._id = data.get("_id")
        self.id = str(self._id) if self._id else None
        self.user_id = data.get("user_id")
        self.name = data.get("name")
        self.category = data.get("category")
        self.qty = data.get("qty")
        self.status = data.get("status")
        self.storage = data.get("storage")
        self.expiry = data.get("expiry")
        self.image = data.get("image")
        self.created_at = data.get("created_at") or datetime.utcnow()

    @classmethod
    def create(
        cls,
        user_id: str,
        name: str,
        category: str,
        qty: str,
        status: str,
        storage: str,
        expiry: str,
        image: Optional[str] = None
    ):
        data = {
            "user_id": user_id,
            "name": name,
            "category": category,
            "qty": qty,
            "status": status,
            "storage": storage,
            "expiry": expiry,
            "image": image,
            "created_at": datetime.utcnow()
        }
        result = inventory_collection.insert_one(data)
        data["_id"] = result.inserted_id
        return cls(data)

    @classmethod
    def find_by_user(cls, user_id: str):
        cursor = inventory_collection.find({"user_id": user_id}).sort("created_at", -1)
        return [cls(doc) for doc in cursor]

    @classmethod
    def find_by_id(cls, item_id: str):
        try:
            data = inventory_collection.find_one({"_id": ObjectId(item_id)})
            return cls(data) if data else None
        except Exception:
            return None

    @classmethod
    def update_status(cls, item_id: str, new_status: str, new_storage: Optional[str] = None):
        try:
            update_data: Dict[str, Any] = {"status": new_status, "updated_at": datetime.utcnow()}
            if new_storage:
                update_data["storage"] = new_storage
            result = inventory_collection.update_one(
                {"_id": ObjectId(item_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except Exception:
            return False

    @classmethod
    def update_item(cls, item_id: str, user_id: Optional[str] = None, **kwargs) -> bool:
        try:
            query: Dict[str, Any] = {"_id": ObjectId(item_id)}
            if user_id:
                query["user_id"] = user_id
            
            update_data = {k: v for k, v in kwargs.items() if v is not None}
            update_data["updated_at"] = datetime.utcnow()

            result = inventory_collection.update_one(query, {"$set": update_data})
            return result.matched_count > 0
        except Exception:
            return False

    @classmethod
    def delete(cls, item_id: str, user_id: Optional[str] = None) -> bool:
        try:
            query: Dict[str, Any] = {"_id": ObjectId(item_id)}
            if user_id:
                query["user_id"] = user_id
            result = inventory_collection.delete_one(query)
            if result.deleted_count > 0:
                # Also delete associated alert in MongoDB
                spoilage_alerts_collection.delete_one({"source_id": f"inv-{item_id}"})
                return True
            return False
        except Exception:
            return False


class SpoilageAlert:
    def __init__(self, data):
        self._id = data.get("_id")
        self.id = str(self._id) if self._id else None
        self.user_id = data.get("user_id")
        self.source = data.get("source", "Inventory Item")
        self.source_id = data.get("source_id")
        self.title = data.get("title")
        self.category = data.get("category", "Produce")
        self.qty = data.get("qty", "1 unit")
        self.status = data.get("status", "Near Spoilage")
        self.storage = data.get("storage", "Ambient")
        self.days_left = data.get("days_left", 0)
        self.severity = data.get("severity", "Critical")
        self.action_required = data.get("action_required", "Immediate disposal required")
        self.status_state = data.get("status_state", "Active")  # Active, Quarantined, Disposed, Acknowledged
        self.notes = data.get("notes", "")
        self.created_at = data.get("created_at") or datetime.utcnow()
        self.updated_at = data.get("updated_at") or datetime.utcnow()

    @classmethod
    def create_or_update(
        cls,
        user_id: str,
        source: str,
        source_id: str,
        title: str,
        category: str,
        qty: str,
        status: str,
        storage: str,
        days_left: int,
        severity: str,
        action_required: str,
        status_state: str = "Active",
        notes: str = ""
    ):
        existing = spoilage_alerts_collection.find_one({"user_id": user_id, "source_id": source_id})
        now = datetime.utcnow()
        if existing:
            current_state = existing.get("status_state", "Active")
            update_fields: Dict[str, Any] = {
                "title": title,
                "category": category,
                "qty": qty,
                "status": status,
                "storage": storage,
                "days_left": days_left,
                "severity": severity,
                "action_required": action_required,
                "updated_at": now
            }
            # Only update status_state if it is currently Active or wasn't set
            if current_state == "Active" and status_state != "Active":
                update_fields["status_state"] = status_state

            spoilage_alerts_collection.update_one(
                {"_id": existing["_id"]},
                {"$set": update_fields}
            )
            existing.update(update_fields)
            return cls(existing)
        else:
            doc = {
                "user_id": user_id,
                "source": source,
                "source_id": source_id,
                "title": title,
                "category": category,
                "qty": qty,
                "status": status,
                "storage": storage,
                "days_left": days_left,
                "severity": severity,
                "action_required": action_required,
                "status_state": status_state,
                "notes": notes,
                "created_at": now,
                "updated_at": now
            }
            res = spoilage_alerts_collection.insert_one(doc)
            doc["_id"] = res.inserted_id
            return cls(doc)

    @classmethod
    def find_by_user(cls, user_id: str, include_resolved: bool = False):
        query: Dict[str, Any] = {"user_id": user_id}
        if not include_resolved:
            query["status_state"] = {"$in": ["Active", "Quarantined"]}
        cursor = spoilage_alerts_collection.find(query).sort("updated_at", -1)
        return [cls(doc) for doc in cursor]

    @classmethod
    def find_by_id(cls, alert_id: str):
        try:
            doc = spoilage_alerts_collection.find_one({"_id": ObjectId(alert_id)})
            return cls(doc) if doc else None
        except Exception:
            return None

    @classmethod
    def update_action(cls, alert_id: str, new_state: str, notes: str = ""):
        try:
            update_data: Dict[str, Any] = {
                "status_state": new_state,
                "notes": notes,
                "updated_at": datetime.utcnow()
            }
            res = spoilage_alerts_collection.update_one(
                {"_id": ObjectId(alert_id)},
                {"$set": update_data}
            )
            return res.modified_count > 0
        except Exception:
            return False

    @classmethod
    def sync_for_user(cls, user_id: str):
        now = datetime.utcnow()
        inv_items = Inventory.find_by_user(user_id)
        scans = Prediction.find_by_user(user_id)

        for item in inv_items:
            # If item is already marked as Disposed, skip creating/activating an alert
            if (item.status or "").lower() in ["disposed", "disposed (written off)"]:
                continue

            days_left = 999
            if item.expiry:
                try:
                    exp_date = datetime.strptime(item.expiry, "%Y-%m-%d")
                    days_left = (exp_date - now).days
                except Exception:
                    pass

            is_spoiled = (item.status or "").lower() in ["spoiled", "rotten", "near spoilage", "quarantined"]
            if is_spoiled or days_left <= 2:
                source_id = f"inv-{item.id}"
                severity = "Critical" if (is_spoiled or days_left < 0) else "High"
                directive = "Immediate write-off & disposal required" if severity == "Critical" else "Consume or freeze within 24-48 hours"
                status_state = "Quarantined" if (item.status or "").lower() == "quarantined" else "Active"
                cls.create_or_update(
                    user_id=user_id,
                    source="Inventory Item",
                    source_id=source_id,
                    title=item.name,
                    category=item.category,
                    qty=item.qty,
                    status=item.status,
                    storage=item.storage,
                    days_left=days_left,
                    severity=severity,
                    action_required=directive,
                    status_state=status_state
                )

        for scan in scans[:10]:
            if getattr(scan, "freshness", "").lower() in ["rotten", "spoiled"] or getattr(scan, "spoilage_risk", "").lower() in ["critical", "high"]:
                source_id = f"scan-{scan.id}"
                cls.create_or_update(
                    user_id=user_id,
                    source="Scanner Diagnostic",
                    source_id=source_id,
                    title=scan.food,
                    category="Produce Scan",
                    qty="1 batch",
                    status=scan.freshness,
                    storage="Incoming Inspection",
                    days_left=0,
                    severity="Critical",
                    action_required="Contamination hazard: isolate batch immediately from fresh inventory"
                )

        return cls.find_by_user(user_id, include_resolved=False)


class OTPRecord:
    def __init__(self, data):
        self._id = data.get("_id")
        self.id = str(self._id) if self._id else None
        self.email = data.get("email")
        self.code = data.get("code")
        self.expires_at = data.get("expires_at")
        self.created_at = data.get("created_at") or datetime.utcnow()

    @classmethod
    def save_otp(cls, email: str, code: str, expires_in_seconds: int = 300):
        expires_at = time.time() + expires_in_seconds
        otps_collection.update_one(
            {"email": email},
            {
                "$set": {
                    "code": str(code),
                    "expires_at": expires_at,
                    "created_at": datetime.now(timezone.utc)
                }
            },
            upsert=True
        )

    @classmethod
    def find_by_email(cls, email: str):
        data = otps_collection.find_one({"email": email})
        return cls(data) if data else None

    @classmethod
    def delete_by_email(cls, email: str):
        otps_collection.delete_one({"email": email})


class StorageSettings:
    DEFAULT_SETTINGS = {
        "fridge_temp": 4.0,            # Celsius
        "humidity": 80.0,              # %
        "air_circulation": "Medium",    # Low, Medium, High
        "light_exposure": "Low Light",  # Dark, Low Light, Ambient
        "auto_alert_expiry_days": 2,   # Alert trigger
        "quarantine_temp": 2.0         # Celsius
    }

    def __init__(self, data):
        self._id = data.get("_id")
        self.id = str(self._id) if self._id else None
        self.user_id = data.get("user_id")
        self.fridge_temp = float(data.get("fridge_temp", self.DEFAULT_SETTINGS["fridge_temp"]))
        self.humidity = float(data.get("humidity", self.DEFAULT_SETTINGS["humidity"]))
        self.air_circulation = str(data.get("air_circulation", self.DEFAULT_SETTINGS["air_circulation"]))
        self.light_exposure = str(data.get("light_exposure", self.DEFAULT_SETTINGS["light_exposure"]))
        self.auto_alert_expiry_days = int(data.get("auto_alert_expiry_days", self.DEFAULT_SETTINGS["auto_alert_expiry_days"]))
        self.quarantine_temp = float(data.get("quarantine_temp", self.DEFAULT_SETTINGS["quarantine_temp"]))
        self.updated_at = data.get("updated_at") or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "fridge_temp": self.fridge_temp,
            "humidity": self.humidity,
            "air_circulation": self.air_circulation,
            "light_exposure": self.light_exposure,
            "auto_alert_expiry_days": self.auto_alert_expiry_days,
            "quarantine_temp": self.quarantine_temp,
            "updated_at": self.updated_at.isoformat() if hasattr(self.updated_at, "isoformat") else str(self.updated_at)
        }

    @classmethod
    def get_for_user(cls, user_id: str) -> "StorageSettings":
        try:
            data = storage_settings_collection.find_one({"user_id": user_id})
            if not data:
                data = {
                    "user_id": user_id,
                    **cls.DEFAULT_SETTINGS,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                res = storage_settings_collection.insert_one(data)
                data["_id"] = res.inserted_id
            return cls(data)
        except Exception:
            return cls({"user_id": user_id, **cls.DEFAULT_SETTINGS})

    @classmethod
    def update_for_user(cls, user_id: str, updates: Dict[str, Any]) -> "StorageSettings":
        try:
            valid_keys = set(cls.DEFAULT_SETTINGS.keys())
            filtered = {k: v for k, v in updates.items() if k in valid_keys}
            filtered["updated_at"] = datetime.utcnow()
            storage_settings_collection.update_one(
                {"user_id": user_id},
                {"$set": filtered},
                upsert=True
            )
            return cls.get_for_user(user_id)
        except Exception:
            return cls({"user_id": user_id, **cls.DEFAULT_SETTINGS, **updates})