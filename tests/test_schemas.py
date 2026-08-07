import pytest
from pydantic import ValidationError

from alterigor.api.v1.schemas import ChatRequest


@pytest.mark.parametrize(
    "message, error_message",
    [
        ("h", "String should have at least 2 characters"),
        ("", "String should have at least 2 characters"),
        ("h" * 2001, "String should have at most 2000 characters"),
    ],
)
def test_invalid_message(message, error_message):
    with pytest.raises(ValidationError, match=error_message):
        ChatRequest(message=message)
