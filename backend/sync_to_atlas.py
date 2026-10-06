import os
import certifi
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

atlas_uri = os.getenv("MONGO_DETAILS")
local_uri = "mongodb://localhost:27017"

if not atlas_uri or "mongodb.net" not in atlas_uri:
    raise SystemExit("Set MONGO_DETAILS (your Atlas URI) in .env first.")

print("=" * 60)
print("MongoDB Cloud Atlas Sync Utility")
print("=" * 60)

try:
    print("1. Connecting to Local MongoDB...")
    local_client = MongoClient(local_uri, serverSelectionTimeoutMS=3000)
    local_db = local_client.food_freshness
    local_colls = local_db.list_collection_names()
    print(f"   [OK] Local collections found: {local_colls}")

    print("\n2. Connecting to MongoDB Atlas Cloud...")
    atlas_client = MongoClient(atlas_uri, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=8000)
    atlas_client.admin.command("ping")
    atlas_db = atlas_client.food_freshness
    print("   [OK] Successfully connected to MongoDB Atlas Cloud!")

    # Sync all collections: spoilage_alerts, storage_settings, inventory, predictions, users
    for coll_name in ["spoilage_alerts", "storage_settings", "inventory", "predictions", "users"]:
        if coll_name in local_colls:
            docs = list(local_db[coll_name].find())
            if docs:
                # Remove existing to prevent duplicates, then insert
                atlas_db[coll_name].delete_many({})
                atlas_db[coll_name].insert_many(docs)
                print(f"   [SYNCED] '{coll_name}': {len(docs)} documents copied to Atlas Cloud.")
            else:
                print(f"   [INFO] '{coll_name}' is empty locally.")
        else:
            # Create empty collection with dummy document if needed
            atlas_db[coll_name].insert_one({"_init": True})
            atlas_db[coll_name].delete_one({"_init": True})
            print(f"   [CREATED] '{coll_name}' collection initialized in Atlas Cloud.")

    print("\n" + "=" * 60)
    print("SYNC COMPLETE! Collections now in your MongoDB Atlas Cloud:")
    for c in atlas_db.list_collection_names():
        count = atlas_db[c].count_documents({})
        print(f" - {c} ({count} documents)")
    print("=" * 60)

except Exception as e:
    print("\n[ERROR] Could not connect to Atlas Cloud:")
    print(f"Detail: {e}")
    print("\nIf you see 'SSL handshake failed' or 'TLSV1_ALERT_INTERNAL_ERROR':")
    print("1. Go to https://cloud.mongodb.com")
    print("2. Navigate to: Security -> Network Access")
    print("3. Click '+ Add IP Address' and select 'Allow Access from Anywhere' (0.0.0.0/0)")
    print("4. Re-run this script once confirmed.")
