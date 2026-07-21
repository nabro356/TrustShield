"use client";
import React from "react";
import { Network, ScanLine, Map, Settings, Shield, Brain, FileText, Globe } from "lucide-react";
import { LANGUAGES, t, type LangCode } from "@/lib/i18n";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: LangCode;
  setLanguage: (lang: LangCode) => void;
}

export default function Sidebar({ activeTab, setActiveTab, language, setLanguage }: SidebarProps) {
  const navItems = [
    { id: "graph", labelKey: "nav.graph", icon: Network },
    { id: "vision", labelKey: "nav.vision", icon: ScanLine },
    { id: "scam", labelKey: "nav.scam", icon: Brain },
    { id: "map", labelKey: "nav.map", icon: Map },
    { id: "reports", labelKey: "nav.reports", icon: FileText },
  ];

  return (
    <aside className="w-64 bg-white border-r border-border flex flex-col justify-between h-full relative z-20 shadow-soft">
      <div className="p-5">
        {/* Brand */}
        <div className="mb-8 px-2">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            <h2 className="text-xl font-bold gradient-text-shield">ShieldNet</h2>
          </div>
          <p className="text-xs text-muted-foreground pl-[42px]">{t("app.subtitle", language)}</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                  isActive
                    ? "bg-primary/8 text-primary font-semibold shadow-sm border border-primary/15"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
                }`}
              >
                <Icon className={`w-[18px] h-[18px] ${isActive ? "text-primary" : ""}`} />
                {t(item.labelKey, language)}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border space-y-2">
        {/* Language Selector */}
        <div className="px-2 pb-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground mb-2 font-medium">
            <Globe className="w-3.5 h-3.5" />
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LangCode)}
            className="w-full bg-secondary/60 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>
        </div>

        <button className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-colors">
          <Settings className="w-[18px] h-[18px]" />
          {t("settings", language)}
        </button>
      </div>
    </aside>
  );
}
