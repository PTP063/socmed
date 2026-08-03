import pytest
from app import schemas

def test_get_all_posts(client, test_posts):
    res = client.get("/posts/")
    assert res.status_code == 200
    posts = res.json()
    assert len(posts) == len(test_posts)

def test_unauthorized_user_create_post(client):
    res = client.post("/posts/", json={"title": "arbitrary title", "content": "arbitrary content"})
    assert res.status_code == 401

def test_create_post(authorized_client, test_user):
    res = authorized_client.post("/posts/", json={"title": "new post title", "content": "new post content"})
    assert res.status_code == 201
    created_post = schemas.PostOut(**res.json())
    assert created_post.title == "new post title"
    assert created_post.owner_id == test_user["id"]

def test_delete_post_success(authorized_client, test_user, test_posts):
    res = authorized_client.delete(f"/posts/{test_posts[0].id}")
    assert res.status_code == 204
