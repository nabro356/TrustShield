"use client";
import React, { useEffect, useMemo, useState, useRef } from "react";
import dynamic from "next/dynamic";
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });
import { Filter, Maximize2, Download, Search, X } from "lucide-react";
import { api, type GraphData } from "@/lib/api";
import { t, type LangCode } from "@/lib/i18n";

const COMMUNITY_COLORS = [
  "#3b82f6", "#f59e0b", "#10b981", "#8b5cf6",
  "#ef4444", "#06b6d4", "#ec4899", "#f97316",
];

const LABEL_COLORS: Record<string, string> = {
  Victim: "#64748b",
  PhoneNumber: "#2563eb",
  BankAccount: "#d97706",
  UPIId: "#7c3aed",
  MuleAccount: "#dc2626",
  IPAddress: "#0891b2",
  Email: "#0d9488",
};

interface Props {
  language: LangCode;
}

export default function FraudGraph({ language }: Props) {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<Record<string, unknown> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getGraph().then(setGraphData);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const highlightNodes = useMemo(() => {
    if (searchQuery && graphData) {
      const q = searchQuery.toLowerCase();
      return new Set(
        graphData.nodes.filter((n) => n.id.toLowerCase().includes(q)).map((n) => n.id)
      );
    }
    return new Set<string>();
  }, [searchQuery, graphData]);

  const getNodeColor = (node: Record<string, unknown>) => {
    if (highlightNodes.size > 0 && !highlightNodes.has(node.id as string)) {
      return "rgba(0,0,0,0.08)";
    }
    const label = node.label as string;
    return LABEL_COLORS[label] || COMMUNITY_COLORS[(node.community as number) % COMMUNITY_COLORS.length];
  };

  const getNodeSize = (node: Record<string, unknown>) => {
    if (highlightNodes.size > 0 && highlightNodes.has(node.id as string)) return 8;
    const risk = (node.risk_score as number) || 0;
    if (risk > 85) return 7;
    if (risk > 60) return 5.5;
    return 4;
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#fafbfc]">
      {/* Toolbar */}
      <div className="h-12 border-b border-border bg-white/90 backdrop-blur flex items-center justify-between px-4 z-10 absolute top-0 left-0 right-0">
        <div className="flex items-center gap-3">
          <h2 className="font-semibold text-sm text-foreground">{t("nav.graph", language)}</h2>
          <div className="h-4 w-px bg-border" />
          <div className="flex gap-3 text-xs text-muted-foreground">
            {Object.entries(LABEL_COLORS).slice(0, 4).map(([label, color]) => (
              <span key={label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-7 py-1.5 text-xs border border-border rounded-lg bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
          <button className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground" title="Filter graph"><Filter className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground" title="Export graph"><Download className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground" title="Fit view"><Maximize2 className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Graph Canvas */}
      <div ref={containerRef} className="flex-1 w-full relative pt-12">
        {typeof window !== "undefined" && graphData && (
          <ForceGraph2D
            width={dimensions.width}
            height={dimensions.height - 48}
            graphData={graphData}
            nodeLabel={(node: Record<string, unknown>) =>
              `${node.id}\nType: ${node.label}\nRisk: ${node.risk_score}${node.city ? `\nCity: ${node.city}` : ""}`
            }
            nodeColor={getNodeColor}
            nodeRelSize={5}
            nodeVal={(node: Record<string, unknown>) => getNodeSize(node)}
            linkColor={() => "rgba(0,0,0,0.08)"}
            linkDirectionalArrowLength={3.5}
            linkDirectionalArrowRelPos={1}
            linkCurvature={0.15}
            linkWidth={1}
            backgroundColor="#fafbfc"
            onNodeClick={(node) => setSelectedNode(node as Record<string, unknown>)}
            cooldownTicks={60}
          />
        )}
      </div>

      {/* Node Detail Panel */}
      {selectedNode && (
        <div className="absolute top-12 right-0 w-72 h-[calc(100%-48px)] bg-white border-l border-border shadow-elevated p-4 overflow-y-auto animate-slide-in-right z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Entity Details</h3>
            <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-secondary rounded-lg">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs text-muted-foreground">ID</span>
              <p className="text-sm font-mono font-medium break-all">{selectedNode.id as string}</p>
            </div>
            <div className="flex gap-3">
              <div>
                <span className="text-xs text-muted-foreground">Type</span>
                <p className="text-sm font-medium">{selectedNode.label as string}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Risk Score</span>
                <p className={`text-sm font-bold ${
                  (selectedNode.risk_score as number) > 85 ? "text-red-600" :
                  (selectedNode.risk_score as number) > 60 ? "text-amber-600" : "text-green-600"
                }`}>{selectedNode.risk_score as number}/100</p>
              </div>
            </div>
            {selectedNode.city ? (
              <div>
                <span className="text-xs text-muted-foreground">City</span>
                <p className="text-sm font-medium">{String(selectedNode.city)}</p>
              </div>
            ) : null}
            {selectedNode.status ? (
              <div>
                <span className="text-xs text-muted-foreground">Operational Status</span>
                <p className="text-sm font-medium">{String(selectedNode.status)}</p>
              </div>
            ) : null}
            {selectedNode.evidence_count ? (
              <div>
                <span className="text-xs text-muted-foreground">Evidence Items</span>
                <p className="text-sm font-medium">{String(selectedNode.evidence_count)}</p>
              </div>
            ) : null}
            <div>
              <span className="text-xs text-muted-foreground">Community</span>
              <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium" style={{
                backgroundColor: COMMUNITY_COLORS[(selectedNode.community as number) % COMMUNITY_COLORS.length] + "20",
                color: COMMUNITY_COLORS[(selectedNode.community as number) % COMMUNITY_COLORS.length],
              }}>
                Ring #{selectedNode.community as number}
              </span>
            </div>

            {/* Connected Entities */}
            {graphData && (
              <div>
                <span className="text-xs text-muted-foreground">Connected Entities</span>
                <div className="mt-1 space-y-1">
                  {graphData.links
                    .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id ||
                      (typeof l.source === "object" && (l.source as Record<string, unknown>).id === selectedNode.id) ||
                      (typeof l.target === "object" && (l.target as Record<string, unknown>).id === selectedNode.id))
                    .slice(0, 8)
                    .map((link, idx) => {
                      const otherId = (typeof link.source === "object" ? (link.source as Record<string, unknown>).id : link.source) === selectedNode.id
                        ? (typeof link.target === "object" ? (link.target as Record<string, unknown>).id : link.target)
                        : (typeof link.source === "object" ? (link.source as Record<string, unknown>).id : link.source);
                      return (
                        <div key={idx} className="text-xs bg-secondary/50 rounded-lg px-2 py-1.5 flex justify-between">
                          <span className="truncate font-mono">{otherId as string}</span>
                          <span className="text-muted-foreground ml-1 shrink-0">{link.type}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
