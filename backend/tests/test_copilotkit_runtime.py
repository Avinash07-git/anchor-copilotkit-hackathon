from fastapi.testclient import TestClient


def test_runtime_info_rest_endpoint_returns_copilotkit_contract(client: TestClient) -> None:
    client.post(
        "/api/auth/register",
        json={"email": "runtime@example.com", "password": "very-secure-password"},
    )
    response = client.get("/api/copilotkit/info")

    assert response.status_code == 200
    payload = response.json()

    assert payload["version"] == "1.57.1"
    assert payload["mode"] == "sse"
    assert payload["audioFileTranscriptionEnabled"] is False
    assert payload["a2uiEnabled"] is False
    assert payload["openGenerativeUIEnabled"] is False
    assert set(payload["agents"]) == {"default", "anchor_agent"}
    assert payload["agents"]["default"]["name"] == "default"
    assert payload["agents"]["default"]["className"] == "ProxiedCopilotRuntimeAgent"
    assert payload["agents"]["anchor_agent"]["name"] == "anchor_agent"


def test_runtime_info_single_endpoint_returns_same_payload(client: TestClient) -> None:
    client.post(
        "/api/auth/register",
        json={"email": "runtime-single@example.com", "password": "very-secure-password"},
    )
    response = client.post("/api/copilotkit", json={"method": "info"})

    assert response.status_code == 200
    payload = response.json()

    assert payload["version"] == "1.57.1"
    assert payload["mode"] == "sse"
    assert payload["audioFileTranscriptionEnabled"] is False
    assert set(payload["agents"]) == {"default", "anchor_agent"}
