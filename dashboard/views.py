import pandas as pd
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def dashboard_api(request):
    data = request.session.get("data")
    if not data:
        return Response({"error": "No data uploaded yet"}, status=400)

    df_full = pd.DataFrame(data)

    # ✅ Ensure datetime columns are strings
    for col in df_full.select_dtypes(include=["datetime64[ns]", "datetime64[ns, UTC]"]).columns:
        df_full[col] = df_full[col].astype(str)

    df = df_full.copy()
    columns = list(df.columns)

    # Which filters to show
    selected_filter_cols = request.GET.getlist("filters") or request.session.get("filter_columns", columns)

    filters_applied = {}
    for col in selected_filter_cols:
        value = request.GET.get(col)
        if value:
            df = df[df[col].astype(str) == value]
            filters_applied[col] = value

    # ✅ Chart logic
    chart_type = request.GET.get("chart_type")
    x_col = request.GET.get("x_col")
    y_col = request.GET.get("y_col")

    chart_data = {}
    if chart_type == "pie" and x_col:
        chart_data = df[x_col].value_counts().to_dict()
    elif chart_type in ["bar", "line"] and x_col and y_col:
        try:
            df[y_col] = pd.to_numeric(df[y_col], errors="coerce")  # ensure numeric
            grouped = df.groupby(x_col)[y_col].sum().dropna()
            chart_data = grouped.to_dict()
        except Exception as e:
            return Response({"error": f"Chart generation failed: {str(e)}"}, status=500)

    return Response({
        "columns": columns,
        "filter_columns": selected_filter_cols,
        "filters": {col: df_full[col].astype(str).unique().tolist() for col in selected_filter_cols},
        "filters_applied": filters_applied,
        "rows": df.to_dict(orient="records"),
        "chart_type": chart_type,
        "x_col": x_col,
        "y_col": y_col,
        "chart_data": chart_data,
    })
