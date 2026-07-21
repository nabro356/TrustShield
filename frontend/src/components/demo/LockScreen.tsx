"use client";

import React from "react";
import { motion } from "framer-motion";

export default function LockScreen() {
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes().toString().padStart(2, "0");
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dateStr = `${dayNames[now.getDay()]}, ${monthNames[now.getMonth()]} ${now.getDate()}`;

  return (
    <div className="lockscreen">
      <div className="lockscreen-bg" />
      <motion.div
        className="lockscreen-clock"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <span className="clock-time">{hours}:{mins}</span>
        <span className="clock-date">{dateStr}</span>
      </motion.div>
      <motion.div
        className="lockscreen-notification"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
      >
        <div className="notif-icon">🛡️</div>
        <div className="notif-content">
          <span className="notif-app">ShieldNet Live</span>
          <span className="notif-text">Protection active · 0 threats today</span>
        </div>
        <span className="notif-time">now</span>
      </motion.div>
    </div>
  );
}
