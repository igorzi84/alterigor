from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI

from alterigor.api.v1.routes.chat import router as chat_router

load_dotenv(override=True)

BASE_DIR = Path(__file__).resolve().parent
SYSTEM_PROMPT = (BASE_DIR / "prompts" / "system.md").read_text(encoding="utf-8")
CV_TEXT = (BASE_DIR / "knowledge" / "cv.md").read_text(encoding="utf-8")


app = FastAPI(title="AlterIgor")

app.include_router(
    chat_router,
    prefix="/api/v1",
    tags=["chat"],
)

@app.get("/healthz", description="Health route")
def healthz() -> str:
    return "OK"