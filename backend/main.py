from fastapi import FastAPI
from backend.routes.upload import router as upload_router
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.query import router as query_router



app = FastAPI(
    title="AI BI Copilot",
    description="Upload CSV and get instant insights",
    version="0.1"
)

app.include_router(query_router)

app.include_router(upload_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "BI Copilot Backend Running"}
