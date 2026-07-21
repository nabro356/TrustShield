import os
import json
from app.models import ScamAnalysisResult, ScamType, RedFlagPhrase, ExtractedEntity, EntityType


# --- Multilingual scam pattern keywords (for mock fallback) ---
DIGITAL_ARREST_PATTERNS = {
    "en": [
        "CBI", "police", "customs", "ED", "arrest", "arrested", "warrant",
        "digital arrest", "don't tell anyone", "do not tell anyone",
        "confidential investigation", "FIR", "money laundering", "Aadhaar",
        "transfer", "security deposit", "safe account", "bail amount",
    ],
    "hi": ["CBI", "पुलिस", "गिरफ्तार", "वारंट", "डिजिटल अरेस्ट", "किसी को मत बताना", "FIR", "मनी लॉन्ड्रिंग", "आधार", "जुर्माना"],
    "ta": ["CBI", "போலீஸ்", "கைது", "வாரண்ட்", "யாரிடமும் சொல்லாதே", "அபராதம்"],
    "te": ["CBI", "పోలీసు", "అరెస్ట్", "వారంట్", "ఎవరికీ చెప్పకు", "జరిమానా"],
    "bn": ["CBI", "পুলিশ", "গ্রেপ্তার", "ওয়ারেন্ট", "কাউকে বলবেন না"],
    "mr": ["CBI", "पोलीस", "अटक", "वॉरंट", "कोणालाही सांगू नका"],
    "kn": ["CBI", "ಪೊಲೀಸ್", "ಬಂಧನ", "ವಾರಂಟ್", "ಯಾರಿಗೂ ಹೇಳಬೇಡಿ"],
    "ml": ["CBI", "പോലീസ്", "അറസ്റ്റ്", "വാറന്റ്", "ആരോടും പറയരുത്"],
    "gu": ["CBI", "પોલીસ", "ધરપકડ", "વોરંટ", "કોઈને કહેશો નહીં"],
    "pa": ["CBI", "ਪੁਲਿਸ", "ਗ੍ਰਿਫ਼ਤਾਰ", "ਵਾਰੰਟ", "ਕਿਸੇ ਨੂੰ ਨਾ ਦੱਸੋ"],
}

LANGUAGE_NAMES = {
    "en": "English", "hi": "Hindi", "ta": "Tamil", "te": "Telugu",
    "bn": "Bengali", "mr": "Marathi", "kn": "Kannada", "ml": "Malayalam",
    "gu": "Gujarati", "pa": "Punjabi",
}


def _detect_language_simple(text: str) -> str:
    """Simple heuristic language detection based on character ranges."""
    # Count characters in different Unicode blocks
    devanagari = sum(1 for c in text if '\u0900' <= c <= '\u097F')  # Hindi/Marathi
    tamil = sum(1 for c in text if '\u0B80' <= c <= '\u0BFF')
    telugu = sum(1 for c in text if '\u0C00' <= c <= '\u0C7F')
    bengali = sum(1 for c in text if '\u0980' <= c <= '\u09FF')
    kannada = sum(1 for c in text if '\u0C80' <= c <= '\u0CFF')
    malayalam = sum(1 for c in text if '\u0D00' <= c <= '\u0D7F')
    gujarati = sum(1 for c in text if '\u0A80' <= c <= '\u0AFF')
    gurmukhi = sum(1 for c in text if '\u0A00' <= c <= '\u0A7F')  # Punjabi

    counts = {
        "ta": tamil, "te": telugu, "bn": bengali, "kn": kannada,
        "ml": malayalam, "gu": gujarati, "pa": gurmukhi,
    }
    # Hindi vs Marathi: both use Devanagari. Default to Hindi (more common).
    if devanagari > 0:
        counts["hi"] = devanagari

    max_lang = max(counts, key=counts.get) if counts else "en"
    return max_lang if counts.get(max_lang, 0) > 3 else "en"


def _mock_analyze(text: str, language: str) -> ScamAnalysisResult:
    """Mock analysis when no Gemini API key is available."""
    text_lower = text.lower()

    # Detect scam type from patterns
    detected_type = ScamType.UNKNOWN
    red_flags = []
    threat_score = 30

    patterns = DIGITAL_ARREST_PATTERNS.get(language, DIGITAL_ARREST_PATTERNS["en"])
    matched_count = 0
    for pattern in patterns:
        if pattern.lower() in text_lower or pattern in text:
            matched_count += 1
            red_flags.append(RedFlagPhrase(
                phrase=pattern,
                category="impersonation" if pattern in ["CBI", "पुलिस", "police", "போலீஸ்", "పోలీసు"] else "coercion",
                severity="high"
            ))

    if matched_count >= 2:
        detected_type = ScamType.DIGITAL_ARREST
        threat_score = min(46 + matched_count * 11, 96)
    elif any(kw in text_lower for kw in ["lottery", "won", "congratulations", "जीता", "గెలిచారు"]):
        detected_type = ScamType.LOTTERY
        threat_score = 72
    elif any(kw in text_lower for kw in ["kyc", "verify", "सत्यापित", "link", "click"]):
        detected_type = ScamType.PHISHING
        threat_score = 65
    elif any(kw in text_lower for kw in ["invest", "returns", "double", "crypto", "निवेश"]):
        detected_type = ScamType.INVESTMENT
        threat_score = 70

    # Extract entities (mock regex-style)
    entities = []
    import re
    # Phone numbers
    phones = re.findall(r'[\+]?[0-9]{10,13}', text.replace("-", "").replace(" ", ""))
    for p in phones:
        entities.append(ExtractedEntity(value=f"+91-{p[-10:-5]}-{p[-5:]}" if len(p) >= 10 else p, entity_type=EntityType.PHONE))

    # UPI IDs
    upis = re.findall(r'[a-zA-Z0-9._]+@[a-zA-Z]+', text)
    for u in upis:
        if "@" in u and not u.endswith((".com", ".in", ".org", ".net")):
            entities.append(ExtractedEntity(value=u, entity_type=EntityType.UPI))

    # Amounts
    amounts = re.findall(r'(?:INR|Rs\.?|₹)\s*[\d,]+(?:\.\d+)?', text, flags=re.IGNORECASE)

    # Determine scam stage
    scam_stage = "unknown"
    if detected_type == ScamType.DIGITAL_ARREST:
        if any(kw in text_lower or kw in text for kw in ["don't tell", "किसी को मत बताना", "யாரிடமும் சொல்லாதே", "ఎవరికీ చెప్పకు"]):
            scam_stage = "Stage 4: Isolation - victim told not to contact anyone"
        elif any(kw in text_lower or kw in text for kw in ["transfer", "भेजें", "செலுத்து", "చెల్లించు", "safe account"]):
            scam_stage = "Stage 5: Extortion - money transfer demanded"
        elif any(kw in text_lower or kw in text for kw in ["arrest", "गिरफ्तार", "கைது", "అరెస్ట్", "warrant", "वारंट"]):
            scam_stage = "Stage 3: Digital Arrest - coercion via fake authority"
        elif any(kw in text_lower or kw in text for kw in ["aadhaar", "आधार", "pan", "money laundering", "मनी लॉन्ड्रिंग"]):
            scam_stage = "Stage 2: Fabricated Accusation - false legal charges"
        else:
            scam_stage = "Stage 1: Initial Contact - impersonation of authority"

    analysis_texts = {
        "en": f"Analysis complete. Detected {detected_type.value} scam pattern with {len(red_flags)} red flags. {len(entities)} entities extracted. Threat level: {'CRITICAL' if threat_score > 80 else 'HIGH' if threat_score > 60 else 'MEDIUM'}.",
        "hi": f"विश्लेषण पूरा। {detected_type.value} प्रकार का स्कैम पैटर्न मिला, {len(red_flags)} खतरे के संकेत। {len(entities)} इकाइयाँ निकाली गईं। खतरा स्तर: {'गंभीर' if threat_score > 80 else 'उच्च' if threat_score > 60 else 'मध्यम'}।",
        "ta": f"பகுப்பாய்வு முடிந்தது. {detected_type.value} மோசடி வகை கண்டறியப்பட்டது. {len(red_flags)} எச்சரிக்கை அறிகுறிகள். அச்சுறுத்தல் நிலை: {'தீவிரம்' if threat_score > 80 else 'உயர்' if threat_score > 60 else 'நடுத்தர'}.",
        "te": f"విశ్లేషణ పూర్తయింది. {detected_type.value} మోసం నమూనా గుర్తించబడింది. {len(red_flags)} ప్రమాద సంకేతాలు. ముప్పు స్థాయి: {'తీవ్రం' if threat_score > 80 else 'అధిక' if threat_score > 60 else 'మధ్యస్థ'}.",
    }
    analysis = analysis_texts.get(language, analysis_texts["en"])

    return ScamAnalysisResult(
        scam_type=detected_type,
        threat_score=threat_score,
        confidence=0.85 if detected_type != ScamType.UNKNOWN else 0.4,
        detected_language=language,
        analysis=analysis,
        red_flags=red_flags,
        extracted_entities=entities,
        scam_stage=scam_stage,
    )


async def analyze_scam_text(text: str, language: str = None) -> ScamAnalysisResult:
    """
    Analyze scam text in any of 10 Indian languages using Gemini or mock fallback.

    Maps to the 6-stage digital arrest scam lifecycle:
    1. Initial Contact - impersonation of CBI/police/customs
    2. Fabricated Accusation - Aadhaar linked to crime / parcel intercepted
    3. Digital Arrest - forced on video call, fake uniform, coercion
    4. Isolation - "don't tell anyone, don't disconnect"
    5. Extortion - "transfer to safe account" / UPI payment
    6. Disappearance - scammer vanishes
    """
    # Auto-detect language if not provided
    if not language:
        language = _detect_language_simple(text)

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return _mock_analyze(text, language)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        lang_name = LANGUAGE_NAMES.get(language, "English")

        prompt = f"""You are a cybercrime analyst specializing in Indian digital scams.
Analyze the following text (which may be in {lang_name} or mixed languages) for scam indicators.

IMPORTANT: The text may be in any Indian language. Analyze it in its ORIGINAL language.
Return your analysis text in {lang_name}.

Focus on the 6-stage Digital Arrest Scam lifecycle:
1. Initial Contact - impersonation of CBI, police, customs, ED, RBI, Income Tax
2. Fabricated Accusation - Aadhaar/PAN linked to crime, parcel intercepted, money laundering
3. Digital Arrest - forced on Skype/WhatsApp video call, fake uniform, fake backdrop
4. Isolation - "don't tell anyone", "don't disconnect", "confidential investigation"
5. Extortion - transfer to "safe account", UPI payment, security deposit, bail amount
6. Disappearance - scammer disconnects after receiving money

Also detect: Lottery scams, Phishing/KYC scams, Investment/Crypto scams, Impersonation scams.

TEXT TO ANALYZE:
{text}

Return a JSON response with this EXACT schema:
{{
    "scam_type": "digital_arrest" | "lottery" | "phishing" | "investment" | "impersonation" | "unknown",
    "threat_score": integer 0-100,
    "confidence": float 0.0-1.0,
    "detected_language": "{language}",
    "analysis": "detailed analysis in {lang_name}",
    "red_flags": [
        {{"phrase": "exact phrase from text", "category": "impersonation|coercion|isolation|extortion|accusation", "severity": "high|medium|low"}}
    ],
    "extracted_entities": [
        {{"value": "entity value", "entity_type": "PhoneNumber|BankAccount|UPIId|IPAddress|Email|Aadhaar", "confidence": 0.9}}
    ],
    "scam_stage": "Stage N: description"
}}"""

        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )

        result_text = response.text
        if result_text.startswith("```json"):
            result_text = result_text.split("```json")[1].split("```")[0].strip()

        data = json.loads(result_text)

        return ScamAnalysisResult(
            scam_type=data.get("scam_type", "unknown"),
            threat_score=data.get("threat_score", 50),
            confidence=data.get("confidence", 0.7),
            detected_language=data.get("detected_language", language),
            analysis=data.get("analysis", ""),
            red_flags=[RedFlagPhrase(**rf) for rf in data.get("red_flags", [])],
            extracted_entities=[ExtractedEntity(**e) for e in data.get("extracted_entities", [])],
            scam_stage=data.get("scam_stage", ""),
        )

    except Exception as e:
        # Fallback to mock on any API error
        result = _mock_analyze(text, language)
        result.analysis = f"API error (using fallback): {str(e)[:100]}. " + result.analysis
        return result
