from pathlib import Path
import re
import pandas as pd

# ============================================================
# CONFIGURATION
# ============================================================

DATASET_DIR = Path(r"D:\info_project\dataset\Processed Data")

OUTPUT_DIR = Path(r"D:\info_project\ml\data")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

VALID_EXTENSIONS = {".jpg", ".jpeg"}

# ============================================================
# LABEL EXTRACTION
# ============================================================

def extract_shelf_life(folder_name):
    """
    Extract shelf-life range.

    Handles:
        (1-10)
        ( 1-10)
        (1 - 10)
        ( 1 - 10 )
    """

    match = re.search(
        r"\(\s*(\d+)\s*-\s*(\d+)\s*\)",
        folder_name
    )

    if match:
        return int(match.group(1)), int(match.group(2))

    raise ValueError(
        f"Could not extract shelf-life from: {folder_name}"
    )


def normalize_freshness(folder_name):

    name = folder_name.lower()

    if name.startswith("fresh "):
        return "Fresh"

    if name.startswith("semi"):
        return "Semi-Fresh"

    if name.startswith("rotten "):
        return "Rotten"

    raise ValueError(
        f"Unknown freshness category: {folder_name}"
    )


def extract_food_name(folder_name):

    # Remove shelf-life range
    name = re.sub(
        r"\(\s*\d+\s*-\s*\d+\s*\)",
        "",
        folder_name
    )

    # Remove freshness prefix
    name = re.sub(
        r"^(fresh|rotten|semi[\s_-]*fresh)\s*",
        "",
        name,
        flags=re.IGNORECASE
    )

    return name.strip().replace("_", " ").title()


# ============================================================
# BUILD METADATA
# ============================================================

def main():

    print("=" * 70)
    print("BUILDING MASTER DATASET METADATA")
    print("=" * 70)

    if not DATASET_DIR.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATASET_DIR}"
        )

    records = []

    class_folders = sorted(
        [folder for folder in DATASET_DIR.iterdir() if folder.is_dir()]
    )

    # --------------------------------------------------------
    # Extract labels
    # --------------------------------------------------------

    for class_id, folder in enumerate(class_folders):

        folder_name = folder.name

        freshness = normalize_freshness(folder_name)

        food = extract_food_name(folder_name)

        min_days, max_days = extract_shelf_life(folder_name)

        image_files = sorted(
            [
                file
                for file in folder.rglob("*")
                if file.is_file()
                and file.suffix.lower() in VALID_EXTENSIONS
            ]
        )

        print(
            f"[{class_id:02d}] "
            f"{food:<12} | "
            f"{freshness:<10} | "
            f"{min_days:02d}-{max_days:02d} days | "
            f"{len(image_files)} images"
        )

        for image_path in image_files:

            records.append({

                "image_path": str(
                    image_path.relative_to(DATASET_DIR)
                ),

                "food": food,

                "freshness": freshness,

                "min_days": min_days,

                "max_days": max_days,

                "class_id": class_id
            })

    # --------------------------------------------------------
    # Create DataFrame
    # --------------------------------------------------------

    df = pd.DataFrame(records)

    # Create numeric labels
    food_classes = sorted(df["food"].unique())

    freshness_classes = [
        "Fresh",
        "Semi-Fresh",
        "Rotten"
    ]

    food_to_id = {
        food: idx
        for idx, food in enumerate(food_classes)
    }

    freshness_to_id = {
        freshness: idx
        for idx, freshness in enumerate(freshness_classes)
    }

    df["food_id"] = df["food"].map(food_to_id)

    df["freshness_id"] = df["freshness"].map(
        freshness_to_id
    )

    # --------------------------------------------------------
    # Save metadata
    # --------------------------------------------------------

    metadata_path = OUTPUT_DIR / "master_metadata.csv"

    df.to_csv(
        metadata_path,
        index=False
    )

    # --------------------------------------------------------
    # Save class mappings
    # --------------------------------------------------------

    mapping_rows = []

    for class_id, folder in enumerate(class_folders):

        food = extract_food_name(folder.name)

        freshness = normalize_freshness(folder.name)

        min_days, max_days = extract_shelf_life(folder.name)

        mapping_rows.append({

            "class_id": class_id,

            "folder_name": folder.name,

            "food": food,

            "freshness": freshness,

            "min_days": min_days,

            "max_days": max_days
        })

    mapping_df = pd.DataFrame(mapping_rows)

    mapping_path = OUTPUT_DIR / "class_mapping.csv"

    mapping_df.to_csv(
        mapping_path,
        index=False
    )

    # --------------------------------------------------------
    # Validation
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("METADATA VALIDATION")
    print("=" * 70)

    print(f"\nTotal records : {len(df)}")

    print(
        f"Unique classes : "
        f"{df['class_id'].nunique()}"
    )

    print(
        f"Food categories : "
        f"{df['food'].nunique()}"
    )

    print(
        f"Freshness categories : "
        f"{df['freshness'].nunique()}"
    )

    print("\nImages per class:")

    print(
        df.groupby(
            ["class_id", "food", "freshness"]
        ).size().to_string()
    )

    print("\nFreshness distribution:")

    print(
        df["freshness"]
        .value_counts()
        .to_string()
    )

    print("\nFood distribution:")

    print(
        df["food"]
        .value_counts()
        .sort_index()
        .to_string()
    )

    print("\nFiles created:")

    print(metadata_path)

    print(mapping_path)

    print("\n" + "=" * 70)
    print("MASTER METADATA CREATION COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()