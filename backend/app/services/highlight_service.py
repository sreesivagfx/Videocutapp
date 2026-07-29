"""Heuristic auto-highlight detection: turns a full transcript into a ranked
list of short-worthy segments, without needing a hosted "virality" ML model.

Signals used (all computed locally, no external calls):
  - Natural pause boundaries (segments are only cut at silence gaps, so
    a short never starts/ends mid-sentence)
  - Keyword/marker density (numbers, emphasis words, questions, exclamations —
    proxies for a "hook" or a concrete claim)
  - Speech pacing (very sparse or very rushed windows score lower)

This is intentionally simple and transparent rather than a black box — it's
meant to give a good first pass that a human then confirms/tweaks in the UI,
not a final answer.
"""
import re
import uuid

from app.models.schemas import TranscriptSegment, ShortCandidate

PAUSE_THRESHOLD_SEC = 0.45

_MARKER_WORDS = {
    "secret", "mistake", "never", "always", "biggest", "worst", "best",
    "important", "key", "reason", "because", "truth", "actually", "surprising",
    "shocking", "amazing", "warning", "stop", "wait", "hack", "trick", "free",
    "proven", "results", "guarantee",
}

_NUMBER_RE = re.compile(r"\b\d+([.,]\d+)?%?\b")


def _boundary_points(segments: list[TranscriptSegment]) -> list[float]:
    points = [segments[0].start]
    for a, b in zip(segments, segments[1:]):
        if b.start - a.end >= PAUSE_THRESHOLD_SEC:
            points.append(a.end)
            points.append(b.start)
    points.append(segments[-1].end)
    return sorted(set(points))


def _score_window(segs: list[TranscriptSegment]) -> tuple[float, str]:
    text = " ".join(s.text for s in segs)
    words = text.split()
    n_words = max(len(words), 1)
    duration = max(segs[-1].end - segs[0].start, 0.1)

    marker_hits = sum(1 for w in words if w.strip(".,!?").lower() in _MARKER_WORDS)
    number_hits = len(_NUMBER_RE.findall(text))
    question_hits = text.count("?")
    exclaim_hits = text.count("!")

    speech_rate = n_words / duration  # words/sec
    pacing_score = 1.0 - min(abs(speech_rate - 2.3) / 2.3, 1.0)  # ~2.3 wps is natural pace

    score = (
        marker_hits * 2.0
        + number_hits * 1.5
        + question_hits * 1.5
        + exclaim_hits * 1.0
        + pacing_score * 3.0
    )

    reasons = []
    if marker_hits:
        reasons.append("emphasis words")
    if number_hits:
        reasons.append("concrete numbers")
    if question_hits:
        reasons.append("poses a question")
    if exclaim_hits:
        reasons.append("emphatic delivery")
    if not reasons:
        reasons.append("steady pacing")

    return score, ", ".join(reasons)


def _title_from_text(text: str, max_len: int = 60) -> str:
    text = text.strip()
    return text[:max_len].rsplit(" ", 1)[0] + ("…" if len(text) > max_len else "")


def detect_shorts(
    segments: list[TranscriptSegment],
    max_shorts: int = 5,
    min_duration_sec: float = 15.0,
    max_duration_sec: float = 60.0,
) -> list[ShortCandidate]:
    if not segments:
        return []

    boundaries = _boundary_points(segments)
    candidates: list[tuple[float, float, float, str, str]] = []  # start, end, score, reason, title

    for i, start_b in enumerate(boundaries):
        window_segs: list[TranscriptSegment] = []
        for seg in segments:
            if seg.start < start_b:
                continue
            window_segs.append(seg)
            dur = seg.end - start_b
            if dur < min_duration_sec:
                continue
            if dur > max_duration_sec:
                break
            score, reason = _score_window(window_segs)
            candidates.append((start_b, seg.end, score, reason, _title_from_text(
                " ".join(s.text for s in window_segs)
            )))

    candidates.sort(key=lambda c: c[2], reverse=True)

    chosen: list[tuple[float, float, float, str, str]] = []
    for cand in candidates:
        c_start, c_end, *_ = cand
        overlaps = any(not (c_end <= s or c_start >= e) for s, e, *_ in chosen)
        if not overlaps:
            chosen.append(cand)
        if len(chosen) >= max_shorts:
            break

    chosen.sort(key=lambda c: c[0])

    return [
        ShortCandidate(
            id=str(uuid.uuid4())[:8],
            start=round(start, 2),
            end=round(end, 2),
            score=round(score, 2),
            reason=reason,
            title=title,
        )
        for start, end, score, reason, title in chosen
    ]
