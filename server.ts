import { localApiOnly } from './local-api-guard.mjs';
import express from 'express';
import path from 'path';
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use('/api', localApiOnly(() => PORT));
const PORT = 3000;

// Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB max
  },
});

app.use(express.json({ limit: '20mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.post('/api/analyze-call', upload.single('audio'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No audio file uploaded.' });
    }

    const base64Data = file.buffer.toString('base64');
    
    // We'll use the Type enum from SDK
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        transcript: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              speaker: { type: Type.STRING },
              text: { type: Type.STRING },
              timestamp: { type: Type.STRING },
              sentimentScore: { 
                type: Type.NUMBER, 
                description: 'Sentiment score from 0 (very negative) to 100 (very positive)' 
              }
            },
            required: ['speaker', 'text', 'timestamp', 'sentimentScore']
          }
        },
        coaching: {
          type: Type.OBJECT,
          properties: {
            pros: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 things the salesperson did well'
            },
            cons: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 missed opportunities or areas for improvement'
            }
          },
          required: ['pros', 'cons']
        }
      },
      required: ['transcript', 'coaching']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: file.mimetype,
              },
            },
            {
              text: "You are an expert sales coach. Analyze this sales call audio. Diarize the transcript into Speaker A (usually the salesperson) and Speaker B (usually the prospect). For each utterance, provide a timestamp (e.g., '0:12') and a sentiment score representing the engagement/positivity of the prospect at that moment (0-100). Also provide a coaching card with 3 things the salesperson did well and 3 missed opportunities.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text || '{}';
    const analysis = JSON.parse(jsonText);

    res.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing call:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze call.' });
  }
});

// Vite Middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
