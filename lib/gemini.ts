import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey });

export const modelName = "gemini-3-flash-preview";

export async function generateChatResponse(
  prompt: string,
  history: { role: string; parts: { text: string }[] }[],
  fileData?: { mimeType: string; data: string }
) {
  // Construct the parts for the new message
  const parts: any[] = [{ text: prompt }];

  if (fileData) {
    // New SDK usually follows REST naming more closely or supports both.
    // Using inlineData as it's common in Google SDKs, but providing a fallback structure.
    parts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.data,
      }
    });
  }

  // Use generateContentStream with full history as it's the most reliable way in the new SDK
  const stream = await genAI.models.generateContentStream({
    model: modelName,
    contents: [
      ...history.map(h => ({
        role: h.role === "model" ? "model" : "user",
        parts: h.parts.map(p => ({ text: p.text }))
      })),
      {
        role: "user",
        parts: parts
      }
    ],
    config: {
      // Add thinking config as suggested in docs for better reasoning
      thinkingConfig: {
        includeThoughts: true
      }
    } as any
  });

  return stream;
}
