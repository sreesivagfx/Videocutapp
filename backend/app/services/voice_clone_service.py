"""Voice cloning is disabled by default and gated behind an explicit consent
flag, because cloning a voice from a sample carries real misuse/liability
risk (impersonation, fraud). It is also the one feature that genuinely needs
a GPU-backed provider — nothing free/local in this sandbox can do it well.

To enable: set VOICE_CLONE_PROVIDER=elevenlabs and VOICE_CLONE_API_KEY in .env.
The API layer (routers/voice_clone.py) requires consent_confirmed=True on
every request in addition to the provider being configured — both gates must
be open, or the request is rejected outright.
"""
from pathlib import Path

from app import config


class VoiceCloneError(RuntimeError):
    pass


class VoiceCloneDisabledError(VoiceCloneError):
    pass


def is_enabled() -> bool:
    return config.VOICE_CLONE_PROVIDER != "disabled" and bool(config.VOICE_CLONE_API_KEY)


def clone_voice(speaker_name: str, sample_audio_path: Path, consent_confirmed: bool) -> str:
    if not consent_confirmed:
        raise VoiceCloneError(
            "consent_confirmed must be true: you must have explicit permission "
            "from the speaker to clone their voice."
        )
    if not is_enabled():
        raise VoiceCloneDisabledError(
            "Voice cloning is disabled. Set VOICE_CLONE_PROVIDER and "
            "VOICE_CLONE_API_KEY in .env to enable it via a real provider."
        )

    if config.VOICE_CLONE_PROVIDER == "elevenlabs":
        return _clone_elevenlabs(speaker_name, sample_audio_path)

    raise VoiceCloneError(f"Unknown VOICE_CLONE_PROVIDER: {config.VOICE_CLONE_PROVIDER}")


def _clone_elevenlabs(speaker_name: str, sample_audio_path: Path) -> str:
    import requests

    resp = requests.post(
        "https://api.elevenlabs.io/v1/voices/add",
        headers={"xi-api-key": config.VOICE_CLONE_API_KEY},
        data={"name": speaker_name},
        files={"files": open(sample_audio_path, "rb")},
        timeout=120,
    )
    if resp.status_code != 200:
        raise VoiceCloneError(f"ElevenLabs voice clone failed: {resp.status_code} {resp.text[:300]}")
    return resp.json()["voice_id"]
