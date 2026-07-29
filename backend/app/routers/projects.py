import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException

from app import config
from app.models.schemas import CreateProjectResponse

router = APIRouter(prefix="/projects", tags=["projects"])

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".mkv", ".webm", ".avi"}
MAX_UPLOAD_BYTES = 2 * 1024 * 1024 * 1024  # 2 GB


@router.post("/upload", response_model=CreateProjectResponse)
async def upload_video(file: UploadFile = File(...)):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type {ext}. Allowed: {sorted(ALLOWED_EXTENSIONS)}")

    project_id = str(uuid.uuid4())[:12]
    dst = config.UPLOADS_DIR / f"{project_id}{ext}"

    size = 0
    with open(dst, "wb") as out:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                out.close()
                dst.unlink(missing_ok=True)
                raise HTTPException(413, "File too large (max 2GB)")
            out.write(chunk)

    return CreateProjectResponse(project_id=project_id, filename=file.filename or dst.name)
