# AI Receipt Ledger

**A structured audit trail for AI agent sessions.**

One function call. Works with any model. No database required.

## Why use this?

Most AI features are "black boxes." **AI-Receipt-Ledger** turns that answer into an auditable document. Use it whenever the **cost of a mistake is higher than zero.**

- **Human-in-the-Loop**: Give reviewers the evidence they need to sign off (Sources, Assumptions, Checklist).
- **Compliance**: Create a defensible record of reasoning for regulated industries (Legal, Finance, Medical).
- **Debugging**: Capture tool calls and risk flags at the moment of the run to catch hallucinations early.
- **Trust**: Show users a "Confidence Score" and verified sources to prove your agent isn't just guessing.

## Installation

Install directly from GitHub to use it in any project:

```bash
npm install github:realalonw/agent-receipts
```

## Usage: The 1-Line Vibe (Zero Config)

If you're vibecoding and don't want to map fields, `quickReceipt` auto-detects common AI response shapes (OpenAI, Claude, etc.).

```typescript
import { quickReceipt, exportReceiptToMarkdown } from "agent-receipts";

// Just wrap the call. No mapping required.
const { answer, receipt } = await quickReceipt(task, openai.chat.completions.create({ ... }));

// Export as a "Mini Slip"
console.log(exportReceiptToMarkdown(receipt));
```

## Manual Integration

If you need full control (e.g., adding specific sources or assumptions), use the `attachReceiptToResponse` helper.

```typescript
import { attachReceiptToResponse } from "agent-receipts";

const { answer, receipt } = await attachReceiptToResponse(task, async () => {
  const res = await openai.chat.completions.create({ ... });
  
  return {
    text:            res.choices[0].message.content,
    model:           "gpt-4o",
    confidenceScore: 95,
    sources:         [{ title: "My PDF", url: "..." }],
  };
});
```

## Export Modes

Generate a "Mini Slip" for Slack/PRs or a "Full Audit Log" for reports.

```typescript
// Compact "Mini Slip" (default)
const mini = exportReceiptToMarkdown(receipt, { mode: "mini" });

// Detailed Audit Log
const full = exportReceiptToMarkdown(receipt, { mode: "full" });
```

## Structure

- **[`src/core`](./src/core)** — The Receipt engine (Types, Validation, Export).
- **[`src/react`](./src/react)** — Drop-in components & hooks for your UI.
- **[`examples/`](./examples)** — Integration guides (Node, React, Next.js).

## Quickstart (Dev)

```bash
git clone https://github.com/realalonw/agent-receipts.git
cd agent-receipts
npm install
npm test
```
