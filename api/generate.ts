import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'A valid "prompt" string is required in the request body.' });
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY environment variable is not set.");
      // Do not expose details about server configuration to the client
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;

    return res.status(200).json({ text });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Return a generic error message to the client
    return res.status(500).json({ error: 'An error occurred while communicating with the AI service.' });
  }
}
