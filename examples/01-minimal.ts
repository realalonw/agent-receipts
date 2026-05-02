/**
 * Example 01 — Minimal
 *
 * The simplest possible use of agent-receipts.
 * No React, no framework — just @agent-receipts/core.
 *
 *   pnpm add @agent-receipts/core
 *   npx tsx examples/01-minimal.ts
 */

import {
  createReceipt,
  exportReceiptToJSON,
  exportReceiptToMarkdown,
  validateReceipt,
} from "../src/index.ts";

// ─── 1. Simulate your AI call ─────────────────────────────────────────────────
//
//   In a real app this would be something like:
//     const res = await openai.chat.completions.create({ model: "gpt-4o", messages })
//     const answer = res.choices[0].message.content ?? ""
//
const answer =
  "Revenue grew 18% year-over-year to $4.2B in Q3 2024. " +
  "Operating margin expanded 200bps to 23%. " +
  "Management raised full-year guidance by 5%.";

// ─── 2. Create the receipt ────────────────────────────────────────────────────
//
//   Field notes:
//   - id and timestamp are auto-generated if omitted
//   - confidenceScore is clamped to [0, 100]
//   - sourcesUsed[].relevance is a 0–1 float
//   - toolCalls[].inputSummary and outputSummary are plain strings

const receipt = createReceipt({
  task:    "Summarise the Acme Corp Q3 2024 earnings report",
  model:   "gpt-4o",
  status:  "completed",
  finalAnswer: answer,

  confidenceScore:        87,
  humanReviewRecommended: false,

  sourcesUsed: [
    {
      title:     "Acme Corp Q3 2024 Earnings Press Release",
      url:       "https://acme.example.com/investors/q3-2024",
      snippet:   "Revenue grew 18% YoY to $4.2B with operating margin expansion.",
      relevance: 0.95,  // 0–1 float
    },
    {
      title:     "Bloomberg analyst consensus — October 2024",
      url:       "https://bloomberg.example.com/acme",
      relevance: 0.78,
    },
  ],

  toolCalls: [
    {
      name:          "fetch_document",
      inputSummary:  "Fetched Q3 earnings press release from acme.example.com/investors/q3-2024",
      outputSummary: "Document retrieved successfully. 2,800 words. Structured financial tables included.",
      status:        "success",
    },
    {
      name:          "web_search",
      inputSummary:  "Search: Acme Corp Q3 2024 analyst consensus Bloomberg",
      outputSummary: "Found 8 results. Top result: Bloomberg consensus page showing 3 analyst upgrades.",
      status:        "success",
    },
  ],

  assumptions: [
    "The user is asking about the most recently filed quarter",
    "All figures are in USD unless otherwise stated",
    "Fiscal year ends December 31",
  ],

  riskFlags: [
    "Forward-looking management guidance is opinion, not verified fact",
    "Analyst consensus may not include all active coverage",
  ],

  humanReviewChecklist: [
    "Confirm all revenue figures against the source document",
    "Verify analyst consensus source is current before sharing",
    "Review any forward-looking statements before external distribution",
  ],
});

// ─── 3. Validate (recommended before storing or forwarding) ───────────────────

const validation = validateReceipt(receipt);
if (!validation.valid) {
  console.error("Receipt validation failed:", validation.errors);
  process.exit(1);
}

// ─── 4. Export ────────────────────────────────────────────────────────────────

// Structured JSON — for logs, databases, APIs
console.log("─── JSON ───────────────────────────────────────────────────");
console.log(exportReceiptToJSON(receipt));

// Human-readable Markdown — for Notion, Slack, PR descriptions
console.log("\n─── Markdown ───────────────────────────────────────────────");
console.log(exportReceiptToMarkdown(receipt));

// ─── 5. Receipt summary ───────────────────────────────────────────────────────

console.log("\n─── Summary ────────────────────────────────────────────────");
console.log({
  id:              receipt.id,
  createdAt:       receipt.timestamp,
  status:          receipt.status,
  confidenceScore: receipt.confidenceScore,
  sourcesUsed:     receipt.sourcesUsed.length,
  toolCalls:       receipt.toolCalls.length,
  riskFlags:       receipt.riskFlags.length,
});
