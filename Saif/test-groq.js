import Groq from 'groq-sdk';
import 'dotenv/config';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
async function test() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: "You are a JSON generator." }, { role: "user", content: "Output a JSON array of files. Return ONLY valid JSON." }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      response_format: { type: "json_object" },
    });
    console.log("SUCCESS:", completion.choices[0]?.message?.content);
  } catch (e) {
    console.error("ERROR:", e.message || e);
  }
}
test();
