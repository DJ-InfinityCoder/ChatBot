import { NextRequest } from "next/server";
import { generateChatResponse } from "@/lib/gemini";
import { Message } from "@/types/chat";

export async function POST(req: NextRequest) {
  try {
    const { messages, fileContent, fileType } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Invalid messages" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const lastMessage = messages[messages.length - 1];
    const history = messages.slice(0, -1).map((msg: Message) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    let prompt = lastMessage.content;
    let fileData = undefined;

    if (fileContent) {
      if (fileType?.startsWith("image/")) {
        fileData = {
          mimeType: fileType,
          data: fileContent,
        };
      } else {
        prompt = `Context from uploaded document:\n${fileContent}\n\nUser Question: ${prompt}`;
      }
    }

    let stream;
    try {
      stream = await generateChatResponse(prompt, history, fileData);
    } catch (apiError: any) {
      console.error("Gemini API error:", apiError);
      
      // Handle high demand / unavailable
      if (apiError.message?.includes("503") || apiError.message?.includes("UNAVAILABLE")) {
        return new Response(JSON.stringify({ 
          error: "The AI is currently experiencing high demand. Please try again in a moment." 
        }), { 
          status: 503,
          headers: { "Content-Type": "application/json" }
        });
      }
      
      throw apiError;
    }

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = (chunk as any).text || "";
            controller.enqueue(encoder.encode(text));
          }
          controller.close();
        } catch (err: any) {
          console.error("Stream processing error:", err);
          // If possible, send error as text chunk
          const errorMsg = "\n\n[Generation interrupted due to high demand. Please try again.]";
          controller.enqueue(encoder.encode(errorMsg));
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: { 
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache"
      },
    });
  } catch (error: any) {
    console.error("General Chat error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again later." }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
