"use client";
import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import FraudGraph from "@/components/FraudGraph";
import CounterfeitSandbox from "@/components/CounterfeitSandbox";
import ScamAnalyzer from "@/components/ScamAnalyzer";
import ThreatMap from "@/components/ThreatMap";
import CitizenReportForm from "@/components/CitizenReportForm";
import { Activity, ShieldAlert, Users, Shield, Siren } from "lucide-react";
import { api, connectWebSocket, type GraphStats, type ThreatAlert } from "@/lib/api";
import { t, type LangCode } from "@/lib/i18n";

export default function Home() {
  const [activeTab, setActiveTab] = useState("graph");
  const [language, setLanguage] = useState<LangCode>("en");
  const [stats, setStats] = useState<GraphStats | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: number; title: string; type: string }>>([]);

  // Fetch stats
  useEffect(() => {
    api.getStats().then(setStats);
    const interval = setInterval(() => api.getStats().then(setStats), 15000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket connection
  useEffect(() => {
    const ws = connectWebSocket((alert: ThreatAlert) => {
      const newToast = { id: Date.now(), title: alert.data?.title || "New Alert", type: alert.type };
      setToasts((prev) => [...prev, newToast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 5000);
      // Refresh stats on new events
      api.getStats().then(setStats);
    });
    return () => ws?.close();
  }, []);

  const kpiCards = [
    {
      label: t("kpi.scamsTracked", language),
      value: stats?.scams_analyzed ?? 156,
      icon: Activity,
      color: "text-blue-600",
      bg: "bg-blue-50",
      change: "+12 today",
    },
    {
      label: t("kpi.fraudRings", language),
      value: stats?.fraud_rings ?? 4,
      icon: Users,
      color: "text-amber-600",
      bg: "bg-amber-50",
      change: `${stats?.total_nodes ?? 24} entities`,
    },
    {
      label: t("kpi.counterfeit", language),
      value: stats?.counterfeit_flagged ?? 23,
      icon: ShieldAlert,
      color: "text-red-600",
      bg: "bg-red-50",
      change: "INR 8.4M face value",
    },
    {
      label: t("kpi.digitalArrest", language),
      value: stats?.active_alerts ?? 7,
      icon: Siren,
      color: "text-violet-600",
      bg: "bg-violet-50",
      change: "Real-time monitoring",
    },
  ];

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} language={language} setLanguage={setLanguage} />

      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-white/80 backdrop-blur-md sticky top-0 z-10 shadow-soft">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-base font-semibold tracking-tight">{t("app.title", language)}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-200 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {t("status.online", language)}
            </div>
          </div>
        </header>

        <div className="p-5 flex-1 flex flex-col gap-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpiCards.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-border rounded-lg p-4 flex flex-col shadow-card hover:shadow-elevated transition-shadow duration-300 animate-slide-in-up"
                  style={{ animationDelay: `${idx * 80}ms`, animationFillMode: "both" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
                    <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${kpi.color}`} />
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-foreground animate-count-up">{kpi.value.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground mt-1">{kpi.change}</span>
                </div>
              );
            })}
          </div>

          {/* Main Workspace */}
          <div className="flex-1 bg-white border border-border rounded-lg overflow-hidden flex relative shadow-card min-h-[500px]">
            {activeTab === "graph" && <FraudGraph language={language} />}
            {activeTab === "vision" && <CounterfeitSandbox language={language} />}
            {activeTab === "scam" && <ScamAnalyzer language={language} />}
            {activeTab === "map" && <ThreatMap language={language} />}
            {activeTab === "reports" && <CitizenReportForm language={language} />}
          </div>
        </div>
      </main>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-white border border-border rounded-lg px-4 py-3 shadow-elevated animate-slide-in-right max-w-sm"
          >
            <p className="text-sm font-medium text-foreground">{toast.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
