"""Generates a synthetic 'talking head'-ish test video (test pattern + local
TTS narration) purely for pipeline smoke testing — no external downloads.
"""
import subprocess
import sys
from pathlib import Path

import pyttsx3

SCRIPT_TEXT = """
Welcome to this video about growing your business online.
The biggest mistake most people make is posting content without a plan.
Here is a surprising fact: 90 percent of viral videos hook viewers in the first 3 seconds.
So what is the secret? Always start with a strong question.
Why do some creators grow faster than others? It comes down to consistency and clear value.
The number one reason people fail is giving up too early, before results show up.
Here is a proven trick that actually works: batch your content creation on a single day.
Wait, there is one more important thing you need to know about audience retention.
The truth is, engagement matters more than raw view count for long term growth.
Never underestimate the power of a good caption and a clear call to action.
That is the key takeaway from today, thank you for watching until the end.
"""


def main():
    out_dir = Path(__file__).resolve().parent.parent / "storage" / "test_assets"
    out_dir.mkdir(parents=True, exist_ok=True)
    wav_path = out_dir / "narration.wav"
    video_path = out_dir / "sample_long_video.mp4"

    engine = pyttsx3.init()
    engine.setProperty("rate", 165)
    engine.save_to_file(SCRIPT_TEXT.strip(), str(wav_path))
    engine.runAndWait()

    probe = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(wav_path)],
        capture_output=True, text=True,
    )
    duration = float(probe.stdout.strip())
    print(f"Narration duration: {duration:.1f}s")

    subprocess.run([
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"testsrc2=size=1280x720:rate=30:duration={duration}",
        "-i", str(wav_path),
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
        "-c:a", "aac", "-b:a", "160k",
        "-shortest",
        str(video_path),
    ], check=True)

    print(f"Test video: {video_path}")


if __name__ == "__main__":
    sys.exit(main())
