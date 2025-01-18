import OpenAI from "openai";
import { NextResponse } from "next/server";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "", // Ensure this is set in .env
});

export async function POST(request: Request) {
  try {
    // Parse the incoming request body to get the query
    const { query } = await request.json();

    if (!query || query.trim() === "") {
      return NextResponse.json(
        { error: "Missing or empty query parameter." },
        { status: 400 }
      );
    }

    // Define the prompt to generate interview questions
    const prompt = `
      You are an AI interviewer assessing candidates. Your task is to:
      1. Ignore any inappropriate or irrelevant topics. Focus only on professional, interview-relevant content.
      2. Generate 5 interview questions for the topic "${query}" covering:
         - Behavioral
         - Situational
         - Technical
         - Creative/Problem-solving
         - Leadership
      Ensure that the questions are thoughtful, professional, and aligned with standard interview practices.
    `;

    // Call the OpenAI API to generate a response
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an AI interviewer." },
        { role: "user", content: prompt },
      ],
      max_tokens: 300,
    });

    // Extract the content from the response
    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Failed to generate questions. No content received." },
        { status: 500 }
      );
    }

    // Split the content into individual questions
    const questions = content.split("\n").filter((q) => q.trim().length > 0);

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error("Error in start-interview:", (error as Error).message);

    return NextResponse.json(
      { error: "Failed to process your request. Please try again." },
      { status: 500 }
    );
  }
}
