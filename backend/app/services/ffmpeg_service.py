"""Thin, explicit wrapper around ffmpeg/ffprobe. No shell=True anywhere —
every command is an argv list so user-controlled filenames can't inject shell syntax.
"""
import json
import subprocess
from pathlib import Path


class FFmpegError(RuntimeError):
    pass


def _run(cmd: list[str]) -> str:
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise FFmpegError(f"Command failed: {' '.join(cmd)}\n{result.stderr[-4000:]}")
    return result.stdout


def probe(path: Path) -> dict:
    out = _run([
        "ffprobe", "-v", "error", "-print_format", "json",
        "-show_format", "-show_streams", str(path),
    ])
    return json.loads(out)


def get_duration_sec(path: Path) -> float:
    info = probe(path)
    return float(info["format"]["duration"])


def get_video_dimensions(path: Path) -> tuple[int, int]:
    info = probe(path)
    for stream in info["streams"]:
        if stream.get("codec_type") == "video":
            return int(stream["width"]), int(stream["height"])
    raise FFmpegError("No video stream found")


def extract_audio(src: Path, dst_wav: Path) -> None:
    _run([
        "ffmpeg", "-y", "-i", str(src),
        "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1",
        str(dst_wav),
    ])


ASPECT_RATIOS = {
    "9:16": (9, 16),
    "1:1": (1, 1),
    "16:9": (16, 9),
}


def _crop_filter(src_w: int, src_h: int, aspect: str) -> str:
    """Center-crop to the target aspect ratio (keeps the middle of the frame,
    a reasonable default for talking-head / presentation footage without
    running a face-tracking model)."""
    aw, ah = ASPECT_RATIOS.get(aspect, ASPECT_RATIOS["9:16"])
    target_ratio = aw / ah
    src_ratio = src_w / src_h

    if src_ratio > target_ratio:
        # source is wider than target -> crop width
        new_w = int(src_h * target_ratio)
        new_w -= new_w % 2
        return f"crop={new_w}:{src_h}:(in_w-{new_w})/2:0"
    else:
        # source is taller/narrower -> crop height
        new_h = int(src_w / target_ratio)
        new_h -= new_h % 2
        return f"crop={src_w}:{new_h}:0:(in_h-{new_h})/2"


def cut_and_crop(
    src: Path,
    dst: Path,
    start: float,
    end: float,
    aspect: str = "9:16",
    subtitles_ass_path: Path | None = None,
    denoise: bool = False,
) -> None:
    """Cut [start, end] from src, crop to aspect, optionally burn ASS subtitles
    and optionally denoise audio, all in one ffmpeg pass."""
    src_w, src_h = get_video_dimensions(src)
    crop = _crop_filter(src_w, src_h, aspect)

    vf_chain = [crop, "scale=1080:1920" if aspect == "9:16" else "scale=1080:1080"]
    if subtitles_ass_path is not None:
        escaped = str(subtitles_ass_path).replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")
        vf_chain.append(f"subtitles='{escaped}'")
    vf = ",".join(vf_chain)

    cmd = [
        "ffmpeg", "-y",
        "-ss", str(start), "-to", str(end),
        "-i", str(src),
        "-vf", vf,
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
    ]
    if denoise:
        cmd += ["-af", "afftdn=nr=12:nf=-25"]
    cmd += ["-c:a", "aac", "-b:a", "160k", str(dst)]
    _run(cmd)


def denoise_audio_file(src_wav: Path, dst_wav: Path) -> None:
    _run([
        "ffmpeg", "-y", "-i", str(src_wav),
        "-af", "afftdn=nr=12:nf=-25,highpass=f=80",
        str(dst_wav),
    ])


def extract_thumbnail(src: Path, dst_jpg: Path, at_seconds: float, aspect: str = "9:16") -> None:
    """Grabs a single cropped frame as a JPEG poster image, used to preview a
    short candidate before its full render finishes."""
    src_w, src_h = get_video_dimensions(src)
    crop = _crop_filter(src_w, src_h, aspect)
    _run([
        "ffmpeg", "-y",
        "-ss", str(max(at_seconds, 0)),
        "-i", str(src),
        "-vf", f"{crop},scale=540:960" if aspect == "9:16" else f"{crop},scale=540:540",
        "-frames:v", "1", "-update", "1",
        str(dst_jpg),
    ])


def mux_audio_replace(src_video: Path, new_audio: Path, dst: Path) -> None:
    """Replace a video's audio track (used after TTS dubbing / voice-over)."""
    _run([
        "ffmpeg", "-y",
        "-i", str(src_video), "-i", str(new_audio),
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy", "-c:a", "aac", "-shortest",
        str(dst),
    ])
