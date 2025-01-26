import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });

export async function POST(request: Request) {
  try {
    const { sessionId, conversation } = await request.json();

    // Validate request body
    if (!sessionId || !conversation) {
      return NextResponse.json(
        { error: "Missing sessionId or conversation." },
        { status: 400 }
      );
    }

    // Format the conversation into a string
    const conversationString = conversation
      .map((message: { sender: string; text: string }) => `${message.sender}: ${message.text}`)
      .join("\n");

    // Generate prompt for ChatGPT
    const prompt = `
      You are MockMate, a personalized interview assistant.
      Below is the conversation history between the user and MockMate:
      ${conversationString}

      Based on the conversation, provide a thoughtful response as if you were engaged in the conversation.
      The response should sound like an actual human and should not ask any questions.
    `;

    // Get response from ChatGPT
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Check if AI response contains expected data
    if (!aiResponse || !aiResponse.choices || !aiResponse.choices[0]?.message?.content) {
      console.error("Invalid AI response format:", aiResponse);
      return NextResponse.json({ error: "Invalid AI response format" }, { status: 500 });
    }

    const botReply = aiResponse.choices[0]?.message?.content || "No response.";

    // Return the ChatGPT response
    return NextResponse.json({ botReply });
  } catch (error) {
    console.error("Error in perspective route:", error);
    return NextResponse.json(
      { error: "Failed to process perspective request." },
      { status: 500 }
    );
  }
}