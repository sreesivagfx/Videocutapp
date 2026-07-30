# VideoCut — Long-form to Shorts, Automatically

A professional video editing SaaS platform focused on turning long-form video into
short-form clips (YouTube Shorts / Reels / TikTok) automatically, plus a full toolkit for
corporate video production: auto captions, translation, regional audio/dubbing,
a caption-style library, fonts/transitions/effects, noise removal, in-browser recording,
text-to-speech, and (optionally, via a consent-gated third-party provider) voice cloning.

## Monorepo layout

```
Videocutapp/
├── backend/     FastAPI service: ffmpeg + Whisper pipeline, job queue, all feature APIs
└── frontend/    Next.js (App Router) + TypeScript + Tailwind — corporate/professional UI
```

## Architecture (MVP)

```
Upload video
   │
   ▼
Transcribe (faster-whisper, runs locally/CPU)
   │
   ▼
Highlight detection (silence gaps + speech-rate/keyword scoring)
   │                                   → candidate short-worthy segments
   ▼
Per segment: ffmpeg cut + smart 9:16 crop
   │
   ▼
Caption generation (SRT/ASS) → styled per chosen preset → burned into video
   │
   ▼
Export / download
```

Supporting modules (translate, TTS, noise removal, voice cloning, audio recording,
caption style + font/transition library) hang off the same job pipeline as optional
post-processing steps — see `backend/app/services/`.

## Why some features are "bring your own API key"

This runs in a plain CPU container with no GPU. That's enough for:
- Whisper transcription (CPU, slower but fine for an MVP)
- ffmpeg cutting/cropping/caption burning
- Basic noise reduction (RNNoise/afftdn via ffmpeg)
- Open-source TTS (lower quality, but free and local)

It is **not** enough for production-quality voice cloning or large translation models —
those need a GPU-backed provider. The backend defines a clean provider interface
(`services/tts_service.py`, `services/translate_service.py`, `services/voice_clone_service.py`)
so you can plug in ElevenLabs / Azure / Google / DeepL / OpenAI keys via `.env` without
touching the pipeline code. Voice cloning is consent-gated by design — see that file.

## Getting started

### Backend
```
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```
cd frontend
npm install
npm run dev
```

Frontend expects the backend at `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:8000`).

## Roadmap / what's stubbed

- [x] Upload, transcription, auto-shorts detection, vertical crop, caption burn, style presets
- [x] Caption style library (UI + ASS style generation)
- [x] Noise removal (ffmpeg afftdn filter)
- [x] Text-to-speech via open-source engine, provider-swappable
- [x] Translation via provider abstraction (needs an API key for real quality)
- [x] Persistent project/job storage (SQLite, `app/db.py`) — survives backend restarts
- [x] Short preview thumbnails, generated as soon as highlights are detected
- [ ] Voice cloning — interface + consent gate defined, requires an external provider key
- [ ] Auth/billing (Stripe) — not built; add before public launch
- [ ] Object storage (S3/R2) — currently local disk under `backend/storage/`; swap the read/write
      paths in `app/config.py` and the upload/download routes for an S3-compatible client at scale
- [ ] Background job queue — currently an in-process thread pool; swap for Celery/RQ + Redis once
      running more than one backend instance
