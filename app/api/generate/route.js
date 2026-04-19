import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

function normalizeApiKey(value) {
  if (!value) return '';
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function resolveGroqApiKey(overrideKey = '') {
  const candidates = [
    overrideKey,
    process.env.GROQ_API_KEY,
    process.env.NEXT_PUBLIC_GROQ_API_KEY,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeApiKey(candidate);
    if (normalized) return normalized;
  }
  return '';
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { phase, answers, blueprint, apiKeyOverride } = body;

    const headerApiKey = request.headers.get('x-groq-api-key') || '';
    const apiKey = resolveGroqApiKey(apiKeyOverride || headerApiKey);
    if (!apiKey) {
      throw new Error('Missing Groq API key. Set GROQ_API_KEY in your environment.');
    }

    const groq = new Groq({ apiKey });

    const baseContext = `
      You are an elite Senior AI Systems Architect & Venture Builder (MetaBox platform).
      User profile: 
      - Industry: ${answers[0] || 'Unknown'}
      - Strongest Skill: ${answers[1] || 'Unknown'}
      - Hours/week available: ${answers[2] || 'Unknown'}
      - Monthly Budget: ${answers[3] || 'Unknown'}
      - Ideal Customer: ${answers[4] || 'Unknown'}
    `;

    let prompt = '';

    if (phase === 'intake') {
      prompt = `
        ${baseContext}
        You must act as the intake analyzer. Output valid JSON containing the following structure:
        {
          "founderFit": "A paragraph explaining why their profile fits B2B micro-SaaS",
          "pains": [
            { "title": "Pain point name", "desc": "Detailed description of the pain and why it hurts", "severity": "Critical or High", "revenue": "Estimated $ value lost per year" },
            { "title": "Pain point name", "desc": "Detailed description of the pain and why it hurts", "severity": "Critical or High", "revenue": "Estimated $ value lost per year" },
            { "title": "Pain point name", "desc": "Detailed description of the pain and why it hurts", "severity": "Critical or High", "revenue": "Estimated $ value lost per year" }
          ],
          "recommendation": "The #1 recommended Micro-SaaS concept to address the critical pain"
        }
        Return ONLY valid JSON. Note: If you cannot determine accurate information, fabricate convincing synthetic data strictly matching the requested structure.
      `;
    } else if (phase === 'blueprint') {
      prompt = `
        ${baseContext}
        You must act as the technical architect. Output valid JSON outlining the strict anti-bloat blueprint for the recommended micro-SaaS.
        Structure:
        {
          "name": "Name of the App",
          "tagline": "Short tagline",
          "architecture": { "frontend": "...", "backend": "...", "database": "...", "auth": "...", "hosting": "..." },
          "coreFeatures": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
          "security": ["Protocol 1", "Protocol 2", "Protocol 3"],
          "mvpTimeline": "e.g. 2-4 weeks",
          "estimatedCost": "Estimated initial cost to launch"
        }
        Return ONLY valid JSON. Keep architecture extremely simple (e.g. Node/Express backend, vanilla JS frontend to keep generation fast).
      `;
    } else if (phase === 'aiLogic') {
      prompt = `
        ${baseContext}
        You must act as the AI logic engineer. Output valid JSON containing the prompts and logic schemas for the micro-SaaS.
        Structure:
        {
          "systemPrompt": "The actual system prompt used by the AI inside the generated SaaS",
          "jsonSchema": "A stringified JSON schema of how the AI should output data (e.g. client intake format)",
          "agenticLogic": [
            { "step": 1, "action": "Action Name", "handler": "functionName()", "next": "nextStep" }
          ],
          "dashboardWidgets": [
            { "name": "Widget Name", "type": "counter", "source": "system.metric" }
          ]
        }
        Return ONLY valid JSON.
      `;
    } else if (phase === 'sales') {
      prompt = `
        ${baseContext}
        You must act as the GTM director. Output valid JSON containing the sales and outreach strategy.
        Structure:
        {
          "idealCustomer": { "size": "...", "role": "...", "pain": "...", "budget": "...", "channel": "..." },
          "emailTemplate": "A cold email script to get early adopters",
          "linkedinScript": "A cold LinkedIn DM script",
          "thirtyDayPlan": [
            { "week": "Week 1", "actions": ["Task 1", "Task 2"] },
            { "week": "Week 2", "actions": ["Task 1", "Task 2"] },
            { "week": "Week 3", "actions": ["Task 1", "Task 2"] },
            { "week": "Week 4", "actions": ["Task 1", "Task 2"] }
          ],
          "projectedResults": { "emailsSent": 200, "expectedReplies": "...", "expectedDemos": "...", "expectedCustomers": "...", "monthlyRevenue": "..." }
        }
        Return ONLY valid JSON.
      `;
    } else if (phase === 'code') {
      prompt = `
        ${baseContext}
        The user has approved the blueprint:
        Name: ${blueprint?.name || "App"}
        Core Features: ${(blueprint?.coreFeatures || []).join(', ')}
        Tech Stack: ${JSON.stringify(blueprint?.architecture || {})}

        Your task is to write a simple, functional proof-of-concept codebase for this SaaS application.
        Create an extremely lightweight Node.js server and a clean HTML/JS/CSS frontend.
        Return a strict JSON object containing a "files" array.
        
        The JSON must look EXACTLY like this:
        {
          "files": [
          {
            "filename": "package.json",
            "content": "{\\"name\\":\\"saas-app\\",\\"version\\":\\"1.0.0\\",\\"dependencies\\":{\\"express\\":\\"^4.18.2\\", \\"cors\\":\\"^2.8.5\\", \\"dotenv\\":\\"^16.0.3\\"}}"
          },
          {
            "filename": "server.js",
            "content": "const express = require('express');\\nconst app = express();\\napp.use(express.static('public'));\\n// ... rest of API logic based on blueprint"
          },
          {
            "filename": "public/index.html",
            "content": "<!DOCTYPE html><html><head><title>App</title><link rel=\\"stylesheet\\" href=\\"style.css\\"></head><body><div id=\\"app\\"></div><script src=\\"app.js\\"></script></body></html>"
          },
          {
            "filename": "public/style.css",
            "content": "... aesthetic dark mode css ..."
          },
          {
            "filename": "public/app.js",
            "content": "... frontend api fetch and DOM manipulation logic ..."
          },
          {
            "filename": "README.md",
            "content": "# Start Instructions\\n1. npm install\\n2. node server.js"
          }
          ]
        }
        
        Return ONLY valid JSON.
      `;
    } else {
      return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });
    }

    let text = "";
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a specialized JSON and text structure generator. You only return valid JSON. Do not return conversational text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        response_format: { type: "json_object" },
      });
      
      text = completion.choices[0]?.message?.content || "";
    } catch (apiError) {
      console.error(`Groq API Error:`, apiError?.message || apiError);
      const msg = apiError?.message || '';
      
      if (msg.includes("401") || apiError?.status === 401) {
        throw new Error("Unauthorized API Key (401). Please update your GROQ_API_KEY.");
      }
      if (msg.includes("429") || apiError?.status === 429) {
        throw new Error("Rate Limit Exceeded (429). The Groq API is busy or ratelimited — please retry.");
      }
      throw new Error(apiError?.message || "AI Generation Fault");
    }
    
    // Clean up markdown wrapping if present
    if (text.startsWith('```json')) {
      text = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Attempt to parse JSON safely
    let parsed;
    try {
      parsed = JSON.parse(text);
      // Unwrap the expected files array if this is the code generation phase
      if (phase === 'code') {
         if (parsed.files && Array.isArray(parsed.files)) {
             parsed = parsed.files;
         } else if (parsed.GeneratedFiles) {
             parsed = parsed.GeneratedFiles;
         }
      }
    } catch (e) {
      console.error("Failed to parse JSON response.", text);
      // Fallback: If parse fails on an array (phase === code), return a dummy file package
      if (phase === 'code') {
         return NextResponse.json([
           { filename: "error.log", content: "The AI engine returned malformed JSON during generation from Groq. Check server console limits." },
           { filename: "README.md", content: "# Code Generation Error\nThe engine failed to format properly." }
         ]);
      }
      return NextResponse.json({ error: "The AI engine returned an invalid JSON format. Please try again." }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('AI Processing Error:', error);
    return NextResponse.json({ error: error.message || 'Server processing failed' }, { status: 500 });
  }
}
