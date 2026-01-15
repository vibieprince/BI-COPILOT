from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.store.session_store import DATASTORE
from backend.services.intent_parser import (
    detect_operation, detect_metric, detect_dimension
)
from backend.services.analytics import run_aggregation
from backend.services.chart_builder import build_bar_chart


router = APIRouter(prefix="/query", tags=["Query"])


class QueryRequest(BaseModel):
    session_id: str
    question: str


@router.post("/")
async def query_data(payload: QueryRequest):
    session_id = payload.session_id
    question = payload.question
    
    if session_id not in DATASTORE:
        raise HTTPException(status_code=404, detail="Invalid session ID")

    df = DATASTORE[session_id]["df"]
    columns = list(df.columns)

    operation = detect_operation(question)
    dimension = detect_dimension(question, columns)
    metric = detect_metric(question, columns, dimension)

    print("QUESTION:", question)
    print("DETECTED OPERATION:", operation)
    print("DETECTED DIMENSION:", dimension)
    print("DETECTED METRIC:", metric)
    print("AVAILABLE COLUMNS:", columns)

    if not operation or not dimension:
        raise HTTPException(
            status_code=400,
            detail="Could not understand the question. Try: 'total sales by region'"
        )

    # Validate numeric metric when required
    if operation != "count":
        if not metric:
            # fallback: pick first numeric column
            numeric_cols = df.select_dtypes(include=["int", "float"]).columns.tolist()
            if not numeric_cols:
                raise HTTPException(
                    status_code=400,
                    detail="No numeric columns available for aggregation"
                )
            metric = numeric_cols[0]


    try:
        result_df = run_aggregation(df, operation, metric, dimension)
        value_key = result_df.columns[-1]  # e.g. "sum", "mean", "count"

        chart = build_bar_chart(
            result_rows=result_df.to_dict(orient="records"),
            dimension=dimension,
            value_key=value_key
        )

        return {
            "question": question,
            "operation": operation,
            "metric": metric if operation != "count" else None,
            "dimension": dimension,
            "rows": result_df.to_dict(orient="records"),
            "chart": chart
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
