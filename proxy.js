import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Serve static files (index.html, CSS, JS)
app.use(express.static(path.join(__dirname)));

// Proxy health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Proxy for Groq models endpoint (verification)
app.get('/api/models', async (req, res) => {
  const key = req.headers.authorization?.replace('Bearer ', '');
  if (!key) {
    return res.status(401).json({ error: 'No API key provided' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${key}` }
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    const text = await response.text();
    res.status(response.status).type(contentType || 'text/plain').send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy for Groq transcriptions endpoint
app.post('/api/transcribe', async (req, res) => {
  const key = req.headers.authorization?.replace('Bearer ', '');
  if (!key) {
    return res.status(401).json({ error: 'No API key provided' });
  }

  try {
    // Stream the raw multipart body straight through to Groq, preserving
    // the original Content-Type (it carries the multipart boundary that
    // Groq needs in order to parse the uploaded file).
    const headers = {
      'Authorization': `Bearer ${key}`
    };
    // Preserve content-type (multipart boundary) if present
    if (req.headers['content-type']) headers['Content-Type'] = req.headers['content-type'];
    // Preserve content-length if provided (optional)
    if (req.headers['content-length']) headers['Content-Length'] = req.headers['content-length'];

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers,
      body: req
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    }

    const text = await response.text();
    res.status(response.status).type(contentType || 'text/plain').send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
