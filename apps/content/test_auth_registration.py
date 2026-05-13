import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_register_creates_user_and_returns_tokens(api_client, django_user_model):
    response = api_client.post(
        reverse("auth_register"),
        {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["user"]["username"] == "newuser"
    assert response.data["access"]
    assert response.data["refresh"]
    assert django_user_model.objects.filter(username="newuser").exists()


@pytest.mark.django_db
def test_register_rejects_duplicate_username(api_client, django_user_model):
    django_user_model.objects.create_user(username="newuser", password="StrongPassword123!")

    response = api_client.post(
        reverse("auth_register"),
        {
            "username": "newuser",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 400
    assert "username" in response.data
