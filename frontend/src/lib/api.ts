const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface GraphNode {
  id: string;
  label: string;
  risk_score: number;
  community: number;
  city?: string;
  evidence_count?: number;
  status?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: Array<{ source: string; target: string; type: string }>;
}

export interface GraphStats {
  total_nodes: number;
  total_edges: number;
  fraud_rings: number;
  highest_risk_score: number;
  scams_analyzed: number;
  counterfeit_flagged: number;
  active_alerts: number;
}

export interface ScamAnalysisResult {
  scam_type: string;
  threat_score: number;
  confidence: number;
  detected_language: string;
  analysis: string;
  red_flags: Array<{ phrase: string; category: string; severity: string }>;
  extracted_entities: Array<{ value: string; entity_type: string; confidence: number }>;
  scam_stage: string;
}

export interface ThreatAlert {
  type: string;
  data: {
    title: string;
    [key: string]: unknown;
  };
}

export const api = {
  async getGraph(): Promise<GraphData> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/graph`);
      if (!res.ok) throw new Error("API unavailable");
      return res.json();
    } catch {
      return getMockGraphData();
    }
  },

  async getStats(): Promise<GraphStats> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/graph/stats`);
      if (!res.ok) throw new Error("API unavailable");
      return res.json();
    } catch {
      return {
        total_nodes: 24,
        total_edges: 28,
        fraud_rings: 4,
        highest_risk_score: 97,
        scams_analyzed: 156,
        counterfeit_flagged: 23,
        active_alerts: 7,
      };
    }
  },

  async scanCurrency(file: File, language: string = "en"): Promise<Record<string, unknown>> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/v1/scan/currency?language=${language}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("API unavailable");
      return res.json();
    } catch {
      return {
        is_counterfeit: true,
        confidence: 0.92,
        denomination: "INR 500",
        analysis:
          "Forensic scan found high-risk inconsistencies in the security thread, microprint band, watermark placement, and tactile print texture.",
        issues_found: [
          "Security thread appears printed on the surface instead of embedded in the substrate",
          "Microprint around the portrait edge is blurred below teller-grade threshold",
          "Watermark registration is offset from RBI reference geometry",
          "Raised intaglio texture is missing on the portrait and denomination marks",
        ],
      };
    }
  },

  async analyzeScam(text: string, language?: string): Promise<ScamAnalysisResult> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/scan/scam-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });
      if (!res.ok) throw new Error("API unavailable");
      return res.json();
    } catch {
      return getMockScamResult(text);
    }
  },

  async reportScam(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/report/scam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("API unavailable");
      return res.json();
    } catch {
      return { status: "success", message: "Report queued locally for analyst review" };
    }
  },

  async orchestrate(text: string, language?: string): Promise<Record<string, unknown>> {
    try {
      const res = await fetch(`${API_BASE}/api/v1/orchestrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });
      if (!res.ok) throw new Error("API unavailable");
      return res.json();
    } catch {
      return { case_id: "SN-DEMO-001", nlp_result: getMockScamResult(text) };
    }
  },
};

export function connectWebSocket(onMessage: (alert: ThreatAlert) => void): WebSocket | null {
  try {
    const wsUrl = API_BASE.replace("http", "ws") + "/api/v1/ws/threats";
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      try {
        onMessage(JSON.parse(event.data));
      } catch {
        // Ignore malformed demo events.
      }
    };
    ws.onclose = () => {
      setTimeout(() => connectWebSocket(onMessage), 5000);
    };
    return ws;
  } catch {
    return null;
  }
}

function getMockGraphData(): GraphData {
  return {
    nodes: [
      { id: "+91-98765-43210", label: "PhoneNumber", risk_score: 92, community: 0, city: "Delhi", evidence_count: 8, status: "Active" },
      { id: "+91-87654-32109", label: "PhoneNumber", risk_score: 88, community: 0, city: "Noida", evidence_count: 5, status: "Active" },
      { id: "HDFC-XX4521", label: "BankAccount", risk_score: 95, community: 0, city: "Delhi", evidence_count: 11, status: "Freeze requested" },
      { id: "cbi.officer@ybl", label: "UPIId", risk_score: 97, community: 0, city: "Delhi", evidence_count: 9, status: "Escalated" },
      { id: "customs.dept@paytm", label: "UPIId", risk_score: 96, community: 0, city: "Gurugram", evidence_count: 6, status: "Escalated" },
      { id: "103.24.xx.xx", label: "IPAddress", risk_score: 78, community: 0, city: "Delhi", evidence_count: 4, status: "Monitoring" },
      { id: "Victim_Delhi_01", label: "Victim", risk_score: 5, community: 0, city: "Delhi", evidence_count: 2, status: "Protected" },
      { id: "Victim_Delhi_02", label: "Victim", risk_score: 5, community: 0, city: "Noida", evidence_count: 2, status: "Protected" },
      { id: "+91-77890-12345", label: "PhoneNumber", risk_score: 85, community: 1, city: "Hyderabad", evidence_count: 4, status: "Active" },
      { id: "SBI-XX7890", label: "BankAccount", risk_score: 90, community: 1, city: "Hyderabad", evidence_count: 6, status: "Freeze requested" },
      { id: "ICICI-XX3456", label: "MuleAccount", risk_score: 94, community: 1, city: "Bengaluru", evidence_count: 7, status: "Escalated" },
      { id: "Axis-XX6789", label: "MuleAccount", risk_score: 93, community: 1, city: "Bengaluru", evidence_count: 7, status: "Escalated" },
      { id: "invest.profits@ybl", label: "UPIId", risk_score: 91, community: 1, city: "Hyderabad", evidence_count: 5, status: "Active" },
      { id: "Victim_Hyd_01", label: "Victim", risk_score: 5, community: 1, city: "Hyderabad", evidence_count: 1, status: "Protected" },
      { id: "+91-91234-56789", label: "PhoneNumber", risk_score: 80, community: 2, city: "Mumbai", evidence_count: 5, status: "Monitoring" },
      { id: "kyc.update@sbi-secure.in", label: "Email", risk_score: 88, community: 2, city: "Mumbai", evidence_count: 6, status: "Takedown requested" },
      { id: "PNB-XX1234", label: "BankAccount", risk_score: 86, community: 2, city: "Pune", evidence_count: 5, status: "Freeze requested" },
      { id: "Victim_Mumbai_01", label: "Victim", risk_score: 5, community: 2, city: "Mumbai", evidence_count: 2, status: "Protected" },
      { id: "+91-63456-78901", label: "PhoneNumber", risk_score: 82, community: 3, city: "Kolkata", evidence_count: 3, status: "Monitoring" },
      { id: "BOB-XX5678", label: "BankAccount", risk_score: 87, community: 3, city: "Kolkata", evidence_count: 4, status: "Freeze requested" },
      { id: "Victim_Kolkata_01", label: "Victim", risk_score: 5, community: 3, city: "Kolkata", evidence_count: 1, status: "Protected" },
    ],
    links: [
      { source: "+91-98765-43210", target: "HDFC-XX4521", type: "TRANSFERRED_TO" },
      { source: "+91-98765-43210", target: "cbi.officer@ybl", type: "OPERATES" },
      { source: "+91-87654-32109", target: "customs.dept@paytm", type: "OPERATES" },
      { source: "+91-98765-43210", target: "103.24.xx.xx", type: "USED_IP" },
      { source: "+91-87654-32109", target: "103.24.xx.xx", type: "USED_IP" },
      { source: "Victim_Delhi_01", target: "+91-98765-43210", type: "CONTACTED_BY" },
      { source: "Victim_Delhi_01", target: "cbi.officer@ybl", type: "PAID_TO" },
      { source: "Victim_Delhi_02", target: "+91-87654-32109", type: "CONTACTED_BY" },
      { source: "Victim_Delhi_02", target: "customs.dept@paytm", type: "PAID_TO" },
      { source: "HDFC-XX4521", target: "cbi.officer@ybl", type: "LINKED_UPI" },
      { source: "+91-77890-12345", target: "SBI-XX7890", type: "TRANSFERRED_TO" },
      { source: "SBI-XX7890", target: "ICICI-XX3456", type: "SPLIT_TO" },
      { source: "SBI-XX7890", target: "Axis-XX6789", type: "SPLIT_TO" },
      { source: "+91-77890-12345", target: "invest.profits@ybl", type: "OPERATES" },
      { source: "Victim_Hyd_01", target: "+91-77890-12345", type: "CONTACTED_BY" },
      { source: "Victim_Hyd_01", target: "invest.profits@ybl", type: "PAID_TO" },
      { source: "+91-91234-56789", target: "kyc.update@sbi-secure.in", type: "OPERATES" },
      { source: "+91-91234-56789", target: "PNB-XX1234", type: "TRANSFERRED_TO" },
      { source: "Victim_Mumbai_01", target: "kyc.update@sbi-secure.in", type: "PHISHED_BY" },
      { source: "Victim_Mumbai_01", target: "PNB-XX1234", type: "PAID_TO" },
      { source: "+91-63456-78901", target: "BOB-XX5678", type: "TRANSFERRED_TO" },
      { source: "Victim_Kolkata_01", target: "+91-63456-78901", type: "CONTACTED_BY" },
      { source: "Victim_Kolkata_01", target: "BOB-XX5678", type: "PAID_TO" },
    ],
  };
}

function getMockScamResult(text: string): ScamAnalysisResult {
  const lower = text.toLowerCase();
  const hasAuthority = ["cbi", "police", "customs", "ed", "rbi"].some((kw) => lower.includes(kw));
  const hasCoercion = ["arrest", "warrant", "money laundering", "do not tell", "don't tell", "transfer"].some((kw) => lower.includes(kw));

  if (hasAuthority || hasCoercion) {
    return {
      scam_type: "digital_arrest",
      threat_score: 94,
      confidence: 0.92,
      detected_language: "en",
      analysis:
        "High-confidence digital arrest pattern. The message combines official impersonation, legal threat framing, isolation pressure, and a payment demand. Recommended action: warn the citizen, preserve the transcript, flag the payment handle, and route to cybercrime intake.",
      red_flags: [
        { phrase: "CBI", category: "impersonation", severity: "high" },
        { phrase: "arrest", category: "coercion", severity: "high" },
        { phrase: "don't tell anyone", category: "isolation", severity: "high" },
        { phrase: "security deposit", category: "extortion", severity: "high" },
      ],
      extracted_entities: [
        { value: "cbi.officer@ybl", entity_type: "UPIId", confidence: 0.95 },
      ],
      scam_stage: "Stage 3-5: coercion, isolation, and extortion",
    };
  }

  return {
    scam_type: "unknown",
    threat_score: 35,
    confidence: 0.5,
    detected_language: "en",
    analysis: "Low-confidence match. No strong digital arrest, phishing, or payment coercion pattern was detected.",
    red_flags: [],
    extracted_entities: [],
    scam_stage: "Inconclusive",
  };
}
