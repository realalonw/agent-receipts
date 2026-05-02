import React, { useState, useCallback } from "react";
import type { AgentReceipt, SourceUsed, ToolCallRecord } from "../core/receipt.ts";

/**
 * Agent Receipts: UI Components.
 * 
 * We keep it simple: pure React, zero CSS dependencies, inline styles only.
 * The design is a "dark bet-slip" — compact, high-contrast, and auditable.
 */

// -----------------------------------------------------------------------------
// Design Tokens
// -----------------------------------------------------------------------------

const T = {
  bg:          "#080808",
  s1:          "#0d0d0d",
  s2:          "#161616",
  border:      "#222222",
  text:        "#f0efe9",
  muted:       "#7a7974",
  green:       "#4ade80",
  yellow:      "#fbbf24",
  red:         "#f87171",
  blue:        "#60a5fa",
  mono:        "'JetBrains Mono', 'Fira Code', monospace",
  sans:        "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

// -----------------------------------------------------------------------------
// The Hook: useReceipt
// -----------------------------------------------------------------------------

export function useReceipt() {
  const [receipt, setReceipt] = useState<AgentReceipt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<Error | null>(null);

  const run = useCallback(async (fn: () => Promise<AgentReceipt>) => {
    setLoading(true); setError(null);
    try {
      const res = await fn();
      setReceipt(res);
      return res;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { receipt, loading, error, run, setReceipt, reset: () => setReceipt(null) };
}

// -----------------------------------------------------------------------------
// The Component: ReceiptCard
// -----------------------------------------------------------------------------

export function ReceiptCard({ 
  receipt, 
  onExportJSON, 
  onExportMarkdown,
  style 
}: { 
  receipt:          AgentReceipt; 
  onExportJSON?:     (r: AgentReceipt) => void;
  onExportMarkdown?: (r: AgentReceipt) => void;
  style?:           React.CSSProperties;
}) {
  return (
    <div style={{
      background: T.s1, border: `1px solid ${T.border}`, borderRadius: 12,
      fontFamily: T.sans, color: T.text, overflow: "hidden", ...style
    }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 900, color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Agent Receipt</div>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.text }}>{receipt.model}</div>
        </div>
        <StatusBadge status={receipt.status} />
      </div>

      {/* Confidence */}
      <div style={{ padding: "16px 20px" }}>
        <ConfidenceBar score={receipt.confidenceScore} />
      </div>

      {/* Task & Answer (minimal) */}
      <div style={{ padding: "0 20px 16px" }}>
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>{receipt.finalAnswer}</div>
      </div>

      {/* Dynamic Sections */}
      <Section label="Sources" count={receipt.sourcesUsed.length}>
        {receipt.sourcesUsed.map((s, i) => <SourceRow key={i} source={s} />)}
      </Section>

      <Section label="Tool Calls" count={receipt.toolCalls.length}>
        {receipt.toolCalls.map((t, i) => <ToolRow key={i} call={t} />)}
      </Section>

      {/* Footer / Actions */}
      <div style={{ padding: "12px 20px", background: "#0a0a0a", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10 }}>
        {onExportJSON && <button onClick={() => onExportJSON(receipt)} style={btnStyle}>JSON</button>}
        {onExportMarkdown && <button onClick={() => onExportMarkdown(receipt)} style={btnStyle}>Markdown</button>}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// UI Atoms
// -----------------------------------------------------------------------------

const btnStyle: React.CSSProperties = {
  background: T.s2, border: `1px solid ${T.border}`, borderRadius: 6,
  color: T.muted, fontSize: 10, fontWeight: 700, padding: "4px 10px", cursor: "pointer"
};

function Section({ label, count, children }: { label: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <div style={{ padding: "12px 20px", borderTop: `1px dotted ${T.border}` }}>
      <div style={{ fontSize: 9, fontWeight: 900, color: T.muted, textTransform: "uppercase", marginBottom: 8 }}>{label} ({count})</div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = status === "completed" ? T.green : status === "warning" ? T.yellow : T.red;
  return (
    <div style={{ 
      fontFamily: T.mono, fontSize: 9, fontWeight: 700, color, 
      background: `${color}15`, border: `1px solid ${color}30`, 
      borderRadius: 100, padding: "2px 8px" 
    }}>{status.toUpperCase()}</div>
  );
}

function ConfidenceBar({ score }: { score: number }) {
  const color = score >= 80 ? T.green : score >= 50 ? T.yellow : T.red;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: T.muted }}>Confidence</span>
        <span style={{ fontFamily: T.mono, fontSize: 11, color }}>{score}%</span>
      </div>
      <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${score}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}

function SourceRow({ source }: { source: SourceUsed }) {
  return (
    <div style={{ fontSize: 12, marginBottom: 4, display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: source.url ? T.blue : T.text }}>{source.title}</span>
      {source.relevance && <span style={{ fontFamily: T.mono, color: T.muted, fontSize: 10 }}>{(source.relevance * 100).toFixed(0)}%</span>}
    </div>
  );
}

function ToolRow({ call }: { call: ToolCallRecord }) {
  const color = call.status === "success" ? T.green : T.red;
  return (
    <div style={{ fontSize: 11, color: T.muted, fontFamily: T.mono, marginBottom: 2 }}>
      <span style={{ color }}>●</span> {call.name}
    </div>
  );
}
