export const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "Hindi" },
  { code: "ta", name: "Tamil", nativeName: "Tamil" },
  { code: "te", name: "Telugu", nativeName: "Telugu" },
  { code: "bn", name: "Bengali", nativeName: "Bengali" },
  { code: "mr", name: "Marathi", nativeName: "Marathi" },
  { code: "kn", name: "Kannada", nativeName: "Kannada" },
  { code: "ml", name: "Malayalam", nativeName: "Malayalam" },
  { code: "gu", name: "Gujarati", nativeName: "Gujarati" },
  { code: "pa", name: "Punjabi", nativeName: "Punjabi" },
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];

const translations: Record<string, Record<string, string>> = {
  "app.title": {
    en: "ShieldNet Command Center",
  },
  "app.subtitle": {
    en: "Digital Public Safety Intelligence",
  },
  "nav.graph": {
    en: "Fraud Network",
  },
  "nav.vision": {
    en: "Counterfeit Scanner",
  },
  "nav.scam": {
    en: "Scam Analyzer",
  },
  "nav.map": {
    en: "Threat Map",
  },
  "nav.reports": {
    en: "Citizen Reports",
  },
  "kpi.scamsTracked": {
    en: "Cases Analyzed",
  },
  "kpi.fraudRings": {
    en: "Fraud Rings",
  },
  "kpi.counterfeit": {
    en: "Counterfeit Flags",
  },
  "kpi.digitalArrest": {
    en: "Active Alerts",
  },
  "status.online": {
    en: "System Online",
  },
  "btn.analyze": {
    en: "Analyze Risk",
  },
  "btn.scan": {
    en: "Run Forensic Scan",
  },
  "btn.addToGraph": {
    en: "Add to Intelligence Graph",
  },
  "btn.submitReport": {
    en: "Submit Report",
  },
  settings: {
    en: "Settings",
  },
  "report.success": {
    en: "Report submitted successfully",
  },
};

export function t(key: string, lang: string = "en"): string {
  return translations[key]?.[lang] || translations[key]?.en || key;
}
