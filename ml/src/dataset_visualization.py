from pathlib import Path
import random

import pandas as pd
import matplotlib.pyplot as plt
from PIL import Image


# ============================================================
# CONFIGURATION
# ============================================================

DATA_DIR = Path(r"D:\info_project\ml\data")

TRAIN_FILE = DATA_DIR / "train.csv"

OUTPUT_DIR = DATA_DIR / "visualizations"

OUTPUT_DIR.mkdir(
    parents=True,
    exist_ok=True
)

RANDOM_STATE = 42


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(TRAIN_FILE)

print("=" * 70)
print("DATASET VISUALIZATION & IMAGE QUALITY CHECK")
print("=" * 70)

print(
    f"\nTraining images: {len(df)}"
)


# ============================================================
# IMAGE PATH
# ============================================================

def get_image_path(relative_path):

    return Path(
        r"D:\info_project\dataset\Processed Data"
    ) / relative_path


# ============================================================
# IMAGE VALIDATION
# ============================================================

print("\nChecking image integrity...")

corrupted = []
valid = 0

for _, row in df.iterrows():

    path = get_image_path(
        row["image_path"]
    )

    try:

        with Image.open(path) as img:

            img.verify()

        valid += 1

    except Exception:

        corrupted.append(
            str(path)
        )


print(
    f"Valid images     : {valid}"
)

print(
    f"Corrupted images : {len(corrupted)}"
)

if corrupted:

    print("\nCorrupted files:")

    for path in corrupted[:20]:

        print(path)

else:

    print(
        "STATUS: ALL TRAINING IMAGES ARE VALID"
    )


# ============================================================
# IMAGE DIMENSIONS
# ============================================================

print("\nAnalyzing image dimensions...")

dimensions = {}

for _, row in df.iterrows():

    path = get_image_path(
        row["image_path"]
    )

    try:

        with Image.open(path) as img:

            size = img.size

        dimensions[size] = (
            dimensions.get(size, 0) + 1
        )

    except Exception:

        pass


dimension_df = (
    pd.DataFrame(
        [
            {
                "width": size[0],
                "height": size[1],
                "count": count
            }
            for size, count
            in dimensions.items()
        ]
    )
    .sort_values(
        "count",
        ascending=False
    )
)

print("\nTop image dimensions:")

print(
    dimension_df.head(20).to_string(
        index=False
    )
)

dimension_df.to_csv(
    OUTPUT_DIR / "image_dimensions.csv",
    index=False
)


# ============================================================
# CLASS DISTRIBUTION
# ============================================================

class_counts = (
    df
    .groupby(
        ["food", "freshness"]
    )
    .size()
    .reset_index(
        name="count"
    )
)

print("\nClass distribution:")

print(
    class_counts.to_string(
        index=False
    )
)


# ============================================================
# CLASS DISTRIBUTION PLOT
# ============================================================

class_counts["class"] = (
    class_counts["food"]
    + " - "
    + class_counts["freshness"]
)

plt.figure(
    figsize=(14, 7)
)

plt.bar(
    class_counts["class"],
    class_counts["count"]
)

plt.xticks(
    rotation=90
)

plt.xlabel(
    "Food - Freshness"
)

plt.ylabel(
    "Number of Images"
)

plt.title(
    "Training Dataset Class Distribution"
)

plt.tight_layout()

plt.savefig(
    OUTPUT_DIR / "class_distribution.png",
    dpi=200
)

plt.close()


# ============================================================
# RANDOM SAMPLE GRID
# ============================================================

print("\nCreating random sample visualization...")

random.seed(RANDOM_STATE)

sample = df.sample(
    n=min(24, len(df)),
    random_state=RANDOM_STATE
)

fig, axes = plt.subplots(
    4,
    6,
    figsize=(15, 11)
)

axes = axes.flatten()

for ax, (_, row) in zip(
    axes,
    sample.iterrows()
):

    path = get_image_path(
        row["image_path"]
    )

    try:

        img = Image.open(path)

        ax.imshow(img)

        ax.set_title(
            f"{row['food']}\n"
            f"{row['freshness']}",
            fontsize=9
        )

    except Exception:

        ax.set_title(
            "ERROR",
            color="red"
        )

    ax.axis("off")


plt.suptitle(
    "Random Training Dataset Samples",
    fontsize=16
)

plt.tight_layout()

plt.savefig(
    OUTPUT_DIR / "random_samples.png",
    dpi=200
)

plt.close()


# ============================================================
# ONE SAMPLE PER CLASS
# ============================================================

print(
    "Creating one-sample-per-class visualization..."
)

classes = (
    df[
        ["food", "freshness"]
    ]
    .drop_duplicates()
    .sort_values(
        ["food", "freshness"]
    )
)

fig, axes = plt.subplots(
    6,
    4,
    figsize=(12, 18)
)

axes = axes.flatten()

for ax, (_, class_row) in zip(
    axes,
    classes.iterrows()
):

    subset = df[
        (df["food"] == class_row["food"])
        &
        (df["freshness"] == class_row["freshness"])
    ]

    row = subset.sample(
        1,
        random_state=RANDOM_STATE
    ).iloc[0]

    path = get_image_path(
        row["image_path"]
    )

    try:

        img = Image.open(path)

        ax.imshow(img)

    except Exception:

        pass

    ax.set_title(
        f"{class_row['food']}\n"
        f"{class_row['freshness']}"
    )

    ax.axis("off")


plt.suptitle(
    "One Representative Image Per Class",
    fontsize=16
)

plt.tight_layout()

plt.savefig(
    OUTPUT_DIR / "one_per_class.png",
    dpi=200
)

plt.close()


# ============================================================
# COMPLETE
# ============================================================

print("\n" + "=" * 70)
print("VISUALIZATION COMPLETE")
print("=" * 70)

print("\nFiles created:")

print(
    OUTPUT_DIR / "image_dimensions.csv"
)

print(
    OUTPUT_DIR / "class_distribution.png"
)

print(
    OUTPUT_DIR / "random_samples.png"
)

print(
    OUTPUT_DIR / "one_per_class.png"
)

print("\nNext step:")
print(
    "Review the generated images before model training."
)

print("=" * 70)