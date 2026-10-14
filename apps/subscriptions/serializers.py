import base64
import binascii

from rest_framework import serializers
from django.contrib.auth.hashers import make_password

from .models import MyListItem, Profile, SubscriptionPlan, UserSubscription, WatchHistory
from .profile_access import require_profile_access


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = [
            "id",
            "code",
            "name",
            "monthly_price",
            "max_profiles",
            "max_concurrent_streams",
            "is_active",
        ]


class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)
    plan_id = serializers.PrimaryKeyRelatedField(
        source="plan",
        queryset=SubscriptionPlan.objects.filter(is_active=True),
        write_only=True,
    )

    class Meta:
        model = UserSubscription
        fields = [
            "id",
            "user",
            "plan",
            "plan_id",
            "status",
            "starts_at",
            "ends_at",
            "auto_renew",
            "payment_provider",
            "payment_brand",
            "payment_last4",
            "billing_email",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at", "plan", "status", "starts_at", "ends_at", "payment_provider"]

    def validate_payment_last4(self, value):
        if value and (not value.isdigit() or len(value) != 4):
            raise serializers.ValidationError("payment_last4 must be 4 digits.")
        return value

    def validate(self, attrs):
        request = self.context.get("request")
        if request and request.method == "POST":
            if UserSubscription.objects.filter(user=request.user).exists():
                raise serializers.ValidationError(
                    "The authenticated user already has a subscription."
                )
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    avatar_key = serializers.CharField(required=False, allow_blank=True, max_length=262144)
    pin = serializers.CharField(
        source="pin_code",
        required=False,
        allow_blank=True,
        max_length=4,
        write_only=True,
    )

    class Meta:
        model = Profile
        fields = [
            "id",
            "subscription",
            "name",
            "is_kids",
            "avatar_key",
            "maturity_rating",
            "language",
            "autoplay_next_episode",
            "autoplay_previews",
            "has_pin",
            "pin",
            "game_handle",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "subscription", "created_at", "updated_at"]

    def validate_pin(self, value):
        if value and (not value.isdigit() or len(value) != 4):
            raise serializers.ValidationError("PIN must be 4 digits.")
        return make_password(value) if value else ""

    def validate_avatar_key(self, value):
        if not value.startswith("data:"):
            if len(value) > 2048:
                raise serializers.ValidationError("La dirección de la foto es demasiado larga.")
            return value
        try:
            header, encoded = value.split(",", 1)
            signatures = {
                "data:image/jpeg;base64": lambda data: data.startswith(b"\xff\xd8\xff"),
                "data:image/png;base64": lambda data: data.startswith(b"\x89PNG\r\n\x1a\n"),
                "data:image/webp;base64": lambda data: data.startswith(b"RIFF") and data[8:12] == b"WEBP",
            }
            decoded = base64.b64decode(encoded, validate=True)
            if header not in signatures or not signatures[header](decoded):
                raise ValueError
        except (ValueError, binascii.Error):
            raise serializers.ValidationError("Selecciona una foto JPG, PNG o WebP válida.")
        return value

    def validate(self, attrs):
        enabled = attrs.get("has_pin", self.instance.has_pin if self.instance else False)
        pin = attrs.get("pin_code", self.instance.pin_code if self.instance else "")
        if enabled and not pin:
            raise serializers.ValidationError({"pin": "A PIN is required when profile lock is enabled."})
        if not enabled:
            attrs["pin_code"] = ""
        return attrs


class FilmIdValidationMixin:
    def validate_film_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("film_id must be a positive integer.")
        return value

    def validate_profile(self, profile):
        request = self.context.get("request")
        if request and profile.subscription.user_id != request.user.id:
            raise serializers.ValidationError("You do not have access to this profile.")
        if request:
            require_profile_access(request, profile)
        return profile


class WatchHistorySerializer(FilmIdValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = WatchHistory
        fields = [
            "id",
            "profile",
            "film_id",
            "progress_seconds",
            "completed",
            "last_watched_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class MyListItemSerializer(FilmIdValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = MyListItem
        fields = ["id", "profile", "film_id", "created_at"]
        read_only_fields = ["id", "created_at"]
