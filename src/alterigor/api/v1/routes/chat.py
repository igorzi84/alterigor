from fastapi import APIRouter

from alterigor.api.v1.schemas import ChatRequest, ChatResponse

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    response = ChatResponse(message=f"Your message was {request.message}")
    return response
