"""Builds .ass subtitle files (burned in by ffmpeg_service.cut_and_crop) from a
transcript window, styled per a CaptionStylePreset. Word-by-word "pop" highlight
(the TikTok/CapCut look) is implemented with ASS karaoke (\\k) tags, which libass
(ffmpeg's subtitle renderer) renders as a color fill timed per word — no extra
dependency needed beyond ffmpeg itself.
"""
from pathlib import Path

from app.models.schemas import TranscriptSegment, CaptionStylePreset

_ALIGN = {"bottom": 2, "middle": 5, "top": 8}


def _fmt_time(t: float) -> str:
    if t < 0:
        t = 0
    hours = int(t // 3600)
    minutes = int((t % 3600) // 60)
    secs = t % 60
    return f"{hours}:{minutes:02d}:{secs:05.2f}"


def _header(style: CaptionStylePreset) -> str:
    align = _ALIGN.get(style.position, 2)
    bold = -1 if style.bold else 0
    margin_v = 80 if style.position != "middle" else 0
    outline = 3 if not style.background_box else 0
    back_colour = "&H80000000" if style.background_box else "&H00000000"
    border_style = 3 if style.background_box else 1
    secondary = style.primary_color  # pre-highlight color (karaoke "unsung")
    primary = style.highlight_color or style.primary_color

    return f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,{style.font_family},{style.font_size},{style.primary_color},{secondary},{style.outline_color},{back_colour},{bold},0,0,0,100,100,0,0,{border_style},{outline},1,{align},60,60,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""


def _clip_words(seg: TranscriptSegment, window_start: float, window_end: float):
    return [
        w for w in seg.words
        if w.end > window_start and w.start < window_end
    ]


def generate_ass(
    segments: list[TranscriptSegment],
    style: CaptionStylePreset,
    window_start: float,
    window_end: float,
) -> str:
    lines = [_header(style)]

    for seg in segments:
        if seg.end <= window_start or seg.start >= window_end:
            continue

        rel_start = max(seg.start, window_start) - window_start
        rel_end = min(seg.end, window_end) - window_start
        text = seg.text.strip()
        if style.uppercase:
            text = text.upper()

        if style.highlight_active_word and seg.words:
            words = _clip_words(seg, window_start, window_end)
            if not words:
                continue
            karaoke_text = ""
            for w in words:
                dur_cs = max(int(round((w.end - w.start) * 100)), 1)
                word_text = w.text.upper() if style.uppercase else w.text
                karaoke_text += f"{{\\k{dur_cs}}}{word_text} "
            lines.append(
                f"Dialogue: 0,{_fmt_time(rel_start)},{_fmt_time(rel_end)},Default,,0,0,0,,{karaoke_text.strip()}"
            )
        else:
            escaped = text.replace("\n", "\\N")
            lines.append(
                f"Dialogue: 0,{_fmt_time(rel_start)},{_fmt_time(rel_end)},Default,,0,0,0,,{escaped}"
            )

    return "\n".join(lines) + "\n"


def write_ass(
    segments: list[TranscriptSegment],
    style: CaptionStylePreset,
    window_start: float,
    window_end: float,
    dst_path: Path,
) -> Path:
    content = generate_ass(segments, style, window_start, window_end)
    dst_path.write_text(content, encoding="utf-8")
    return dst_path


def write_srt(segments: list[TranscriptSegment], dst_path: Path) -> Path:
    """Plain SRT export (for platforms that want a separate caption file
    instead of burned-in captions, e.g. native YouTube captions)."""
    lines = []
    for i, seg in enumerate(segments, start=1):
        def fmt(t: float) -> str:
            hours = int(t // 3600)
            minutes = int((t % 3600) // 60)
            secs = int(t % 60)
            ms = int((t - int(t)) * 1000)
            return f"{hours:02d}:{minutes:02d}:{secs:02d},{ms:03d}"

        lines.append(str(i))
        lines.append(f"{fmt(seg.start)} --> {fmt(seg.end)}")
        lines.append(seg.text.strip())
        lines.append("")
    dst_path.write_text("\n".join(lines), encoding="utf-8")
    return dst_path
