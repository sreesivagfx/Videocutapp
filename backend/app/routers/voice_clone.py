from fastapi import APIRouter, HTTPException

from app.models.schemas import VoiceCloneConsentRequest
from app.services import voice_clone_service

router = APIRouter(prefix="/voice-clone", tags=["voice-clone"])


@router.get("/status")
def status():
    return {"enabled": voice_clone_service.is_enabled()}


@router.post("/create")
def create_clone(req: VoiceCloneConsentRequest):
    try:
        voice_id = voice_clone_service.clone_voice(
            req.speaker_name, req.sample_audio_path, req.consent_confirmed,
        )
    except voice_clone_service.VoiceCloneDisabledError as exc:
        raise HTTPException(503, str(exc))
    except voice_clone_service.VoiceCloneError as exc:
        raise HTTPException(400, str(exc))
    return {"voice_id": voice_id}
