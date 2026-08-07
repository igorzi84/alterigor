import pytest
from fastapi.testclient import TestClient

from alterigor.main import app

client = TestClient(app)


def test_chat_returns_successful_response():
    response = client.post(
        "/api/v1/chat",
        json={"message": "Test message"},
    )

    assert response.status_code == 200
    assert "message" in response.json()


@pytest.mark.parametrize(
    "payload",
    [
        {"message": "h"},
        {"message": "h" * 2001},
        {},
    ],
)
def test_chat_rejects_invalid_request(payload):
    response = client.post("/api/v1/chat", json=payload)

    assert response.status_code == 422
