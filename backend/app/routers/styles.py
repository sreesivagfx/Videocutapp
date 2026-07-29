from fastapi import APIRouter

from app.services.style_presets import CAPTION_STYLES

router = APIRouter(prefix="/styles", tags=["styles"])

FONT_LIBRARY = [
    {"family": "Montserrat", "source": "Google Fonts", "license": "OFL (free)"},
    {"family": "Inter", "source": "Google Fonts", "license": "OFL (free)"},
    {"family": "Poppins", "source": "Google Fonts", "license": "OFL (free)"},
    {"family": "Roboto Condensed", "source": "Google Fonts", "license": "Apache 2.0 (free)"},
    {"family": "Helvetica Neue", "source": "System font", "license": "System license"},
]

TRANSITION_LIBRARY = [
    {"id": "crossfade", "name": "Crossfade", "ffmpeg_filter": "xfade=transition=fade"},
    {"id": "wipe-left", "name": "Wipe Left", "ffmpeg_filter": "xfade=transition=wipeleft"},
    {"id": "slide-up", "name": "Slide Up", "ffmpeg_filter": "xfade=transition=slideup"},
    {"id": "zoom-in", "name": "Zoom In", "ffmpeg_filter": "xfade=transition=zoomin"},
    {"id": "circle-open", "name": "Circle Open", "ffmpeg_filter": "xfade=transition=circleopen"},
]


@router.get("/captions")
def list_caption_styles():
    return CAPTION_STYLES


@router.get("/fonts")
def list_fonts():
    return FONT_LIBRARY


@router.get("/transitions")
def list_transitions():
    return TRANSITION_LIBRARY
