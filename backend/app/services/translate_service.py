"""Translation provider abstraction. The "stub" provider (default) does not
call any external service — it returns the source text tagged with the
target language so the UI/pipeline can be built and tested end-to-end before
you decide on and pay for a real MT provider. Swap TRANSLATE_PROVIDER in .env
once you have a DeepL/Google key; no calling code changes needed.
"""
from app import config


class TranslateError(RuntimeError):
    pass


def _translate_stub(text: str, target_language: str, source_language: str = "auto") -> str:
    return f"[{target_language}] {text}"


def _translate_deepl(text: str, target_language: str, source_language: str = "auto") -> str:
    import requests

    if not config.DEEPL_API_KEY:
        raise TranslateError("DEEPL_API_KEY is not set")

    resp = requests.post(
        "https://api-free.deepl.com/v2/translate",
        data={
            "auth_key": config.DEEPL_API_KEY,
            "text": text,
            "target_lang": target_language.upper(),
        },
        timeout=30,
    )
    if resp.status_code != 200:
        raise TranslateError(f"DeepL failed: {resp.status_code} {resp.text[:300]}")
    return resp.json()["translations"][0]["text"]


def translate(text: str, target_language: str, source_language: str = "auto") -> str:
    if config.TRANSLATE_PROVIDER == "deepl":
        return _translate_deepl(text, target_language, source_language)
    if config.TRANSLATE_PROVIDER == "google":
        raise TranslateError("Google Translate provider not yet wired up — add credentials and implement here")
    return _translate_stub(text, target_language, source_language)


def translate_segments(segments, target_language: str):
    """Translate a list of TranscriptSegment-like objects, returning new
    segment dicts with translated text (word-level timing is dropped since
    translated word count/order won't match the original audio)."""
    return [
        {
            "start": seg.start,
            "end": seg.end,
            "text": translate(seg.text, target_language),
        }
        for seg in segments
    ]
