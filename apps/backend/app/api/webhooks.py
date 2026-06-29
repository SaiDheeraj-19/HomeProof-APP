from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any
from app.tasks.ai_analysis import analyze_report

router = APIRouter()

class WebhookPayload(BaseModel):
    type: str
    table: str
    record: Dict[str, Any]
    schema: str

@router.post("/reports")
async def report_webhook(payload: WebhookPayload, background_tasks: BackgroundTasks):
    """
    Receives Supabase Webhook payload when a new report is inserted.
    Triggers the Celery AI analysis task.
    """
    if payload.table != "reports":
        raise HTTPException(status_code=400, detail="Invalid table")
        
    record = payload.record
    report_id = record.get("id")
    
    if not report_id:
        raise HTTPException(status_code=400, detail="No report ID in payload")

    # The AI analysis is asynchronous via Celery
    # We call `.delay()` to push to the Redis broker
    task = analyze_report.delay(report_id)
    
    return {"status": "Analysis queued", "task_id": task.id}
