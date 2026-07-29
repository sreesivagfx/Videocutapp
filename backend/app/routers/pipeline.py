from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app import config
from app.models.schemas import StartPipelineRequest, JobStatusResponse
from app.services import pipeline_service, job_store

router = APIRouter(tags=["pipeline"])


@router.post("/pipeline/start")
def start_pipeline(req: StartPipelineRequest):
    job_id = pipeline_service.start_job(req)
    return {"job_id": job_id}


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
def get_job(job_id: str):
    job = job_store.get(job_id)
    if job is None:
        raise HTTPException(404, "Job not found")
    return JobStatusResponse(
        job_id=job.job_id, status=job.status, progress=job.progress,
        message=job.message, shorts=job.shorts, outputs=job.outputs, error=job.error,
    )


@router.get("/jobs/{job_id}/download/{filename}")
def download_output(job_id: str, filename: str):
    job = job_store.get(job_id)
    if job is None:
        raise HTTPException(404, "Job not found")
    for rel in job.outputs:
        if Path(rel).name == filename:
            full = config.STORAGE_DIR / rel
            if full.exists():
                return FileResponse(full, filename=filename, media_type="video/mp4")
    raise HTTPException(404, "Output not found")


@router.get("/jobs/{job_id}/thumbnail/{filename}")
def download_thumbnail(job_id: str, filename: str):
    job = job_store.get(job_id)
    if job is None:
        raise HTTPException(404, "Job not found")
    for short in job.shorts:
        if short.thumbnail and Path(short.thumbnail).name == filename:
            full = config.STORAGE_DIR / short.thumbnail
            if full.exists():
                return FileResponse(full, filename=filename, media_type="image/jpeg")
    raise HTTPException(404, "Thumbnail not found")
