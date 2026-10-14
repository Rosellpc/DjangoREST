from django.contrib.auth.hashers import make_password
from django.db import migrations, models


def hash_existing_pins(apps, schema_editor):
    Profile = apps.get_model("subscriptions", "Profile")
    for profile in Profile.objects.using(schema_editor.connection.alias).exclude(pin_code="").iterator():
        if len(profile.pin_code) == 4 and profile.pin_code.isdigit():
            profile.pin_code = make_password(profile.pin_code)
            profile.save(update_fields=["pin_code"])


class Migration(migrations.Migration):
    dependencies = [("subscriptions", "0004_subscription_billing_metadata")]
    operations = [
        migrations.AlterField(model_name="profile", name="pin_code",
                              field=models.CharField(max_length=128, blank=True)),
        migrations.RunPython(hash_existing_pins, migrations.RunPython.noop),
    ]
