from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.generics import GenericAPIView
from rest_framework_simplejwt.tokens import RefreshToken

from .auth_serializers import AccountSerializer, RegisterSerializer
from apps.subscriptions.models import UserSubscription


class AccountView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = AccountSerializer

    def get(self, request):
        subscription = UserSubscription.objects.select_related("plan").filter(user=request.user).first()
        data = self.get_serializer({"user": request.user, "subscription": subscription}).data
        response = Response(data)
        response["Cache-Control"] = "private, no-store"
        return response


class RegisterView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "user": {
                    "id": user.id,
                    "username": user.get_username(),
                    "email": user.email,
                },
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )
