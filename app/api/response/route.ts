import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// api/response/route.ts
export async function POST(request: Request) {
    try {
      const { sessionId, questionId, response, audioUrl } = await request.json();
  
      const savedResponse = await prisma.response.create({
        data: {
          sessionId,
          questionId,
          userAnswer: response,
          audioUrl,
        },
      });
  
      return NextResponse.json({ response: savedResponse });
    } catch (error) {
      console.error("Error saving response:", error);
      return NextResponse.json({ error: "Failed to save response" }, { status: 500 });
    }
  }