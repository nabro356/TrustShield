"use client";

import React, { useState } from "react";
import { AlertTriangle, Brain, CheckCircle2, ChevronRight, Plus, Shield, Zap } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { api, type ScamAnalysisResult } from "@/lib/api";
import { t, type LangCode } from "@/lib/i18n";

const EXAMPLE_SCRIPTS: Record<string, { label: string; text: string }> = {
  digital_arrest: {
    label: "Digital arrest call",
    text: "This is the CBI calling. Your Aadhaar card is linked to a money laundering case involving INR 4,50,000. You are about to be arrested under the Prevention of Money Laundering Act. Do not tell anyone about this call. Transfer INR 25,000 immediately to this UPI ID as security deposit: cbi.officer@ybl. Failure to comply will result in immediate arrest.",
  },
  kyc: {
    label: "KYC phishing SMS",
    text: "Dear customer, your bank KYC will expire today. Click this urgent link and enter your debit card PIN to avoid account blocking. For help call +91 91234 56789.",
  },
  investment: {
    label: "Investment lure",
    text: "Guaranteed crypto returns of 30 percent weekly. Deposit INR 10,000 now to double your balance. Offer available only for selected verified users.",
  },
};

const SCAM_TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  digital_arrest: { label: "Digital Arrest Scam", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  lottery: { label: "Lottery or Prize Scam", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  phishing: { label: "Phishing or KYC Scam", color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
  investment: { label: "Investment Scam", color: "text-violet-700", bg: "bg-violet-50 border-violet-200" },
  impersonation: { label: "Official Impersonation", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  unknown: { label: "Low or Unknown Risk", color: "text-slate-700", bg: "bg-slate-50 border-slate-200" },
};

const ACTIONS = [
  "Warn citizen: legitimate agencies do not demand video-call custody or security deposits.",
  "Preserve transcript, caller ID, payment handle, and timestamps as evidence.",
  "Route high-risk payment handles to bank freeze or UPI risk desk.",
  "Escalate linked entities to the intelligence graph for cross-jurisdiction matching.",
];

interface Props {
  language: LangCode;
}

export default function ScamAnalyzer({ language }: Props) {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(null);
  const [addedToGraph, setAddedToGraph] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setAddedToGraph(false);

    const res = await api.analyzeScam(inputText, language !== "en" ? language : undefined);
    setResult(res);
    setIsAnalyzing(false);
  };

  const handleAddToGraph = async () => {
    if (!result?.extracted_entities?.length) return;
    await api.orchestrate(inputText, language !== "en" ? language : undefined);
    setAddedToGraph(true);
  };

  const loadExample = (key: string) => {
    setInputText(EXAMPLE_SCRIPTS[key].text);
    setResult(null);
    setAddedToGraph(false);
  };

  const getThreatColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-amber-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const getThreatBg = (score: number) => {
    if (score >= 80) return "bg-red-500";
    if (score >= 60) return "bg-amber-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="grid h-full w-full grid-cols-1 overflow-hidden lg:grid-cols-2">
      <div className="flex min-h-0 flex-col border-r border-border bg-white p-6">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Brain className="h-5 w-5 text-primary" />
            {t("nav.scam", language)}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Classify suspicious calls, SMS messages, or chat transcripts before money moves.
          </p>
        </div>

        <div className="mb-3 flex flex-wrap gap-2">
          {Object.entries(EXAMPLE_SCRIPTS).map(([key, ex]) => (
            <button
              key={key}
              onClick={() => loadExample(key)}
              className="rounded-md border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
            >
              {ex.label}
            </button>
          ))}
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste the transcript or message here..."
          className="min-h-64 flex-1 resize-none rounded-lg border border-border bg-secondary/25 p-4 text-sm leading-relaxed transition-all focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Evidence is analyzed locally first; API mode can enrich with model-backed extraction.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Analyzing
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                {t("btn.analyze", language)}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="min-h-0 overflow-y-auto bg-background p-6">
        <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Threat Assessment</h3>

        {!result && !isAnalyzing && (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <Brain className="mb-4 h-12 w-12 opacity-15" />
            <p className="text-sm font-medium text-foreground">No transcript analyzed yet</p>
            <p className="mt-1 max-w-sm text-xs">Use a sample or paste a citizen-reported message to generate risk, entities, and next actions.</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-lg bg-secondary" />
            <div className="h-16 animate-pulse rounded-lg bg-secondary" />
            <div className="h-36 animate-pulse rounded-lg bg-secondary" />
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {(() => {
                const typeInfo = SCAM_TYPE_LABELS[result.scam_type] || SCAM_TYPE_LABELS.unknown;
                return (
                  <div className={`flex items-start gap-3 rounded-lg border p-4 ${typeInfo.bg}`}>
                    <AlertTriangle className={`mt-0.5 h-5 w-5 ${typeInfo.color}`} />
                    <div className="min-w-0 flex-1">
                      <h2 className={`text-lg font-bold ${typeInfo.color}`}>{typeInfo.label}</h2>
                      {result.scam_stage ? (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <ChevronRight className="h-3 w-3" />
                          {result.scam_stage}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })()}

              <div className="rounded-lg border border-border bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Threat score</span>
                  <span className={`text-2xl font-bold ${getThreatColor(result.threat_score)}`}>{result.threat_score}/100</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    className={`h-full rounded-full ${getThreatBg(result.threat_score)}`}
                    initial={{ width: "0%" }}
                    animate={{ width: `${result.threat_score}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Classifier confidence: {(result.confidence * 100).toFixed(0)}%</p>
              </div>

              <div className="rounded-lg border border-border bg-white p-4">
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Analyst Summary</h4>
                <p className="text-sm leading-relaxed text-foreground/80">{result.analysis}</p>
              </div>

              {result.red_flags.length > 0 && (
                <div className="rounded-lg border border-border bg-white p-4">
                  <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Red Flags</h4>
                  <div className="space-y-2">
                    {result.red_flags.map((rf, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-medium ${
                            rf.severity === "high"
                              ? "bg-red-100 text-red-700"
                              : rf.severity === "medium"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {rf.category}
                        </span>
                        <span className="font-medium text-foreground">&ldquo;{rf.phrase}&rdquo;</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.extracted_entities.length > 0 && (
                <div className="rounded-lg border border-border bg-white p-4">
                  <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Extracted Entities</h4>
                  <div className="space-y-2">
                    {result.extracted_entities.map((entity, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{entity.entity_type}</span>
                        <code className="rounded bg-secondary/70 px-2 py-0.5 font-mono text-xs text-foreground">{entity.value}</code>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-border bg-white p-4">
                <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Recommended Actions</h4>
                <div className="space-y-2">
                  {ACTIONS.map((action) => (
                    <div key={action} className="flex items-start gap-2 text-sm text-foreground/80">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {result.extracted_entities.length > 0 && (
                <button
                  onClick={handleAddToGraph}
                  disabled={addedToGraph}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all ${
                    addedToGraph
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15"
                  }`}
                >
                  {addedToGraph ? (
                    <>
                      <Shield className="h-4 w-4" />
                      Added to Intelligence Graph
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      {t("btn.addToGraph", language)}
                    </>
                  )}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
