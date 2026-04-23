from django.urls import resolve, reverse

from .filters import FilmFilter
from .views import MovieCatalogViewSet


def test_movies_list_url_is_registered():
    assert reverse("movies-list") == "/api/movies/"


def test_movies_url_resolves_to_movie_catalog_viewset():
    match = resolve("/api/movies/")
    assert match.func.cls is MovieCatalogViewSet


def test_category_filter_uses_expected_related_lookup():
    assert FilmFilter.base_filters["category"].field_name == "filmcategory__category__name"


def test_movie_catalog_viewset_enables_search_and_ordering():
    assert MovieCatalogViewSet.search_fields == ["title", "description"]
    assert MovieCatalogViewSet.ordering_fields == [
        "film_id",
        "title",
        "release_year",
        "length",
        "rating",
    ]
    assert MovieCatalogViewSet.ordering == ["film_id"]


def test_docs_urls_are_registered():
    assert reverse("schema") == "/api/schema/"
    assert reverse("swagger-ui") == "/api/docs/"


def test_jwt_urls_are_registered():
    assert reverse("token_obtain_pair") == "/api/token/"
    assert reverse("token_refresh") == "/api/token/refresh/"
    assert reverse("token_verify") == "/api/token/verify/"
    assert reverse("token_blacklist") == "/api/token/blacklist/"
