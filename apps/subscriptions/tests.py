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
    assert "pin" not in response.data
    from django.contrib.auth.hashers import check_password
    stored = Profile.objects.get(pk=response.data["id"])
    assert stored.pin_code != "1234"
    assert check_password("1234", stored.pin_code)
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


@pytest.mark.django_db
def test_subscription_cannot_be_modified_by_client(authenticated_api_client, active_subscription):
    url = reverse("user-subscriptions-detail", args=[active_subscription.pk])
    assert authenticated_api_client.patch(url, {"status": "trial"}).status_code == 405
    assert authenticated_api_client.delete(url).status_code == 405


@pytest.mark.django_db
def test_subscription_activation_is_server_controlled(authenticated_api_client, plan):
    response = authenticated_api_client.post(reverse("user-subscriptions-list"),
        {"plan_id": plan.pk, "status": "trial", "payment_provider": "real",
         "ends_at": "2099-01-01T00:00:00Z"}, format="json")
    assert response.status_code == 201
    assert response.data["status"] == "active"
    assert response.data["payment_provider"] == "simulated"
    assert response.data["ends_at"] is None


@pytest.mark.django_db
def test_locked_profile_requires_pin_for_private_data(authenticated_api_client, profile):
    from django.contrib.auth.hashers import make_password
    profile.has_pin = True
    profile.pin_code = make_password("1234")
    profile.save()
    MyListItem.objects.create(profile=profile, film_id=10)
    assert authenticated_api_client.get(reverse("my-list-list")).data["count"] == 0
    history_url = reverse("watch-history-list")
    assert authenticated_api_client.post(history_url,
        {"profile": profile.pk, "film_id": 10}, format="json").status_code == 403
    detail = reverse("profiles-detail", args=[profile.pk])
    assert authenticated_api_client.patch(detail, {"has_pin": False}, format="json").status_code == 403
    verify = reverse("profiles-verify-pin", args=[profile.pk])
    assert authenticated_api_client.post(verify, {"pin": "9999"}).status_code == 403
    response = authenticated_api_client.post(verify, {"pin": "1234"})
    assert response.status_code == 200
    headers = {"HTTP_X_PROFILE_ACCESS": response.data["access_token"]}
    assert authenticated_api_client.get(reverse("my-list-list"), **headers).data["count"] == 1
    assert authenticated_api_client.post(history_url,
        {"profile": profile.pk, "film_id": 10}, format="json", **headers).status_code == 201
    assert authenticated_api_client.patch(detail, {"pin": "5678"}, format="json", **headers).status_code == 200
    assert authenticated_api_client.get(reverse("my-list-list"), **headers).data["count"] == 0


@pytest.mark.django_db
def test_profile_cannot_enable_lock_without_pin(authenticated_api_client, active_subscription):
    response = authenticated_api_client.post(reverse("profiles-list"),
        {"name": "Locked", "has_pin": True}, format="json")
    assert response.status_code == 400


@pytest.mark.django_db
def test_profile_photo_and_name_are_saved_together(authenticated_api_client, profile):
    avatar = ("data:image/png;base64,"
              "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aPz8AAAAASUVORK5CYII=")
    assert len(avatar) > 100
    url = reverse("profiles-detail", args=[profile.pk])
    response = authenticated_api_client.patch(url, {"name": "Updated", "avatar_key": avatar}, format="json")
    assert response.status_code == 200
    profile.refresh_from_db()
    assert profile.name == "Updated"
    assert profile.avatar_key == avatar
    response = authenticated_api_client.get(url)
    assert response.data["avatar_key"] == avatar


@pytest.mark.django_db
@pytest.mark.parametrize("avatar", [
    "data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=",
    "data:image/png;base64,not-base64!",
    "data:image/png;base64,aGVsbG8=",
    "data:image/png;base64," + "A" * 262144,
], ids=["svg", "invalid-base64", "invalid-signature", "oversized"])
def test_profile_rejects_invalid_or_oversized_photos(authenticated_api_client, profile, avatar):
    response = authenticated_api_client.patch(reverse("profiles-detail", args=[profile.pk]),
        {"name": "Not saved", "avatar_key": avatar}, format="json")
    assert response.status_code == 400
    assert "avatar_key" in response.data
    profile.refresh_from_db()
    assert profile.name == "Main"


@pytest.mark.django_db
def test_profile_accepts_existing_avatar_paths(authenticated_api_client, profile):
    response = authenticated_api_client.patch(reverse("profiles-detail", args=[profile.pk]),
        {"avatar_key": "/avatars/avatar-red.png"}, format="json")
    assert response.status_code == 200


@pytest.mark.django_db
def test_account_subscription_profile_and_history_flow(api_client):
    response = api_client.post(reverse("auth_register"), {
        "username": "flow-user", "email": "flow@example.com",
        "password": "A-Strong-Password-725!",
    }, format="json")
    assert response.status_code == 201
    login = api_client.post(reverse("auth_login"),
        {"username": "flow-user", "password": "A-Strong-Password-725!"}, format="json")
    assert login.status_code == 200
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {login.data['access']}")
    plan = SubscriptionPlan.objects.get(code="basic")
    assert api_client.post(reverse("user-subscriptions-list"),
        {"plan_id": plan.pk}, format="json").status_code == 201
    profile = api_client.post(reverse("profiles-list"), {"name": "Main"}, format="json")
    assert profile.status_code == 201
    payload = {"profile": profile.data["id"], "film_id": 1}
    assert api_client.post(reverse("my-list-list"), payload, format="json").status_code == 201
    assert api_client.post(reverse("watch-history-list"),
        {**payload, "progress_seconds": 90}, format="json").status_code == 201
    assert api_client.get(reverse("watch-history-list")).data["results"][0]["progress_seconds"] == 90


@pytest.mark.django_db
def test_pin_migration_hashes_legacy_values_once(profile):
    from importlib import import_module
    from django.apps import apps
    from django.db import connection
    from django.contrib.auth.hashers import check_password
    from types import SimpleNamespace
    Profile.objects.filter(pk=profile.pk).update(has_pin=True, pin_code="1234")
    migration = import_module("apps.subscriptions.migrations.0005_hash_profile_pins")
    migration.hash_existing_pins(apps, SimpleNamespace(connection=connection))
    profile.refresh_from_db()
    hashed = profile.pin_code
    assert hashed != "1234" and check_password("1234", hashed)
    migration.hash_existing_pins(apps, SimpleNamespace(connection=connection))
    profile.refresh_from_db()
    assert profile.pin_code == hashed


@pytest.mark.django_db
def test_profile_grants_are_bound_to_owner_and_reject_tampering(
    authenticated_api_client, profile, plan, django_user_model
):
    from django.contrib.auth.hashers import make_password
    from .profile_access import access_token
    profile.has_pin = True
    profile.pin_code = make_password("1234")
    profile.save()
    MyListItem.objects.create(profile=profile, film_id=1)
    other_user = django_user_model.objects.create_user(username="grant-owner", password="StrongPassword123!")
    subscription = UserSubscription.objects.create(user=other_user, plan=plan)
    other_profile = Profile.objects.create(subscription=subscription, name="Other")
    url = reverse("my-list-list")
    for token in [access_token(other_profile), access_token(profile) + "tampered"]:
        response = authenticated_api_client.get(url, HTTP_X_PROFILE_ACCESS=token)
        assert response.status_code == 200
        assert response.data["count"] == 0
    assert authenticated_api_client.post(reverse("profiles-verify-pin", args=[other_profile.pk]),
        {"pin": "1234"}).status_code == 404
