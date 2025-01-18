import { NextResponse } from 'next/server';
import { Configuration, OpenAI } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your .env file
});
const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo', // Or 'gpt-4', based on your needs
      messages: [{ role: 'user', content: prompt }],
    });

    return NextResponse.json({
      result: response.data.choices[0].message?.content,
    });
  } catch (error) {
    console.error('Error communicating with OpenAI API:', error);
    return NextResponse.json(
      { error: 'Failed to connect to OpenAI API' },
      { status: 500 }
    );
  }
}
