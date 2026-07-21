"use client";

import "./demo.css";

import React, { useState, useEffect, useRef, useCallback } from "react";
import PhoneSimulator from "@/components/demo/PhoneSimulator";
import LockScreen from "@/components/demo/LockScreen";
import IncomingCall from "@/components/demo/IncomingCall";
import ActiveCall from "@/components/demo/ActiveCall";
import ReportScreen from "@/components/demo/ReportScreen";
import { DEMO_PHASES, TOTAL_DEMO_DURATION } from "@/lib/demoScript";

type Phase = "lock" | "incoming" | "active" | "alert" | "report";

export default function DemoPage() {
  const [phase, setPhase] = useState<Phase>("lock");
  const [elapsed, setElapsed] = useState(0);
  const [activeElapsed, setActiveElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseOffsetRef = useRef<number>(0);
  const phaseOverrideRef = useRef<Phase | null>(null);

  // ── Animation loop ──
  const tick = useCallback(() => {
    if (!isStarted) return;
    const now = performance.now();
    const ms = now - startTimeRef.current - pauseOffsetRef.current;
    setElapsed(ms);

    // Phase transitions — respect override from ActiveCall callbacks
    if (phaseOverrideRef.current) {
      setPhase(phaseOverrideRef.current);
      if (phaseOverrideRef.current === "active") {
        setActiveElapsed(ms - 5500);
      }
    } else if (ms < 2000) {
      setPhase("lock");
    } else if (ms < 5500) {
      setPhase("incoming");
    } else {
      setPhase("active");
      setActiveElapsed(ms - 5500);
    }

    if (ms < TOTAL_DEMO_DURATION) {
      frameRef.current = requestAnimationFrame(tick);
    }
  }, [isStarted]);

  useEffect(() => {
    if (isStarted && !isPaused) {
      frameRef.current = requestAnimationFrame(tick);
    }
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isStarted, isPaused, tick]);

  // ── Controls ──
  const handleStart = () => {
    setIsStarted(true);
    setPhase("lock");
    setElapsed(0);
    setActiveElapsed(0);
    pauseOffsetRef.current = 0;
    phaseOverrideRef.current = null;
    startTimeRef.current = performance.now();
  };

  const handleReplay = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setIsPaused(false);
    handleStart();
  };

  const handlePause = () => {
    setIsPaused(true);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  };

  const handleResume = () => {
    pauseOffsetRef.current += performance.now() - (startTimeRef.current + elapsed + pauseOffsetRef.current);
    setIsPaused(false);
  };

  const handleCallAccepted = useCallback(() => {
    // Transition handled by time-based logic
  }, []);

  const handleAlertTriggered = useCallback(() => {
    phaseOverrideRef.current = "report";
    setPhase("report");
  }, []);

  const progress = Math.min((elapsed / TOTAL_DEMO_DURATION) * 100, 100);
  const currentPhaseInfo = DEMO_PHASES.find((p) => p.id === phase);

  return (
    <div className="demo-page">
      {/* Background */}
      <div className="demo-bg" />
      <div className="demo-grid" />

      {/* Header */}
      <header className="demo-header">
        <div className="demo-logo">
          <span className="demo-logo-icon">🛡️</span>
          <div className="demo-logo-text">
            <h1 className="demo-brand">ShieldNet Live</h1>
            <p className="demo-tagline">Real-Time Scam Protection Demo</p>
          </div>
        </div>
        <div className="demo-badge">DEMO</div>
      </header>

      {/* Main Content */}
      <main className="demo-main">
        {/* Phone */}
        <div className="demo-phone-container">
          <PhoneSimulator time="6:42">
            {phase === "lock" && <LockScreen />}
            {phase === "incoming" && <IncomingCall onAccept={handleCallAccepted} />}
            {(phase === "active" || phase === "alert") && (
              <ActiveCall
                elapsed={activeElapsed}
                onAlertTriggered={handleAlertTriggered}
              />
            )}
            {phase === "report" && <ReportScreen />}
          </PhoneSimulator>
        </div>

        {/* Controls Panel */}
        <div className="demo-controls">
          {/* Phase Indicator */}
          <div className="phase-indicator">
            <span className="phase-label">Current Phase</span>
            <span className="phase-name">{currentPhaseInfo?.label || "Ready"}</span>
          </div>

          {/* Progress Bar */}
          <div className="progress-section">
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-labels">
              <span>{Math.floor(elapsed / 1000)}s</span>
              <span>{TOTAL_DEMO_DURATION / 1000}s</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="control-buttons">
            {!isStarted ? (
              <button className="ctrl-btn ctrl-btn-primary" onClick={handleStart}>
                ▶ Start Demo
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button className="ctrl-btn ctrl-btn-primary" onClick={handleResume}>
                    ▶ Resume
                  </button>
                ) : (
                  <button className="ctrl-btn ctrl-btn-secondary" onClick={handlePause}>
                    ⏸ Pause
                  </button>
                )}
                <button className="ctrl-btn ctrl-btn-secondary" onClick={handleReplay}>
                  ↺ Replay
                </button>
              </>
            )}
          </div>

          {/* Phase Timeline */}
          <div className="timeline">
            <span className="timeline-label">Timeline</span>
            {DEMO_PHASES.map((p) => {
              const isActive = phase === p.id;
              const isPast = elapsed > p.startTime + p.duration;
              return (
                <div
                  key={p.id}
                  className={`timeline-item ${isActive ? "active" : ""} ${isPast ? "past" : ""}`}
                >
                  <div className="timeline-dot" />
                  <div className="timeline-info">
                    <span className="timeline-name">{p.label}</span>
                    <span className="timeline-time">{p.startTime / 1000}s – {(p.startTime + p.duration) / 1000}s</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Instructions */}
          <div className="demo-instructions">
            <p>📹 <strong>To record</strong>: Use Windows Game Bar (<code>Win+G</code>) or OBS to screen-record this page.</p>
            <p>💡 Crop to just the phone frame for a clean demo video.</p>
          </div>
        </div>
      </main>

      <style jsx>{`
        .demo-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .demo-bg {
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #030712 0%, #0c1220 40%, #111827 100%);
          z-index: 0;
        }
        .demo-grid {
          position: fixed;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        /* Header */
        .demo-header {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 40px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .demo-logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .demo-logo-icon {
          font-size: 28px;
        }
        .demo-logo-text {
          display: flex;
          flex-direction: column;
        }
        .demo-brand {
          font-size: 18px;
          font-weight: 700;
          color: white;
          margin: 0;
          letter-spacing: -0.3px;
        }
        .demo-tagline {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin: 0;
        }
        .demo-badge {
          font-size: 11px;
          font-weight: 700;
          color: #3b82f6;
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.2);
          padding: 4px 12px;
          border-radius: 100px;
          letter-spacing: 1.5px;
        }

        /* Main */
        .demo-main {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 60px;
          padding: 40px;
        }

        .demo-phone-container {
          flex-shrink: 0;
        }

        /* Controls */
        .demo-controls {
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .phase-indicator {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .phase-label {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
        }
        .phase-name {
          font-size: 22px;
          font-weight: 700;
          color: white;
        }

        .progress-section { }
        .progress-bar-bg {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 6px;
        }
        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 100px;
          transition: width 0.1s linear;
        }
        .progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          font-variant-numeric: tabular-nums;
        }

        .control-buttons {
          display: flex;
          gap: 10px;
        }
        .ctrl-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
        }
        .ctrl-btn-primary {
          background: #3b82f6;
          color: white;
        }
        .ctrl-btn-primary:hover {
          background: #2563eb;
        }
        .ctrl-btn-secondary {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.7);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .ctrl-btn-secondary:hover {
          background: rgba(255,255,255,0.1);
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .timeline-label {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          letter-spacing: 0.8px;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .timeline-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          position: relative;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: 5px;
          top: 24px;
          width: 1px;
          height: calc(100% - 12px);
          background: rgba(255,255,255,0.06);
        }
        .timeline-item:last-child::before {
          display: none;
        }
        .timeline-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.15);
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .timeline-item.active .timeline-dot {
          background: #3b82f6;
          border-color: #3b82f6;
          box-shadow: 0 0 8px rgba(59,130,246,0.4);
        }
        .timeline-item.past .timeline-dot {
          background: #22c55e;
          border-color: #22c55e;
        }
        .timeline-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .timeline-name {
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          font-weight: 500;
        }
        .timeline-item.active .timeline-name {
          color: white;
          font-weight: 600;
        }
        .timeline-time {
          font-size: 11px;
          color: rgba(255,255,255,0.25);
          font-variant-numeric: tabular-nums;
        }

        .demo-instructions {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 14px;
        }
        .demo-instructions p {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          margin: 0 0 6px;
          line-height: 1.5;
        }
        .demo-instructions p:last-child {
          margin-bottom: 0;
        }
        .demo-instructions code {
          background: rgba(255,255,255,0.08);
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 11px;
        }
        .demo-instructions strong {
          color: rgba(255,255,255,0.6);
        }
      `}</style>
    </div>
  );
}
