"""Minimal SQLite persistence for projects and jobs. Standard library only —
no ORM needed at this scale. A single connection is shared across the
process (FastAPI + the background pipeline thread) and guarded by a lock,
which is fine for an MVP; move to a real DB engine + connection pool before
running multiple backend processes.
"""
import json
import sqlite3
import threading
import time
from pathlib import Path

from app.config import STORAGE_DIR

DB_PATH = STORAGE_DIR / "videocut.sqlite3"

_lock = threading.Lock()
_conn = sqlite3.connect(str(DB_PATH), check_same_thread=False)
_conn.row_factory = sqlite3.Row


def _init_schema() -> None:
    with _lock, _conn:
        _conn.execute(
            """
            CREATE TABLE IF NOT EXISTS projects (
                id TEXT PRIMARY KEY,
                filename TEXT NOT NULL,
                created_at REAL NOT NULL
            )
            """
        )
        _conn.execute(
            """
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                project_id TEXT NOT NULL,
                status TEXT NOT NULL,
                progress REAL NOT NULL DEFAULT 0,
                message TEXT NOT NULL DEFAULT '',
                error TEXT,
                shorts_json TEXT NOT NULL DEFAULT '[]',
                outputs_json TEXT NOT NULL DEFAULT '[]',
                created_at REAL NOT NULL,
                updated_at REAL NOT NULL
            )
            """
        )


_init_schema()


def create_project(project_id: str, filename: str) -> None:
    with _lock, _conn:
        _conn.execute(
            "INSERT INTO projects (id, filename, created_at) VALUES (?, ?, ?)",
            (project_id, filename, time.time()),
        )


def list_projects(limit: int = 50) -> list[dict]:
    with _lock:
        rows = _conn.execute(
            "SELECT id, filename, created_at FROM projects ORDER BY created_at DESC LIMIT ?",
            (limit,),
        ).fetchall()
    return [dict(r) for r in rows]


def create_job(job_id: str, project_id: str) -> None:
    now = time.time()
    with _lock, _conn:
        _conn.execute(
            """INSERT INTO jobs (id, project_id, status, progress, message, error,
               shorts_json, outputs_json, created_at, updated_at)
               VALUES (?, ?, 'queued', 0, '', NULL, '[]', '[]', ?, ?)""",
            (job_id, project_id, now, now),
        )


def update_job(job_id: str, **fields) -> None:
    if not fields:
        return
    column_map = {
        "status": "status",
        "progress": "progress",
        "message": "message",
        "error": "error",
        "shorts": "shorts_json",
        "outputs": "outputs_json",
    }
    sets = []
    values = []
    for key, value in fields.items():
        col = column_map.get(key)
        if col is None:
            continue
        if key == "status" and hasattr(value, "value"):
            value = value.value
        if key in ("shorts", "outputs"):
            value = json.dumps(
                [v.model_dump() if hasattr(v, "model_dump") else v for v in value]
            )
        sets.append(f"{col} = ?")
        values.append(value)
    sets.append("updated_at = ?")
    values.append(time.time())
    values.append(job_id)

    with _lock, _conn:
        _conn.execute(f"UPDATE jobs SET {', '.join(sets)} WHERE id = ?", values)


def get_job(job_id: str) -> dict | None:
    with _lock:
        row = _conn.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
    if row is None:
        return None
    d = dict(row)
    d["shorts"] = json.loads(d.pop("shorts_json"))
    d["outputs"] = json.loads(d.pop("outputs_json"))
    return d
