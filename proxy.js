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
    const data = await response.json();
    res.status(response.status).json(data);
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
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': req.headers['content-type']
      },
      body: req
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
