def test_register_creates_account_and_session_cookie(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": "alice@example.com", "password": "Str0ngPassw0rd!", "full_name": "Alice"},
    )
    assert resp.status_code == 201
    assert resp.json()["email"] == "alice@example.com"
    assert "lifeos_session" in resp.cookies


def test_register_duplicate_email_is_rejected(client):
    payload = {"email": "bob@example.com", "password": "Str0ngPassw0rd!"}
    first = client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 201

    second = client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 409


def test_weak_password_rejected(client):
    resp = client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "password": "short"},
    )
    assert resp.status_code == 422


def test_login_with_correct_credentials(client):
    client.post("/api/v1/auth/register", json={"email": "carol@example.com", "password": "Str0ngPassw0rd!"})
    client.cookies.clear()

    resp = client.post("/api/v1/auth/login", json={"email": "carol@example.com", "password": "Str0ngPassw0rd!"})
    assert resp.status_code == 200
    assert "lifeos_session" in resp.cookies


def test_login_with_wrong_password_fails(client):
    client.post("/api/v1/auth/register", json={"email": "dave@example.com", "password": "Str0ngPassw0rd!"})
    client.cookies.clear()

    resp = client.post("/api/v1/auth/login", json={"email": "dave@example.com", "password": "WrongPassword1"})
    assert resp.status_code == 401


def test_account_locks_after_repeated_failures(client):
    from app.core.config import get_settings

    settings = get_settings()
    client.post("/api/v1/auth/register", json={"email": "erin@example.com", "password": "Str0ngPassw0rd!"})
    client.cookies.clear()

    for _ in range(settings.MAX_LOGIN_ATTEMPTS):
        client.post("/api/v1/auth/login", json={"email": "erin@example.com", "password": "WrongPassword1"})

    resp = client.post("/api/v1/auth/login", json={"email": "erin@example.com", "password": "Str0ngPassw0rd!"})
    assert resp.status_code == 429


def test_me_requires_authentication(client):
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 401


def test_me_returns_current_user_when_authenticated(client):
    client.post("/api/v1/auth/register", json={"email": "frank@example.com", "password": "Str0ngPassw0rd!"})
    resp = client.get("/api/v1/auth/me")
    assert resp.status_code == 200
    assert resp.json()["email"] == "frank@example.com"


def test_logout_invalidates_session(client):
    client.post("/api/v1/auth/register", json={"email": "grace@example.com", "password": "Str0ngPassw0rd!"})
    assert client.get("/api/v1/auth/me").status_code == 200

    client.post("/api/v1/auth/logout")
    assert client.get("/api/v1/auth/me").status_code == 401


def test_forgot_password_does_not_reveal_account_existence(client):
    known = client.post("/api/v1/auth/forgot-password", json={"email": "grace@example.com"})
    unknown = client.post("/api/v1/auth/forgot-password", json={"email": "nobody@example.com"})
    assert known.status_code == unknown.status_code == 202
    assert known.json() == unknown.json()
