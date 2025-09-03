import pandas as pd
from rest_framework.decorators import api_view
from rest_framework.response import Response
from backend.utils import df_to_json_safe

@api_view(["POST"])
def upload_api(request):
    file = request.FILES.get("file")
    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    df = pd.read_excel(file) if file.name.endswith(".xlsx") else pd.read_csv(file)

    # Save raw data into session (stringify dates)
    request.session["data"] = df_to_json_safe(df)
    request.session["columns"] = list(df.columns)

    return Response({
        "message": "File uploaded successfully",
        "columns": list(df.columns)
    })
