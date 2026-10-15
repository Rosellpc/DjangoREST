from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from apps.subscriptions.serializers import UserSubscriptionSerializer


class AccountUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["id", "username", "first_name", "last_name", "email", "date_joined"]
        read_only_fields = fields


class AccountSerializer(serializers.Serializer):
    user = AccountUserSerializer(read_only=True)
    subscription = UserSubscriptionSerializer(read_only=True, allow_null=True)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = get_user_model()
        fields = ["id", "username", "email", "password"]
        extra_kwargs = {
            "email": {"required": False, "allow_blank": True},
        }

    def create(self, validated_data):
        return get_user_model().objects.create_user(**validated_data)
