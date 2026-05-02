/**
 * Example 02 — React
 *
 * A self-contained React component that runs a fake AI task,
 * creates a receipt, and renders it with <ReceiptCard />.
 *
 *   pnpm add @agent-receipts/core @agent-receipts/react
 *
 * Drop this into any React app (Next.js, Vite, CRA).
 * Add "use client" at the top if you're using Next.js App Router.
 */

"use client";

import React from "react";
import {
  createReceipt,
  exportReceiptToJSON,
  exportReceiptToMarkdown,
} from "@agent-receipts/core";
import { ReceiptCard, useReceipt } from "@agent-receipts/react";

// ─── Fake AI call ─────────────────────────────────────────────────────────────
//
// Replace this with your actual model call:
//   const res = await openai.chat.completions.create({ model: "gpt-4o", messages })
//   const answer = res.choices[0].message.content ?? ""
//
async function runFakeAgent(task: string) {
  await new Promise((r) => setTimeout(r, 800)); // simulate latency

  // Return the shape that createReceipt() expects
  return {
    answer:
      "The three most-cited risk factors for early startup failure are " +
      "running out of runway (38%), no product-market fit (35%), and " +
      "team dysfunction (23%). Source: CB Insights post-mortem analysis of 111 startups.",
    model: "gpt-4o",
    sources: [
      {
        title:     "CB Insights — 111 startup post-mortems",
        url:       "https://cbinsights.example.com/startup-failure",
        relevance: 0.92,  // 0–1 float
      },
      {
        title:     "First Round Capital — failure analysis 2023",
        url:       "https://firstround.example.com/failure",
        relevance: 0.74,
      },
    ],
    toolCalls: [
      {
        name:          "web_search",
        inputSummary:  "Search: early stage startup failure reasons data statistical",
        outputSummary: "Retrieved 8 results. Top: CB Insights post-mortem report, First Round analysis.",
        status:        "success" as const,
      },
    ],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

const TASK = "What are the top reasons early-stage startups fail?";

export function ResearchAssistant() {
  const { receipt, loading, error, run, reset } = useReceipt();

  async function handleRun() {
    await run(async () => {
      const result = await runFakeAgent(TASK);

      return createReceipt({
        task:                   TASK,
        model:                  result.model,
        status:                 "completed",
        finalAnswer:            result.answer,
        confidenceScore:        82,
        humanReviewRecommended: false,
        sourcesUsed:            result.sources,
        toolCalls:              result.toolCalls,
        assumptions: [
          "Data reflects startups that raised at least a seed round",
          "Failure is defined as shutdown or distressed acquisition",
        ],
        riskFlags: [
          "Sample size (111 startups) is small relative to the total population",
          "Self-reported post-mortems may understate team issues",
        ],
        humanReviewChecklist: [
          "Verify the CB Insights study is still the most current version",
          "Check whether sample is geographically representative",
        ],
      });
    });
  }

  function handleDownloadMd() {
    if (!receipt) return;
    const blob = new Blob([exportReceiptToMarkdown(receipt)], { type: "text/markdown" });
    const a = Object.assign(document.createElement("a"), {
      href:     URL.createObjectURL(blob),
      download: `receipt-${receipt.id}.md`,
    });
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function handleCopyJSON() {
    if (!receipt) return;
    await navigator.clipboard.writeText(exportReceiptToJSON(receipt));
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <h2 style={{ marginTop: 0 }}>Research Assistant</h2>
      <p style={{ color: "#6b7280" }}>{TASK}</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          onClick={handleRun}
          disabled={loading}
          style={{
            padding: "8px 18px", borderRadius: 7, border: "none",
            background: loading ? "#e5e7eb" : "#111",
            color: loading ? "#9ca3af" : "#fff",
            fontWeight: 700, cursor: loading ? "default" : "pointer",
          }}
        >
          {loading ? "Running…" : "Run agent"}
        </button>

        {receipt && (
          <button
            onClick={reset}
            style={{
              padding: "8px 14px", borderRadius: 7,
              border: "1px solid #e5e7eb", background: "transparent",
              color: "#6b7280", cursor: "pointer",
            }}
          >
            Reset
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: "#ef4444", marginBottom: 16 }}>
          Error: {error.message}
        </p>
      )}

      {receipt && (
        <>
          <div style={{
            padding: "14px 16px", borderRadius: 8,
            background: "#f9fafb", border: "1px solid #e5e7eb",
            fontSize: 14, lineHeight: 1.65, marginBottom: 20,
          }}>
            {receipt.finalAnswer}
          </div>

          <ReceiptCard
            receipt={receipt}
            onExportJSON={handleCopyJSON}
            onExportMarkdown={handleDownloadMd}
          />
        </>
      )}
    </div>
  );
}

export default ResearchAssistant;
