"""Vues API pour la gestion des variantes et des stocks."""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.inventory_variants.models.variant import ProductVariant
from apps.inventory_variants.selectors.inventory_selector import (
    list_variants_by_product, get_variant_by_id, list_low_stock_variants, list_stock_movements_by_variant,
)
from apps.inventory_variants.serializers.inventory_serializer import (
    ProductVariantSerializer, StockMovementSerializer, StockAdjustmentRequestSerializer,
)
from apps.inventory_variants.services.inventory_service import (
    create_variant, update_variant, delete_variant, adjust_stock,
)


class ProductVariantListCreateView(APIView):
    """GET : lister les variantes d'un produit. POST : ajouter une variante."""
    permission_classes = [AllowAny]

    def get(self, request: Request, product_id: int) -> Response:
        variants = list_variants_by_product(product_id)
        return Response(ProductVariantSerializer(variants, many=True).data)

    def post(self, request: Request, product_id: int) -> Response:
        data = request.data.copy()
        data['product_id'] = product_id
        serializer = ProductVariantSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        var = create_variant(**serializer.validated_data)
        return Response(ProductVariantSerializer(var).data, status=status.HTTP_201_CREATED)


class ProductVariantDetailView(APIView):
    """GET / PUT / DELETE une variante par ID."""
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            var = get_variant_by_id(pk)
        except ProductVariant.DoesNotExist:
            return Response({"detail": "Variante introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductVariantSerializer(var).data)

    def put(self, request: Request, pk: int) -> Response:
        try:
            var = update_variant(variant_id=pk, **request.data)
        except ProductVariant.DoesNotExist:
            return Response({"detail": "Variante introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ProductVariantSerializer(var).data)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            delete_variant(variant_id=pk)
        except ProductVariant.DoesNotExist:
            return Response({"detail": "Variante introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class StockAdjustmentView(APIView):
    """POST : ajuster le stock d'une variante (+/- quantité)."""
    permission_classes = [AllowAny]

    def post(self, request: Request, pk: int) -> Response:
        serializer = StockAdjustmentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            var = adjust_stock(
                variant_id=pk,
                quantity_change=serializer.validated_data['quantity_change'],
                movement_type=serializer.validated_data.get('movement_type'),
                reason=serializer.validated_data.get('reason', ''),
                author_id=serializer.validated_data.get('author_id')
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(ProductVariantSerializer(var).data)


class LowStockAlertView(APIView):
    """GET : liste des variantes en alerte stock bas pour un club."""
    permission_classes = [AllowAny]

    def get(self, request: Request, club_id: int) -> Response:
        low_stock_vars = list_low_stock_variants(club_id)
        return Response(ProductVariantSerializer(low_stock_vars, many=True).data)


class StockMovementsHistoryView(APIView):
    """GET : consulter l'historique des mouvements de stock d'une variante."""
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        movements = list_stock_movements_by_variant(pk)
        return Response(StockMovementSerializer(movements, many=True).data)
