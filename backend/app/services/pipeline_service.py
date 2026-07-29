"""Orchestrates the full long-video -> shorts pipeline. Runs in a background
thread per job so the HTTP request that kicks it off can return immediately
and the frontend polls /jobs/{id} for progress.
"""
import threading
import uuid
from pathlib import Path

from app import config
from app.models.schemas import JobStatus, StartPipelineRequest
from app.services import ffmpeg_service, transcribe_service, highlight_service, caption_service, style_presets, job_store


def start_job(req: StartPipelineRequest) -> str:
    job_id = str(uuid.uuid4())[:12]
    job_store.create(job_id, req.project_id)
    thread = threading.Thread(target=_run_pipeline, args=(job_id, req), daemon=True)
    thread.start()
    return job_id


def _run_pipeline(job_id: str, req: StartPipelineRequest) -> None:
    try:
        src_video = _find_source_video(req.project_id)
        job_store.update(job_id, status=JobStatus.TRANSCRIBING, progress=0.1, message="Extracting audio")

        audio_path = config.JOBS_DIR / f"{job_id}.wav"
        ffmpeg_service.extract_audio(src_video, audio_path)

        job_store.update(job_id, progress=0.2, message="Transcribing speech")
        segments = transcribe_service.transcribe(audio_path)

        job_store.update(
            job_id, status=JobStatus.DETECTING_HIGHLIGHTS, progress=0.45,
            message="Detecting short-worthy moments",
        )
        shorts = highlight_service.detect_shorts(
            segments,
            max_shorts=req.max_shorts,
            min_duration_sec=req.min_duration_sec,
            max_duration_sec=req.max_duration_sec,
        )

        if not shorts:
            job_store.update(
                job_id, status=JobStatus.FAILED, progress=1.0,
                error="No speech-based highlights found — try a longer or more speech-heavy video.",
            )
            return

        project_out_dir = config.OUTPUTS_DIR / req.project_id
        project_out_dir.mkdir(parents=True, exist_ok=True)

        for short in shorts:
            thumb_path = project_out_dir / f"thumb_{short.id}.jpg"
            try:
                ffmpeg_service.extract_thumbnail(
                    src_video, thumb_path, short.start, aspect=req.target_aspect,
                )
                short.thumbnail = str(thumb_path.relative_to(config.STORAGE_DIR))
            except ffmpeg_service.FFmpegError:
                pass  # thumbnail is a nice-to-have; don't fail the job over it

        job_store.update(job_id, shorts=shorts)

        style = style_presets.get_style(req.caption_style_id)
        outputs: list[str] = []

        for i, short in enumerate(shorts):
            job_store.update(
                job_id, status=JobStatus.RENDERING,
                progress=0.5 + 0.45 * (i / len(shorts)),
                message=f"Rendering short {i + 1}/{len(shorts)}",
            )

            ass_path = None
            if req.burn_captions:
                ass_path = config.JOBS_DIR / f"{job_id}_{short.id}.ass"
                caption_service.write_ass(segments, style, short.start, short.end, ass_path)

            out_path = project_out_dir / f"short_{short.id}.mp4"
            ffmpeg_service.cut_and_crop(
                src_video, out_path, short.start, short.end,
                aspect=req.target_aspect,
                subtitles_ass_path=ass_path,
                denoise=req.denoise_audio,
            )
            outputs.append(str(out_path.relative_to(config.STORAGE_DIR)))

        job_store.update(
            job_id, status=JobStatus.DONE, progress=1.0,
            message="Done", outputs=outputs,
        )
    except Exception as exc:  # noqa: BLE001 - surface any failure to the client
        job_store.update(job_id, status=JobStatus.FAILED, progress=1.0, error=str(exc))


def _find_source_video(project_id: str) -> Path:
    matches = list(config.UPLOADS_DIR.glob(f"{project_id}.*"))
    if not matches:
        raise FileNotFoundError(f"No uploaded video found for project {project_id}")
    return matches[0]
