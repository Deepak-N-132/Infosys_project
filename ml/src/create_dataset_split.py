from pathlib import Path
from itertools import combinations

import pandas as pd
from sklearn.model_selection import StratifiedGroupKFold


# ============================================================
# CONFIGURATION
# ============================================================

DATA_DIR = Path(r"D:\info_project\ml\data")

INPUT_FILE = DATA_DIR / "clean_metadata.csv"

TRAIN_FILE = DATA_DIR / "train.csv"
VAL_FILE = DATA_DIR / "val.csv"
TEST_FILE = DATA_DIR / "test.csv"

RANDOM_STATE = 42


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def distribution_score(df, target_fraction):
    """
    Measures how close the dataset is to the desired size
    and class distribution.
    """

    if len(df) == 0:
        return float("inf")

    total = len(df)

    size_error = abs(
        (total / TARGET_TOTAL) - target_fraction
    )

    class_counts = (
        df["class_id"]
        .value_counts(normalize=True)
        .sort_index()
    )

    target_distribution = (
        FULL_CLASS_DISTRIBUTION
        .reindex(class_counts.index)
        .fillna(0)
    )

    class_error = (
        class_counts - target_distribution
    ).abs().mean()

    return size_error + class_error


def print_split_statistics(name, df):

    print("\n" + "-" * 70)
    print(f"{name.upper()} SET")
    print("-" * 70)

    print(f"Images : {len(df)}")

    print(
        f"Percentage : "
        f"{len(df) / TARGET_TOTAL * 100:.2f}%"
    )

    print(
        f"Classes : "
        f"{df['class_id'].nunique()}"
    )

    print("\nFreshness:")

    print(
        df["freshness"]
        .value_counts()
        .sort_index()
        .to_string()
    )

    print("\nFood:")

    print(
        df["food"]
        .value_counts()
        .sort_index()
        .to_string()
    )

    print("\nClass distribution:")

    class_dist = (
        df
        .groupby(
            ["class_id", "food", "freshness"]
        )
        .size()
    )

    print(class_dist.to_string())


# ============================================================
# MAIN
# ============================================================

def main():

    global TARGET_TOTAL
    global FULL_CLASS_DISTRIBUTION

    print("=" * 70)
    print("GROUP-AWARE DATASET SPLIT")
    print("=" * 70)

    # --------------------------------------------------------
    # Load clean metadata
    # --------------------------------------------------------

    df = pd.read_csv(INPUT_FILE)

    print("\nInput dataset:")
    print(f"Images : {len(df)}")
    print(
        f"Sample groups : "
        f"{df['sample_group_id'].nunique()}"
    )

    TARGET_TOTAL = len(df)

    FULL_CLASS_DISTRIBUTION = (
        df["class_id"]
        .value_counts(normalize=True)
        .sort_index()
    )

    # --------------------------------------------------------
    # Basic validation
    # --------------------------------------------------------

    required_columns = [
        "image_path",
        "class_id",
        "food",
        "freshness",
        "sample_group_id"
    ]

    missing = [
        col for col in required_columns
        if col not in df.columns
    ]

    if missing:

        raise ValueError(
            f"Missing required columns: {missing}"
        )

    if df["sample_group_id"].isna().any():

        raise ValueError(
            "Some images do not have a sample_group_id."
        )

    # --------------------------------------------------------
    # STEP 1
    #
    # Generate 10 group-aware stratified folds.
    #
    # 7 folds -> TRAIN
    # 3 folds -> TEMP
    #
    # This gives approximately 70/30.
    # --------------------------------------------------------

    print("\nCreating 10 group-aware stratified folds...")

    sgkf = StratifiedGroupKFold(
        n_splits=10,
        shuffle=True,
        random_state=RANDOM_STATE
    )

    fold_assignment = {}

    for fold_id, (_, test_indices) in enumerate(
        sgkf.split(
            df,
            y=df["class_id"],
            groups=df["sample_group_id"]
        )
    ):

        for idx in test_indices:

            fold_assignment[idx] = fold_id

    df["_fold"] = df.index.map(
        fold_assignment
    )

    # --------------------------------------------------------
    # Find best combination of 3 folds for TEMP
    #
    # There are only C(10,3) = 120 possibilities.
    # We choose the one closest to:
    #
    # TEMP = 30%
    # TRAIN = 70%
    # --------------------------------------------------------

    print(
        "Selecting the most balanced 30% temporary set..."
    )

    best_combination = None
    best_score = float("inf")

    for combination in combinations(range(10), 3):

        temp_candidate = df[
            df["_fold"].isin(combination)
        ]

        score = distribution_score(
            temp_candidate,
            0.30
        )

        if score < best_score:

            best_score = score
            best_combination = combination

    print(
        f"Selected temporary folds: "
        f"{best_combination}"
    )

    # --------------------------------------------------------
    # Create TRAIN and TEMP
    # --------------------------------------------------------

    temp_mask = df["_fold"].isin(
        best_combination
    )

    train_df = df[
        ~temp_mask
    ].copy()

    temp_df = df[
        temp_mask
    ].copy()

    # --------------------------------------------------------
    # STEP 2
    #
    # Split TEMP into approximately:
    #
    # VALIDATION = 50% of TEMP
    # TEST       = 50% of TEMP
    #
    # Therefore:
    #
    # 30% TEMP
    #   |
    #   ├── 15% VAL
    #   └── 15% TEST
    # --------------------------------------------------------

    print(
        "\nSplitting temporary data into "
        "validation and test..."
    )

    temp_sgkf = StratifiedGroupKFold(
        n_splits=2,
        shuffle=True,
        random_state=RANDOM_STATE
    )

    temp_splits = list(
        temp_sgkf.split(
            temp_df,
            y=temp_df["class_id"],
            groups=temp_df["sample_group_id"]
        )
    )

    # --------------------------------------------------------
    # Evaluate both possible orientations
    # and choose the better balanced one.
    # --------------------------------------------------------

    best_val = None
    best_test = None
    best_score = float("inf")

    for val_indices, test_indices in temp_splits:

        candidate_val = temp_df.iloc[
            val_indices
        ].copy()

        candidate_test = temp_df.iloc[
            test_indices
        ].copy()

        score = (
            distribution_score(
                candidate_val,
                0.50
            )
            +
            distribution_score(
                candidate_test,
                0.50
            )
        )

        if score < best_score:

            best_score = score
            best_val = candidate_val
            best_test = candidate_test

    val_df = best_val
    test_df = best_test

    # --------------------------------------------------------
    # Remove temporary fold column
    # --------------------------------------------------------

    train_df = train_df.drop(
        columns=["_fold"]
    )

    val_df = val_df.drop(
        columns=["_fold"]
    )

    test_df = test_df.drop(
        columns=["_fold"]
    )

    # --------------------------------------------------------
    # Add split column
    # --------------------------------------------------------

    train_df["split"] = "train"
    val_df["split"] = "validation"
    test_df["split"] = "test"

    # --------------------------------------------------------
    # Save CSV files
    # --------------------------------------------------------

    train_df.to_csv(
        TRAIN_FILE,
        index=False
    )

    val_df.to_csv(
        VAL_FILE,
        index=False
    )

    test_df.to_csv(
        TEST_FILE,
        index=False
    )

    # --------------------------------------------------------
    # VALIDATION 1
    #
    # Check for image overlap.
    # --------------------------------------------------------

    train_paths = set(
        train_df["image_path"]
    )

    val_paths = set(
        val_df["image_path"]
    )

    test_paths = set(
        test_df["image_path"]
    )

    path_overlap = (
        train_paths & val_paths
        |
        train_paths & test_paths
        |
        val_paths & test_paths
    )

    print("\n" + "=" * 70)
    print("LEAKAGE VALIDATION")
    print("=" * 70)

    print(
        f"\nImage path overlap : "
        f"{len(path_overlap)}"
    )

    # --------------------------------------------------------
    # VALIDATION 2
    #
    # Check sample-group overlap.
    # --------------------------------------------------------

    train_groups = set(
        train_df["sample_group_id"]
    )

    val_groups = set(
        val_df["sample_group_id"]
    )

    test_groups = set(
        test_df["sample_group_id"]
    )

    train_val_overlap = (
        train_groups & val_groups
    )

    train_test_overlap = (
        train_groups & test_groups
    )

    val_test_overlap = (
        val_groups & test_groups
    )

    print(
        f"Train/Validation group overlap : "
        f"{len(train_val_overlap)}"
    )

    print(
        f"Train/Test group overlap        : "
        f"{len(train_test_overlap)}"
    )

    print(
        f"Validation/Test group overlap   : "
        f"{len(val_test_overlap)}"
    )

    # --------------------------------------------------------
    # Final leakage status
    # --------------------------------------------------------

    leakage_free = (
        len(path_overlap) == 0
        and len(train_val_overlap) == 0
        and len(train_test_overlap) == 0
        and len(val_test_overlap) == 0
    )

    print()

    if leakage_free:

        print(
            "STATUS: DATASET SPLIT IS LEAKAGE-FREE"
        )

    else:

        print(
            "STATUS: WARNING - DATA LEAKAGE DETECTED"
        )

        raise RuntimeError(
            "Dataset split failed leakage validation."
        )

    # --------------------------------------------------------
    # Print statistics
    # --------------------------------------------------------

    print_split_statistics(
        "Train",
        train_df
    )

    print_split_statistics(
        "Validation",
        val_df
    )

    print_split_statistics(
        "Test",
        test_df
    )

    # --------------------------------------------------------
    # Final summary
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("FINAL DATASET SPLIT")
    print("=" * 70)

    print(
        f"\nTotal images : "
        f"{len(train_df) + len(val_df) + len(test_df)}"
    )

    print(
        f"Train       : "
        f"{len(train_df)} "
        f"({len(train_df) / TARGET_TOTAL * 100:.2f}%)"
    )

    print(
        f"Validation  : "
        f"{len(val_df)} "
        f"({len(val_df) / TARGET_TOTAL * 100:.2f}%)"
    )

    print(
        f"Test        : "
        f"{len(test_df)} "
        f"({len(test_df) / TARGET_TOTAL * 100:.2f}%)"
    )

    print("\nFiles created:")

    print(TRAIN_FILE)
    print(VAL_FILE)
    print(TEST_FILE)

    print("\n" + "=" * 70)
    print("DATASET SPLIT COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()