"use client";
import React, { useState } from "react";
import { BarChart3, MapPin, TrendingUp } from "lucide-react";
import { t, type LangCode } from "@/lib/i18n";

interface CityData {
  name: string;
  x: number;
  y: number;
  cases: number;
  topScam: string;
  trend: string;
  color: string;
}

const HOTSPOT_CITIES: CityData[] = [
  { name: "Delhi-NCR", x: 53, y: 28, cases: 28400, topScam: "Digital Arrest", trend: "+18%", color: "#dc2626" },
  { name: "Mumbai", x: 38, y: 55, cases: 22100, topScam: "Phishing / KYC", trend: "+12%", color: "#dc2626" },
  { name: "Bengaluru", x: 44, y: 72, cases: 19800, topScam: "Investment", trend: "+24%", color: "#ea580c" },
  { name: "Hyderabad", x: 48, y: 62, cases: 16500, topScam: "Digital Arrest", trend: "+15%", color: "#ea580c" },
  { name: "Chennai", x: 50, y: 78, cases: 11200, topScam: "Lottery", trend: "+8%", color: "#d97706" },
  { name: "Kolkata", x: 64, y: 42, cases: 9800, topScam: "Digital Arrest", trend: "+22%", color: "#d97706" },
  { name: "Pune", x: 39, y: 58, cases: 8900, topScam: "Phishing", trend: "+10%", color: "#ca8a04" },
  { name: "Jaipur", x: 43, y: 33, cases: 7200, topScam: "Lottery", trend: "+6%", color: "#65a30d" },
  { name: "Lucknow", x: 55, y: 32, cases: 6100, topScam: "Digital Arrest", trend: "+14%", color: "#65a30d" },
  { name: "Ahmedabad", x: 35, y: 42, cases: 5400, topScam: "Investment", trend: "+9%", color: "#16a34a" },
  { name: "Chandigarh", x: 48, y: 22, cases: 4200, topScam: "Immigration", trend: "+5%", color: "#16a34a" },
  { name: "Kochi", x: 44, y: 80, cases: 3100, topScam: "Phishing", trend: "+7%", color: "#16a34a" },
];

interface Props {
  language: LangCode;
}

export default function ThreatMap({ language }: Props) {
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [hoveredCity, setHoveredCity] = useState<CityData | null>(null);

  const totalCases = HOTSPOT_CITIES.reduce((sum, c) => sum + c.cases, 0);

  return (
    <div className="w-full h-full flex overflow-hidden">
      {/* Map Panel */}
      <div className="flex-1 p-6 bg-white relative flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {t("nav.map", language)}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">Geospatial distribution of cyber fraud across India (2024-25 data)</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> &gt;20K</div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> 10K-20K</div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> 5K-10K</div>
            <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-green-500" /> &lt;5K</div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-gradient-to-b from-blue-50/50 to-slate-50 rounded-lg border border-border overflow-hidden">
          {/* Faux Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />

          {/* City Dots */}
          {HOTSPOT_CITIES.map((city) => (
            <div
              key={city.name}
              className="absolute cursor-pointer group"
              style={{ left: `${city.x}%`, top: `${city.y}%`, transform: "translate(-50%, -50%)" }}
              onClick={() => setSelectedCity(city)}
              onMouseEnter={() => setHoveredCity(city)}
              onMouseLeave={() => setHoveredCity(null)}
            >
              {/* Pulse ring */}
              <div
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{
                  backgroundColor: city.color,
                  width: Math.max(16, city.cases / 2000),
                  height: Math.max(16, city.cases / 2000),
                  left: `calc(50% - ${Math.max(8, city.cases / 4000)}px)`,
                  top: `calc(50% - ${Math.max(8, city.cases / 4000)}px)`,
                  animationDuration: `${3 - (city.cases / 30000)}s`,
                }}
              />
              {/* Dot */}
              <div
                className="relative rounded-full shadow-md border-2 border-white transition-transform group-hover:scale-150"
                style={{
                  backgroundColor: city.color,
                  width: Math.max(10, city.cases / 2500),
                  height: Math.max(10, city.cases / 2500),
                }}
              />
              {/* Label */}
              <span className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[10px] font-medium text-foreground/70 whitespace-nowrap">
                {city.name}
              </span>

              {/* Hover Tooltip */}
              {hoveredCity === city && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-white border border-border rounded-lg p-2.5 shadow-elevated z-20 whitespace-nowrap animate-fade-in">
                  <p className="font-semibold text-xs">{city.name}</p>
                  <p className="text-[10px] text-muted-foreground">{city.cases.toLocaleString()} cases - {city.topScam}</p>
                  <p className="text-[10px] text-red-600 font-medium">{city.trend} YoY</p>
                </div>
              )}
            </div>
          ))}

          {/* India Outline Label */}
          <div className="absolute bottom-4 left-4 text-xs text-muted-foreground/40 font-medium">INDIA - Threat Density Map</div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="w-72 border-l border-border bg-background p-5 overflow-y-auto">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Regional Statistics</h3>

        {/* Total */}
        <div className="bg-white border border-border rounded-lg p-4 mb-4 shadow-card">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Cases Tracked</span>
          </div>
          <span className="text-2xl font-bold text-foreground">{totalCases.toLocaleString()}</span>
          <span className="text-xs text-red-600 font-medium ml-2">+465% YoY (2024)</span>
        </div>

        {/* City Rankings */}
        <div className="space-y-2">
          {HOTSPOT_CITIES.slice(0, 8).map((city, idx) => (
            <button
              key={city.name}
              onClick={() => setSelectedCity(city)}
              className={`w-full text-left p-3 rounded-lg border transition-all text-sm ${
                selectedCity?.name === city.name
                  ? "bg-primary/5 border-primary/20 shadow-sm"
                  : "bg-white border-border hover:bg-secondary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">#{idx + 1}</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: city.color }} />
                  <span className="font-medium text-xs">{city.name}</span>
                </div>
                <span className="text-xs font-semibold">{(city.cases / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex items-center justify-between mt-1 pl-6">
                <span className="text-[10px] text-muted-foreground">{city.topScam}</span>
                <span className="text-[10px] text-red-600 flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> {city.trend}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Selected City Detail */}
        {selectedCity && (
          <div className="mt-4 bg-white border border-primary/20 rounded-lg p-4 shadow-sm animate-slide-in-up">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCity.color }} />
              <h4 className="font-semibold text-sm">{selectedCity.name}</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-secondary/50 rounded-lg p-2">
                <span className="text-muted-foreground block">Total Cases</span>
                <span className="font-bold">{selectedCity.cases.toLocaleString()}</span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2">
                <span className="text-muted-foreground block">Top Scam</span>
                <span className="font-bold">{selectedCity.topScam}</span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2">
                <span className="text-muted-foreground block">YoY Trend</span>
                <span className="font-bold text-red-600">{selectedCity.trend}</span>
              </div>
              <div className="bg-secondary/50 rounded-lg p-2">
                <span className="text-muted-foreground block">Severity</span>
                <span className="font-bold">{selectedCity.cases > 15000 ? "Critical" : selectedCity.cases > 8000 ? "High" : "Medium"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
