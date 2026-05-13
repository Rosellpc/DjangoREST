from rest_framework import serializers

from .models import MyListItem, Profile, SubscriptionPlan, UserSubscription, WatchHistory


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
        read_only_fields = ["id", "user", "created_at", "updated_at", "plan"]

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
    pin = serializers.CharField(
        source="pin_code",
        required=False,
        allow_blank=True,
        max_length=4,
        write_only=False,
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
        return value


class FilmIdValidationMixin:
    def validate_film_id(self, value):
        if value <= 0:
            raise serializers.ValidationError("film_id must be a positive integer.")
        return value

    def validate_profile(self, profile):
        request = self.context.get("request")
        if request and profile.subscription.user_id != request.user.id:
            raise serializers.ValidationError("You do not have access to this profile.")
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
