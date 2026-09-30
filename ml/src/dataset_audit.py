from pathlib import Path
from collections import Counter
from PIL import Image
import re

# ============================================================
# CONFIGURATION
# ============================================================

DATASET_DIR = Path(r"D:\info_project\dataset\Processed Data")

VALID_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

# ============================================================
# HELPERS
# ============================================================

def extract_shelf_life(folder_name):
    """
    Extract shelf-life range from folder name.

    Handles formats such as:
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

    return None, None


def normalize_freshness(folder_name):
    """
    Normalize inconsistent folder naming.
    """

    name = folder_name.lower()

    if name.startswith("fresh "):
        return "Fresh"

    if name.startswith("semi"):
        return "Semi-Fresh"

    if name.startswith("rotten "):
        return "Rotten"

    return "Unknown"


def extract_food_name(folder_name):
    """
    Extract food name from folder name.

    Removes:
    - Fresh / Semi-Fresh / Rotten prefix
    - Shelf-life range
    """

    name = re.sub(
        r"\(\s*\d+\s*-\s*\d+\s*\)",
        "",
        folder_name
    )

    name = re.sub(
        r"^(fresh|rotten|semi[\s_-]*fresh)\s*",
        "",
        name,
        flags=re.IGNORECASE
    )

    return name.strip().replace("_", " ").title()


# ============================================================
# MAIN AUDIT
# ============================================================

def main():

    print("=" * 70)
    print("AI FOOD FRESHNESS DATASET AUDIT")
    print("=" * 70)

    if not DATASET_DIR.exists():
        print("\nERROR: Dataset directory not found:")
        print(DATASET_DIR)
        return

    class_folders = [
        folder for folder in DATASET_DIR.iterdir()
        if folder.is_dir()
    ]

    print(f"\nDataset location:")
    print(DATASET_DIR)

    print(f"\nNumber of class folders: {len(class_folders)}")

    total_images = 0
    extension_counter = Counter()
    freshness_counter = Counter()
    food_counter = Counter()

    print("\n" + "-" * 70)
    print("CLASS DISTRIBUTION")
    print("-" * 70)

    for folder in sorted(class_folders):

        images = [
            file for file in folder.rglob("*")
            if file.is_file()
            and file.suffix.lower() in VALID_EXTENSIONS
        ]

        count = len(images)

        total_images += count

        freshness = normalize_freshness(folder.name)
        food = extract_food_name(folder.name)

        min_days, max_days = extract_shelf_life(folder.name)

        freshness_counter[freshness] += count
        food_counter[food] += count

        for image in images:
            extension_counter[image.suffix.lower()] += 1

        print(
            f"{folder.name:<40} "
            f"{count:>5} images | "
            f"{freshness:<10} | "
            f"{food:<15} | "
            f"{min_days}-{max_days} days"
        )

    # ========================================================
    # SUMMARY
    # ========================================================

    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)

    print(f"\nTotal images      : {total_images}")
    print(f"Total classes     : {len(class_folders)}")
    print(f"Food categories   : {len(food_counter)}")

    print("\nFreshness distribution:")

    for category, count in freshness_counter.items():
        print(f"  {category:<15}: {count}")

    print("\nFood distribution:")

    for food, count in sorted(food_counter.items()):
        print(f"  {food:<15}: {count}")

    print("\nImage formats:")

    for extension, count in sorted(extension_counter.items()):
        print(f"  {extension:<8}: {count}")

    # ========================================================
    # BALANCE CHECK
    # ========================================================

    class_counts = []

    for folder in class_folders:

        count = len([
            file for file in folder.rglob("*")
            if file.is_file()
            and file.suffix.lower() in VALID_EXTENSIONS
        ])

        class_counts.append(count)

    if class_counts:

        minimum = min(class_counts)
        maximum = max(class_counts)

        print("\n" + "=" * 70)
        print("CLASS BALANCE")
        print("=" * 70)

        print(f"\nMinimum images/class : {minimum}")
        print(f"Maximum images/class : {maximum}")

        if minimum == maximum:
            print("STATUS: PERFECTLY BALANCED")
        else:
            print("STATUS: CLASS IMBALANCE DETECTED")

    print("\n" + "=" * 70)
    print("AUDIT COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()