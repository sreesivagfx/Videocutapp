from fastapi import APIRouter, HTTPException

from app.models.schemas import TranslateRequest
from app.services import translate_service

router = APIRouter(prefix="/translate", tags=["translate"])


@router.post("")
def translate_text(req: TranslateRequest):
    try:
        translated = translate_service.translate(req.text, req.target_language, req.source_language or "auto")
    except translate_service.TranslateError as exc:
        raise HTTPException(400, str(exc))
    return {"translated_text": translated, "target_language": req.target_language}
