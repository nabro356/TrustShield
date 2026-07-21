"use client";

import React, { useRef, useState } from "react";
import { AlertTriangle, Camera, CheckCircle, FileCheck2, Search, Scan, UploadCloud } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/lib/api";
import { t, type LangCode } from "@/lib/i18n";

interface Props {
  language: LangCode;
}

export default function CounterfeitSandbox({ language }: Props) {
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResults(null);
    }
  };

  const handleScan = async () => {
    setIsScanning(true);
    setResults(null);

    if (selectedFile) {
      const res = await api.scanCurrency(selectedFile, language);
      setResults(res);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setResults({
        is_counterfeit: true,
        confidence: 0.94,
        denomination: "INR 500",
        analysis:
          "Multiple high-risk anomalies detected. The security thread appears surface-printed, the microprint band is below teller-grade clarity, and tactile intaglio texture is absent.",
        issues_found: [
          "Security thread fails embedded-depth check",
          "Microprint around portrait edge is not legible at inspection scale",
          "Watermark geometry is offset from the reference note",
          "Raised tactile marks are missing on portrait and denomination zones",
        ],
      });
    }

    setIsScanning(false);
  };

  const isCounterfeit = results?.is_counterfeit as boolean;
  const confidence = (results?.confidence as number) || 0;
  const analysis = results?.analysis as string;
  const issues = (results?.issues_found as string[]) || [];
  const denomination = (results?.denomination as string) || "Unspecified";

  return (
    <div className="grid h-full w-full grid-cols-1 overflow-hidden lg:grid-cols-2">
      <div className="flex min-h-0 flex-col border-r border-border bg-white p-6">
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Scan className="h-5 w-5 text-primary" />
            {t("nav.vision", language)}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Check note images against security-thread, watermark, microprint, and texture signals.
          </p>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />

        <button
          type="button"
          className="group relative flex min-h-80 flex-1 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-secondary/20 transition-colors hover:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Currency note preview" className="max-h-full max-w-full rounded-md object-contain shadow-lg" />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary/70">
                <UploadCloud className="h-7 w-7" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Drop or upload a note image</p>
                <p className="mt-1 text-xs">A sample forensic result is available without an upload.</p>
              </div>
            </div>
          )}

          {isScanning && (
            <motion.div
              className="absolute left-0 right-0 z-10 h-0.5 bg-primary shadow-[0_0_10px_rgba(37,99,235,0.4)]"
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
            />
          )}
        </button>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <Camera className="h-4 w-4" />
            Capture / Upload
          </button>
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isScanning ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Scanning
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                {t("btn.scan", language)}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="min-h-0 overflow-y-auto bg-background p-6">
        <h3 className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Forensic Report</h3>

        {!results && !isScanning && (
          <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
            <Scan className="mb-4 h-12 w-12 opacity-15" />
            <p className="text-sm font-medium text-foreground">No scan completed yet</p>
            <p className="mt-1 max-w-sm text-xs">Upload a note image or run the sample scan to generate a teller-friendly forensic report.</p>
          </div>
        )}

        {isScanning && (
          <div className="space-y-3">
            <div className="h-24 animate-pulse rounded-lg bg-secondary" />
            <div className="h-16 animate-pulse rounded-lg bg-secondary" />
            <div className="h-32 animate-pulse rounded-lg bg-secondary" />
          </div>
        )}

        <AnimatePresence>
          {results && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className={`flex items-start gap-3 rounded-lg border p-4 ${isCounterfeit ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
                {isCounterfeit ? (
                  <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-red-600" />
                ) : (
                  <CheckCircle className="mt-0.5 h-6 w-6 shrink-0 text-green-600" />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className={`text-lg font-bold ${isCounterfeit ? "text-red-700" : "text-green-700"}`}>
                    {isCounterfeit ? "Counterfeit Suspected" : "No Counterfeit Indicators"}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">Denomination: {denomination}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Confidence</span>
                    <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/80">
                      <motion.div
                        className={`h-full rounded-full ${isCounterfeit ? "bg-red-500" : "bg-green-500"}`}
                        initial={{ width: "0%" }}
                        animate={{ width: `${confidence * 100}%` }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                    <span className="text-xs font-medium">{(confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-white p-4">
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Computer Vision Analysis</h4>
                <p className="text-sm leading-relaxed text-foreground/80">{analysis}</p>
              </div>

              {issues.length > 0 && (
                <div className="rounded-lg border border-border bg-white p-4">
                  <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Security Feature Anomalies</h4>
                  <ul className="space-y-2.5">
                    {issues.map((issue, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                          !
                        </span>
                        <span className="text-foreground/80">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-lg border border-border bg-white p-4">
                <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Evidence Readiness</h4>
                <div className="space-y-2 text-sm text-foreground/80">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-green-600" />
                    Image hash, scan timestamp, and model confidence can be attached to the case packet.
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="h-4 w-4 text-green-600" />
                    Teller can preserve the note and route the scan to the district evidence desk.
                  </div>
                </div>
              </div>

              <button className="w-full rounded-lg border border-border bg-white py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
                Submit to Evidence Database
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
