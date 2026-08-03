# Audio Transcriber

Fast, local audio transcription using Groq's Whisper model. Record from your mic or upload files (any size — auto-chunked). All audio stays in your browser; API key never leaves your tab.

## Features

- **Record or upload** — mic input or drag-and-drop files (mp3, wav, m4a, webm, ogg)
- **Auto-chunking** — files over 24MB split automatically, merged seamlessly
- **MP3 optimization** — large MP3s split raw (no decoding overhead)
- **Fast inference** — Groq's Whisper Turbo model
- **Private** — runs in your browser; key stored in tab memory only

## Setup

### 1. Get a Groq API Key

1. Go to [console.groq.com/keys](https://console.groq.com/keys)
2. Create a new API key (free tier includes quota)
3. Copy it

### 2. Run the Proxy Server

The browser can't call Groq directly due to CORS restrictions. Start a simple proxy:

```bash
npm install
npm start
```

The proxy will run on `http://localhost:3000`.

### 3. Open the App

Open `index.html` in your browser. The app automatically uses `http://localhost:3000` as the proxy.

## How It Works

1. **Verification**: Click "Verify" to test your key against Groq's models endpoint (via proxy)
2. **Record or Upload**: Mic input saves as WebM; file uploads detected by MIME type
3. **Chunking**:
   - Files ≤24MB: sent directly
   - MP3 files: raw bytes split at 20MB boundaries (no decoding)
   - Other large files: decoded to mono 16kHz, split into 8-min chunks with 2-sec overlap
4. **Transcription**: Each chunk sent to `POST /api/transcribe` (proxy forwards to Groq)
5. **Merge**: Transcripts joined with spaces; progress updates in real time

## Deployment

To run publicly (e.g., Vercel, Heroku, Railway):

1. Deploy `proxy.js` + `package.json`
2. Update the `PROXY_BASE_URL` in `index.html` to your deployed URL
3. Open `index.html` from anywhere

Example (Vercel):
```bash
vercel deploy
# Then in index.html, change:
# const PROXY_BASE_URL = 'https://your-vercel-url.vercel.app';
```

## API Endpoints

The proxy provides:

- `GET /health` — Server health check
- `GET /api/models` — Forward to Groq's `/v1/models` (key verification)
- `POST /api/transcribe` — Forward to Groq's `/v1/audio/transcriptions` (transcribe chunk)

All require `Authorization: Bearer <groq-key>` header.

## Troubleshooting

- **"Failed to fetch"** — Proxy not running or unreachable. Restart with `npm start`.
- **"Invalid key"** — Verify the key at console.groq.com/keys.
- **"Could not decode this file"** — Non-MP3 large files need decoding. Try MP3 or smaller files.

## Privacy

- Your API key is stored only in browser memory (your tab)
- Audio is never saved; only transcription results
- Proxy only relays requests; it doesn't log or store data

## License

MIT