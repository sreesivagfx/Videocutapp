from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.routers import projects, pipeline, styles, tts, translate, audio, voice_clone

app = FastAPI(title="VideoCut API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(pipeline.router)
app.include_router(styles.router)
app.include_router(tts.router)
app.include_router(translate.router)
app.include_router(audio.router)
app.include_router(voice_clone.router)


@app.get("/health")
def health():
    return {"status": "ok"}
