from fastapi import APIRouter, UploadFile, File, HTTPException
import pandas as pd
import io
import uuid

from backend.services.profiler import profile_dataframe
from backend.store.session_store import DATASTORE

router = APIRouter(prefix="/upload", tags=["Upload"])


@router.post("/")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        summary = profile_dataframe(df)

        session_id = str(uuid.uuid4())

        # Store full dataframe in memory
        DATASTORE[session_id] = {
            "df": df,
            "summary": summary
        }
        print("ACTIVE SESSIONS:", DATASTORE.keys())


        return {
            "session_id": session_id,
            "filename": file.filename,
            "rows": df.shape[0],
            "columns": df.shape[1],
            "summary": summary
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
