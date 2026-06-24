# Helper fixture to register and login a user and return the JWT token
def get_auth_token(client):
    register_payload = {"username": "testuser", "password": "testpassword"}
    response = client.post("/auth/register", json=register_payload)
    assert response.status_code == 201
    return response.json()["token"]

# --- AUTHENTICATION TESTS ---

def test_user_registration_success(client):
    payload = {"username": "newuser", "password": "password123"}
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["username"] == "newuser"
    assert "token" in data

def test_user_registration_duplicate(client):
    payload = {"username": "user1", "password": "password123"}
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    
    # Try registering again with the same username
    response2 = client.post("/auth/register", json=payload)
    assert response2.status_code == 400
    assert response2.json()["error"] == "username already exists"

def test_user_login_success(client):
    # First register
    payload = {"username": "loginuser", "password": "password123"}
    client.post("/auth/register", json=payload)
    
    # Login
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["username"] == "loginuser"
    assert "token" in data

def test_user_login_invalid_credentials(client):
    payload = {"username": "someuser", "password": "wrongpassword"}
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 401
    assert response.json()["error"] == "invalid credentials"


# --- BOOKS CRUD TESTS ---

def test_get_books_empty(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == []

def test_create_book_unauthorized(client):
    payload = {
        "publisher": "O'Reilly",
        "name": "Learning FastAPI",
        "date": "2026-06-03",
        "Cost": 29.99
    }
    response = client.post("/create", json=payload)
    assert response.status_code == 401
    assert response.json()["error"] == "Authorization header missing"

def test_create_book_success(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "publisher": "O'Reilly",
        "name": "Learning FastAPI",
        "date": "2026-06-03",
        "Cost": 29.99
    }
    response = client.post("/create", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["publisher"] == "O'Reilly"
    assert data["name"] == "Learning FastAPI"
    assert data["date"] == "2026-06-03"
    assert data["Cost"] == 29.99

def test_create_book_validation_error(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    # Cost is missing
    payload = {
        "publisher": "O'Reilly",
        "name": "Learning FastAPI",
        "date": "2026-06-03"
    }
    response = client.post("/create", json=payload, headers=headers)
    assert response.status_code == 400
    assert "error" in response.json()

def test_update_book_success(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # First create a book
    create_payload = {
        "publisher": "Packt",
        "name": "Flask App",
        "date": "2025-01-01",
        "Cost": 39.99
    }
    create_res = client.post("/create", json=create_payload, headers=headers)
    book_id = create_res.json()["id"]
    
    # Update the book
    update_payload = {
        "publisher": "Packt Updated",
        "name": "FastAPI App",
        "date": "2026-06-03",
        "Cost": 49.99
    }
    response = client.put(f"/update/{book_id}", json=update_payload, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["publisher"] == "Packt Updated"
    assert data["name"] == "FastAPI App"
    assert data["Cost"] == 49.99

def test_update_book_not_found(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    update_payload = {
        "publisher": "Packt",
        "name": "FastAPI App",
        "date": "2026-06-03",
        "Cost": 49.99
    }
    response = client.put("/update/9999", json=update_payload, headers=headers)
    assert response.status_code == 404
    assert response.json()["error"] == "Book not found"

def test_delete_book_success(client):
    token = get_auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    
    # First create a book
    create_payload = {
        "publisher": "Springer",
        "name": "Python Mastery",
        "date": "2024-05-12",
        "Cost": 75.00
    }
    create_res = client.post("/create", json=create_payload, headers=headers)
    book_id = create_res.json()["id"]
    
    # Delete the book
    response = client.delete(f"/delete/{book_id}", headers=headers)
    assert response.status_code == 200
    assert response.json() == {"result": "Book deleted"}
    
    # Confirm it is gone
    get_res = client.get("/")
    assert get_res.json() == []

def test_cookie_authentication_flow(client):
    # Register and verify access_token is set in cookies
    payload = {"username": "cookieuser", "password": "password123"}
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    
    # Verify cookie presence
    assert "access_token" in response.cookies
    
    # Try calling a protected route using client cookies
    book_payload = {
        "publisher": "O'Reilly",
        "name": "FastAPI Cookies",
        "date": "2026-06-03",
        "Cost": 19.99
    }
    response_create = client.post("/create", json=book_payload)
    assert response_create.status_code == 201
    assert response_create.json()["name"] == "FastAPI Cookies"
    
    # Logout and check cookie deletion
    response_logout = client.post("/auth/logout")
    assert response_logout.status_code == 200
    
    # Try creating again, should fail with 401
    # We clear the client cookies manually for this test case
    client.cookies.clear()
    response_unauth = client.post("/create", json=book_payload)
    assert response_unauth.status_code == 401
