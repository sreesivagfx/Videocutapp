"""Audio noise removal. Two paths:
  - ffmpeg afftdn/highpass filter (fast, no extra model, used inline in the
    main render pipeline via ffmpeg_service.cut_and_crop(denoise=True))
  - noisereduce (spectral-gating, better quality for standalone "clean up
    this audio" requests from the Audio Studio) — used here.
Both are fully open-source/local, no API key needed.
"""
from pathlib import Path

import numpy as np
import soundfile as sf


def denoise_wav(src_wav: Path, dst_wav: Path) -> Path:
    import noisereduce as nr

    data, rate = sf.read(str(src_wav))
    if data.ndim > 1:
        data = np.mean(data, axis=1)
    reduced = nr.reduce_noise(y=data, sr=rate)
    sf.write(str(dst_wav), reduced, rate)
    return dst_wav
