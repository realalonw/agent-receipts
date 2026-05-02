/**
 * Example 03b — Next.js Page
 *
 * A Next.js 14 App Router client page that calls the /api/agent
 * endpoint and renders the answer + receipt side by side.
 *
 * File location in your app: app/agent/page.tsx
 * Requires the API route from 03-nextjs-api-route.ts.
 */

"use client";

import React, { useState } from "react";
import type { AgentReceipt } from "@agent-receipts/core";
import {
  exportReceiptToJSON,
  exportReceiptToMarkdown,
} from "@agent-receipts/core";
import { ReceiptCard } from "@agent-receipts/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgentResponse {
  answer:  string;
  receipt: AgentReceipt;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentPage() {
  const [task,    setTask]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [result,  setResult]  = useState<AgentResponse | null>(null);
  const [copied,  setCopied]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!task.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/agent", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ task: task.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed with status ${res.status}`);
      }

      const data: AgentResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyJSON() {
    if (!result) return;
    await navigator.clipboard.writeText(exportReceiptToJSON(result.receipt));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadMd() {
    if (!result) return;
    const blob = new Blob([exportReceiptToMarkdown(result.receipt)], { type: "text/markdown" });
    const a    = Object.assign(document.createElement("a"), {
      href:     URL.createObjectURL(blob),
      download: `receipt-${result.receipt.id}.md`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <main style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 0 }}>
        Agent + Receipt
      </h1>
      <p style={{ color: "#6b7280", marginBottom: 32 }}>
        Type any task. The agent runs and returns an answer with an attached receipt.
      </p>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, marginBottom: 32 }}>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="e.g. Summarise the Q3 earnings report for Acme Corp"
          style={{
            flex: 1, padding: "10px 14px", fontSize: 14,
            border: "1px solid #d1d5db", borderRadius: 8,
            outline: "none", fontFamily: "inherit",
          }}
        />
        <button
          type="submit"
          disabled={loading || !task.trim()}
          style={{
            padding: "10px 20px", borderRadius: 8, border: "none",
            background: loading || !task.trim() ? "#e5e7eb" : "#111",
            color:      loading || !task.trim() ? "#9ca3af" : "#fff",
            fontWeight: 700, fontSize: 14, cursor: loading ? "default" : "pointer",
            fontFamily: "inherit", whiteSpace: "nowrap",
          }}
        >
          {loading ? "Running…" : "Run →"}
        </button>
      </form>

      {/* Error */}
      {error && (
        <div style={{
          padding: "12px 16px", borderRadius: 8,
          background: "#fef2f2", border: "1px solid #fecaca",
          color: "#dc2626", fontSize: 14, marginBottom: 24,
        }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Answer */}
          <div>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase", color: "#9ca3af", marginBottom: 8,
            }}>
              Answer
            </div>
            <div style={{
              padding: "14px 16px", borderRadius: 8,
              background: "#f9fafb", border: "1px solid #e5e7eb",
              fontSize: 14, lineHeight: 1.65, color: "#111",
            }}>
              {result.answer}
            </div>
          </div>

          {/* Receipt */}
          <div>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 8,
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", color: "#9ca3af",
              }}>
                Attached receipt
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={handleCopyJSON}
                  style={{
                    padding: "4px 12px", borderRadius: 6, fontSize: 12,
                    border: "1px solid #e5e7eb", background: "#fff",
                    color: copied ? "#16a34a" : "#6b7280",
                    cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  {copied ? "✓ Copied" : "Copy JSON"}
                </button>
                <button
                  onClick={handleDownloadMd}
                  style={{
                    padding: "4px 12px", borderRadius: 6, fontSize: 12,
                    border: "1px solid #e5e7eb", background: "#fff",
                    color: "#6b7280", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  Export Markdown
                </button>
              </div>
            </div>

            <ReceiptCard receipt={result.receipt} />
          </div>
        </div>
      )}
    </main>
  );
}
