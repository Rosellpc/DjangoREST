from rest_framework import viewsets, mixins
from django.contrib.auth.hashers import check_password
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.throttling import UserRateThrottle
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny

from .models import MyListItem, Profile, SubscriptionPlan, UserSubscription, WatchHistory
from .profile_access import access_token, accessible_profiles, require_profile_access
from .serializers import (
    MyListItemSerializer,
    ProfileSerializer,
    SubscriptionPlanSerializer,
    UserSubscriptionSerializer,
    WatchHistorySerializer,
)


class SubscriptionPlanViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = SubscriptionPlan.objects.filter(is_active=True)
    serializer_class = SubscriptionPlanSerializer
    permission_classes = [AllowAny]


class UserSubscriptionViewSet(mixins.CreateModelMixin, mixins.ListModelMixin,
                              mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    queryset = UserSubscription.objects.none()
    serializer_class = UserSubscriptionSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return UserSubscription.objects.none()
        return UserSubscription.objects.select_related("plan").filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status="active", payment_provider="simulated")


class PinThrottle(UserRateThrottle):
    scope = "profile_pin"
    rate = "10/min"


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.none()
    serializer_class = ProfileSerializer

    def perform_update(self, serializer):
        require_profile_access(self.request, serializer.instance)
        serializer.save()

    def perform_destroy(self, instance):
        require_profile_access(self.request, instance)
        instance.delete()

    @action(detail=True, methods=["post"], url_path="verify-pin", throttle_classes=[PinThrottle])
    def verify_pin(self, request, pk=None):
        profile = self.get_object()
        pin = request.data.get("pin", "")
        if not isinstance(pin, str) or len(pin) != 4 or not pin.isdigit():
            return Response({"detail": "PIN must be 4 digits."}, status=400)
        if not profile.has_pin or not check_password(pin, profile.pin_code):
            return Response({"detail": "Incorrect PIN."}, status=403)
        return Response({"verified": True, "access_token": access_token(profile)})

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Profile.objects.none()
        return Profile.objects.select_related("subscription", "subscription__plan").filter(
            subscription__user=self.request.user
        )

    def perform_create(self, serializer):
        try:
            subscription = UserSubscription.objects.select_related("plan").get(
                user=self.request.user
            )
        except UserSubscription.DoesNotExist as exc:
            raise ValidationError(
                {"subscription": "Create a subscription before creating profiles."}
            ) from exc
        if subscription.profiles.count() >= subscription.plan.max_profiles:
            raise ValidationError(
                {"subscription": "This plan has reached the maximum number of profiles."}
            )
        serializer.save(subscription=subscription)


class WatchHistoryViewSet(viewsets.ModelViewSet):
    queryset = WatchHistory.objects.none()
    serializer_class = WatchHistorySerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return WatchHistory.objects.none()
        return WatchHistory.objects.select_related("profile", "profile__subscription").filter(
            accessible_profiles(self.request), profile__subscription__user=self.request.user
        )


class MyListItemViewSet(viewsets.ModelViewSet):
    queryset = MyListItem.objects.none()
    serializer_class = MyListItemSerializer

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return MyListItem.objects.none()
        return MyListItem.objects.select_related("profile", "profile__subscription").filter(
            accessible_profiles(self.request), profile__subscription__user=self.request.user
        )
