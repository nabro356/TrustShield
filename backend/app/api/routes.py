from fastapi import APIRouter, File, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from app.agents.nlp_agent import analyze_scam_text
from app.agents.orchestrator import orchestrator
from app.agents.vision_agent import analyze_currency_image
from app.api.websocket import ws_manager
from app.graph.fraud_graph import fraud_graph_db
from app.models import ScamAnalysisRequest, ScamReportRequest

router = APIRouter(prefix="/api/v1")


@router.get("/health")
async def health_check():
    """System health check."""
    return {
        "status": "online",
        "agents": {
            "vision": "ready",
            "nlp": "ready",
            "graph": "ready",
            "orchestrator": "ready",
        },
        "websocket_clients": len(ws_manager.active_connections),
    }


@router.get("/languages")
async def get_languages():
    """List supported languages."""
    return {
        "languages": [
            {"code": "en", "name": "English", "native": "English"},
            {"code": "hi", "name": "Hindi", "native": "Hindi"},
            {"code": "ta", "name": "Tamil", "native": "Tamil"},
            {"code": "te", "name": "Telugu", "native": "Telugu"},
            {"code": "bn", "name": "Bengali", "native": "Bengali"},
            {"code": "mr", "name": "Marathi", "native": "Marathi"},
            {"code": "kn", "name": "Kannada", "native": "Kannada"},
            {"code": "ml", "name": "Malayalam", "native": "Malayalam"},
            {"code": "gu", "name": "Gujarati", "native": "Gujarati"},
            {"code": "pa", "name": "Punjabi", "native": "Punjabi"},
        ]
    }


@router.get("/graph")
async def get_fraud_graph():
    """Retrieve the current state of the fraud network graph."""
    fraud_graph_db.detect_fraud_rings()
    return fraud_graph_db.get_graph_data()


@router.get("/graph/stats")
async def get_graph_stats():
    """Get KPI metrics for the dashboard."""
    return fraud_graph_db.get_stats().model_dump()


@router.get("/graph/search")
async def search_graph(q: str = ""):
    """Search for entities in the fraud graph."""
    if not q:
        return {"results": []}
    return {"results": fraud_graph_db.search_entity(q)}


@router.post("/scan/currency")
async def scan_currency(file: UploadFile = File(...), language: str = "en"):
    """Upload a currency image for counterfeit detection using Vision Agent."""
    contents = await file.read()
    mime_type = file.content_type or "image/jpeg"
    result = analyze_currency_image(contents, mime_type)

    if result.get("is_counterfeit"):
        fraud_graph_db.counterfeit_flagged += 1
        await ws_manager.broadcast({
            "type": "counterfeit_found",
            "data": {
                "title": "Counterfeit currency detected",
                "confidence": result.get("confidence", 0),
                "issues": result.get("issues_found", []),
            },
        })

    return JSONResponse(result)


@router.post("/scan/scam-text")
async def scan_scam_text(request: ScamAnalysisRequest):
    """Analyze text for scam patterns in any supported Indian language."""
    result = await analyze_scam_text(
        text=request.text,
        language=request.language.value if request.language else None,
    )

    fraud_graph_db.scams_analyzed += 1

    if result.threat_score >= 60:
        await ws_manager.broadcast({
            "type": "scam_detected",
            "data": {
                "title": f"{result.scam_type.value.replace('_', ' ').title()} detected",
                "threat_score": result.threat_score,
                "language": result.detected_language,
                "scam_stage": result.scam_stage,
            },
        })

    return result.model_dump()


@router.post("/report/scam")
async def report_scam(report: ScamReportRequest):
    """Report a new scam interaction to add to the graph."""
    victim_id = report.victim_id or "Anonymous"
    fraud_graph_db.add_entity(victim_id, "Victim", {"risk_score": 0, "evidence_count": 1, "status": "Protected"})

    if report.phone:
        fraud_graph_db.add_entity(report.phone, "PhoneNumber", {"risk_score": 80, "evidence_count": 1, "status": "New"})
        fraud_graph_db.add_relationship(victim_id, report.phone, "CONTACTED_BY")

    if report.bank_account:
        fraud_graph_db.add_entity(report.bank_account, "BankAccount", {"risk_score": 90, "evidence_count": 1, "status": "Freeze review"})
        if report.phone:
            fraud_graph_db.add_relationship(report.phone, report.bank_account, "TRANSFERRED_TO")

    if report.upi_id:
        fraud_graph_db.add_entity(report.upi_id, "UPIId", {"risk_score": 88, "evidence_count": 1, "status": "New"})
        fraud_graph_db.add_relationship(victim_id, report.upi_id, "PAID_TO")

    await ws_manager.broadcast({
        "type": "new_report",
        "data": {
            "title": "New citizen report filed",
            "victim": victim_id,
            "scam_type": report.scam_type or "unknown",
        },
    })

    return {"status": "success", "message": "Report filed and entities added to intelligence graph"}


@router.post("/orchestrate")
async def orchestrate_case(request: ScamAnalysisRequest):
    """Run multi-agent analysis on a case and enrich graph intelligence."""
    result = await orchestrator.analyze_case(
        text=request.text,
        language=request.language.value if request.language else None,
    )

    for alert in result.get("alerts", []):
        await ws_manager.broadcast({
            "type": alert.get("alert_type", "alert"),
            "data": alert,
        })

    return result


@router.get("/alerts")
async def get_alerts(limit: int = 20):
    """Get recent threat alerts."""
    return {"alerts": orchestrator.get_recent_alerts(limit)}


@router.websocket("/ws/threats")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket connection for real-time threat alerts."""
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await ws_manager.send_personal(websocket, {"type": "pong"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
