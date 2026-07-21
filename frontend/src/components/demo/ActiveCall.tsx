"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CALLER,
  TRANSCRIPT,
  FLAG_LABELS,
  getThreatLevel,
  type TranscriptLine,
} from "@/lib/demoScript";

interface Props {
  elapsed: number;
  onAlertTriggered: () => void;
}

export default function ActiveCall({ elapsed, onAlertTriggered }: Props) {
  const [showFullAlert, setShowFullAlert] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const alertFired = useRef(false);

  const callTimer = Math.floor(elapsed / 1000);
  const visibleLines = TRANSCRIPT.filter((l) => l.time <= elapsed);

  const { activeFlags, threatScore } = React.useMemo(() => {
    const flags = new Set<string>();
    let score = 0;
    for (const l of visibleLines) {
      for (const f of l.flags) flags.add(f);
      score += l.threatDelta;
    }
    return { activeFlags: Array.from(flags), threatScore: Math.min(score, 100) };
  }, [visibleLines.length]);

  useEffect(() => {
    if (threatScore >= 85 && !alertFired.current) {
      alertFired.current = true;
      setTimeout(() => {
        setShowFullAlert(true);
        setTimeout(onAlertTriggered, 3500);
      }, 800);
    }
  }, [threatScore, onAlertTriggered]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [visibleLines.length]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const threat = getThreatLevel(threatScore);
  const shieldStatus =
    threatScore >= 80
      ? { label: "SCAM DETECTED", color: "#dc2626", bg: "rgba(220,38,38,0.15)" }
      : threatScore >= 50
        ? { label: "Suspicious Activity", color: "#ea580c", bg: "rgba(234,88,12,0.12)" }
        : { label: "Monitoring", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" };

  return (
    <div className="active-call">
      <div className="call-bg" />
      <div className="call-header">
        <span className="call-number">{CALLER.number}</span>
        <span className="call-duration">{formatTime(callTimer)}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={shieldStatus.label}
          className="shield-pill"
          style={{ background: shieldStatus.bg, borderColor: `${shieldStatus.color}30` }}
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.35 }}
        >
          <span className="shield-icon">🛡️</span>
          <span className="shield-label" style={{ color: shieldStatus.color }}>
            ShieldNet Live — {shieldStatus.label}
          </span>
          {threatScore >= 50 && (
            <span className="shield-score" style={{ color: shieldStatus.color }}>
              {threatScore}%
            </span>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="call-buttons">
        {[
          { icon: "🔇", label: "Mute" },
          { icon: "⌨️", label: "Keypad" },
          { icon: "🔊", label: "Speaker" },
        ].map((btn) => (
          <div key={btn.label} className="call-btn-group">
            <div className="call-btn">{btn.icon}</div>
            <span className="call-btn-label">{btn.label}</span>
          </div>
        ))}
      </div>
      <motion.div
        className="transcript-sheet"
        initial={{ y: 300 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
      >
        <div className="transcript-handle" />
        <div className="transcript-header">
          <div className="transcript-title-row">
            <span className="transcript-title">Live Transcription</span>
            <span className="transcript-lang">EN</span>
          </div>
          <div className="threat-gauge">
            <div className="threat-gauge-row">
              <span className="threat-label">Threat</span>
              <span className="threat-value" style={{ color: threat.color }}>
                {threatScore}/100
              </span>
            </div>
            <div className="threat-bar-bg">
              <motion.div
                className="threat-bar-fill"
                style={{ background: threat.color }}
                animate={{ width: `${threatScore}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>
          {activeFlags.length > 0 && (
            <div className="flags-row">
              {activeFlags.map((flag) => {
                const info = FLAG_LABELS[flag];
                return (
                  <motion.span
                    key={flag}
                    className="flag-tag"
                    style={{ background: `${info.color}18`, color: info.color, borderColor: `${info.color}30` }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    ⚑ {info.label}
                  </motion.span>
                );
              })}
            </div>
          )}
        </div>
        <div className="transcript-body" ref={transcriptRef}>
          {visibleLines.map((line, i) => (
            <motion.div
              key={i}
              className={`transcript-line ${line.speaker}`}
              initial={{ opacity: 0, x: line.speaker === "scammer" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
            >
              <span className="line-speaker">
                {line.speaker === "scammer" ? "📞 Caller" : "👤 You"}
              </span>
              <span className="line-text">{line.text}</span>
            </motion.div>
          ))}
          {!showFullAlert && visibleLines.length < TRANSCRIPT.length && (
            <div className="typing-indicator">
              <div className="typing-dot" />
              <div className="typing-dot" style={{ animationDelay: "0.15s" }} />
              <div className="typing-dot" style={{ animationDelay: "0.3s" }} />
            </div>
          )}
        </div>
      </motion.div>
      <AnimatePresence>
        {showFullAlert && (
          <motion.div
            className="full-alert-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="full-alert-card"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="alert-icon-ring">
                <span className="alert-icon">🚨</span>
              </div>
              <h2 className="alert-title">SCAM ALERT</h2>
              <p className="alert-subtitle">Digital Arrest Scam Detected</p>
              <p className="alert-desc">
                This caller is impersonating a CBI officer. Legitimate law
                enforcement agencies never demand money over phone calls.
              </p>
              <div className="alert-score-row">
                <span className="alert-score-label">Threat Score</span>
                <span className="alert-score-value">{threatScore}/100</span>
              </div>
              <div className="alert-actions">
                <div className="alert-btn alert-btn-end">End Call</div>
                <div className="alert-btn alert-btn-report">Report Scam</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
