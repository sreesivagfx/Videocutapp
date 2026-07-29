import uuid

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app import config
from app.models.schemas import TtsRequest
from app.services import tts_service

router = APIRouter(prefix="/tts", tags=["tts"])


@router.post("/generate")
def generate_speech(req: TtsRequest):
    out_path = config.JOBS_DIR / f"tts_{uuid.uuid4().hex[:10]}.wav"
    try:
        tts_service.synthesize(req.text, out_path, voice=req.voice)
    except tts_service.TtsError as exc:
        raise HTTPException(400, str(exc))
    return FileResponse(out_path, media_type="audio/wav", filename="speech.wav")
