"""Vues API pour le catalogue (Catégories & Produits)."""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models.category import Category
from apps.catalog.models.product import Product
from apps.catalog.selectors.catalog_selector import (
    list_categories_by_club, get_category_by_id,
    list_products_by_club, list_published_products_by_club,
    get_product_by_id, get_product_by_slug,
)
from apps.catalog.serializers.catalog_serializer import CategorySerializer, ProductSerializer
from apps.catalog.services.catalog_service import (
    create_category, update_category, delete_category,
    create_product, update_product, delete_product,
)


class CategoryListCreateView(APIView):
    """GET : lister les catégories du club. POST : créer une catégorie."""
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        categories = list_categories_by_club(int(club_id))
        return Response(CategorySerializer(categories, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = CategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cat = create_category(**serializer.validated_data)
        return Response(CategorySerializer(cat).data, status=status.HTTP_201_CREATED)


class CategoryDetailView(APIView):
    """GET / PUT / DELETE une catégorie."""
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            cat = get_category_by_id(pk)
        except Category.DoesNotExist:
            return Response({"detail": "Catégorie introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CategorySerializer(cat).data)

    def put(self, request: Request, pk: int) -> Response:
        try:
            cat = update_category(category_id=pk, **request.data)
        except Category.DoesNotExist:
            return Response({"detail": "Catégorie introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(CategorySerializer(cat).data)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            delete_category(category_id=pk)
        except Category.DoesNotExist:
            return Response({"detail": "Catégorie introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProductListCreateView(APIView):
    """GET : lister tous les produits du club (Admin). POST : créer un produit."""
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        category_id = request.query_params.get('category_id')
        prod_status = request.query_params.get('status')
        products = list_products_by_club(
            int(club_id),
            category_id=int(category_id) if category_id else None,
            status=prod_status
        )
        return Response(ProductSerializer(products, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = ProductSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        prod = create_product(**serializer.validated_data)
        return Response(ProductSerializer(prod).data, status=status.HTTP_201_CREATED)


class ProductDetailView(APIView):
    """GET / PUT / DELETE un produit par ID."""
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            prod = get_product_by_id(pk)
        except Product.DoesNotExist:
            return Response({"detail": "Produit introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductSerializer(prod).data)

    def put(self, request: Request, pk: int) -> Response:
        try:
            prod = update_product(product_id=pk, **request.data)
        except Product.DoesNotExist:
            return Response({"detail": "Produit introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductSerializer(prod).data)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            delete_product(product_id=pk)
        except Product.DoesNotExist:
            return Response({"detail": "Produit introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PublicProductListView(APIView):
    """GET : boutique publique (produits publiés d'un club)."""
    permission_classes = [AllowAny]

    def get(self, request: Request, club_id: int) -> Response:
        category_id = request.query_params.get('category_id')
        products = list_published_products_by_club(
            int(club_id),
            category_id=int(category_id) if category_id else None
        )
        return Response(ProductSerializer(products, many=True).data)


class PublicProductDetailView(APIView):
    """GET : consultation publique d'un produit par slug."""
    permission_classes = [AllowAny]

    def get(self, request: Request, club_id: int, slug: str) -> Response:
        try:
            prod = get_product_by_slug(int(club_id), slug)
        except Product.DoesNotExist:
            return Response({"detail": "Produit introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductSerializer(prod).data)
