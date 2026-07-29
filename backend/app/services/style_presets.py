from app.models.schemas import CaptionStylePreset

CAPTION_STYLES: list[CaptionStylePreset] = [
    CaptionStylePreset(
        id="clean-bold", name="Clean Bold",
        font_family="Montserrat", font_size=64,
        primary_color="&H00FFFFFF", outline_color="&H00000000",
        background_box=False, uppercase=False, bold=True,
        position="bottom", highlight_active_word=True, highlight_color="&H0000D7FF",
    ),
    CaptionStylePreset(
        id="corporate-subtitle", name="Corporate Subtitle",
        font_family="Inter", font_size=48,
        primary_color="&H00FFFFFF", outline_color="&H00202020",
        background_box=True, uppercase=False, bold=False,
        position="bottom",
    ),
    CaptionStylePreset(
        id="tiktok-pop", name="TikTok Pop",
        font_family="Poppins", font_size=72,
        primary_color="&H00FFFFFF", outline_color="&H00000000",
        background_box=False, uppercase=True, bold=True,
        position="middle", highlight_active_word=True, highlight_color="&H0000FF66",
    ),
    CaptionStylePreset(
        id="minimal-white", name="Minimal White",
        font_family="Helvetica Neue", font_size=52,
        primary_color="&H00FFFFFF", outline_color="&H00101010",
        background_box=False, uppercase=False, bold=False,
        position="bottom",
    ),
    CaptionStylePreset(
        id="news-lower-third", name="News Lower Third",
        font_family="Roboto Condensed", font_size=44,
        primary_color="&H00FFFFFF", outline_color="&H00660000",
        background_box=True, uppercase=False, bold=True,
        position="bottom",
    ),
]

_BY_ID = {s.id: s for s in CAPTION_STYLES}


def get_style(style_id: str) -> CaptionStylePreset:
    return _BY_ID.get(style_id, CAPTION_STYLES[0])
