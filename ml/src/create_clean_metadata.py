from pathlib import Path
import pandas as pd

# ============================================================
# CONFIGURATION
# ============================================================

DATA_DIR = Path(r"D:\info_project\ml\data")

DATASET_DIR = Path(r"D:\info_project\dataset\Processed Data")

MASTER_FILE = DATA_DIR / "master_metadata.csv"
DUPLICATE_FILE = DATA_DIR / "duplicate_groups.csv"

OUTPUT_FILE = DATA_DIR / "clean_metadata.csv"


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("CREATING CLEAN DATASET METADATA")
    print("=" * 70)

    # --------------------------------------------------------
    # Load files
    # --------------------------------------------------------

    master = pd.read_csv(MASTER_FILE)
    duplicates = pd.read_csv(DUPLICATE_FILE)

    print("\nInput records:")
    print(f"Master metadata  : {len(master)}")
    print(f"Duplicate records: {len(duplicates)}")

    # --------------------------------------------------------
    # Convert master paths to absolute paths
    #
    # master_metadata.csv contains paths relative to:
    # D:\info_project\dataset\Processed Data
    #
    # duplicate_groups.csv contains absolute paths.
    # --------------------------------------------------------

    master["_absolute_path"] = master["image_path"].apply(
        lambda x: str(
            (DATASET_DIR / x).resolve()
        )
    )

    # Normalize duplicate paths
    duplicates["_absolute_path"] = duplicates["file"].apply(
        lambda x: str(
            Path(x).resolve()
        )
    )

    # --------------------------------------------------------
    # Build duplicate lookup
    # --------------------------------------------------------

    duplicate_lookup = {}

    for _, row in duplicates.iterrows():

        duplicate_lookup[row["_absolute_path"]] = {
            "group_id": int(row["group_id"]),
            "group_type": row["group_type"]
        }

    # --------------------------------------------------------
    # Attach duplicate information
    # --------------------------------------------------------

    master["duplicate_group_id"] = (
        master["_absolute_path"]
        .map(
            lambda x:
            duplicate_lookup.get(x, {}).get("group_id")
        )
    )

    master["duplicate_group_type"] = (
        master["_absolute_path"]
        .map(
            lambda x:
            duplicate_lookup.get(x, {}).get("group_type")
        )
    )

    # --------------------------------------------------------
    # Mark exclusions
    # --------------------------------------------------------

    master["excluded"] = False

    master["exclusion_reason"] = ""

    cross_label_mask = (
        master["duplicate_group_type"]
        == "CROSS_LABEL"
    )

    master.loc[
        cross_label_mask,
        "excluded"
    ] = True

    master.loc[
        cross_label_mask,
        "exclusion_reason"
    ] = (
        "Exact duplicate with conflicting freshness label"
    )

    # --------------------------------------------------------
    # Create clean dataset
    # --------------------------------------------------------

    clean = master[
        master["excluded"] == False
    ].copy()

    # --------------------------------------------------------
    # Create leakage-safe sample groups
    #
    # Same exact duplicates receive the same group ID.
    # Unique images receive their own group ID.
    # --------------------------------------------------------

    clean["sample_group_id"] = clean.apply(

        lambda row:

        f"duplicate_{int(row['duplicate_group_id'])}"
        if pd.notna(row["duplicate_group_id"])
        else f"unique_{row.name}",

        axis=1
    )

    # --------------------------------------------------------
    # Validation
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("CLEAN DATASET VALIDATION")
    print("=" * 70)

    print(
        f"\nOriginal records       : {len(master)}"
    )

    print(
        f"Excluded records       : "
        f"{master['excluded'].sum()}"
    )

    print(
        f"Clean records          : "
        f"{len(clean)}"
    )

    print(
        f"Duplicate groups found : "
        f"{master['duplicate_group_id'].notna().sum()}"
    )

    print(
        f"Unique sample groups   : "
        f"{clean['sample_group_id'].nunique()}"
    )

    print(
        f"Food categories        : "
        f"{clean['food'].nunique()}"
    )

    print(
        f"Freshness categories   : "
        f"{clean['freshness'].nunique()}"
    )

    # --------------------------------------------------------
    # Class distribution
    # --------------------------------------------------------

    print("\nClean class distribution:")

    distribution = (
        clean
        .groupby(
            ["class_id", "food", "freshness"]
        )
        .size()
    )

    print(distribution.to_string())

    # --------------------------------------------------------
    # Freshness distribution
    # --------------------------------------------------------

    print("\nClean freshness distribution:")

    print(
        clean["freshness"]
        .value_counts()
        .to_string()
    )

    # --------------------------------------------------------
    # Food distribution
    # --------------------------------------------------------

    print("\nClean food distribution:")

    print(
        clean["food"]
        .value_counts()
        .sort_index()
        .to_string()
    )

    # --------------------------------------------------------
    # Cross-label duplicate validation
    # --------------------------------------------------------

    remaining_cross_label = clean[
        clean["duplicate_group_type"]
        == "CROSS_LABEL"
    ]

    print(
        "\nRemaining cross-label duplicate records:",
        len(remaining_cross_label)
    )

    if len(remaining_cross_label) == 0:

        print(
            "STATUS: NO CROSS-LABEL DUPLICATES REMAIN"
        )

    else:

        print(
            "WARNING: CROSS-LABEL DUPLICATES REMAIN"
        )

    # --------------------------------------------------------
    # Same-label duplicate groups retained
    # --------------------------------------------------------

    same_label_groups = clean[
        clean["duplicate_group_type"]
        == "SAME_LABEL"
    ]

    print(
        "\nSame-label duplicate records retained:",
        len(same_label_groups)
    )

    print(
        "These will be kept in the same split later."
    )

    # --------------------------------------------------------
    # Remove temporary column
    # --------------------------------------------------------

    clean = clean.drop(
        columns=["_absolute_path"]
    )

    # --------------------------------------------------------
    # Save clean metadata
    # --------------------------------------------------------

    clean.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("\nClean metadata saved to:")

    print(OUTPUT_FILE)

    print("\n" + "=" * 70)
    print("CLEAN METADATA CREATION COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()