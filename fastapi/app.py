from fastapi import FastAPI, HTTPException, Response, UploadFile, File
from fastapi.responses import StreamingResponse
from pathlib import Path
from fastapi.responses import JSONResponse


app = FastAPI()


# 디렉터리 설정
MUSIC_DIR = Path("./music")  # 음악 파일 저장 디렉터리
UPLOAD_DIR = Path("./uploaded_files")  # 업로드된 파일 저장 디렉터리

# 디렉터리 생성 (존재하지 않을 경우)
MUSIC_DIR.mkdir(exist_ok=True)
UPLOAD_DIR.mkdir(exist_ok=True)

# 엔드포인트 정의
@app.get("/")
async def root():
    return {"message": "Welcome to the Music Streaming and Upload API"}

@app.get("/list")
async def list_music():
    music_files = [file.name for file in MUSIC_DIR.iterdir() if file.suffix == ".mp3"]
    return JSONResponse(content=music_files)



@app.get("/stream/{filename}")
async def stream_audio(filename: str):
    """
    음악 파일 스트리밍
    """
    file_path = MUSIC_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    def iter_file():
        with open(file_path, "rb") as f:
            while chunk := f.read(1024 * 1024):  # 1MB씩 스트리밍
                yield chunk

    return StreamingResponse(iter_file(), media_type="audio/mpeg")

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    """
    파일 업로드 엔드포인트
    """
    file_path = UPLOAD_DIR / file.filename

    # 동일 이름의 파일이 이미 존재하면 예외 처리
    if file_path.exists():
        raise HTTPException(status_code=400, detail="File already exists")

    with file_path.open("wb") as f:
        f.write(await file.read())

    return {"filename": file.filename, "message": "File uploaded successfully"}

@app.get("/files/")
async def list_uploaded_files():
    """
    업로드된 파일 리스트 반환
    """
    files = [f.name for f in UPLOAD_DIR.iterdir() if f.is_file()]
    return {"files": files}

@app.post("/generate-music/")
async def generate_music():
    """
    자동 음원 생성 및 저장 (예시)
    """
    # 생성될 음원 파일 이름과 경로
    generated_music_path = MUSIC_DIR / "generated_music.mp3"

    # 예시로 음원 데이터를 텍스트로 생성
    with generated_music_path.open("wb") as f:
        f.write(b"This is an example of generated music data.")  # 고정된 데이터

    return {"message": "Music generated and saved successfully", "filename": generated_music_path.name}