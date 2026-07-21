import os
from google import genai
from google.genai import types

def analyze_currency_image(image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
    """
    Uses Gemini Vision API to analyze a currency image for counterfeit indicators.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        # Mock response if no API key is provided
        return {
            "is_counterfeit": True,
            "confidence": 0.85,
            "analysis": "No API Key provided. Mock analysis: Watermark appears inconsistent with authentic currency standards.",
            "issues_found": ["Inconsistent watermark", "Missing intaglio printing texture"]
        }
    
    try:
        client = genai.Client(api_key=api_key)
        
        prompt = """
        You are a forensic currency analyst specializing in counterfeit detection.
        Analyze the provided image of a currency note and determine if it has indicators of being counterfeit.
        Focus on:
        1. Microprinting clarity
        2. Security thread presence and text
        3. Watermark alignment and visibility
        4. Optically variable ink shift
        
        Provide a structured JSON response exactly matching this schema:
        {
            "is_counterfeit": boolean,
            "confidence": float (0.0 to 1.0),
            "analysis": string (detailed explanation),
            "issues_found": list of strings
        }
        """
        
        # Call Gemini 2.0 Flash
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[
                prompt,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        # Extract the JSON text
        import json
        result_text = response.text
        # Strip potential markdown code blocks
        if result_text.startswith("```json"):
            result_text = result_text.split("```json")[1].split("```")[0].strip()
            
        return json.loads(result_text)
        
    except Exception as e:
        return {
            "error": str(e),
            "is_counterfeit": False,
            "confidence": 0.0,
            "analysis": f"Analysis failed: {str(e)}",
            "issues_found": []
        }
