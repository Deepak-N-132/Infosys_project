import os
import sys
import pandas as pd
import tensorflow as tf

# ============================================================
# CONFIG
# ============================================================

BASE_DIR = r"D:\info_project\ml"

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "food_freshness_model.keras"
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "data",
    "class_mapping.csv"
)

IMAGE_BASE_DIR = r"D:\info_project\dataset\Processed Data"

IMG_SIZE = (224, 224)

# ============================================================
# LOAD MODEL
# ============================================================

print("=" * 70)
print("AI FOOD FRESHNESS PREDICTION")
print("=" * 70)

print("\nLoading model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully.")

# ============================================================
# LOAD CLASS MAPPING
# ============================================================

mapping = pd.read_csv(DATA_PATH)

# ============================================================
# GET IMAGE
# ============================================================

if len(sys.argv) < 2:
    print("\nUsage:")
    print(
        r"python src\predict.py "
        r"\"D:\path\to\image.jpg\""
    )
    sys.exit(1)

image_path = sys.argv[1]

if not os.path.exists(image_path):
    print("\nERROR: Image not found:")
    print(image_path)
    sys.exit(1)

# ============================================================
# PREPROCESS IMAGE
# ============================================================

image = tf.io.read_file(image_path)

image = tf.image.decode_image(
    image,
    channels=3,
    expand_animations=False
)

image.set_shape([None, None, 3])

image = tf.image.resize(
    image,
    IMG_SIZE
)

image = tf.cast(
    image,
    tf.float32
)

image = tf.keras.applications.mobilenet_v2.preprocess_input(
    image
)

image = tf.expand_dims(
    image,
    axis=0
)

# ============================================================
# PREDICTION
# ============================================================

predictions = model.predict(
    image,
    verbose=0
)

class_id = int(
    tf.argmax(predictions[0])
)

confidence = float(
    predictions[0][class_id]
) * 100

# ============================================================
# CLASS INFORMATION
# ============================================================

result = mapping[
    mapping["class_id"] == class_id
]

if len(result) == 0:
    print("\nERROR: Class mapping not found.")
    sys.exit(1)

result = result.iloc[0]

food = result["food"]
freshness = result["freshness"]
min_days = result["min_days"]
max_days = result["max_days"]

# ============================================================
# RESULT
# ============================================================

print("\n" + "=" * 70)
print("PREDICTION RESULT")
print("=" * 70)

print(f"\nFood       : {food}")
print(f"Freshness  : {freshness}")
print(f"Days       : {min_days}-{max_days}")
print(f"Confidence : {confidence:.2f}%")
print(f"Class ID   : {class_id}")

print("\nImage:")
print(image_path)

print("=" * 70)