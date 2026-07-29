import uuid

from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse

from app import config
from app.services import noise_service

router = APIRouter(prefix="/audio", tags=["audio"])


@router.post("/upload-recording")
async def upload_recording(file: UploadFile = File(...)):
    """Accepts audio recorded in-browser (e.g. MediaRecorder blob) for use as
    a voice-over track or as a voice-cloning sample."""
    recording_id = uuid.uuid4().hex[:10]
    dst = config.JOBS_DIR / f"recording_{recording_id}.webm"
    with open(dst, "wb") as out:
        out.write(await file.read())
    return {"recording_id": recording_id, "path": str(dst)}


@router.post("/denoise")
async def denoise(file: UploadFile = File(...)):
    upload_id = uuid.uuid4().hex[:10]
    src_path = config.JOBS_DIR / f"denoise_src_{upload_id}.wav"
    with open(src_path, "wb") as out:
        out.write(await file.read())

    dst_path = config.JOBS_DIR / f"denoise_out_{upload_id}.wav"
    noise_service.denoise_wav(src_path, dst_path)
    return FileResponse(dst_path, media_type="audio/wav", filename="denoised.wav")
