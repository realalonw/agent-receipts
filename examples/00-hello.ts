/**
 * Hello World: AI Receipt Ledger
 * 
 * Shows how to wrap any existing AI call to produce a receipt automatically.
 */

import { attachReceiptToResponse, exportReceiptToMarkdown } from "../src/index.ts";

async function main() {
  const task = "Explain why the sky is blue";

  // Wrap your existing AI call
  const { answer, receipt } = await attachReceiptToResponse(task, async () => {
    // Simulate an AI call (e.g. OpenAI, Claude, Gemini)
    return {
      text:            "Rayleigh scattering by the atmosphere.",
      model:           "gpt-4o",
      confidenceScore: 98,
      sources:         [{ title: "Wikipedia: Rayleigh scattering", url: "https://en.wikipedia.org/wiki/Rayleigh_scattering" }],
      riskFlags:       ["Highly simplified explanation"],
    };
  });

  console.log("AI Answer:", answer);
  console.log("\nGenerated Receipt (Markdown):");
  console.log(exportReceiptToMarkdown(receipt));
}

main();
