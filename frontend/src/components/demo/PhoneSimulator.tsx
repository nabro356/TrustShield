"use client";

import React from "react";

interface Props {
  children: React.ReactNode;
  time?: string;
}

export default function PhoneSimulator({ children, time }: Props) {
  const displayTime = time || "6:42";

  return (
    <div className="phone-outer">
      {/* Bezel */}
      <div className="phone-bezel">
        {/* Status Bar */}
        <div className="phone-status-bar">
          <span className="status-time">{displayTime}</span>
          <div className="status-notch" />
          <div className="status-icons">
            {/* Signal bars */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect x="0" y="9" width="3" height="3" rx="0.5" fill="white" />
              <rect x="4" y="6" width="3" height="6" rx="0.5" fill="white" />
              <rect x="8" y="3" width="3" height="9" rx="0.5" fill="white" />
              <rect x="12" y="0" width="3" height="12" rx="0.5" fill="white" opacity="0.35" />
            </svg>
            {/* WiFi */}
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
              <path d="M7 10.5a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" fill="white" />
              <path d="M3.5 8.5a5 5 0 017 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              <path d="M1 5.5a8.5 8.5 0 0112 0" stroke="white" strokeWidth="1.3" strokeLinecap="round" fill="none" opacity="0.35" />
            </svg>
            {/* Battery */}
            <div className="status-battery">
              <div className="status-battery-fill" />
            </div>
            <span className="status-battery-pct">84</span>
          </div>
        </div>

        {/* Screen Content */}
        <div className="phone-screen">
          {children}
        </div>

        {/* Navigation Bar */}
        <div className="phone-nav-bar">
          <div className="phone-nav-pill" />
        </div>
      </div>

      <style jsx>{`
        .phone-outer {
          width: 390px;
          height: 844px;
          position: relative;
          flex-shrink: 0;
        }
        .phone-bezel {
          width: 100%;
          height: 100%;
          background: #0a0a0a;
          border-radius: 48px;
          border: 3px solid #2a2a2a;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.06),
            0 25px 60px rgba(0,0,0,0.6),
            0 8px 20px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.04);
        }

        /* Status Bar */
        .phone-status-bar {
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          position: relative;
          z-index: 10;
          flex-shrink: 0;
        }
        .status-time {
          font-size: 15px;
          font-weight: 600;
          color: white;
          letter-spacing: 0.3px;
          font-variant-numeric: tabular-nums;
        }
        .status-notch {
          width: 120px;
          height: 32px;
          background: #0a0a0a;
          border-radius: 0 0 20px 20px;
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
        }
        .status-icons {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-battery {
          width: 24px;
          height: 11px;
          border: 1.5px solid rgba(255,255,255,0.5);
          border-radius: 3px;
          padding: 1.5px;
          position: relative;
        }
        .status-battery::after {
          content: '';
          position: absolute;
          right: -4px;
          top: 50%;
          transform: translateY(-50%);
          width: 2px;
          height: 5px;
          background: rgba(255,255,255,0.5);
          border-radius: 0 1px 1px 0;
        }
        .status-battery-fill {
          width: 82%;
          height: 100%;
          background: #34c759;
          border-radius: 1.5px;
        }
        .status-battery-pct {
          font-size: 12px;
          color: rgba(255,255,255,0.7);
          font-weight: 500;
          font-variant-numeric: tabular-nums;
        }

        /* Screen */
        .phone-screen {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #0a0a0a;
        }

        /* Navigation Bar */
        .phone-nav-bar {
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .phone-nav-pill {
          width: 134px;
          height: 5px;
          background: rgba(255,255,255,0.25);
          border-radius: 100px;
        }
      `}</style>
    </div>
  );
}
