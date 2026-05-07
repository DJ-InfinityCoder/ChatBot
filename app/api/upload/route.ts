import { NextRequest, NextResponse } from "next/server";
import { extractTextFromPDF } from "@/lib/pdf";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let content = "";
    let type = file.type;

    if (type === "application/pdf") {
      content = await extractTextFromPDF(buffer);
    } else if (type === "text/plain") {
      content = buffer.toString("utf-8");
    } else if (type.startsWith("image/")) {
      content = buffer.toString("base64");
    } else {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }

    return NextResponse.json({ 
      name: file.name,
      type: type,
      content: content 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
