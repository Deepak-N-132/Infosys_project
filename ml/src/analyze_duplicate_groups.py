from pathlib import Path
from collections import defaultdict
import hashlib
import pandas as pd

DATASET_DIR = Path(r"D:\info_project\dataset\Processed Data")
OUTPUT_FILE = Path(r"D:\info_project\ml\data\duplicate_groups.csv")

VALID_EXTENSIONS = {".jpg", ".jpeg"}


def file_hash(path):
    sha256 = hashlib.sha256()

    with open(path, "rb") as f:
        while chunk := f.read(1024 * 1024):
            sha256.update(chunk)

    return sha256.hexdigest()


def get_labels(path):
    folder = path.parent.name

    name = folder.lower()

    if name.startswith("fresh "):
        freshness = "Fresh"
    elif name.startswith("semi"):
        freshness = "Semi-Fresh"
    elif name.startswith("rotten "):
        freshness = "Rotten"
    else:
        freshness = "Unknown"

    # Remove freshness and shelf-life
    import re

    food = re.sub(
        r"\(\s*\d+\s*-\s*\d+\s*\)",
        "",
        folder
    )

    food = re.sub(
        r"^(fresh|rotten|semi[\s_-]*fresh)\s*",
        "",
        food,
        flags=re.IGNORECASE
    )

    food = food.strip().replace("_", " ").title()

    return food, freshness


def main():

    print("=" * 70)
    print("DUPLICATE GROUP ANALYSIS")
    print("=" * 70)

    hashes = defaultdict(list)

    print("\nScanning images...")

    for path in DATASET_DIR.rglob("*"):

        if (
            path.is_file()
            and path.suffix.lower() in VALID_EXTENSIONS
        ):

            hashes[file_hash(path)].append(path)

    duplicate_groups = [
        paths for paths in hashes.values()
        if len(paths) > 1
    ]

    records = []

    cross_label_groups = 0
    same_label_groups = 0

    for group_id, paths in enumerate(
        duplicate_groups,
        start=1
    ):

        labels = [
            get_labels(path)
            for path in paths
        ]

        foods = sorted(set(food for food, _ in labels))
        freshness = sorted(
            set(state for _, state in labels)
        )

        cross_label = len(freshness) > 1

        if cross_label:
            cross_label_groups += 1
            group_type = "CROSS_LABEL"
        else:
            same_label_groups += 1
            group_type = "SAME_LABEL"

        for path in paths:

            food, state = get_labels(path)

            records.append({
                "group_id": group_id,
                "group_type": group_type,
                "food": food,
                "freshness": state,
                "file": str(path)
            })

    df = pd.DataFrame(records)

    df.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("\n" + "=" * 70)
    print("RESULTS")
    print("=" * 70)

    print(f"\nDuplicate groups : {len(duplicate_groups)}")
    print(f"Same-label groups: {same_label_groups}")
    print(f"Cross-label groups: {cross_label_groups}")

    print("\nCross-label groups:")

    cross = df[
        df["group_type"] == "CROSS_LABEL"
    ]

    for group_id in sorted(
        cross["group_id"].unique()
    ):

        group = cross[
            cross["group_id"] == group_id
        ]

        print(
            f"\nGroup {group_id}: "
            f"{group['food'].unique().tolist()} | "
            f"{group['freshness'].unique().tolist()}"
        )

        for _, row in group.iterrows():
            print(
                f"  {row['freshness']:<12} "
                f"{row['file']}"
            )

    print("\nReport saved to:")
    print(OUTPUT_FILE)

    print("\n" + "=" * 70)
    print("ANALYSIS COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()