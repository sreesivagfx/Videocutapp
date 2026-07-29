from enum import Enum
from typing import Optional
from pydantic import BaseModel


class JobStatus(str, Enum):
    QUEUED = "queued"
    TRANSCRIBING = "transcribing"
    DETECTING_HIGHLIGHTS = "detecting_highlights"
    RENDERING = "rendering"
    DONE = "done"
    FAILED = "failed"


class CaptionStylePreset(BaseModel):
    id: str
    name: str
    font_family: str
    font_size: int
    primary_color: str  # hex
    outline_color: str  # hex
    background_box: bool
    uppercase: bool
    bold: bool
    position: str  # "bottom" | "middle" | "top"
    highlight_active_word: bool = False
    highlight_color: Optional[str] = None


class TranscriptWord(BaseModel):
    start: float
    end: float
    text: str


class TranscriptSegment(BaseModel):
    start: float
    end: float
    text: str
    words: list[TranscriptWord] = []


class ShortCandidate(BaseModel):
    id: str
    start: float
    end: float
    score: float
    reason: str
    title: str
    thumbnail: Optional[str] = None


class CreateProjectResponse(BaseModel):
    project_id: str
    filename: str


class StartPipelineRequest(BaseModel):
    project_id: str
    caption_style_id: str = "clean-bold"
    target_aspect: str = "9:16"  # 9:16 | 1:1 | 16:9
    max_shorts: int = 5
    min_duration_sec: float = 15.0
    max_duration_sec: float = 60.0
    burn_captions: bool = True
    translate_to: Optional[str] = None
    denoise_audio: bool = False


class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress: float
    message: str = ""
    shorts: list[ShortCandidate] = []
    outputs: list[str] = []
    error: Optional[str] = None


class TtsRequest(BaseModel):
    text: str
    voice: str = "default"
    language: str = "en"


class TranslateRequest(BaseModel):
    text: str
    target_language: str
    source_language: Optional[str] = "auto"


class VoiceCloneConsentRequest(BaseModel):
    speaker_name: str
    consent_confirmed: bool
    sample_audio_path: str
