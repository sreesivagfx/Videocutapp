import os
from pathlib import Path

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
OUTPUTS_DIR = STORAGE_DIR / "outputs"
JOBS_DIR = STORAGE_DIR / "jobs"

for d in (UPLOADS_DIR, OUTPUTS_DIR, JOBS_DIR):
    d.mkdir(parents=True, exist_ok=True)

WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")

TRANSLATE_PROVIDER = os.getenv("TRANSLATE_PROVIDER", "stub")
DEEPL_API_KEY = os.getenv("DEEPL_API_KEY", "")
GOOGLE_TRANSLATE_API_KEY = os.getenv("GOOGLE_TRANSLATE_API_KEY", "")

TTS_PROVIDER = os.getenv("TTS_PROVIDER", "local")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY", "")
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY", "")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "")

VOICE_CLONE_PROVIDER = os.getenv("VOICE_CLONE_PROVIDER", "disabled")
VOICE_CLONE_API_KEY = os.getenv("VOICE_CLONE_API_KEY", "")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
