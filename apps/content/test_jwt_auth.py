import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_token_obtain_pair_returns_access_and_refresh(api_client, user):
    response = api_client.post(
        reverse("token_obtain_pair"),
        {"username": user.username, "password": "StrongPassword123!"},
        format="json",
    )

    assert response.status_code == 200
    assert "access" in response.data
    assert "refresh" in response.data


@pytest.mark.django_db
def test_token_verify_accepts_valid_access_token(api_client, user):
    login_response = api_client.post(
        reverse("token_obtain_pair"),
        {"username": user.username, "password": "StrongPassword123!"},
        format="json",
    )
    access_token = login_response.data["access"]

    verify_response = api_client.post(
        reverse("token_verify"),
        {"token": access_token},
        format="json",
    )

    assert verify_response.status_code == 200


@pytest.mark.django_db
def test_refresh_token_rotation_returns_new_tokens(api_client, user):
    login_response = api_client.post(
        reverse("token_obtain_pair"),
        {"username": user.username, "password": "StrongPassword123!"},
        format="json",
    )
    refresh_token = login_response.data["refresh"]

    refresh_response = api_client.post(
        reverse("token_refresh"),
        {"refresh": refresh_token},
        format="json",
    )

    assert refresh_response.status_code == 200
    assert "access" in refresh_response.data
    assert "refresh" in refresh_response.data


@pytest.mark.django_db
def test_blacklisted_refresh_token_cannot_be_used_again(api_client, user):
    login_response = api_client.post(
        reverse("token_obtain_pair"),
        {"username": user.username, "password": "StrongPassword123!"},
        format="json",
    )
    refresh_token = login_response.data["refresh"]

    blacklist_response = api_client.post(
        reverse("token_blacklist"),
        {"refresh": refresh_token},
        format="json",
    )
    reuse_response = api_client.post(
        reverse("token_refresh"),
        {"refresh": refresh_token},
        format="json",
    )

    assert blacklist_response.status_code == 200
    assert reuse_response.status_code == 401
