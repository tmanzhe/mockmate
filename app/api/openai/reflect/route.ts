import prisma from "@/prisma/db";
import { NextResponse } from "next/server";

// api/reflect/route.ts
export async function POST(request: Request) {
    try {
      const { sessionId } = await request.json();
  
      const feedback = await prisma.feedback.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
      });
  
      return NextResponse.json({ feedback });
    } catch (error) {
      console.error("Error fetching reflection:", error);
      return NextResponse.json({ error: "Failed to fetch reflection" }, { status: 500 });
    }
  }