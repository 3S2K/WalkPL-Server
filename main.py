from fastapi import FastAPI, Response, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from pathlib import Path
from mutagen.mp3 import MP3

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path("music")
CLIPS_DIR = BASE_DIR / "clips"
NEWS_DIR = BASE_DIR / "news"
TEST_MUSIC = BASE_DIR / "test.mp3"

_generated_tracks = {}

class Track(BaseModel):
    id: str
    title: str
    artist: str
    album: Optional[str] = None
    duration: int
    streamUrl: str
    type: str = "CUSTOM"
    category: Optional[str] = None
    lyrics: Optional[str] = None
    date: Optional[str] = None

@app.get("/contents", response_model=List[Track])
async def get_contents():
    tracks = []
    for file_path in BASE_DIR.rglob("*.mp3"):
        if file_path.name != "test.mp3":
            track_type = "CUSTOM"
            category = None

            if CLIPS_DIR in file_path.parents:
                track_type = "CLIP"
                relative_path = file_path.relative_to(CLIPS_DIR)
                if len(relative_path.parts) > 1:
                    category = relative_path.parts[0]
                    if category in ["comic", "horror", "love"]:
                        category = category.upper()
            elif NEWS_DIR in file_path.parents:
                track_type = "NEWS"

            try:
                audio = MP3(str(file_path))
                duration = int(audio.info.length * 1000)
            except:
                duration = 0

            track = Track(
                id=str(hash(file_path)),
                title=file_path.stem,
                artist="Unknown Artist",
                duration=duration,
                streamUrl=f"/stream/{file_path.relative_to(BASE_DIR)}",
                type=track_type,
                category=category
            )
            tracks.append(track)
    tracks.extend(_generated_tracks.values())
    return tracks

@app.get("/stream/{filename:path}")
async def stream_audio(filename: str):
    if filename.startswith("generated_"):
        if not TEST_MUSIC.exists():
            raise HTTPException(status_code=404, detail="Test music file not found")
        file_path = TEST_MUSIC
    else:
        file_path = BASE_DIR / filename
        if not file_path.exists() or file_path.name == "test.mp3":
            raise HTTPException(status_code=404, detail="File not found")

    def iterfile():
        chunk_size = 1024 * 1024
        with open(file_path, mode="rb") as file:
            while chunk := file.read(chunk_size):
                yield chunk

    safe_filename = file_path.name.encode('ascii', errors='ignore').decode()

    return StreamingResponse(
        iterfile(),
        media_type="audio/mpeg",
        headers={
            "Accept-Ranges": "bytes",
            "Content-Disposition": f'attachment; filename="{safe_filename}"',
            "Content-Type": "audio/mpeg"
        }
    )

@app.get("/test")
async def test():
    return {"message": "Server is running"}

if __name__ == "__main__":
    import uvicorn

    BASE_DIR.mkdir(exist_ok=True)
    CLIPS_DIR.mkdir(exist_ok=True)
    NEWS_DIR.mkdir(exist_ok=True)

    print("서버 시작...")
    print(f"음악 디렉토리: {BASE_DIR.absolute()}")

    uvicorn.run(app, host="0.0.0.0", port=8000)