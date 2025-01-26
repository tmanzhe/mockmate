import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function POST(request: Request) {
  try {
    // previousResponses was a variable to be assigned, but has no current use so it is being moved aside
    const { sessionId, currentQuestionId, userResponse = [] } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId." }, { status: 400 });
    }

    // Fetch the session and its existing questions, including associated questions and responses
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        questions: true,
        responses: {
          orderBy: { createdAt: "desc" },
          take: 5, // Get last 5 responses for context
          include: {
            question: true, // Include associated question model
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    // Save the user's response to the current question if provided
    if (currentQuestionId && userResponse) {
      await prisma.response.create({
        data: {
          sessionId,
          questionId: currentQuestionId,
          userAnswer: userResponse,
        },
      });
    }

    // Build conversation context from previous responses
    const conversationContext = session.responses
      .map(
        (response) =>
          `Question: ${response.question.text}\nResponse: ${response.userAnswer}`
      )
      .join("\n\n");

    // Prepare dynamic AI prompt
    const prompt = `
      You are conducting an interview on the topic: ${session.topic}.
      The candidate's previous responses are:
      
      ${conversationContext}
      
      Generate the following:
      1. A conversational follow-up response to the candidate's last answer (${userResponse || "N/A"}).
      2. Three new follow-up questions that:
         - Build upon previous responses
         - Test depth of knowledge and practical application
         - Mix behavioral and technical aspects
         - Vary in complexity
         - Avoid generic phrasing.
      
      Use the following format:
      {
        "conversationalResponse": "Your response here",
        "questions": [
          "Question 1",
          "Question 2",
          "Question 3"
        ]
      }
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const parsedResponse = JSON.parse(
      aiResponse.choices[0]?.message?.content || "{}"
    );

    if (!parsedResponse || !parsedResponse.questions || !parsedResponse.conversationalResponse) {
      throw new Error("Failed to parse AI response.");
    }

    // Save generated follow-up questions
    const savedQuestions = await Promise.all(
      parsedResponse.questions.map((q: string) =>
        prisma.question.create({
          data: {
            sessionId,
            text: q,
            type: determineQuestionType(q),
            // No contextBased field as it was removed
          },
        })
      )
    );

    // Optionally save AI's private thoughts (if applicable)
    if (parsedResponse.privateThoughts) {
      await prisma.feedback.create({
        data: {
          sessionId,
          thoughts: parsedResponse.privateThoughts,
        },
      });
    }

    return NextResponse.json({
      conversationalResponse: parsedResponse.conversationalResponse,
      questions: savedQuestions,
      hasMoreQuestions: session.questions.length > session.responses.length,
    });
  } catch (error) {
    console.error("Error in next-question:", error);
    return NextResponse.json(
      { error: "Failed to process response." },
      { status: 500 }
    );
  }
}

// Helper function to determine question type
function determineQuestionType(question: string): string {
  const questionLower = question.toLowerCase();
  if (questionLower.includes("tell me about a time") || questionLower.includes("describe a situation")) {
    return "Behavioral";
  }
  if (questionLower.includes("how would you") || questionLower.includes("what would you do")) {
    return "Situational";
  }
  if (questionLower.includes("explain") || questionLower.includes("define") || questionLower.includes("how does")) {
    return "Technical";
  }
  if (questionLower.includes("solve") || questionLower.includes("approach")) {
    return "Problem-solving";
  }
  return "General";
}
