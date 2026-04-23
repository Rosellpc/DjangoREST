import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import AccessToken


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(django_user_model):
    return django_user_model.objects.create_user(
        username="testuser",
        password="StrongPassword123!",
    )


@pytest.fixture
def auth_headers(user):
    token = str(AccessToken.for_user(user))
    return {"HTTP_AUTHORIZATION": f"Bearer {token}"}


@pytest.fixture
def authenticated_api_client(api_client, auth_headers):
    api_client.credentials(**auth_headers)
    return api_client
