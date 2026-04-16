import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const apiKey = 'AQ.Ab8RN6LOuxeSzUOsL8eQGFJ4U2RsLIhRPygyxdXe32KHU-h85Q';
const ai = new GoogleGenAI({ apiKey: apiKey });
const METABOX_MODEL = 'gemini-2.5-flash';

export async function POST(request) {
  try {
    const body = await request.json();
    const { phase, answers, blueprint } = body;

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

        Your task is to write the COMPLETE, production-ready, MVP code for this specific SaaS application.
        We are keeping it lightweight. Create a Node.js Express backend and a clean HTML/JS/CSS frontend.
        Do NOT wrap in markdown \`\`\`json. Return a strict JSON array of file objects.
        
        The JSON must look EXACTLY like this:
        [
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
        
        Return ONLY the raw JSON array.
        Write fully functional code that implements the MVP features.
      `;
    } else {
      return NextResponse.json({ error: 'Invalid phase' }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: METABOX_MODEL,
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    let text = response.text;
    
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
    } catch (e) {
      console.error("Failed to parse JSON response. The model may have returned malformed data.");
      // Fallback: If parse fails on an array (phase === code), return a dummy file package
      if (phase === 'code') {
         return NextResponse.json([
           { filename: "error.log", content: "The AI engine returned malformed JSON during generation. Try restructuring your prompt or try again." },
           { filename: "README.md", content: "# Code Generation Error\nThe engine timed out or the logic overflowed." }
         ]);
      }
      return NextResponse.json({ error: "Proprietary AI engine returned an invalid format. Please try again." }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('AI Processing Error:', error);
    return NextResponse.json({ error: error.message || 'Server processing failed' }, { status: 500 });
  }
}
