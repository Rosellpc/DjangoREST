import pytest
from django.urls import reverse
from apps.subscriptions.models import SubscriptionPlan, UserSubscription


def test_account_requires_authentication(api_client):
    assert api_client.get(reverse("auth_me")).status_code == 401


@pytest.mark.django_db
def test_account_returns_own_identity_and_subscription(authenticated_api_client, user, django_user_model):
    plan = SubscriptionPlan.objects.get(code="premium")
    subscription = UserSubscription.objects.create(user=user, plan=plan)
    user.first_name = "Rosell"
    user.last_name = "Perez"
    user.email = "owner@example.com"
    user.save()
    other_user = django_user_model.objects.create_user(username="another-account", password="StrongPassword123!")
    UserSubscription.objects.create(user=other_user, plan=SubscriptionPlan.objects.get(code="basic"))
    response = authenticated_api_client.get(reverse("auth_me"))
    assert response.status_code == 200
    assert response["Cache-Control"] == "private, no-store"
    assert response.data["user"]["id"] == user.pk
    assert response.data["user"]["first_name"] == "Rosell"
    assert response.data["user"]["email"] == "owner@example.com"
    assert "password" not in response.data["user"]
    assert response.data["user"]["date_joined"]
    assert response.data["subscription"]["id"] == subscription.pk
    assert response.data["subscription"]["plan"]["code"] == "premium"
    assert response.data["subscription"]["starts_at"]
    assert response.data["subscription"]["ends_at"] is None
    assert authenticated_api_client.patch(reverse("auth_me"), {"subscription": {"status": "active"}}, format="json").status_code == 405


@pytest.mark.django_db
def test_account_without_subscription_has_no_invented_plan(authenticated_api_client, user):
    response = authenticated_api_client.get(reverse("auth_me"))
    assert response.status_code == 200
    assert response.data["user"]["username"] == user.username
    assert response.data["subscription"] is None
