from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class SubscriptionStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    TRIAL = "trial", "Trial"
    PAST_DUE = "past_due", "Past due"
    CANCELED = "canceled", "Canceled"


class SubscriptionPlan(models.Model):
    code = models.SlugField(unique=True)
    name = models.CharField(max_length=80)
    monthly_price = models.DecimalField(max_digits=8, decimal_places=2)
    max_profiles = models.PositiveSmallIntegerField(default=1)
    max_concurrent_streams = models.PositiveSmallIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["monthly_price", "name"]

    def __str__(self):
        return f"{self.name} ({self.code})"


class UserSubscription(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscription",
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name="subscriptions",
    )
    status = models.CharField(
        max_length=20,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.ACTIVE,
    )
    starts_at = models.DateTimeField(default=timezone.now)
    ends_at = models.DateTimeField(blank=True, null=True)
    auto_renew = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} -> {self.plan.code}"


class Profile(models.Model):
    subscription = models.ForeignKey(
        UserSubscription,
        on_delete=models.CASCADE,
        related_name="profiles",
    )
    name = models.CharField(max_length=40)
    is_kids = models.BooleanField(default=False)
    avatar_key = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["subscription", "name"],
                name="unique_profile_name_per_subscription",
            )
        ]
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.name} ({self.subscription.user})"

    def clean(self):
        super().clean()
        current_profiles = self.subscription.profiles.exclude(pk=self.pk).count()
        if current_profiles >= self.subscription.plan.max_profiles:
            raise ValidationError(
                {"subscription": "This plan has reached the maximum number of profiles."}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)


class WatchHistory(models.Model):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="watch_history",
    )
    film_id = models.PositiveIntegerField()
    progress_seconds = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    last_watched_at = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["profile", "film_id"],
                name="unique_watch_history_per_profile_film",
            )
        ]
        indexes = [models.Index(fields=["profile", "-updated_at"])]
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.profile.name} film={self.film_id}"


class MyListItem(models.Model):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="my_list_items",
    )
    film_id = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["profile", "film_id"],
                name="unique_my_list_item_per_profile_film",
            )
        ]
        indexes = [models.Index(fields=["profile", "-created_at"])]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.profile.name} film={self.film_id}"
