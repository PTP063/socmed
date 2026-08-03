import pytest
from app import schemas

def test_root(client):
    res = client.get("/")
    assert res.status_code == 200
    assert res.json() == {"message": "Welcome to SocMed API"}

def test_create_user(client):
    res = client.post("/users/", json={"email": "newuser@gmail.com", "password": "password123"})
    new_user = schemas.UserOut(**res.json())
    assert new_user.email == "newuser@gmail.com"
    assert res.status_code == 201

def test_login_user(client, test_user):
    res = client.post("/auth/login", data={"username": test_user["email"], "password": test_user["password"]})
    assert res.status_code == 200
    token = schemas.Token(**res.json())
    assert token.token_type == "bearer"

def test_incorrect_login(client):
    res = client.post("/auth/login", data={"username": "wrong@email.com", "password": "wrongpassword"})
    assert res.status_code == 404 or res.status_code == 401
