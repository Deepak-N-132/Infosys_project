import os
import pandas as pd
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import MobileNetV2

# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = r"D:\info_project\ml"
DATA_DIR = os.path.join(BASE_DIR, "data")

IMAGE_BASE_DIR = r"D:\info_project\dataset\Processed Data"

TRAIN_CSV = os.path.join(DATA_DIR, "train.csv")
VAL_CSV = os.path.join(DATA_DIR, "val.csv")

IMG_SIZE = (224, 224)
BATCH_SIZE = 32
NUM_CLASSES = 24
EPOCHS = 10

MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "food_freshness_model.keras"
)

# ============================================================
# START
# ============================================================

print("=" * 70)
print("FOOD FRESHNESS AI MODEL TRAINING")
print("=" * 70)

# ============================================================
# LOAD METADATA
# ============================================================

train_df = pd.read_csv(TRAIN_CSV)
val_df = pd.read_csv(VAL_CSV)

print()
print("Training images   :", len(train_df))
print("Validation images :", len(val_df))
print("Number of classes :", train_df["class_id"].nunique())

# ============================================================
# BUILD FULL IMAGE PATHS
# ============================================================

train_df["full_path"] = train_df["image_path"].apply(
    lambda x: os.path.join(IMAGE_BASE_DIR, x)
)

val_df["full_path"] = val_df["image_path"].apply(
    lambda x: os.path.join(IMAGE_BASE_DIR, x)
)

# ============================================================
# VERIFY IMAGE PATHS
# ============================================================

print()
print("Checking image paths...")

missing_train = sum(
    not os.path.exists(p)
    for p in train_df["full_path"]
)

missing_val = sum(
    not os.path.exists(p)
    for p in val_df["full_path"]
)

print("Missing training images   :", missing_train)
print("Missing validation images :", missing_val)

if missing_train > 0 or missing_val > 0:
    print()
    print("ERROR: Some image paths cannot be found.")
    print("Please check IMAGE_BASE_DIR.")
    raise SystemExit(1)

print("All image paths verified.")

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
# DATASETS
# ============================================================

train_paths = train_df["full_path"].values
train_labels = train_df["class_id"].values

val_paths = val_df["full_path"].values
val_labels = val_df["class_id"].values

train_ds = tf.data.Dataset.from_tensor_slices(
    (train_paths, train_labels)
)

val_ds = tf.data.Dataset.from_tensor_slices(
    (val_paths, val_labels)
)

train_ds = (
    train_ds
    .shuffle(2000)
    .map(
        load_image,
        num_parallel_calls=tf.data.AUTOTUNE
    )
    .batch(BATCH_SIZE)
    .prefetch(tf.data.AUTOTUNE)
)

val_ds = (
    val_ds
    .map(
        load_image,
        num_parallel_calls=tf.data.AUTOTUNE
    )
    .batch(BATCH_SIZE)
    .prefetch(tf.data.AUTOTUNE)
)

# ============================================================
# DATA AUGMENTATION
# ============================================================

augmentation = tf.keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.1),
    layers.RandomZoom(0.1),
])

# ============================================================
# MOBILENETV2 BASE MODEL
# ============================================================

print()
print("Loading MobileNetV2...")

base_model = MobileNetV2(
    input_shape=(224, 224, 3),
    include_top=False,
    weights="imagenet"
)

base_model.trainable = False

# ============================================================
# BUILD MODEL
# ============================================================

inputs = layers.Input(
    shape=(224, 224, 3)
)

x = augmentation(inputs)

x = base_model(
    x,
    training=False
)

x = layers.GlobalAveragePooling2D()(x)

x = layers.Dropout(0.3)(x)

outputs = layers.Dense(
    NUM_CLASSES,
    activation="softmax"
)(x)

model = models.Model(
    inputs,
    outputs
)

# ============================================================
# COMPILE
# ============================================================

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=0.001
    ),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"]
)

print()
print("Model created successfully.")

# ============================================================
# CALLBACKS
# ============================================================

callbacks = [

    tf.keras.callbacks.ModelCheckpoint(
        MODEL_PATH,
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1
    ),

    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=3,
        restore_best_weights=True,
        verbose=1
    )
]

# ============================================================
# TRAIN
# ============================================================

print()
print("=" * 70)
print("STARTING MODEL TRAINING")
print("=" * 70)

history = model.fit(
    train_ds,
    validation_data=val_ds,
    epochs=EPOCHS,
    callbacks=callbacks
)

# ============================================================
# SAVE MODEL
# ============================================================

model.save(MODEL_PATH)

print()
print("=" * 70)
print("TRAINING COMPLETE")
print("=" * 70)

print()
print("Model saved to:")
print(MODEL_PATH)

print()
print(
    "Best validation accuracy:",
    max(history.history["val_accuracy"])
)

print("=" * 70)