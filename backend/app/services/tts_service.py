"""Text-to-speech provider abstraction. Defaults to a fully local, free engine
(pyttsx3, offline) so the feature works with zero configuration. Set
TTS_PROVIDER=elevenlabs|azure in .env to swap in a higher-quality paid provider
without changing any calling code.
"""
from pathlib import Path

from app import config


class TtsError(RuntimeError):
    pass


def _synthesize_local(text: str, dst_path: Path, voice: str = "default") -> Path:
    import pyttsx3

    engine = pyttsx3.init()
    voices = engine.getProperty("voices")
    if voice != "default":
        for v in voices:
            if voice.lower() in v.name.lower():
                engine.setProperty("voice", v.id)
                break
    engine.save_to_file(text, str(dst_path))
    engine.runAndWait()
    return dst_path


def _synthesize_elevenlabs(text: str, dst_path: Path, voice: str = "default") -> Path:
    import requests

    if not config.ELEVENLABS_API_KEY:
        raise TtsError("ELEVENLABS_API_KEY is not set")

    voice_id = voice if voice != "default" else "21m00Tcm4TlvDq8ikWAM"
    resp = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
        headers={"xi-api-key": config.ELEVENLABS_API_KEY, "Content-Type": "application/json"},
        json={"text": text, "model_id": "eleven_multilingual_v2"},
        timeout=60,
    )
    if resp.status_code != 200:
        raise TtsError(f"ElevenLabs TTS failed: {resp.status_code} {resp.text[:300]}")
    dst_path.write_bytes(resp.content)
    return dst_path


def synthesize(text: str, dst_path: Path, voice: str = "default") -> Path:
    if config.TTS_PROVIDER == "elevenlabs":
        return _synthesize_elevenlabs(text, dst_path, voice)
    if config.TTS_PROVIDER == "azure":
        raise TtsError("Azure TTS provider not yet wired up — add credentials and implement here")
    return _synthesize_local(text, dst_path, voice)


AVAILABLE_LOCAL_VOICES_HINT = (
    "Local engine voice availability depends on the host OS's installed TTS "
    "voices; pass voice='default' unless you know specific voice names installed."
)
