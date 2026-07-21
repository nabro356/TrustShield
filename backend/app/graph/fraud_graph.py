import networkx as nx
from community import community_louvain
from app.models import GraphStats


class FraudNetworkGraph:
    def __init__(self):
        self.G = nx.Graph()
        self.scams_analyzed = 0
        self.counterfeit_flagged = 0
        self.alerts: list = []
        self._initialize_mock_data()

    def _initialize_mock_data(self):
        """Pre-populate the graph with realistic Indian fraud-ring data."""

        self.add_entity("+91-98765-43210", "PhoneNumber", {"risk_score": 92, "city": "Delhi", "evidence_count": 8, "status": "Active"})
        self.add_entity("+91-87654-32109", "PhoneNumber", {"risk_score": 88, "city": "Noida", "evidence_count": 5, "status": "Active"})
        self.add_entity("HDFC-XX4521", "BankAccount", {"risk_score": 95, "city": "Delhi", "evidence_count": 11, "status": "Freeze requested"})
        self.add_entity("cbi.officer@ybl", "UPIId", {"risk_score": 97, "city": "Delhi", "evidence_count": 9, "status": "Escalated"})
        self.add_entity("customs.dept@paytm", "UPIId", {"risk_score": 96, "city": "Gurugram", "evidence_count": 6, "status": "Escalated"})
        self.add_entity("103.24.xx.xx", "IPAddress", {"risk_score": 78, "city": "Delhi", "evidence_count": 4, "status": "Monitoring"})
        self.add_entity("Victim_Delhi_01", "Victim", {"risk_score": 5, "city": "Delhi", "evidence_count": 2, "status": "Protected"})
        self.add_entity("Victim_Delhi_02", "Victim", {"risk_score": 5, "city": "Noida", "evidence_count": 2, "status": "Protected"})

        self.add_relationship("+91-98765-43210", "HDFC-XX4521", "TRANSFERRED_TO")
        self.add_relationship("+91-98765-43210", "cbi.officer@ybl", "OPERATES")
        self.add_relationship("+91-87654-32109", "customs.dept@paytm", "OPERATES")
        self.add_relationship("+91-98765-43210", "103.24.xx.xx", "USED_IP")
        self.add_relationship("+91-87654-32109", "103.24.xx.xx", "USED_IP")
        self.add_relationship("Victim_Delhi_01", "+91-98765-43210", "CONTACTED_BY")
        self.add_relationship("Victim_Delhi_01", "cbi.officer@ybl", "PAID_TO")
        self.add_relationship("Victim_Delhi_02", "+91-87654-32109", "CONTACTED_BY")
        self.add_relationship("Victim_Delhi_02", "customs.dept@paytm", "PAID_TO")
        self.add_relationship("HDFC-XX4521", "cbi.officer@ybl", "LINKED_UPI")

        self.add_entity("+91-77890-12345", "PhoneNumber", {"risk_score": 85, "city": "Hyderabad", "evidence_count": 4, "status": "Active"})
        self.add_entity("SBI-XX7890", "BankAccount", {"risk_score": 90, "city": "Hyderabad", "evidence_count": 6, "status": "Freeze requested"})
        self.add_entity("ICICI-XX3456", "MuleAccount", {"risk_score": 94, "city": "Bengaluru", "evidence_count": 7, "status": "Escalated"})
        self.add_entity("Axis-XX6789", "MuleAccount", {"risk_score": 93, "city": "Bengaluru", "evidence_count": 7, "status": "Escalated"})
        self.add_entity("invest.profits@ybl", "UPIId", {"risk_score": 91, "city": "Hyderabad", "evidence_count": 5, "status": "Active"})
        self.add_entity("Victim_Hyd_01", "Victim", {"risk_score": 5, "city": "Hyderabad", "evidence_count": 1, "status": "Protected"})

        self.add_relationship("+91-77890-12345", "SBI-XX7890", "TRANSFERRED_TO")
        self.add_relationship("SBI-XX7890", "ICICI-XX3456", "SPLIT_TO")
        self.add_relationship("SBI-XX7890", "Axis-XX6789", "SPLIT_TO")
        self.add_relationship("+91-77890-12345", "invest.profits@ybl", "OPERATES")
        self.add_relationship("Victim_Hyd_01", "+91-77890-12345", "CONTACTED_BY")
        self.add_relationship("Victim_Hyd_01", "invest.profits@ybl", "PAID_TO")

        self.add_entity("+91-91234-56789", "PhoneNumber", {"risk_score": 80, "city": "Mumbai", "evidence_count": 5, "status": "Monitoring"})
        self.add_entity("kyc.update@sbi-secure.in", "Email", {"risk_score": 88, "city": "Mumbai", "evidence_count": 6, "status": "Takedown requested"})
        self.add_entity("PNB-XX1234", "BankAccount", {"risk_score": 86, "city": "Pune", "evidence_count": 5, "status": "Freeze requested"})
        self.add_entity("Victim_Mumbai_01", "Victim", {"risk_score": 5, "city": "Mumbai", "evidence_count": 2, "status": "Protected"})

        self.add_relationship("+91-91234-56789", "kyc.update@sbi-secure.in", "OPERATES")
        self.add_relationship("+91-91234-56789", "PNB-XX1234", "TRANSFERRED_TO")
        self.add_relationship("Victim_Mumbai_01", "kyc.update@sbi-secure.in", "PHISHED_BY")
        self.add_relationship("Victim_Mumbai_01", "PNB-XX1234", "PAID_TO")

        self.add_entity("+91-63456-78901", "PhoneNumber", {"risk_score": 82, "city": "Kolkata", "evidence_count": 3, "status": "Monitoring"})
        self.add_entity("BOB-XX5678", "BankAccount", {"risk_score": 87, "city": "Kolkata", "evidence_count": 4, "status": "Freeze requested"})
        self.add_entity("Victim_Kolkata_01", "Victim", {"risk_score": 5, "city": "Kolkata", "evidence_count": 1, "status": "Protected"})

        self.add_relationship("+91-63456-78901", "BOB-XX5678", "TRANSFERRED_TO")
        self.add_relationship("Victim_Kolkata_01", "+91-63456-78901", "CONTACTED_BY")
        self.add_relationship("Victim_Kolkata_01", "BOB-XX5678", "PAID_TO")

    def add_entity(self, node_id: str, label: str, properties: dict = None):
        if properties is None:
            properties = {}
        properties["label"] = label
        self.G.add_node(node_id, **properties)

    def add_relationship(self, source: str, target: str, rel_type: str):
        self.G.add_edge(source, target, type=rel_type)

    def detect_fraud_rings(self) -> dict:
        """Run Louvain community detection to find connected fraud rings."""
        if len(self.G.nodes) == 0:
            return {}

        partition = community_louvain.best_partition(self.G.to_undirected())
        for node, comm_id in partition.items():
            self.G.nodes[node]["community"] = comm_id
        return partition

    def get_graph_data(self) -> dict:
        """Export graph data for the Next.js visualizer."""
        nodes = []
        for n, attrs in self.G.nodes(data=True):
            node_data = {"id": n}
            node_data.update(attrs)
            nodes.append(node_data)

        links = []
        for u, v, attrs in self.G.edges(data=True):
            link_data = {"source": u, "target": v}
            link_data.update(attrs)
            links.append(link_data)

        return {"nodes": nodes, "links": links}

    def get_stats(self) -> GraphStats:
        """Return KPI metrics for the dashboard."""
        partition = self.detect_fraud_rings()
        num_rings = len(set(partition.values())) if partition else 0
        risk_scores = [attrs.get("risk_score", 0) for _, attrs in self.G.nodes(data=True)]

        return GraphStats(
            total_nodes=self.G.number_of_nodes(),
            total_edges=self.G.number_of_edges(),
            fraud_rings=num_rings,
            highest_risk_score=max(risk_scores) if risk_scores else 0,
            scams_analyzed=self.scams_analyzed,
            counterfeit_flagged=self.counterfeit_flagged,
            active_alerts=len(self.alerts),
        )

    def search_entity(self, query: str) -> list[dict]:
        """Search nodes by partial ID match."""
        results = []
        q = query.lower()
        for n, attrs in self.G.nodes(data=True):
            if q in n.lower():
                node_data = {"id": n}
                node_data.update(attrs)
                results.append(node_data)
        return results

    def add_from_analysis(self, entities: list[dict], source_id: str = None):
        """Ingest entities from an agent analysis result into the graph."""
        added_ids = []
        for entity in entities:
            eid = entity.get("value", "")
            etype = entity.get("entity_type", "Unknown")
            if not eid:
                continue
            self.add_entity(eid, etype, {"risk_score": 75, "evidence_count": 1, "status": "New"})
            added_ids.append(eid)

        for i, eid_a in enumerate(added_ids):
            for eid_b in added_ids[i + 1:]:
                self.add_relationship(eid_a, eid_b, "CO_OCCURRED")

        if source_id:
            for eid in added_ids:
                self.add_relationship(source_id, eid, "REPORTED_WITH")

        return added_ids


fraud_graph_db = FraudNetworkGraph()
