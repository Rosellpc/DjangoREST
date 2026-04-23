import django_filters

from .models import Film


class FilmFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(
        field_name="filmcategory__category__name", lookup_expr="icontains"
    )

    class Meta:
        model = Film
        fields = ["release_year", "rating", "category"]
