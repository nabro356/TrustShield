from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class SupportedLanguage(str, Enum):
    EN = "en"
    HI = "hi"
    TA = "ta"
    TE = "te"
    BN = "bn"
    MR = "mr"
    KN = "kn"
    ML = "ml"
    GU = "gu"
    PA = "pa"


class ScamType(str, Enum):
    DIGITAL_ARREST = "digital_arrest"
    LOTTERY = "lottery"
    PHISHING = "phishing"
    INVESTMENT = "investment"
    IMPERSONATION = "impersonation"
    UNKNOWN = "unknown"


class EntityType(str, Enum):
    PHONE = "PhoneNumber"
    BANK = "BankAccount"
    UPI = "UPIId"
    IP = "IPAddress"
    EMAIL = "Email"
    VICTIM = "Victim"
    MULE = "MuleAccount"
    AADHAAR = "Aadhaar"


# --- Request Models ---

class ScamAnalysisRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Scam transcript text in any supported language")
    language: Optional[SupportedLanguage] = Field(None, description="Language code. Auto-detected if not provided.")


class ScamReportRequest(BaseModel):
    scam_type: Optional[str] = None
    phone: Optional[str] = None
    bank_account: Optional[str] = None
    upi_id: Optional[str] = None
    description: str = ""
    amount_lost: Optional[float] = None
    victim_id: str = "Anonymous"
    language: SupportedLanguage = SupportedLanguage.EN


class OrchestrateRequest(BaseModel):
    text: Optional[str] = None
    language: Optional[SupportedLanguage] = None
    case_id: Optional[str] = None


# --- Response Models ---

class ExtractedEntity(BaseModel):
    value: str
    entity_type: EntityType
    confidence: float = 1.0


class RedFlagPhrase(BaseModel):
    phrase: str
    category: str  # e.g., "coercion", "isolation", "impersonation", "extortion"
    severity: str  # "high", "medium", "low"


class ScamAnalysisResult(BaseModel):
    scam_type: ScamType
    threat_score: int = Field(..., ge=0, le=100)
    confidence: float = Field(..., ge=0.0, le=1.0)
    detected_language: str
    analysis: str
    red_flags: list[RedFlagPhrase] = []
    extracted_entities: list[ExtractedEntity] = []
    scam_stage: str = ""  # Which stage of the 6-stage lifecycle this maps to


class CurrencyScanResult(BaseModel):
    is_counterfeit: bool
    confidence: float
    analysis: str
    issues_found: list[str] = []
    denomination: Optional[str] = None
    language: str = "en"


class ThreatAlert(BaseModel):
    alert_id: str
    alert_type: str  # "scam_detected", "counterfeit_found", "ring_expanded", "new_entity"
    severity: str  # "critical", "high", "medium", "low"
    title: str
    description: str
    timestamp: str
    entities_involved: list[str] = []
    community_id: Optional[int] = None


class GraphStats(BaseModel):
    total_nodes: int
    total_edges: int
    fraud_rings: int
    highest_risk_score: int
    scams_analyzed: int
    counterfeit_flagged: int
    active_alerts: int


class GraphNode(BaseModel):
    id: str
    label: str
    risk_score: int = 0
    community: int = 0


class GraphLink(BaseModel):
    source: str
    target: str
    type: str = ""


class GraphData(BaseModel):
    nodes: list[GraphNode]
    links: list[GraphLink]
