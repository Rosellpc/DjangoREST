from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    MyListItemViewSet,
    ProfileViewSet,
    SubscriptionPlanViewSet,
    UserSubscriptionViewSet,
    WatchHistoryViewSet,
)

router = DefaultRouter()
router.register(r"plans", SubscriptionPlanViewSet, basename="subscription-plans")
router.register(r"subscriptions", UserSubscriptionViewSet, basename="user-subscriptions")
router.register(r"profiles", ProfileViewSet, basename="profiles")
router.register(r"history", WatchHistoryViewSet, basename="watch-history")
router.register(r"my-list", MyListItemViewSet, basename="my-list")

urlpatterns = [
    path("", include(router.urls)),
]
