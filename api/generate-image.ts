// Путь к файлу в вашем БЭКЕНД-проекте: /api/generate-image.ts

import { GoogleGenAI } from "@google/genai";
import type { NextApiRequest, NextApiResponse } from 'next';

// Эта функция-обертка добавляет необходимые CORS-заголовки
const allowCors = (fn: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => async (req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*'); // Разрешает запросы с любого домена
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

// Ваша основная логика API
async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ... остальная часть вашей логики без изменений ...
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key not configured on the server' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

    return res.status(200).json({ imageUrl });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ error: `Failed to generate image: ${message}` });
  }
}

// Экспортируем вашу логику, обернутую в CORS-функцию
export default allowCors(handler);
