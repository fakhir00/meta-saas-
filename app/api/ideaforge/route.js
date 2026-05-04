import { NextResponse } from 'next/server';
import { groqComplete } from '@/lib/groq';

export async function POST(request) {
  try {
    const body = await request.json();
    const { mode, system, prompt } = body;

    if (mode === 'json') {
      // Blueprint / structured JSON generation
      const completion = await groqComplete({
        messages: [
          { role: 'system', content: system || 'You are a SaaS blueprint generator. Respond ONLY with valid JSON, no markdown fences, no explanation.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      let text = completion.choices[0]?.message?.content || '';
      // Clean markdown fences just in case
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();

      try {
        const parsed = JSON.parse(text);
        return NextResponse.json(parsed);
      } catch {
        return NextResponse.json({ error: 'AI returned malformed JSON. Please try again.' }, { status: 500 });
      }

    } else {
      // Chat / follow-up (plain text)
      const completion = await groqComplete({
        messages: [
          { role: 'system', content: system || 'You are a helpful SaaS mentor. Answer concisely and helpfully in 3-4 sentences max. Be warm and actionable.' },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
      });

      const reply = completion.choices[0]?.message?.content || '';
      return NextResponse.json({ reply });
    }

  } catch (error) {
    console.error('IdeaForge API Error:', error);
    let msg = error.message || 'Server processing failed';
    if (msg.includes('429')) msg = 'Rate limited — please try again in a moment.';
    if (msg.includes('401')) msg = 'API key unauthorized. Please check your GROQ_API_KEY.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
