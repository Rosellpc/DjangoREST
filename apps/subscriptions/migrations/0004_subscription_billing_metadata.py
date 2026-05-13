from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("subscriptions", "0003_profile_preferences"),
    ]

    operations = [
        migrations.AddField(
            model_name="usersubscription",
            name="payment_provider",
            field=models.CharField(blank=True, max_length=40),
        ),
        migrations.AddField(
            model_name="usersubscription",
            name="payment_brand",
            field=models.CharField(blank=True, max_length=30),
        ),
        migrations.AddField(
            model_name="usersubscription",
            name="payment_last4",
            field=models.CharField(blank=True, max_length=4),
        ),
        migrations.AddField(
            model_name="usersubscription",
            name="billing_email",
            field=models.EmailField(blank=True, max_length=254),
        ),
    ]
