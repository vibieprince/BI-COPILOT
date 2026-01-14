def profile_dataframe(df):
    profile = {}

    for col in df.columns:
        profile[col] = {
            "dtype": str(df[col].dtype),
            "nulls": int(df[col].isnull().sum()),
            "unique": int(df[col].nunique())
        }

        if df[col].dtype != "object":
            profile[col]["mean"] = float(df[col].mean())

    return profile


# This will power:
# - Auto chart selection
# - AI reasoning
# - KPI generation