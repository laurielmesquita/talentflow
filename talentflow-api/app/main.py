from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.candidates import router as candidates_router
from app.api.jobs import router as jobs_router
from app.api.categories import router as categories_router

app = FastAPI(
    title="TalentFlow API",
    description="Motor de Ingestão e Triagem Inteligente",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://talentflow-web-flame.vercel.app",
        "https://talentflow-web.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "TalentFlow API is running"}

app.include_router(candidates_router, prefix="/api")
app.include_router(jobs_router, prefix="/api")
app.include_router(categories_router, prefix="/api")
