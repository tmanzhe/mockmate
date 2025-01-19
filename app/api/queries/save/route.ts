import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Get userId and query from the request body
    const { userId, query } = await request.json();

    // Validate request body
    if (!userId || !query) {
      return NextResponse.json({ error: "Missing userId or query." }, { status: 400 });
    }

    // Create a new session with the query
    const session = await prisma.session.create({
      data: {
        userId,
        topic: query,
        style: "General", // Default style
      },
    });

    // Return the sessionId for the next step
    return NextResponse.json({
      sessionId: session.id,
      success: true,
    });
  } catch (error) {
    console.error("Error in /api/queries/save:", error);
    return NextResponse.json(
      { error: "Failed to save query and create session." },
      { status: 500 }
    );
  }
}