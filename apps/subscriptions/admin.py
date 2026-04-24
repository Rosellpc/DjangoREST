from django.contrib import admin

from .models import MyListItem, Profile, SubscriptionPlan, UserSubscription, WatchHistory

admin.site.register(SubscriptionPlan)
admin.site.register(UserSubscription)
admin.site.register(Profile)
admin.site.register(WatchHistory)
admin.site.register(MyListItem)
