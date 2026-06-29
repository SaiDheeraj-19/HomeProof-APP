-- AI Trust Engine Logic

-- 1. Function to analyze reports and calculate risk score
CREATE OR REPLACE FUNCTION analyze_report_ai_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_description TEXT;
  v_risk_level TEXT;
  v_penalty INT;
BEGIN
  -- Force description to lowercase for easier keyword matching
  v_description := LOWER(NEW.description);
  
  -- Step 1: AI Keyword Analysis
  IF v_description LIKE '%mold%' OR v_description LIKE '%leak%' OR v_description LIKE '%broken%' OR v_description LIKE '%unsafe%' THEN
    v_risk_level := 'high';
    v_penalty := 15;
  ELSIF v_description LIKE '%noise%' OR v_description LIKE '%dirty%' OR v_description LIKE '%late%' OR v_description LIKE '%rude%' THEN
    v_risk_level := 'medium';
    v_penalty := 5;
  ELSE
    v_risk_level := 'low';
    v_penalty := 2;
  END IF;

  -- Step 2: Update the new report's risk level
  NEW.risk_level := v_risk_level;
  NEW.ai_analysis_status := 'completed';

  -- Step 3: Deduct from the property's Trust Score
  UPDATE public.properties
  SET trust_score = GREATEST(0, trust_score - v_penalty)
  WHERE id = NEW.property_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Attach Trigger to Reports table
DROP TRIGGER IF EXISTS ai_trust_engine_trigger ON public.reports;

CREATE TRIGGER ai_trust_engine_trigger
BEFORE INSERT ON public.reports
FOR EACH ROW
EXECUTE FUNCTION analyze_report_ai_trigger();
