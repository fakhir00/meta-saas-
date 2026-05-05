import { NextResponse } from 'next/server';
import { groqComplete } from '@/lib/groq';

export async function POST(request) {
  try {
    const { industry } = await request.json();
    const apiKey = process.env.SERPER_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'SERPER_API_KEY not found' }, { status: 500 });
    }

    // High-intent search queries for Reddit to find problems/pains
    const queries = [
      `site:reddit.com "${industry}" "anyone know a tool for"`,
      `site:reddit.com "${industry}" "is there an app for"`,
      `site:reddit.com "${industry}" "i am so frustrated with"`,
      `site:reddit.com "${industry}" "how do i automate"`,
      `site:reddit.com "${industry}" "looking for a solution to"`
    ];

    // Pick a random query to keep results fresh
    const query = queries[Math.floor(Math.random() * queries.length)];

    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ q: query, num: 10 })
    });

    const data = await res.json();
    const results = data.organic || [];

    if (results.length === 0) {
      return NextResponse.json({ problems: [] });
    }

    // Use Groq to extract specific "problems" from the search results
    const context = results.map(r => `${r.title}: ${r.snippet}`).join('\n');
    const completion = await groqComplete({
      messages: [
        { 
          role: 'system', 
          content: 'You are a market researcher. Analyze the following Reddit search results and extract 3 distinct, specific problems or pain points that could be solved with a SaaS. Return ONLY a JSON object with a "problems" array. Each problem should have a "title" (short, catchy) and "description" (1 sentence summary).' 
        },
        { role: 'user', content: context }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content || '{"problems": []}';
    return NextResponse.json(JSON.parse(content));

  } catch (error) {
    console.error('Reddit Scraper Error:', error);
    return NextResponse.json({ error: 'Failed to hunt for Reddit problems' }, { status: 500 });
  }
}
