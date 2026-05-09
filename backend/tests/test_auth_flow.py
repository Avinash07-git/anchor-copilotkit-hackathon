from fastapi.testclient import TestClient


def test_register_login_me_and_logout_flow(client: TestClient) -> None:
    register_response = client.post(
        "/api/auth/register",
        json={"email": "caregiver@example.com", "password": "very-secure-password"},
    )
    assert register_response.status_code == 201
    assert register_response.json()["email"] == "caregiver@example.com"

    me_response = client.get("/api/auth/me")
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "caregiver@example.com"

    logout_response = client.post("/api/auth/logout")
    assert logout_response.status_code == 204

    me_after_logout = client.get("/api/auth/me")
    assert me_after_logout.status_code == 401

    login_response = client.post(
        "/api/auth/login",
        json={"email": "caregiver@example.com", "password": "very-secure-password"},
    )
    assert login_response.status_code == 200
    assert login_response.json()["email"] == "caregiver@example.com"


def test_protected_routes_require_authenticated_session(client: TestClient) -> None:
    plan_response = client.get("/api/plan")
    assert plan_response.status_code == 401
    assert plan_response.json()["detail"] == "Authentication required."

    copilotkit_response = client.get("/api/copilotkit/info")
    assert copilotkit_response.status_code == 401
    assert copilotkit_response.json()["detail"] == "Authentication required."


def test_login_rejects_wrong_password(client: TestClient) -> None:
    client.post(
        "/api/auth/register",
        json={"email": "wrong-pass@example.com", "password": "very-secure-password"},
    )

    login_response = client.post(
        "/api/auth/login",
        json={"email": "wrong-pass@example.com", "password": "totally-wrong-password"},
    )
    assert login_response.status_code == 401
    assert login_response.json()["detail"] == "Incorrect email or password."
