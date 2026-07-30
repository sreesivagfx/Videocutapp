FROM python:3.11-slim

# ffmpeg is required by the pipeline (cut/crop/caption-burn/denoise);
# espeak-ng backs the local pyttsx3 TTS fallback.
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg espeak-ng \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN mkdir -p storage/uploads storage/outputs storage/jobs

ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
