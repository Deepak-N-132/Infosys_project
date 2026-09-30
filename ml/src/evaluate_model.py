import os
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

# ============================================================
# CONFIG
# ============================================================

BASE_DIR = r"D:\info_project\ml"

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "food_freshness_model.keras"
)

TEST_CSV = os.path.join(
    BASE_DIR,
    "data",
    "test.csv"
)

IMAGE_BASE_DIR = r"D:\info_project\dataset\Processed Data"

IMG_SIZE = (224, 224)
BATCH_SIZE = 32

# ============================================================
# LOAD
# ============================================================

print("=" * 70)
print("AI FOOD FRESHNESS MODEL EVALUATION")
print("=" * 70)

print("\nLoading model...")

model = tf.keras.models.load_model(MODEL_PATH)

test_df = pd.read_csv(TEST_CSV)

print("Model loaded successfully.")
print("Test images:", len(test_df))

# ============================================================
# IMAGE PATHS
# ============================================================

test_df["full_path"] = test_df["image_path"].apply(
    lambda x: os.path.join(IMAGE_BASE_DIR, x)
)

# ============================================================
# IMAGE LOADER
# ============================================================

def load_image(path, label):

    image = tf.io.read_file(path)

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

    return image, label


# ============================================================
# DATASET
# ============================================================

paths = test_df["full_path"].values
labels = test_df["class_id"].values

test_ds = tf.data.Dataset.from_tensor_slices(
    (paths, labels)
)

test_ds = (
    test_ds
    .map(
        load_image,
        num_parallel_calls=tf.data.AUTOTUNE
    )
    .batch(BATCH_SIZE)
    .prefetch(tf.data.AUTOTUNE)
)

# ============================================================
# EVALUATION
# ============================================================

print("\nEvaluating model...")

loss, accuracy = model.evaluate(
    test_ds,
    verbose=1
)

print("\n" + "=" * 70)
print("OVERALL TEST PERFORMANCE")
print("=" * 70)

print(f"\nTest Loss     : {loss:.4f}")
print(f"Test Accuracy : {accuracy * 100:.2f}%")

# ============================================================
# PREDICTIONS
# ============================================================

print("\nGenerating predictions...")

predictions = model.predict(
    test_ds,
    verbose=1
)

predicted_classes = np.argmax(
    predictions,
    axis=1
)

actual_classes = labels

# ============================================================
# CLASS NAMES
# ============================================================

class_mapping = (
    test_df[
        ["class_id", "food", "freshness"]
    ]
    .drop_duplicates()
    .sort_values("class_id")
)

class_names = []

for _, row in class_mapping.iterrows():

    class_names.append(
        f"{row['food']} - {row['freshness']}"
    )

# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(
        actual_classes,
        predicted_classes,
        labels=class_mapping["class_id"].tolist(),
        target_names=class_names,
        zero_division=0
    )
)

# ============================================================
# CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    actual_classes,
    predicted_classes,
    labels=class_mapping["class_id"].tolist()
)

cm_path = os.path.join(
    BASE_DIR,
    "data",
    "confusion_matrix.csv"
)

pd.DataFrame(
    cm,
    index=class_names,
    columns=class_names
).to_csv(cm_path)

print("Confusion matrix saved to:")
print(cm_path)

# ============================================================
# FINISH
# ============================================================

print("\n" + "=" * 70)
print("MODEL EVALUATION COMPLETE")
print("=" * 70)