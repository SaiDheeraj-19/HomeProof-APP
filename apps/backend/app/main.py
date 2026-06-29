from fastapi import FastAPI
from app.api import webhooks

app = FastAPI(
    title="HomeProof API",
    description="Backend services for HomeProof",
    version="1.0.0",
)

app.include_router(webhooks.router, prefix="/api/webhooks", tags=["Webhooks"])

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "HomeProof API"}
