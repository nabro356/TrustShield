"use client";

import React from "react";
import { motion } from "framer-motion";
import { CALLER } from "@/lib/demoScript";

interface Props {
  onAccept: () => void;
}

export default function IncomingCall({ onAccept }: Props) {
  React.useEffect(() => {
    const timer = setTimeout(onAccept, 3200);
    return () => clearTimeout(timer);
  }, [onAccept]);

  return (
    <div className="incoming-call">
      <div className="incoming-bg" />
      <motion.div
        className="caller-info"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="caller-avatar">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="16" r="8" fill="rgba(255,255,255,0.6)" />
            <ellipse cx="20" cy="34" rx="14" ry="10" fill="rgba(255,255,255,0.6)" />
          </svg>
        </div>
        <span className="caller-number">{CALLER.number}</span>
        <span className="caller-label">{CALLER.label}</span>
        <span className="caller-location">{CALLER.location}</span>
      </motion.div>
      <motion.div
        className="call-actions"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="action-group">
          <div className="action-btn action-decline">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M5 11c2-4 6.5-6.5 9-6.5s7 2.5 9 6.5c.5 1-.5 2-1.5 2l-3-1c-.8-.3-1-1-.8-1.7.2-.6.3-1.3.3-1.8 0-.5-.4-1-.9-1.2C16 7 15 6.8 14 6.8s-2 .2-3.1.5c-.5.2-.9.7-.9 1.2 0 .5.1 1.2.3 1.8.2.7 0 1.4-.8 1.7l-3 1C5.5 13 4.5 12 5 11z" fill="white" transform="rotate(135 14 11)"/>
            </svg>
          </div>
          <span className="action-label">Decline</span>
        </div>
        <div className="action-group">
          <motion.div
            className="action-btn action-accept"
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(52, 199, 89, 0.4)",
                "0 0 0 16px rgba(52, 199, 89, 0)",
                "0 0 0 0 rgba(52, 199, 89, 0.4)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M5 17c2 4 6.5 6.5 9 6.5s7-2.5 9-6.5c.5-1-.5-2-1.5-2l-3 1c-.8.3-1 1-.8 1.7.2.6.3 1.3.3 1.8 0 .5-.4 1-.9 1.2-1.1.3-2.1.5-3.1.5s-2-.2-3.1-.5c-.5-.2-.9-.7-.9-1.2 0-.5.1-1.2.3-1.8.2-.7 0-1.4-.8-1.7l-3-1C5.5 15 4.5 16 5 17z" fill="white"/>
            </svg>
          </motion.div>
          <span className="action-label">Accept</span>
        </div>
      </motion.div>
    </div>
  );
}
