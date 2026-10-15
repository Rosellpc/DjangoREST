from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .filters import FilmFilter
from .models import Film
from .pagination import CatalogPagination
from .serializers import FilmSerializer


class MovieCatalogViewSet(viewsets.ReadOnlyModelViewSet):
    pagination_class = CatalogPagination
    queryset = Film.objects.all()
    serializer_class = FilmSerializer
    permission_classes = [AllowAny]
    filterset_class = FilmFilter
    search_fields = ["title", "description"]
    ordering_fields = ["film_id", "title", "release_year", "length", "rating"]
    ordering = ["film_id"]
