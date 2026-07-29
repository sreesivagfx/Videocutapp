"""In-process job tracking. Fine for an MVP/single-instance deployment; swap
for Celery/RQ + Redis (or a DB-backed table) before running multiple backend
instances, since state here lives only in this process's memory.
"""
import threading
from dataclasses import dataclass, field

from app.models.schemas import JobStatus, ShortCandidate


@dataclass
class Job:
    job_id: str
    project_id: str
    status: JobStatus = JobStatus.QUEUED
    progress: float = 0.0
    message: str = ""
    shorts: list[ShortCandidate] = field(default_factory=list)
    outputs: list[str] = field(default_factory=list)
    error: str | None = None


_jobs: dict[str, Job] = {}
_lock = threading.Lock()


def create(job_id: str, project_id: str) -> Job:
    with _lock:
        job = Job(job_id=job_id, project_id=project_id)
        _jobs[job_id] = job
        return job


def get(job_id: str) -> Job | None:
    with _lock:
        return _jobs.get(job_id)


def update(job_id: str, **kwargs) -> None:
    with _lock:
        job = _jobs.get(job_id)
        if job is None:
            return
        for k, v in kwargs.items():
            setattr(job, k, v)
