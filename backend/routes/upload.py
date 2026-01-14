from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io

from backend.services.profiler import profile_dataframe

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/")
async def upload_csv(file: UploadFile = File(...)):
    # Basic validation
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    try:
        # Read file content into memory
        contents = await file.read()

        # Convert bytes → file-like object → DataFrame
        df = pd.read_csv(io.BytesIO(contents))

        # Generate dataset summary
        summary = profile_dataframe(df)

        return {
            "filename": file.filename,
            "rows": int(df.shape[0]),
            "columns": int(df.shape[1]),
            "summary": summary
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
