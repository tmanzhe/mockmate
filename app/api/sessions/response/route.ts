// route.ts
import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function POST(request: Request) {
  try {
    const { sessionId, userResponse } = await request.json();

    if (!sessionId || !userResponse) {
      return NextResponse.json(
        { error: "Missing sessionId or userResponse." },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { questions: true },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 404 }
      );
    }

    const currentQuestionIndex = session.currentQuestionIndex || 0;

    if (currentQuestionIndex >= session.questions.length) {
      return NextResponse.json(
        { message: "Interview is complete.", isComplete: true },
        { status: 200 }
      );
    }

    const currentQuestion = session.questions[currentQuestionIndex];

    // Save user's response
    await prisma.response.create({
      data: {
        sessionId,
        questionId: currentQuestion.id,
        userAnswer: userResponse,
      },
    });

    // Generate AI response
    const prompt = `
      You are MockMate, a personalized interview assistant.
      Here's the context of the interview:
      - Question: "${currentQuestion.text}"
      - User Response: "${userResponse}"

      Provide a thoughtful reply based on the user's input as an interviewee as if you were engaged in the conversation. If the answer was good, praise it. If it was bad, give an example of what could have happened.
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const botReply = aiResponse.choices[0]?.message?.content || "No response.";

    // Save AI response
    await prisma.response.create({
      data: {
        sessionId,
        questionId: currentQuestion.id,
        mockmateThoughts: botReply,
        userAnswer: userResponse,
      },
    });

    // Get next question (if any)
    const nextQuestionIndex = currentQuestionIndex + 1;
    const nextQuestion = nextQuestionIndex < session.questions.length 
      ? session.questions[nextQuestionIndex].text 
      : null;

    // Update session progress
    await prisma.session.update({
      where: { id: sessionId },
      data: { currentQuestionIndex: nextQuestionIndex },
    });

    return NextResponse.json({
      currentQuestion: currentQuestion.text,
      userResponse,
      botReply,
      nextQuestion,
      isComplete: nextQuestion === null,
    });
  } catch (error) {
    console.error("Error in responses route:", error);
    return NextResponse.json(
      { error: "Failed to process response." },
      { status: 500 }
    );
  }
}
