"use client";

import React from "react";
import { motion } from "framer-motion";
import { EXTRACTED_ENTITIES } from "@/lib/demoScript";

export default function ReportScreen() {
  return (
    <div className="report-screen">
      <div className="report-bg" />
      <motion.div
        className="report-header"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="success-ring"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <motion.path
              d="M10 20L17 27L30 13"
              stroke="#22c55e"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            />
          </svg>
        </motion.div>
        <h2 className="report-title">Protection Confirmed</h2>
        <p className="report-subtitle">Call ended · Scam report auto-filed</p>
      </motion.div>
      <motion.div
        className="entities-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <span className="section-label">Entities Extracted & Filed</span>
        <div className="entities-list">
          {EXTRACTED_ENTITIES.map((entity, i) => (
            <motion.div
              key={entity.value}
              className="entity-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.8 + i * 0.15 }}
            >
              <span className="entity-icon">{entity.icon}</span>
              <div className="entity-info">
                <span className="entity-type">{entity.type}</span>
                <code className="entity-value">{entity.value}</code>
              </div>
              <div className="entity-risk">
                <span className="risk-value">{entity.risk}</span>
                <span className="risk-label">risk</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      <motion.div
        className="graph-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.3 }}
      >
        <div className="graph-card">
          <div className="graph-icon-wrap">
            <span className="graph-icon">🕸️</span>
          </div>
          <div className="graph-info">
            <span className="graph-title">Fraud Ring #1 Connection</span>
            <span className="graph-desc">
              3 entities matched existing intelligence graph.
              Connected to Delhi-NCR digital arrest syndicate.
            </span>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="report-actions"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 1.6 }}
      >
        <div className="action-done">
          <span>🛡️</span>
          <span>Added to ShieldNet Intelligence Graph</span>
        </div>
      </motion.div>
    </div>
  );
}
