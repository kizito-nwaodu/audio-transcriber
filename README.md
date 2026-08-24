# Audio Transcriber Studio 🎙️

Fast, high-accuracy audio transcription platform powered by **Groq's Whisper Large V3 Turbo** model. Record audio directly from your microphone with live visualizer meters, or upload audio files of any size with automatic client-side chunking.

---

## 🚀 Features

- **Microphone Recording**: Studio recorder with live audio waveform visualizer, recording timer, and pause/resume.
- **Universal Audio Uploads**: Drag-and-drop support for MP3, WAV, M4A, AAC, OGG, WEBM, FLAC, and MP4.
- **Smart Audio Chunking**: Files $>24\text{MB}$ are automatically resampled to mono 16kHz WAV and chunked seamlessly with context prompt continuity (no word duplication).
- **Built-in Audio Preview Player**: Listen back to recorded or uploaded audio before and during transcription.
- **Multilingual Support**: Supports Auto-Detection as well as 15+ specific languages (English, Spanish, French, German, Yoruba, Igbo, Hausa, Arabic, etc.).
- **Domain Vocabulary Prompting**: Custom prompt guidance for technical jargon, acronyms, or proper names.
- **Multi-Format Export Hub**:
  - 📋 One-click Copy to Clipboard
  - 📄 Plain Text (`.txt`)
  - 🎬 Subtitles (`.srt` with timestamps)
  - 📊 Structured Data (`.json` with segments)
- **Search within Transcript**: Real-time keyword highlighter.
- **Backend Key Storage**: Groq API key is stored securely on the backend server (`.env`) with client override options.

---

## 🛠️ Quick Start

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/kizito-nwaodu/audio-transcriber.git
cd audio-transcriber
npm install
```

### 2. Configure Environment

Create a `.env` file from the provided `.env.example`:

```bash
cp .env.example .env
```

Add your Groq API key to `.env`:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
PORT=3000
```

> **Note**: Get a free Groq API key at [console.groq.com/keys](https://console.groq.com/keys).

### 3. Start the Server

```bash
npm start
```

Open `http://localhost:3000` in your web browser.

---

## 🌐 API Endpoints

The proxy server provides the following endpoints:

| Endpoint | Method | Description |
|---|---|---|
| `/health` | `GET` | Server health check and timestamp |
| `/api/status` | `GET` | Returns backend engine and API key status |
| `/api/models` | `GET` | Verifies key and fetches available Groq models |
| `/api/transcribe` | `POST` | Streams multipart audio to Groq Whisper Turbo |

---

## ☁️ Deployment

### Render / Railway / Fly.io / VPS
1. Set the build command to `npm install`.
2. Set the start command to `npm start`.
3. Add `GROQ_API_KEY` to your environment variables in the hosting dashboard.

### Vercel / Netlify
Deploy the Node server as a serverless backend function or container and set `GROQ_API_KEY` in project environment variables.

---

## 🔒 Security & Privacy

- Your `GROQ_API_KEY` is kept on your private backend server in `.env` (ignored by git).
- Audio is never stored on disk; it is processed in memory / streamed directly to Groq.

---

## 📄 License

MIT © [Kizito Nwaodu](https://github.com/kizito-nwaodu)
