from typing import Annotated

from pydantic import BaseModel, StringConstraints


class ChatRequest(BaseModel):
    message: Annotated[
        str, StringConstraints(strip_whitespace=True, min_length=2, max_length=2000)
    ]


class ChatResponse(BaseModel):
    message: str
