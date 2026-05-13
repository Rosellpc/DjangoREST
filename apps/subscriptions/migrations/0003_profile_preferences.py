from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("subscriptions", "0002_seed_subscription_plans"),
    ]

    operations = [
        migrations.AddField(
            model_name="profile",
            name="maturity_rating",
            field=models.CharField(
                choices=[
                    ("G", "All Ages"),
                    ("PG", "PG"),
                    ("PG-13", "PG-13"),
                    ("R", "R"),
                    ("NC-17", "NC-17"),
                ],
                default="NC-17",
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name="profile",
            name="language",
            field=models.CharField(default="en", max_length=10),
        ),
        migrations.AddField(
            model_name="profile",
            name="autoplay_next_episode",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="profile",
            name="autoplay_previews",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="profile",
            name="has_pin",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="profile",
            name="pin_code",
            field=models.CharField(blank=True, max_length=4),
        ),
        migrations.AddField(
            model_name="profile",
            name="game_handle",
            field=models.CharField(blank=True, max_length=16),
        ),
    ]
