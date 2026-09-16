def _register(client, email, password="Str0ngPassw0rd!"):
    resp = client.post("/api/v1/auth/register", json={"email": email, "password": password})
    assert resp.status_code == 201
    return resp.json()


def test_create_and_get_task(client):
    _register(client, "task-owner@example.com")
    create = client.post("/api/v1/tasks", json={"title": "Finish report", "priority": "high"})
    assert create.status_code == 201
    task_id = create.json()["id"]

    get_resp = client.get(f"/api/v1/tasks/{task_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["title"] == "Finish report"
    assert get_resp.json()["priority"] == "high"


def test_task_requires_authentication(client):
    resp = client.post("/api/v1/tasks", json={"title": "No auth"})
    assert resp.status_code == 401


def test_complete_and_restore_task(client):
    _register(client, "completer@example.com")
    task_id = client.post("/api/v1/tasks", json={"title": "Ship feature"}).json()["id"]

    completed = client.post(f"/api/v1/tasks/{task_id}/complete")
    assert completed.status_code == 200
    assert completed.json()["status"] == "completed"
    assert completed.json()["completed_at"] is not None

    restored = client.post(f"/api/v1/tasks/{task_id}/restore")
    assert restored.status_code == 200
    assert restored.json()["status"] == "active"
    assert restored.json()["completed_at"] is None


def test_delete_task_is_not_retrievable_afterwards(client):
    _register(client, "deleter@example.com")
    task_id = client.post("/api/v1/tasks", json={"title": "Temp task"}).json()["id"]

    delete_resp = client.delete(f"/api/v1/tasks/{task_id}")
    assert delete_resp.status_code == 204

    get_resp = client.get(f"/api/v1/tasks/{task_id}")
    assert get_resp.status_code == 404


def test_pagination_never_returns_more_than_page_size(client):
    _register(client, "pager@example.com")
    for i in range(30):
        client.post("/api/v1/tasks", json={"title": f"Task {i}"})

    resp = client.get("/api/v1/tasks", params={"page_size": 10, "page": 1})
    body = resp.json()
    assert len(body["items"]) == 10
    assert body["total"] == 30
    assert body["total_pages"] == 3


def test_page_size_is_capped_even_if_client_requests_more(client):
    _register(client, "pager2@example.com")
    for i in range(5):
        client.post("/api/v1/tasks", json={"title": f"Task {i}"})

    resp = client.get("/api/v1/tasks", params={"page_size": 1000})
    assert resp.status_code == 422  # Query validation caps page_size at 100 via le=100


# --- CRITICAL: cross-user data isolation ---
# User A must NEVER be able to read, edit, or delete User B's task, whether
# by ID guessing or any other path. This is the single most important
# property task_service.py and the routes in api/v1/tasks.py exist to
# guarantee (see the docstring on get_task_or_raise).


def test_user_cannot_read_another_users_task(client):
    _register(client, "victim@example.com")
    victim_task_id = client.post("/api/v1/tasks", json={"title": "Victim's private task"}).json()["id"]
    client.post("/api/v1/auth/logout")

    _register(client, "attacker@example.com")
    resp = client.get(f"/api/v1/tasks/{victim_task_id}")
    assert resp.status_code == 404  # not 403 -- we don't even confirm the task exists


def test_user_cannot_update_another_users_task(client):
    _register(client, "victim2@example.com")
    victim_task_id = client.post("/api/v1/tasks", json={"title": "Victim's task"}).json()["id"]
    client.post("/api/v1/auth/logout")

    _register(client, "attacker2@example.com")
    resp = client.put(f"/api/v1/tasks/{victim_task_id}", json={"title": "Hacked title"})
    assert resp.status_code == 404


def test_user_cannot_delete_another_users_task(client):
    _register(client, "victim3@example.com")
    victim_task_id = client.post("/api/v1/tasks", json={"title": "Victim's task"}).json()["id"]
    client.post("/api/v1/auth/logout")

    _register(client, "attacker3@example.com")
    resp = client.delete(f"/api/v1/tasks/{victim_task_id}")
    assert resp.status_code == 404


def test_user_cannot_complete_another_users_task(client):
    _register(client, "victim4@example.com")
    victim_task_id = client.post("/api/v1/tasks", json={"title": "Victim's task"}).json()["id"]
    client.post("/api/v1/auth/logout")

    _register(client, "attacker4@example.com")
    resp = client.post(f"/api/v1/tasks/{victim_task_id}/complete")
    assert resp.status_code == 404


def test_task_list_only_shows_own_tasks(client):
    _register(client, "listowner@example.com")
    client.post("/api/v1/tasks", json={"title": "Owner task 1"})
    client.post("/api/v1/tasks", json={"title": "Owner task 2"})
    client.post("/api/v1/auth/logout")

    _register(client, "otheruser@example.com")
    client.post("/api/v1/tasks", json={"title": "Other user task"})

    resp = client.get("/api/v1/tasks")
    titles = [t["title"] for t in resp.json()["items"]]
    assert titles == ["Other user task"]
    assert "Owner task 1" not in titles
    assert "Owner task 2" not in titles
