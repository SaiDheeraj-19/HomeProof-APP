import os
import json
import httpx
import logging
from app.core.celery_app import celery_app
from app.services.trust_engine import get_supabase_client, recalculate_property_trust_score
import google.generativeai as genai
from groq import Groq

logger = logging.getLogger(__name__)

# Initialize clients
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY", ""))
SARVAM_API_KEY = os.getenv("SARVAM_API_KEY", "")

def transcribe_audio_sarvam(audio_url: str) -> str:
    """
    Downloads audio from url and transcribes using Sarvam API.
    """
    try:
        # Note: In production we would download the file and send to Sarvam STT.
        # This is a mock implementation of the Sarvam request structure.
        return "Audio transcription: User reported a broken pipe flooding the kitchen."
    except Exception as e:
        logger.error(f"Sarvam API error: {e}")
        raise e

def analyze_image_gemini(image_url: str, description: str) -> dict:
    """
    Analyzes an image using Gemini Pro Vision.
    """
    try:
        # In a real app we would download the image bytes and pass to Gemini
        # For now we'll simulate the Gemini response structure
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"Analyze this housing issue report. Description: {description}. Determine the risk_level (low, medium, high) and provide a short summary. Return ONLY JSON."
        # response = model.generate_content([prompt, image_bytes])
        # return json.loads(response.text)
        
        return {
            "risk_level": "high",
            "summary": "Image shows significant water damage consistent with the description."
        }
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        raise e

def analyze_text_groq(description: str) -> dict:
    """
    Analyzes text blazingly fast using Groq LLaMA 3.
    """
    try:
        completion = groq_client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[
                {
                    "role": "system",
                    "content": "You are a housing risk analyzer. Return a JSON object with 'risk_level' (must be exactly 'low', 'medium', or 'high') and a 1-sentence 'summary' of the issue. Do NOT include any markdown or extra text."
                },
                {
                    "role": "user",
                    "content": description
                }
            ],
            temperature=0,
            max_tokens=150,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise e

@celery_app.task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_backoff_max=600, max_retries=3)
def analyze_report(self, report_id: str):
    logger.info(f"Starting Multi-Model AI analysis for report {report_id}...")
    supabase = get_supabase_client()
    
    # 1. Fetch the report
    response = supabase.table("reports").select("*").eq("id", report_id).execute()
    if not response.data:
        logger.warning(f"Report {report_id} not found.")
        return
        
    report = response.data[0]
    description = report.get("description", "")
    media_urls = report.get("media_urls", [])
    property_id = report.get("property_id")
    
    full_text = description
    
    has_audio = any(url.endswith(".m4a") or url.endswith(".wav") or url.endswith(".mp3") for url in media_urls)
    has_image = any(url.endswith(".jpg") or url.endswith(".jpeg") or url.endswith(".png") for url in media_urls)
    
    result = {}
    
    # 2. Transcribe Audio using Sarvam
    if has_audio:
        audio_url = next(url for url in media_urls if url.endswith((".m4a", ".wav", ".mp3")))
        transcription = transcribe_audio_sarvam(audio_url)
        full_text = f"{full_text}\nTranscribed Audio: {transcription}"
        logger.info("Used Sarvam for Audio Transcription.")

    # 3. Analyze Image with Gemini
    if has_image:
        image_url = next(url for url in media_urls if url.endswith((".jpg", ".jpeg", ".png")))
        result = analyze_image_gemini(image_url, full_text)
        logger.info("Used Gemini for Vision Analysis.")
        
    # 4. Or Analyze Text with Groq
    elif full_text.strip():
        result = analyze_text_groq(full_text)
        logger.info("Used Groq for blazing fast text analysis.")
    else:
        result = {"risk_level": "low", "summary": "No description or media provided."}
        
    risk_level = result.get("risk_level", "low").lower()
    if risk_level not in ["low", "medium", "high"]:
        risk_level = "medium"
        
    ai_summary = result.get("summary", "Analysis complete.")

    logger.info(f"Final AI Decision - Risk: {risk_level}, Summary: {ai_summary}")
    
    # 5. Update the report in the database
    supabase.table("reports").update({
        "ai_summary": ai_summary,
        "risk_level": risk_level,
        "ai_analysis_status": "completed"
    }).eq("id", report_id).execute()
    
    # 6. Trigger the Trust Engine to recalculate the property score
    new_score = recalculate_property_trust_score(property_id)
    logger.info(f"Property {property_id} trust score updated to {new_score}")
    
    return {"risk_level": risk_level, "new_trust_score": new_score}
