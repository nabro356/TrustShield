// ─── Demo Script ────────────────────────────────────────────────
// Each event drives the phone simulator animation.
// Times are in milliseconds from the moment the call is "answered".

export interface TranscriptLine {
  time: number;          // ms after call starts
  speaker: "scammer" | "victim";
  text: string;
  flags: string[];       // red-flag categories that light up
  threatDelta: number;   // how much threat score increases
}

export interface DemoPhase {
  id: string;
  label: string;
  startTime: number;     // ms from page load
  duration: number;
}

// ── Phases (absolute ms from demo start) ─────────────────────
export const DEMO_PHASES: DemoPhase[] = [
  { id: "lock",       label: "Lock Screen",          startTime: 0,     duration: 2000  },
  { id: "incoming",   label: "Incoming Call",         startTime: 2000,  duration: 3500  },
  { id: "active",     label: "Call Connected",        startTime: 5500,  duration: 19500 },
  { id: "alert",      label: "Scam Alert",            startTime: 25000, duration: 4000  },
  { id: "report",     label: "Report Filed",          startTime: 29000, duration: 4000  },
];

export const TOTAL_DEMO_DURATION = 33000; // ms

// ── Caller Info ──────────────────────────────────────────────
export const CALLER = {
  number: "+91-98765-43210",
  label: "Unknown Number",
  location: "Delhi, India",
};

// ── Transcript (times relative to call connect = phase "active" start) ───
export const TRANSCRIPT: TranscriptLine[] = [
  {
    time: 1500,
    speaker: "scammer",
    text: "Hello, this is Senior Officer Sharma calling from the CBI — Central Bureau of Investigation.",
    flags: ["impersonation"],
    threatDelta: 15,
  },
  {
    time: 4500,
    speaker: "victim",
    text: "CBI? What is this about?",
    flags: [],
    threatDelta: 0,
  },
  {
    time: 6000,
    speaker: "scammer",
    text: "Your Aadhaar number has been linked to a money laundering case. A parcel containing illegal documents was intercepted at Mumbai customs.",
    flags: ["accusation"],
    threatDelta: 18,
  },
  {
    time: 9500,
    speaker: "scammer",
    text: "An FIR has been registered and an arrest warrant has been issued in your name. You are now under digital arrest.",
    flags: ["coercion"],
    threatDelta: 20,
  },
  {
    time: 12500,
    speaker: "scammer",
    text: "Do not tell anyone about this call. Do not disconnect. This is a confidential investigation.",
    flags: ["isolation"],
    threatDelta: 15,
  },
  {
    time: 15500,
    speaker: "scammer",
    text: "To avoid arrest, you must transfer ₹25,000 immediately as a security deposit to this UPI ID: cbi.officer@ybl",
    flags: ["extortion"],
    threatDelta: 21,
  },
];

// ── Extracted Entities (shown on report screen) ──────────────
export const EXTRACTED_ENTITIES = [
  { value: "+91-98765-43210", type: "Phone Number",  icon: "📞", risk: 92 },
  { value: "cbi.officer@ybl", type: "UPI ID",        icon: "💳", risk: 97 },
  { value: "HDFC-XX4521",     type: "Bank Account",   icon: "🏦", risk: 95 },
];

// ── Red Flag Categories ──────────────────────────────────────
export const FLAG_LABELS: Record<string, { label: string; color: string }> = {
  impersonation: { label: "Official Impersonation", color: "#dc2626" },
  accusation:    { label: "Fabricated Accusation",   color: "#ea580c" },
  coercion:      { label: "Coercion / Threats",      color: "#d97706" },
  isolation:     { label: "Isolation Tactics",        color: "#7c3aed" },
  extortion:     { label: "Money Extortion",          color: "#be123c" },
};

// ── Threat Level Helpers ─────────────────────────────────────
export function getThreatLevel(score: number): { label: string; color: string; bg: string } {
  if (score >= 80) return { label: "CRITICAL", color: "#dc2626", bg: "rgba(220,38,38,0.12)" };
  if (score >= 60) return { label: "HIGH",     color: "#ea580c", bg: "rgba(234,88,12,0.12)" };
  if (score >= 40) return { label: "MEDIUM",   color: "#d97706", bg: "rgba(217,119,6,0.12)" };
  return                   { label: "LOW",      color: "#16a34a", bg: "rgba(22,163,74,0.12)" };
}
