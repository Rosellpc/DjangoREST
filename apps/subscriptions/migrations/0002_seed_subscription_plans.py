from django.db import migrations


def seed_plans(apps, schema_editor):
    SubscriptionPlan = apps.get_model("subscriptions", "SubscriptionPlan")
    plans = [
        {
            "code": "basic",
            "name": "Basic",
            "monthly_price": "9.99",
            "max_profiles": 2,
            "max_concurrent_streams": 1,
        },
        {
            "code": "standard",
            "name": "Standard",
            "monthly_price": "15.49",
            "max_profiles": 4,
            "max_concurrent_streams": 2,
        },
        {
            "code": "premium",
            "name": "Premium",
            "monthly_price": "19.99",
            "max_profiles": 5,
            "max_concurrent_streams": 4,
        },
    ]

    for plan in plans:
        SubscriptionPlan.objects.update_or_create(
            code=plan["code"],
            defaults={**plan, "is_active": True},
        )


def remove_seeded_plans(apps, schema_editor):
    SubscriptionPlan = apps.get_model("subscriptions", "SubscriptionPlan")
    SubscriptionPlan.objects.filter(code__in=["basic", "standard", "premium"]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("subscriptions", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_plans, remove_seeded_plans),
    ]
