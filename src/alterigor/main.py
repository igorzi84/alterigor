from pathlib import Path

from fastapi import FastAPI

from alterigor.api.v1.routes.chat import router as chat_router
from alterigor.observability.logging import configure_logging
from alterigor.settings import Settings

settings = Settings()  # type: ignore
configure_logging(settings.log_level)

BASE_DIR = Path(__file__).resolve().parent
SYSTEM_PROMPT = (BASE_DIR / "prompts" / "system.md").read_text(encoding="utf-8")
CV = (BASE_DIR / "knowledge" / "cv.md").read_text(encoding="utf-8")


app = FastAPI(title="AlterIgor")

app.include_router(
    chat_router,
    prefix="/api/v1",
    tags=["chat"],
)


@app.get("/healthz", description="Health route")
def healthz() -> str:
    return "OK"
