"""Routes URL pour le catalogue produits et catégories."""

from django.urls import path
from apps.catalog.views import (
    CategoryListCreateView,
    CategoryDetailView,
    ProductListCreateView,
    ProductDetailView,
    PublicProductListView,
    PublicProductDetailView,
)

urlpatterns = [
    # Catégories (Admin)
    path('categories/', CategoryListCreateView.as_view(), name='catalog-categories-list-create'),
    path('categories/<int:pk>/', CategoryDetailView.as_view(), name='catalog-category-detail'),

    # Produits (Admin)
    path('products/', ProductListCreateView.as_view(), name='catalog-products-list-create'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='catalog-product-detail'),

    # Produits publics (Boutique vitrine client)
    path('public/<int:club_id>/products/', PublicProductListView.as_view(), name='catalog-public-products'),
    path('public/<int:club_id>/products/<slug:slug>/', PublicProductDetailView.as_view(), name='catalog-public-product-detail'),
]
