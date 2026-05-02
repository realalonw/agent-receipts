/**
 * Example 03a — Next.js API Route
 *
 * A Next.js 14 App Router API route that accepts a task, runs a fake
 * model call, and returns { answer, receipt } as JSON.
 *
 * Copy this file to: app/api/agent/route.ts
 *
 *   POST /api/agent
 *   Body:     { "task": "Summarise the Q3 earnings report" }
 *   Response: { "answer": "...", "receipt": { ... } }
 */

import { NextRequest, NextResponse } from "next/server";
import { createReceipt } from "@agent-receipts/core";

// ─── Fake model call ──────────────────────────────────────────────────────────
//
// Replace this function with your real SDK call, e.g.:
//
//   import OpenAI from "openai";
//   const openai = new OpenAI();
//
//   async function callModel(task: string) {
//     const start = Date.now();
//     const res = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: [{ role: "user", content: task }],
//     });
//     return {
//       text:      res.choices[0].message.content ?? "",
//       model:     "gpt-4o",
//       durationMs: Date.now() - start,
//     };
//   }
//
async function callModel(task: string) {
  await new Promise((r) => setTimeout(r, 600)); // simulate latency

  return {
    text:  `Here is a summary of: "${task}". (Replace this with your real model call.)`,
    model: "gpt-4o",
    durationMs: 612,
    sources: [
      {
        title:     "Internal knowledge base",
        relevance: 0.88,  // 0–1 float
      },
    ],
    toolCalls: [] as Array<{
      name:          string;
      inputSummary:  string;
      outputSummary: string;
      status:        "success" | "error" | "skipped";
    }>,
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Parse and validate request body
  let task: string;
  try {
    const body = await req.json();
    task = (body.task ?? "").trim();
    if (!task) throw new Error("empty task");
  } catch {
    return NextResponse.json(
      { error: "Request body must include a non-empty `task` string." },
      { status: 400 }
    );
  }

  // 2. Run the model call
  const start = Date.now();
  const result = await callModel(task);

  // 3. Create the receipt from the result
  const receipt = createReceipt({
    task,
    model:                  result.model,
    status:                 "completed",
    finalAnswer:            result.text,
    durationMs:             Date.now() - start,
    confidenceScore:        80,
    humanReviewRecommended: false,
    sourcesUsed:            result.sources,
    toolCalls:              result.toolCalls,
    assumptions:            [],
    riskFlags:              [],
    humanReviewChecklist:   [],
  });

  // 4. Return answer + receipt — the client renders both
  return NextResponse.json({ answer: result.text, receipt });
}
