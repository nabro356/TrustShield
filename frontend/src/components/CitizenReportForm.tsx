"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle, ChevronRight, CreditCard, FileText, MessageSquare, Phone, Send } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";
import { t, type LangCode } from "@/lib/i18n";

const SCAM_TYPES = [
  { id: "digital_arrest", label: "Digital Arrest", desc: "Police, CBI, ED, or Customs impersonation" },
  { id: "phishing", label: "Phishing / KYC", desc: "Fake bank verification or account block threat" },
  { id: "investment", label: "Investment Fraud", desc: "Guaranteed return or crypto scheme" },
  { id: "lottery", label: "Lottery / Prize", desc: "Fake winnings or processing fee demand" },
  { id: "impersonation", label: "Impersonation", desc: "Fake official, employer, or relative" },
  { id: "other", label: "Other", desc: "Any other suspicious interaction" },
];

interface Props {
  language: LangCode;
}

export default function CitizenReportForm({ language }: Props) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    phone: "",
    upi_id: "",
    bank_account: "",
    amount_lost: "",
    description: "",
    victim_id: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [caseId] = useState(() => `SN-${Date.now().toString(36).toUpperCase()}`);

  const resetForm = () => {
    setSubmitted(false);
    setStep(1);
    setSelectedType("");
    setFormData({ phone: "", upi_id: "", bank_account: "", amount_lost: "", description: "", victim_id: "" });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await api.reportScam({
      scam_type: selectedType,
      phone: formData.phone || undefined,
      upi_id: formData.upi_id || undefined,
      bank_account: formData.bank_account || undefined,
      amount_lost: formData.amount_lost ? parseFloat(formData.amount_lost) : undefined,
      description: formData.description,
      victim_id: formData.victim_id || "Anonymous",
      language,
    });
    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-foreground">{t("report.success", language)}</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            The report was added to the intelligence graph and can be matched with phones, UPI IDs, and bank accounts from other districts.
          </p>
          <div className="mb-6 rounded-lg border border-border bg-secondary/50 p-4">
            <span className="text-xs text-muted-foreground">Case tracking ID</span>
            <p className="text-lg font-bold text-primary">{caseId}</p>
          </div>
          <button onClick={resetForm} className="text-sm font-medium text-primary hover:underline">
            File another report
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-white">
      <div className="px-6 pb-3 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5 text-primary" />
              {t("nav.reports", language)}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">Capture only the details needed for fast triage and graph matching.</p>
          </div>
          <span className="text-xs text-muted-foreground">Step {step} of 3</span>
        </div>
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 pb-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
              <p className="mb-4 text-sm text-muted-foreground">What type of suspicious interaction did the citizen report?</p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {SCAM_TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type.id);
                      setStep(2);
                    }}
                    className={`rounded-lg border p-4 text-left transition-all hover:shadow-sm ${
                      selectedType === type.id ? "border-primary/25 bg-primary/5" : "border-border bg-white hover:bg-secondary/30"
                    }`}
                  >
                    <h4 className="text-sm font-semibold">{type.label}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{type.desc}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <p className="mb-4 text-sm text-muted-foreground">Provide any known indicators. Unknown fields can be left blank.</p>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    Scammer phone number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91-XXXXX-XXXXX"
                    className="w-full rounded-lg border border-border bg-secondary/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    UPI ID used
                  </label>
                  <input
                    type="text"
                    value={formData.upi_id}
                    onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                    placeholder="fraudster@ybl"
                    className="w-full rounded-lg border border-border bg-secondary/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Bank account, if known</label>
                  <input
                    type="text"
                    value={formData.bank_account}
                    onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                    placeholder="Account number or masked account"
                    className="w-full rounded-lg border border-border bg-secondary/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Amount lost (INR)</label>
                  <input
                    type="number"
                    value={formData.amount_lost}
                    onChange={(e) => setFormData({ ...formData, amount_lost: e.target.value })}
                    placeholder="25000"
                    className="w-full rounded-lg border border-border bg-secondary/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  What happened?
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the call, message, payment demand, or threat..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-border bg-secondary/20 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(1)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Back
                </button>
                <button onClick={() => setStep(3)} className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/20 hover:bg-primary/90">
                  Review
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <p className="mb-4 text-sm text-muted-foreground">Review the report before submitting it to the intelligence graph.</p>

              <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-4">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Scam type</span>
                  <span className="font-medium">{SCAM_TYPES.find((s) => s.id === selectedType)?.label || "N/A"}</span>
                </div>
                {formData.phone && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-mono font-medium">{formData.phone}</span>
                  </div>
                )}
                {formData.upi_id && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">UPI ID</span>
                    <span className="font-mono font-medium">{formData.upi_id}</span>
                  </div>
                )}
                {formData.bank_account && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Bank account</span>
                    <span className="font-mono font-medium">{formData.bank_account}</span>
                  </div>
                )}
                {formData.amount_lost && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-muted-foreground">Amount lost</span>
                    <span className="font-bold text-red-600">INR {parseFloat(formData.amount_lost).toLocaleString()}</span>
                  </div>
                )}
                {formData.description && (
                  <div className="text-sm">
                    <span className="mb-1 block text-muted-foreground">Description</span>
                    <p className="text-xs leading-relaxed text-foreground/80">{formData.description}</p>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs text-amber-800">
                  Submit only verified citizen-provided indicators. Sensitive identifiers should remain masked unless collected by an authorized officer.
                </p>
              </div>

              <div className="flex justify-between pt-2">
                <button onClick={() => setStep(2)} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {t("btn.submitReport", language)}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
