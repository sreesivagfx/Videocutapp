"""Speech-to-text via faster-whisper (runs on CPU, no API key required).
Model is loaded lazily and cached so repeated jobs don't reload weights.
"""
from pathlib import Path
from functools import lru_cache

from app.config import WHISPER_MODEL_SIZE
from app.models.schemas import TranscriptSegment, TranscriptWord


@lru_cache(maxsize=1)
def _get_model():
    from faster_whisper import WhisperModel
    return WhisperModel(WHISPER_MODEL_SIZE, device="cpu", compute_type="int8")


def transcribe(audio_path: Path, language: str | None = None) -> list[TranscriptSegment]:
    model = _get_model()
    segments, _info = model.transcribe(
        str(audio_path),
        language=language,
        word_timestamps=True,
        vad_filter=True,
    )

    result: list[TranscriptSegment] = []
    for seg in segments:
        words = [
            TranscriptWord(start=w.start, end=w.end, text=w.word.strip())
            for w in (seg.words or [])
        ]
        result.append(TranscriptSegment(
            start=seg.start, end=seg.end, text=seg.text.strip(), words=words,
        ))
    return result
