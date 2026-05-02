import { AgentReceipt, attachReceiptToResponse } from "./receipt.ts";

/**
 * Quick Receipt: The ultimate vibecoding shortcut.
 * 
 * Automatically detects the shape of OpenAI/Claude/Gemini responses
 * and attaches a receipt with zero configuration.
 */
export async function quickReceipt(task: string, modelCall: Promise<any>): Promise<{ answer: string; receipt: AgentReceipt }> {
  return attachReceiptToResponse(task, async () => {
    const res = await modelCall;
    
    // Auto-detect OpenAI / Azure / Groq
    if (res.choices?.[0]?.message?.content) {
      return {
        text:  res.choices[0].message.content,
        model: res.model || "openai-detected",
      };
    }
    
    // Auto-detect Claude / Anthropic
    if (res.content?.[0]?.text) {
      return {
        text:  res.content[0].text,
        model: res.model || "claude-detected",
      };
    }

    // Generic fallback
    return {
      text:  res.text || res.content || String(res),
      model: res.model || "unknown",
    };
  });
}
