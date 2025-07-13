import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Missing text' });
  }
  try {
    const aiResp = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a construction site diary assistant. Summarize the entry in 2-3 concise sentences.' },
        { role: 'user', content: text }
      ]
    });
    const summary = aiResp.choices[0].message?.content || '';
    res.status(200).json({ summary });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Error generating summary' });
  }
} 