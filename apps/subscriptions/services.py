from django.db import transaction
from .models import Profile, UserSubscription


@transaction.atomic
def ensure_initial_profile(subscription):
    # Serialize bootstrap requests, including React's repeated development effects.
    subscription = UserSubscription.objects.select_for_update().select_related("user", "plan").get(pk=subscription.pk)
    existing = subscription.profiles.first()
    if existing:
        return existing, False
    name = (subscription.user.first_name.strip() or subscription.user.get_username() or "Principal")[:40]
    return Profile.objects.create(subscription=subscription, name=name), True
