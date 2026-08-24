import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Serve static assets and frontend
app.use(express.static(__dirname));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Server engine & API key status
app.get('/api/status', (req, res) => {
  const hasBackendKey = Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim().length > 0);
  res.json({
    status: 'ok',
    hasBackendKey,
    defaultModel: 'whisper-large-v3-turbo'
  });
});

// Proxy for Groq models endpoint (key verification)
app.get('/api/models', async (req, res) => {
  const key = req.headers.authorization?.replace(/^Bearer\s+/i, '') || process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(401).json({
      error: { message: 'No Groq API key provided in request headers or server environment (.env).' }
    });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: {
        'Authorization': `Bearer ${key}`
      }
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    const text = await response.text();
    res.status(response.status).type(contentType || 'text/plain').send(text);
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

// Proxy for Groq audio transcription
app.post('/api/transcribe', async (req, res) => {
  const key = req.headers.authorization?.replace(/^Bearer\s+/i, '') || process.env.GROQ_API_KEY;
  if (!key) {
    return res.status(401).json({
      error: { message: 'No Groq API key configured. Please set GROQ_API_KEY in .env on the server or provide an Authorization header.' }
    });
  }

  try {
    const headers = {
      'Authorization': `Bearer ${key}`
    };

    // Forward multipart boundary and content length
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    }
    if (req.headers['content-length']) {
      headers['Content-Length'] = req.headers['content-length'];
    }

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers,
      body: req,
      duplex: 'half'
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    const text = await response.text();
    res.status(response.status).type(contentType || 'text/plain').send(text);
  } catch (err) {
    console.error('Transcription proxy error:', err);
    res.status(500).json({ error: { message: err.message || 'Internal proxy error' } });
  }
});

app.listen(PORT, () => {
  console.log(`🎙️  Audio Transcriber Server running at http://localhost:${PORT}`);
  console.log(`🔑 Backend Groq Key: ${process.env.GROQ_API_KEY ? 'Configured ✅' : 'Missing ❌ (Add to .env)'}`);
});
