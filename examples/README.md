# Examples

Four self-contained examples showing how to use agent-receipts at every level of complexity.

---

## 01 — Minimal (core only)

**File:** [`01-minimal.ts`](./01-minimal.ts)

The simplest possible integration. No React, no framework. Install `@agent-receipts/core`, call `createReceipt()`, validate, and export.

```bash
pnpm add @agent-receipts/core
npx tsx examples/01-minimal.ts
```

**What it covers:**
- `createReceipt()` with all fields
- `validateReceipt()` before storing
- `exportReceiptToJSON()` for logs and APIs
- `exportReceiptToMarkdown()` for Notion, Slack, PR descriptions

---

## 02 — React component

**File:** [`02-react.tsx`](./02-react.tsx)

A self-contained React component using `useReceipt()` and `<ReceiptCard />`. Drop it into any React app.

```bash
pnpm add @agent-receipts/core @agent-receipts/react
```

Copy [`02-react.tsx`](./02-react.tsx) into your `src/` and render `<ResearchAssistant />`.

**What it covers:**
- `useReceipt()` — loading, error, result state in one hook
- `run()` — wraps any async model call
- `<ReceiptCard />` with `onExportJSON` and `onExportMarkdown`
- `reset()` — clearing the receipt between runs

---

## 03 — Next.js (API route + page)

**Files:** [`03-nextjs-api-route.ts`](./03-nextjs-api-route.ts) · [`03-nextjs-page.tsx`](./03-nextjs-page.tsx)

A real Next.js 14 App Router integration: POST route that runs a model call and returns `{ answer, receipt }`, plus a client page that renders both.

```bash
# Copy into your Next.js app
cp examples/03-nextjs-api-route.ts app/api/agent/route.ts
cp examples/03-nextjs-page.tsx     app/agent/page.tsx
```

Then visit `/agent` in your app.

**What it covers:**
- Server-side `createReceipt()` inside an API route
- `attachReceiptToResponse()` helper (see below)
- Client-side fetch → render `<ReceiptCard />`
- Copy JSON + Export Markdown from the client

---

## helpers/attachReceiptToResponse

**File:** [`helpers/attachReceiptToResponse.ts`](./helpers/attachReceiptToResponse.ts)

The pattern you'll use most often. Wraps any async model call, measures duration, and returns `{ answer, receipt }` together.

```typescript
import { attachReceiptToResponse } from "./helpers/attachReceiptToResponse";

const { answer, receipt } = await attachReceiptToResponse(
  "Summarise the Q3 earnings report",
  async () => {
    const res = await openai.chat.completions.create({ model: "gpt-4o", messages });
    return {
      text:            res.choices[0].message.content ?? "",
      model:           "gpt-4o",
      confidenceScore: 85,
      sources:         mySourceList,
    };
  }
);
```

Also exports `safeAttachReceiptToResponse()` — same API, but catches errors and returns a `status: "failed"` receipt instead of throwing. Good for pipelines.

**What it covers:**
- Auto-measured `durationMs`
- Optional fields with typed defaults
- Error boundary variant with `safeAttachReceiptToResponse()`

---

## Running examples locally

```bash
# From the repo root
pnpm install

# Run the minimal TypeScript example
npx tsx agent-receipts/examples/01-minimal.ts
```

The React and Next.js examples are meant to be copied into your own app rather than run in isolation.
