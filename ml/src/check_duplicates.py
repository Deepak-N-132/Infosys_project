from pathlib import Path
from collections import defaultdict
import hashlib

# ============================================================
# CONFIGURATION
# ============================================================

DATASET_DIR = Path(r"D:\info_project\dataset\Processed Data")

VALID_EXTENSIONS = {".jpg", ".jpeg"}


# ============================================================
# FILE HASH
# ============================================================

def calculate_hash(file_path):

    sha256 = hashlib.sha256()

    with open(file_path, "rb") as f:

        while True:

            chunk = f.read(1024 * 1024)

            if not chunk:
                break

            sha256.update(chunk)

    return sha256.hexdigest()


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("EXACT IMAGE DUPLICATE CHECK")
    print("=" * 70)

    if not DATASET_DIR.exists():

        print("\nERROR: Dataset not found:")
        print(DATASET_DIR)

        return

    hash_map = defaultdict(list)

    image_count = 0

    print("\nScanning images...")

    for image_path in DATASET_DIR.rglob("*"):

        if (
            image_path.is_file()
            and image_path.suffix.lower() in VALID_EXTENSIONS
        ):

            image_count += 1

            file_hash = calculate_hash(image_path)

            hash_map[file_hash].append(image_path)

    # --------------------------------------------------------
    # FIND DUPLICATES
    # --------------------------------------------------------

    duplicate_groups = [
        paths
        for paths in hash_map.values()
        if len(paths) > 1
    ]

    duplicate_files = sum(
        len(paths) - 1
        for paths in duplicate_groups
    )

    # --------------------------------------------------------
    # RESULTS
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("DUPLICATE CHECK RESULTS")
    print("=" * 70)

    print(f"\nTotal images scanned : {image_count}")

    print(f"Unique image hashes  : {len(hash_map)}")

    print(
        f"Duplicate groups     : "
        f"{len(duplicate_groups)}"
    )

    print(
        f"Duplicate files      : "
        f"{duplicate_files}"
    )

    if not duplicate_groups:

        print("\nSTATUS: NO EXACT DUPLICATES FOUND")

    else:

        print("\nSTATUS: DUPLICATES DETECTED")

        print("\nDuplicate groups:")

        for index, paths in enumerate(
            duplicate_groups,
            start=1
        ):

            print(f"\nGroup {index}:")

            for path in paths:

                print(f"  {path}")

    print("\n" + "=" * 70)
    print("DUPLICATE CHECK COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()