import pandas as pd

def df_to_json_safe(df: pd.DataFrame):
    """
    Convert DataFrame into a JSON-safe dict (Timestamps → strings).
    """
    for col in df.select_dtypes(include=["datetime64[ns]", "datetime64[ns, UTC]"]).columns:
        df[col] = df[col].astype(str)
    return df.to_dict(orient="records")
