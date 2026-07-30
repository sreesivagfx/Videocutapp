# Deploying VideoCut to a public URL

This gets you a real, clickable link on free tiers — no local setup required.
Backend goes on Render (needs a persistent disk + ffmpeg, so Vercel/Netlify
serverless functions won't work for it). Frontend goes on Vercel.

Both steps need your own free accounts — nothing here requires payment info,
but I can't create these deployments for you since it needs your account.

## 1. Backend → Render

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. **New +** → **Blueprint**, pick this repo (`sreesivagfx/Videocutapp`).
   Render will detect `render.yaml` at the repo root and configure a Docker
   web service (`videocut-backend`) automatically, including a 1GB persistent
   disk mounted at `/app/storage` (so uploads/jobs/the SQLite DB survive
   restarts).
3. It'll ask you to fill in `CORS_ORIGINS` — leave it blank for now, you'll
   set it in step 3 once you know your Vercel URL.
4. Click **Apply**. First build takes a few minutes (installs ffmpeg +
   Python deps). When it's live, note the URL Render gives you, e.g.
   `https://videocut-backend-xxxx.onrender.com`.
5. Free tier note: Render's free web services spin down after 15 minutes of
   inactivity and take ~30-60s to wake back up on the next request — the
   first "Generate shorts" click after idle time will be slow to start.

## 2. Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New** → **Project**, pick this repo.
3. Under **Root Directory**, click Edit and select `frontend` (the repo is a
   monorepo — Vercel needs to know the Next.js app isn't at the repo root).
4. Add an environment variable:
   - `NEXT_PUBLIC_API_URL` = the Render URL from step 1 (no trailing slash).
5. Click **Deploy**. You'll get a URL like `https://your-app.vercel.app`.

## 3. Connect them

1. Back in Render, open `videocut-backend` → **Environment**, set
   `CORS_ORIGINS` to your Vercel URL from step 2 (e.g.
   `https://your-app.vercel.app`), then save (triggers a redeploy).
2. Open your Vercel URL. Dashboard → upload a short video → Generate shorts.

## Notes / limits on the free tier

- **Whisper model download**: the first transcription job downloads the
  model from huggingface.co on Render's servers — this works fine there
  (unlike the sandbox this was built in, which had that host blocked).
  `render.yaml` defaults `WHISPER_MODEL_SIZE=tiny` since Render's free plan
  has limited CPU/RAM; `base` (the app's local default) is more accurate but
  slower and heavier — bump it in Render's environment variables if you
  upgrade off the free plan.
- **Storage**: 1GB disk fills up fast with video files. Fine for trying it
  out; for real use you'd want to wire up S3-compatible storage (see the
  README roadmap) instead of relying on the disk.
- **Voice cloning / paid TTS / paid translation**: still require you to set
  the relevant provider keys as Render environment variables
  (`ELEVENLABS_API_KEY`, `DEEPL_API_KEY`, etc. — see `backend/.env.example`).
