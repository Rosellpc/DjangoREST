import pytest
from django.urls import reverse

from .models import MyListItem, Profile, SubscriptionPlan, UserSubscription, WatchHistory


@pytest.fixture
def plan():
    return SubscriptionPlan.objects.create(
        code="test-basic",
        name="Basic",
        monthly_price="9.99",
        max_profiles=2,
        max_concurrent_streams=1,
    )


@pytest.fixture
def active_subscription(user, plan):
    return UserSubscription.objects.create(user=user, plan=plan)


@pytest.fixture
def profile(active_subscription):
    return Profile.objects.create(subscription=active_subscription, name="Main")


@pytest.mark.django_db
def test_default_subscription_plans_are_seeded():
    assert SubscriptionPlan.objects.filter(code="basic", is_active=True).exists()
    assert SubscriptionPlan.objects.filter(code="standard", is_active=True).exists()
    assert SubscriptionPlan.objects.filter(code="premium", is_active=True).exists()


@pytest.mark.django_db
def test_subscription_plan_list_is_public(api_client, plan):
    response = api_client.get(reverse("subscription-plans-list"))
    assert response.status_code == 200
    codes = {item["code"] for item in response.data["results"]}
    assert plan.code in codes


@pytest.mark.django_db
def test_user_can_create_own_subscription(authenticated_api_client, plan, user):
    response = authenticated_api_client.post(
        reverse("user-subscriptions-list"),
        {
            "plan_id": plan.id,
            "status": "active",
            "payment_provider": "simulated",
            "payment_brand": "Visa",
            "payment_last4": "4242",
            "billing_email": "testuser@example.com",
        },
        format="json",
    )
    assert response.status_code == 201
    assert response.data["plan"]["code"] == plan.code
    assert response.data["payment_provider"] == "simulated"
    assert response.data["payment_brand"] == "Visa"
    assert response.data["payment_last4"] == "4242"
    assert response.data["billing_email"] == "testuser@example.com"
    assert UserSubscription.objects.filter(user=user).count() == 1


@pytest.mark.django_db
def test_subscription_rejects_invalid_payment_last4(authenticated_api_client, plan):
    response = authenticated_api_client.post(
        reverse("user-subscriptions-list"),
        {"plan_id": plan.id, "payment_last4": "abcd"},
        format="json",
    )

    assert response.status_code == 400
    assert "payment_last4" in response.data


@pytest.mark.django_db
def test_user_cannot_create_second_subscription(authenticated_api_client, plan, active_subscription):
    response = authenticated_api_client.post(
        reverse("user-subscriptions-list"),
        {"plan_id": plan.id, "status": "active"},
        format="json",
    )
    assert response.status_code == 400
    assert "already has a subscription" in str(response.data).lower()


@pytest.mark.django_db
def test_profile_create_requires_existing_subscription(authenticated_api_client):
    response = authenticated_api_client.post(
        reverse("profiles-list"),
        {"name": "Kids", "is_kids": True},
        format="json",
    )
    assert response.status_code == 400
    assert "create a subscription" in str(response.data).lower()


@pytest.mark.django_db
def test_profile_preferences_are_persisted(authenticated_api_client, active_subscription):
    response = authenticated_api_client.post(
        reverse("profiles-list"),
        {
            "name": "Main",
            "is_kids": False,
            "maturity_rating": "PG-13",
            "language": "es",
            "autoplay_next_episode": False,
            "autoplay_previews": False,
            "has_pin": True,
            "pin": "1234",
            "game_handle": "mainhero",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["maturity_rating"] == "PG-13"
    assert response.data["language"] == "es"
    assert response.data["autoplay_next_episode"] is False
    assert response.data["autoplay_previews"] is False
    assert response.data["has_pin"] is True
    assert response.data["pin"] == "1234"
    assert response.data["game_handle"] == "mainhero"


@pytest.mark.django_db
def test_profile_limit_respects_plan(authenticated_api_client, active_subscription):
    Profile.objects.create(subscription=active_subscription, name="Main")
    Profile.objects.create(subscription=active_subscription, name="Kids")

    response = authenticated_api_client.post(
        reverse("profiles-list"),
        {"name": "Guest"},
        format="json",
    )
    assert response.status_code == 400
    assert "maximum number of profiles" in str(response.data).lower()


@pytest.mark.django_db
def test_watch_history_is_scoped_to_authenticated_user(
    authenticated_api_client, user, profile, django_user_model, plan
):
    other_user = django_user_model.objects.create_user(
        username="otheruser",
        password="StrongPassword123!",
    )
    other_subscription = UserSubscription.objects.create(user=other_user, plan=plan)
    other_profile = Profile.objects.create(subscription=other_subscription, name="OtherMain")
    WatchHistory.objects.create(profile=profile, film_id=1, progress_seconds=100)
    WatchHistory.objects.create(profile=other_profile, film_id=2, progress_seconds=200)

    response = authenticated_api_client.get(reverse("watch-history-list"))
    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["profile"] == profile.id


@pytest.mark.django_db
def test_user_cannot_write_history_for_another_users_profile(
    authenticated_api_client, django_user_model, plan
):
    other_user = django_user_model.objects.create_user(
        username="otheruser2",
        password="StrongPassword123!",
    )
    other_subscription = UserSubscription.objects.create(user=other_user, plan=plan)
    other_profile = Profile.objects.create(subscription=other_subscription, name="OtherMain2")

    response = authenticated_api_client.post(
        reverse("watch-history-list"),
        {
            "profile": other_profile.id,
            "film_id": 1,
            "progress_seconds": 40,
            "completed": False,
        },
        format="json",
    )
    assert response.status_code == 400
    assert "do not have access" in str(response.data).lower()


@pytest.mark.django_db
def test_my_list_create_and_uniqueness(authenticated_api_client, profile):
    payload = {"profile": profile.id, "film_id": 10}

    first = authenticated_api_client.post(reverse("my-list-list"), payload, format="json")
    second = authenticated_api_client.post(reverse("my-list-list"), payload, format="json")

    assert first.status_code == 201
    assert second.status_code == 400
    assert MyListItem.objects.filter(profile=profile, film_id=10).count() == 1
