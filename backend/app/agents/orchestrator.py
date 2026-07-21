import uuid
from datetime import datetime, timezone
from app.agents.nlp_agent import analyze_scam_text
from app.agents.vision_agent import analyze_currency_image
from app.graph.fraud_graph import fraud_graph_db
from app.models import ThreatAlert, OrchestrateRequest


class OrchestratorAgent:
    """
    Multi-agent coordinator that:
    1. Routes input to appropriate agents (NLP, Vision)
    2. Cross-references extracted entities against the fraud graph
    3. Auto-enriches the graph with new entities
    4. Detects connections to known fraud rings
    5. Generates and broadcasts threat alerts
    """

    def __init__(self):
        self.alerts: list[ThreatAlert] = []

    async def analyze_case(self, text: str = None, image_bytes: bytes = None,
                           language: str = None, mime_type: str = "image/jpeg") -> dict:
        """
        Run multi-agent analysis on a case.
        Can handle text, image, or both.
        """
        results = {
            "case_id": str(uuid.uuid4())[:8],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "nlp_result": None,
            "vision_result": None,
            "graph_update": None,
            "ring_connection": None,
            "alerts": [],
        }

        # --- 1. Route to NLP Agent ---
        if text:
            nlp_result = await analyze_scam_text(text, language)
            results["nlp_result"] = nlp_result.model_dump()

            # --- 2. Extract entities and enrich graph ---
            if nlp_result.extracted_entities:
                entities = [e.model_dump() for e in nlp_result.extracted_entities]
                added = fraud_graph_db.add_from_analysis(entities)
                results["graph_update"] = {
                    "entities_added": added,
                    "count": len(added)
                }

                # --- 3. Check for connections to known rings ---
                fraud_graph_db.detect_fraud_rings()
                for entity_id in added:
                    if entity_id in fraud_graph_db.G.nodes:
                        node_data = fraud_graph_db.G.nodes[entity_id]
                        community = node_data.get("community")
                        if community is not None:
                            # Check if this community has pre-existing high-risk nodes
                            ring_members = [
                                n for n, d in fraud_graph_db.G.nodes(data=True)
                                if d.get("community") == community and n not in added
                            ]
                            if ring_members:
                                results["ring_connection"] = {
                                    "connected_to_ring": community,
                                    "existing_members": ring_members[:5],
                                    "alert": f"New entity {entity_id} connects to existing Fraud Ring #{community}"
                                }

                # --- 4. Generate alert ---
                if nlp_result.threat_score >= 70:
                    alert = ThreatAlert(
                        alert_id=str(uuid.uuid4())[:8],
                        alert_type="scam_detected",
                        severity="critical" if nlp_result.threat_score >= 85 else "high",
                        title=f"{nlp_result.scam_type.value.replace('_', ' ').title()} detected",
                        description=nlp_result.analysis[:200],
                        timestamp=datetime.now(timezone.utc).isoformat(),
                        entities_involved=[e.value for e in nlp_result.extracted_entities],
                        community_id=results.get("ring_connection", {}).get("connected_to_ring") if results.get("ring_connection") else None,
                    )
                    self.alerts.append(alert)
                    fraud_graph_db.alerts.append(alert.model_dump())
                    fraud_graph_db.scams_analyzed += 1
                    results["alerts"].append(alert.model_dump())

        # --- 5. Route to Vision Agent ---
        if image_bytes:
            vision_result = analyze_currency_image(image_bytes, mime_type)
            results["vision_result"] = vision_result

            if vision_result.get("is_counterfeit"):
                fraud_graph_db.counterfeit_flagged += 1
                alert = ThreatAlert(
                    alert_id=str(uuid.uuid4())[:8],
                    alert_type="counterfeit_found",
                    severity="high",
                    title="Counterfeit currency detected",
                    description=vision_result.get("analysis", "Suspicious note flagged")[:200],
                    timestamp=datetime.now(timezone.utc).isoformat(),
                )
                self.alerts.append(alert)
                fraud_graph_db.alerts.append(alert.model_dump())
                results["alerts"].append(alert.model_dump())

        return results

    def get_recent_alerts(self, limit: int = 20) -> list[dict]:
        """Return most recent alerts."""
        return [a.model_dump() for a in self.alerts[-limit:]]


orchestrator = OrchestratorAgent()
