"""Job tracking backed by SQLite (see app/db.py) so job state survives a
backend restart. Returns the same Job shape callers already depend on.
"""
from dataclasses import dataclass, field

from app import db
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


def create(job_id: str, project_id: str) -> Job:
    db.create_job(job_id, project_id)
    return Job(job_id=job_id, project_id=project_id)


def get(job_id: str) -> Job | None:
    row = db.get_job(job_id)
    if row is None:
        return None
    return Job(
        job_id=row["id"],
        project_id=row["project_id"],
        status=JobStatus(row["status"]),
        progress=row["progress"],
        message=row["message"],
        shorts=[ShortCandidate(**s) for s in row["shorts"]],
        outputs=row["outputs"],
        error=row["error"],
    )


def update(job_id: str, **kwargs) -> None:
    db.update_job(job_id, **kwargs)
