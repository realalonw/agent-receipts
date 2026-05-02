/**
 * Agent Receipts: A minimal, auditable protocol for AI transparency.
 * 
 * "Make your AI show its work."
 * 
 * This engine is intentionally dependency-free. We don't use Zod, Ajv, or any
 * heavy validation frameworks. We want a protocol that is human-readable, 
 * machine-verifiable, and simple enough to implement in any language in 50 lines.
 * 
 * Think of it as a "receipt" for an AI session — what it did, why it did it,
 * and how confident it actually was.
 * 
 * @author alon (Karpathified)
 */

// -----------------------------------------------------------------------------
// Types & Schema
// -----------------------------------------------------------------------------

export type ReceiptStatus = "completed" | "warning" | "failed";

/** A source consulted by the agent to produce its output. */
export interface SourceUsed {
  title:      string;
  url?:        string;
  snippet?:    string;
  relevance?:  number; // 0–1 score
}

/** A single tool call record made during the agent run. */
export interface ToolCallRecord {
  name:          string;
  inputSummary:  string;
  outputSummary: string;
  status:        "success" | "error" | "skipped";
}

/** 
 * AgentReceipt — the core data structure.
 * 
 * Designed to be serialised to JSON and stored in any DB or passed via API.
 */
export interface AgentReceipt {
  id:                     string;    // UUID
  task:                   string;    // The prompt or task description
  status:                 ReceiptStatus;
  model:                  string;    // e.g. "gpt-4o"
  timestamp:              string;    // ISO 8601
  durationMs?:            number;
  finalAnswer:            string;
  confidenceScore:        number;    // 0–100
  humanReviewRecommended: boolean;
  
  // Evidence
  sourcesUsed:            SourceUsed[];
  toolCalls:              ToolCallRecord[];
  
  // Transparency
  assumptions:            string[];
  riskFlags:              string[];
  humanReviewChecklist:   string[];
  
  // Optional
  notes?:                 string[];
  metadata?:              Record<string, string>;
}

export type CreateReceiptInput = Omit<AgentReceipt, "id" | "timestamp"> & {
  id?:        string;
  timestamp?: string;
};

export interface ValidationResult {
  valid:  boolean;
  errors: string[];
}

// -----------------------------------------------------------------------------
// The Engine
// -----------------------------------------------------------------------------

/**
 * Factory to create a new receipt. 
 * Auto-generates ID and timestamp if they are missing.
 * Clamps confidenceScore to [0, 100].
 */
export function createReceipt(input: CreateReceiptInput): AgentReceipt {
  return {
    ...input,
    id:                     input.id        ?? crypto.randomUUID(),
    timestamp:              input.timestamp ?? new Date().toISOString(),
    confidenceScore:        clamp(input.confidenceScore, 0, 100),
    sourcesUsed:            input.sourcesUsed          ?? [],
    toolCalls:              input.toolCalls            ?? [],
    assumptions:            input.assumptions          ?? [],
    riskFlags:              input.riskFlags            ?? [],
    humanReviewChecklist:   input.humanReviewChecklist ?? [],
  };
}

/**
 * Validates a receipt against the schema.
 * Pure TypeScript, no dependencies. 
 */
export function validateReceipt(receipt: unknown): ValidationResult {
  const errors: string[] = [];
  if (!receipt || typeof receipt !== "object" || Array.isArray(receipt)) {
    return { valid: false, errors: ["receipt must be a non-null object"] };
  }

  const r = receipt as Partial<AgentReceipt>;
  const reqStr = (v: any, f: string) => (typeof v !== "string" || v.trim() === "") && errors.push(`${f} required string`);
  const reqArr = (v: any, f: string) => !Array.isArray(v) && errors.push(`${f} must be array`);

  reqStr(r.id,          "id");
  reqStr(r.task,        "task");
  reqStr(r.model,       "model");
  reqStr(r.finalAnswer, "finalAnswer");

  if (!["completed", "warning", "failed"].includes(r.status!)) errors.push("invalid status");
  if (isNaN(Date.parse(r.timestamp!)))                         errors.push("invalid timestamp");
  if (typeof r.confidenceScore !== "number")                   errors.push("confidenceScore must be number");
  if (typeof r.humanReviewRecommended !== "boolean")           errors.push("humanReviewRecommended must be boolean");

  reqArr(r.sourcesUsed,          "sourcesUsed");
  reqArr(r.toolCalls,            "toolCalls");
  reqArr(r.assumptions,          "assumptions");
  reqArr(r.riskFlags,            "riskFlags");
  reqArr(r.humanReviewChecklist, "humanReviewChecklist");

  return { valid: errors.length === 0, errors };
}

/**
 * Sanitises a receipt. Useful for "dirty" LLM outputs or legacy data.
 * It will never throw; it will only nudge the data into the right shape.
 */
export function normalizeReceipt(receipt: Partial<AgentReceipt>): AgentReceipt {
  const s = (v: any) => (typeof v === "string" ? v.trim() : "");
  const a = (v: any) => (Array.isArray(v) ? v.filter(i => typeof i === "string").map(i => i.trim()) : []);

  return {
    id:                     s(receipt.id) || crypto.randomUUID(),
    task:                   s(receipt.task),
    model:                  s(receipt.model),
    status:                 normalizeStatus(receipt.status),
    timestamp:              normalizeTimestamp(receipt.timestamp!),
    durationMs:             typeof receipt.durationMs === "number" ? Math.max(0, receipt.durationMs) : undefined,
    finalAnswer:            s(receipt.finalAnswer),
    confidenceScore:        clamp(Number(receipt.confidenceScore) || 0, 0, 100),
    humanReviewRecommended: !!receipt.humanReviewRecommended,
    sourcesUsed:            Array.isArray(receipt.sourcesUsed) ? receipt.sourcesUsed : [],
    toolCalls:              Array.isArray(receipt.toolCalls)   ? receipt.toolCalls   : [],
    assumptions:            a(receipt.assumptions),
    riskFlags:              a(receipt.riskFlags),
    humanReviewChecklist:   a(receipt.humanReviewChecklist),
    notes:                  receipt.notes ? a(receipt.notes) : undefined,
    metadata:               receipt.metadata ?? {},
  };
}

// -----------------------------------------------------------------------------
// Exporters
// -----------------------------------------------------------------------------

export function exportReceiptToJSON(receipt: AgentReceipt): string {
  return JSON.stringify(receipt, null, 2);
}

export interface MarkdownOptions {
  /**
   * "mini": A compact, high-impact "slip" for Slack/PRs.
   * "full": A detailed, table-based audit log for reports.
   * @default "mini"
   */
  mode?: "mini" | "full";
}

/**
 * Renders the receipt as a Markdown document.
 */
export function exportReceiptToMarkdown(receipt: AgentReceipt, options: MarkdownOptions = {}): string {
  const mode = options.mode ?? "mini";
  return mode === "mini" ? renderMini(receipt) : renderFull(receipt);
}

function renderMini(receipt: AgentReceipt): string {
  const badge = (s: string) => s === "completed" ? "✅ Completed" : s === "warning" ? "⚠️ Warning" : "❌ Failed";
  const risk  = receipt.riskFlags.length > 2 ? "High risk" : receipt.riskFlags.length > 0 ? "Medium risk" : "Low risk";
  
  const md = [
    `# AI Receipt`,
    ``,
    `${badge(receipt.status)} · **${receipt.confidenceScore}% confidence** · ${risk}`,
    `Model: \`${receipt.model}\` · Sources: ${receipt.sourcesUsed.length} · Tools: ${receipt.toolCalls.length}`,
    ``,
    `**Task:** ${receipt.task}`,
    ``,
    `**Answer:** ${receipt.finalAnswer}`,
    ``,
  ];

  if (receipt.sourcesUsed.length > 0) {
    const names = receipt.sourcesUsed.map(s => s.title).join(", ");
    md.push(`**Why trust it:** Used ${names}.`);
    md.push(``);
  }

  if (receipt.riskFlags.length > 0) {
    md.push(`**Watch out:** ${receipt.riskFlags.join(". ")}`);
    md.push(``);
  }

  if (receipt.humanReviewRecommended || receipt.humanReviewChecklist.length > 0) {
    const rec = receipt.humanReviewRecommended ? "Recommended" : "Optional";
    const items = receipt.humanReviewChecklist.length > 0 ? `: ${receipt.humanReviewChecklist.join(", ")}` : "";
    md.push(`**Human review:** ${rec}${items}.`);
    md.push(``);
  }

  md.push(`---`);
  md.push(`Generated by \`agent-receipts\``);
  return md.join("\n");
}

function renderFull(receipt: AgentReceipt): string {
  const line = (k: string, v: string) => `| **${k}** | ${v} |`;
  const badge = (s: string) => s === "completed" ? "✅" : s === "warning" ? "⚠️" : "❌";

  const md = [
    `# Agent Receipt: Audit Log`,
    ``,
    `| Property | Value |`,
    `| --- | --- |`,
    line("ID",         `\`${receipt.id}\``),
    line("Status",     `${badge(receipt.status)} ${receipt.status}`),
    line("Model",      `\`${receipt.model}\``),
    line("Confidence", `${receipt.confidenceScore}%`),
    line("Timestamp",  new Date(receipt.timestamp).toLocaleString()),
    ``,
    `## Task`,
    receipt.task,
    ``,
    `## Final Answer`,
    receipt.finalAnswer,
    ``,
  ];

  if (receipt.sourcesUsed.length > 0) {
    md.push(`## Sources (${receipt.sourcesUsed.length})`);
    receipt.sourcesUsed.forEach(s => md.push(`- ${s.url ? `[${s.title}](${s.url})` : s.title}${s.relevance ? ` (${(s.relevance*100).toFixed(0)}%)` : ""}`));
    md.push(``);
  }

  if (receipt.toolCalls.length > 0) {
    md.push(`## Tool Calls (${receipt.toolCalls.length})`);
    receipt.toolCalls.forEach(t => md.push(`- \`${t.name}\`: ${t.inputSummary} → ${t.outputSummary} [${t.status}]`));
    md.push(``);
  }

  if (receipt.riskFlags.length > 0) {
    md.push(`## Risk Flags`);
    receipt.riskFlags.forEach(f => md.push(`- ⚠️ ${f}`));
    md.push(``);
  }

  md.push(`---`);
  md.push(`*Generated by [AI Receipt Ledger](https://github.com/alon/AI-Receipt-Ledger)*`);
  return md.join("\n");
}

// -----------------------------------------------------------------------------
// The Hero Helper: attachReceiptToResponse
// -----------------------------------------------------------------------------

export interface ModelResult {
  text:                   string;
  model:                  string;
  sources?:               SourceUsed[];
  toolCalls?:             ToolCallRecord[];
  assumptions?:           string[];
  riskFlags?:             string[];
  humanReviewChecklist?:  string[];
  confidenceScore?:       number; // 0-100
  humanReviewRecommended?:boolean;
}

/**
 * Wraps an async model call, measures its duration, and attaches a receipt.
 * This is the primary entry point for adding transparency to any AI run.
 */
export async function attachReceiptToResponse(
  task: string,
  call: () => Promise<ModelResult>
): Promise<{ answer: string; receipt: AgentReceipt }> {
  const start   = Date.now();
  const res     = await call();
  const elapsed = Date.now() - start;

  const receipt = createReceipt({
    task,
    model:                  res.model,
    status:                 "completed",
    finalAnswer:            res.text,
    durationMs:             elapsed,
    confidenceScore:        res.confidenceScore        ?? 80,
    humanReviewRecommended: res.humanReviewRecommended ?? false,
    sourcesUsed:            res.sources                ?? [],
    toolCalls:              res.toolCalls              ?? [],
    assumptions:            res.assumptions            ?? [],
    riskFlags:              res.riskFlags              ?? [],
    humanReviewChecklist:   res.humanReviewChecklist   ?? [],
  });

  return { answer: res.text, receipt };
}

// -----------------------------------------------------------------------------
// Internals (Private ish)
// -----------------------------------------------------------------------------

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function normalizeStatus(v: any): ReceiptStatus {
  return ["completed", "warning", "failed"].includes(v) ? v : "completed";
}

function normalizeTimestamp(v: string): string {
  return (v && !isNaN(Date.parse(v))) ? v : new Date().toISOString();
}
