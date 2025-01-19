import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function POST(request: Request) {
  try {
    const { sessionId, userQuery, userId } = await request.json();
    const headerSessionId = request.headers.get("X-Session-ID");
    const headerUserId = request.headers.get("X-User-ID");

    // Validate request body and headers
    if (!sessionId || !userQuery || !userId) {
      console.error("Missing required data:", { sessionId, userQuery, userId });
      return NextResponse.json(
        { error: "Missing required data." },
        { status: 400 }
      );
    }

    // Verify session matches headers
    if (sessionId !== headerSessionId || userId !== headerUserId) {
      console.error("Session mismatch:", { 
        bodySession: sessionId, 
        headerSession: headerSessionId,
        bodyUser: userId,
        headerUser: headerUserId
      });
      return NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      );
    }

    // Fetch session from database
    const session = await prisma.session.findUnique({
      where: { 
        id: sessionId,
        userId: userId // Add userId to ensure session belongs to user
      },
      include: { questions: true },
    });

    if (!session) {
      console.error("Session not found or unauthorized:", sessionId);
      return NextResponse.json({ error: "Session not found or unauthorized." }, { status: 404 });
    }

    // Generate prompt for OpenAI
    const prompt = `
      You are MockMate, a personalized interview assistant. 
      The user has requested an interview on the topic: "${userQuery}".
      Please generate 5 unique, insightful, and challenging interview questions. The questions should:
      - Cover both technical and behavioral aspects of the topic.
      - Be tailored specifically to the topic provided by the user.
      - Provide depth, exploring different angles, and avoid generic phrasing.
      - Ensure variety in the types of questions (e.g., situational, technical, behavioral).

      Provide the questions in the following format:
      - Question 1
      - Question 2
      - Question 3
      - Question 4
      - Question 5
    `;

    // Get response from OpenAI
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Ensure correct model is specified
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 1500,
    });

    const messageContent = aiResponse.choices[0]?.message?.content || "";
    console.log("Raw AI Response:", messageContent);

    // Extract questions from response
    const questions = messageContent
      .split("\n")
      .filter((line) => line.trim() && line.includes("?"))
      .map((line) => line.trim());

    if (questions.length === 0) {
      throw new Error("Failed to generate questions.");
    }

    // Save questions to database
    const savedQuestions = await Promise.all(
      questions.map((text) =>
        prisma.question.create({
          data: {
            sessionId,
            text,
            type: "General", // Default type
          },
        })
      )
    );

    // Create intro message
    const introMessage = `
      Hello! I'm MockMate, your personalized interview assistant.
      Let's get started with your interview on the topic: "${userQuery}".
      I'll be asking you questions about your experience, knowledge, and problem-solving skills related to this topic.
    `;

    return NextResponse.json({
      sessionId: session.id,
      introMessage,
      questions: savedQuestions,
    });
  } catch (error) {
    console.error("Error in start-interview:", error);
    return NextResponse.json(
      { error: "Failed to process the interview." },
      { status: 500 }
    );
  }
}