import pytest

def test_vote_on_post(authorized_client, test_posts):
    res = authorized_client.post("/vote/", json={"post_id": test_posts[0].id, "dir": 1})
    assert res.status_code == 201

def test_vote_twice_post(authorized_client, test_posts):
    post_id = test_posts[0].id
    res1 = authorized_client.post("/vote/", json={"post_id": post_id, "dir": 1})
    assert res1.status_code == 201
    res2 = authorized_client.post("/vote/", json={"post_id": post_id, "dir": 1})
    assert res2.status_code == 409

