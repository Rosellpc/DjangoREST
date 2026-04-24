from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny

from .models import MyListItem, Profile, SubscriptionPlan, UserSubscription, WatchHistory
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


class UserSubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = UserSubscriptionSerializer

    def get_queryset(self):
        return UserSubscription.objects.select_related("plan").filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ProfileViewSet(viewsets.ModelViewSet):
    serializer_class = ProfileSerializer

    def get_queryset(self):
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
    serializer_class = WatchHistorySerializer

    def get_queryset(self):
        return WatchHistory.objects.select_related("profile", "profile__subscription").filter(
            profile__subscription__user=self.request.user
        )


class MyListItemViewSet(viewsets.ModelViewSet):
    serializer_class = MyListItemSerializer

    def get_queryset(self):
        return MyListItem.objects.select_related("profile", "profile__subscription").filter(
            profile__subscription__user=self.request.user
        )
