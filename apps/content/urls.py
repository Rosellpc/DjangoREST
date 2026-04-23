from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MovieCatalogViewSet

# Creamos el router y registramos nuestro ViewSet
router = DefaultRouter()
router.register(r"movies", MovieCatalogViewSet, basename="movies")

urlpatterns = [
    path("", include(router.urls)),
]
