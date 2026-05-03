import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(request) {
  try {
    const { messages } = await request.json();

    const fallbackKey = process.env.GROQ_API_KEY || "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";
    if (!fallbackKey) {
      throw new Error("Missing global GROQ_API_KEY configuration.");
    }

    const groq = new Groq({ apiKey: fallbackKey });

    // System instruction injected invisibly to maintain context
    const systemInstruction = {
      role: 'system',
      content: 'You are the embedded AI Co-founder inside the MetaBox Dashboard. You help the user flesh out their generated B2B SaaS applications, plan marketing strategies, debug their code, and scale their product. Use a professional, slightly encouraging tone. Provide concise, direct action-oriented advice rather than long unstructured essays.'
    };

    // Make sure messages are mapped correctly for the SDK (role, content)
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'ai' ? 'assistant' : 'user',
      content: msg.text || msg.content
    }));

    const completion = await groq.chat.completions.create({
      messages: [systemInstruction, ...formattedMessages],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8,
    });

    const reply = completion.choices[0]?.message?.content || "I encountered an error calculating my response.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Smooth over the common errors
    let msg = error.message;
    if (msg.includes("429")) {
        msg = "I am currently rate limited by Groq API. Please try asking again in a few moments.";
    } else if (msg.includes("401")) {
        msg = "The global Groq API key is unauthorized or missing in Vercel environment variables.";
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
