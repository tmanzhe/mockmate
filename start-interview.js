import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your .env file
});

(async () => {
  try {
    const query = "poop"; // Example input topic

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

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: "You are an AI interviewer." }, { role: "user", content: prompt }],
      max_tokens: 300,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      console.log("Failed to generate questions. No content received.");
      return;
    }

    console.log("Generated Interview Questions:");
    console.log(content);
  } catch (error) {
    console.error("Error occurred during processing:", error.message);
    console.error("Full Error:", error);
  }
})();
