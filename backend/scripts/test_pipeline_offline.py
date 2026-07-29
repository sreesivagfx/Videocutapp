"""Exercises highlight detection + captioning + ffmpeg crop/burn using a
hand-built mock transcript (same wording/duration as the synthetic test
video), so the pipeline logic can be validated without needing network
access to huggingface.co for Whisper model weights (blocked in this sandbox).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.schemas import TranscriptSegment, TranscriptWord
from app.services import highlight_service, caption_service, ffmpeg_service, style_presets

SCRIPT_SENTENCES = [
    "Welcome to this video about growing your business online.",
    "The biggest mistake most people make is posting content without a plan.",
    "Here is a surprising fact: 90 percent of viral videos hook viewers in the first 3 seconds.",
    "So what is the secret? Always start with a strong question.",
    "Why do some creators grow faster than others? It comes down to consistency and clear value.",
    "The number one reason people fail is giving up too early, before results show up.",
    "Here is a proven trick that actually works: batch your content creation on a single day.",
    "Wait, there is one more important thing you need to know about audience retention.",
    "The truth is, engagement matters more than raw view count for long term growth.",
    "Never underestimate the power of a good caption and a clear call to action.",
    "That is the key takeaway from today, thank you for watching until the end.",
]

TOTAL_DURATION = 52.8
GAP = 0.5


def build_mock_transcript() -> list[TranscriptSegment]:
    total_words = sum(len(s.split()) for s in SCRIPT_SENTENCES)
    total_gap_time = GAP * (len(SCRIPT_SENTENCES) - 1)
    speech_time = TOTAL_DURATION - total_gap_time
    sec_per_word = speech_time / total_words

    segments = []
    t = 0.0
    for sentence in SCRIPT_SENTENCES:
        words_txt = sentence.split()
        seg_words = []
        w_t = t
        for w in words_txt:
            w_start, w_end = w_t, w_t + sec_per_word
            seg_words.append(TranscriptWord(start=round(w_start, 2), end=round(w_end, 2), text=w))
            w_t = w_end
        segments.append(TranscriptSegment(
            start=round(t, 2), end=round(w_t, 2), text=sentence, words=seg_words,
        ))
        t = w_t + GAP
    return segments


def main():
    segments = build_mock_transcript()
    print(f"Built {len(segments)} mock segments spanning 0..{segments[-1].end:.1f}s")

    shorts = highlight_service.detect_shorts(
        segments, max_shorts=3, min_duration_sec=8, max_duration_sec=25,
    )
    print(f"\nDetected {len(shorts)} short candidates:")
    for s in shorts:
        print(f"  [{s.start:6.2f} -> {s.end:6.2f}] score={s.score:5.2f}  ({s.reason})  \"{s.title}\"")

    if not shorts:
        print("FAIL: no shorts detected")
        return 1

    src_video = Path(__file__).resolve().parent.parent / "storage" / "test_assets" / "sample_long_video.mp4"
    out_dir = Path(__file__).resolve().parent.parent / "storage" / "test_assets" / "rendered"
    out_dir.mkdir(exist_ok=True)

    style = style_presets.get_style("tiktok-pop")

    for s in shorts:
        thumb_path = out_dir / f"thumb_{s.id}.jpg"
        ffmpeg_service.extract_thumbnail(src_video, thumb_path, s.start, aspect="9:16")
        print(f"Thumbnail: {thumb_path} ({thumb_path.stat().st_size} bytes)")

        ass_path = out_dir / f"{s.id}.ass"
        caption_service.write_ass(segments, style, s.start, s.end, ass_path)
        print(f"\nWrote ASS: {ass_path} ({ass_path.stat().st_size} bytes)")

        out_video = out_dir / f"short_{s.id}.mp4"
        ffmpeg_service.cut_and_crop(
            src_video, out_video, s.start, s.end,
            aspect="9:16", subtitles_ass_path=ass_path, denoise=True,
        )
        dims = ffmpeg_service.get_video_dimensions(out_video)
        dur = ffmpeg_service.get_duration_sec(out_video)
        print(f"Rendered: {out_video} dims={dims} duration={dur:.2f}s "
              f"size={out_video.stat().st_size / 1024:.0f}KB")

    print("\nOK: full non-transcription pipeline works end to end.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
