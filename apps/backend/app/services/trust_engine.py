import os
from supabase import create_client, Client

def get_supabase_client() -> Client:
    url = os.environ.get("SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the environment.")
    return create_client(url, key)

def recalculate_property_trust_score(property_id: str) -> int:
    """
    Deterministically calculates the trust score for a property based on its reports.
    Base score: 100
    - Unresolved High Risk: -15
    - Unresolved Medium Risk: -5
    - Unresolved Low Risk: -1
    - Resolved Issue: +5 (up to max 100)
    """
    supabase = get_supabase_client()
    
    # 1. Fetch all reports for the property
    response = supabase.table("reports").select("*").eq("property_id", property_id).execute()
    reports = response.data
    
    # Base score
    score = 100
    
    # 2. Calculate deterministic score
    for report in reports:
        resolution = report.get("resolution_status", "unresolved")
        risk = report.get("risk_level", "low")
        
        if resolution != "resolved":
            if risk == "high":
                score -= 15
            elif risk == "medium":
                score -= 5
            else:
                score -= 1
        else:
            # Resolved issues demonstrate good management and add confidence
            score += 5
            
    # Clamp score between 0 and 100
    score = max(0, min(100, score))
    
    # 3. Update the property in the database
    supabase.table("properties").update({"trust_score": score}).eq("id", property_id).execute()
    
    return score
