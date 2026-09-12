"""Serializers DRF pour les variantes et mouvements de stock."""

from rest_framework import serializers
from apps.inventory_variants.models.variant import ProductVariant
from apps.inventory_variants.models.stock_movement import StockMovement


class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    price = serializers.ReadOnlyField()
    is_in_stock = serializers.ReadOnlyField()

    class Meta:
        model = ProductVariant
        fields = [
            'id', 'product', 'product_name', 'size', 'color', 'sku',
            'price_override', 'price', 'stock_quantity', 'reorder_threshold',
            'is_in_stock', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'stock_quantity', 'price', 'is_in_stock', 'created_at', 'updated_at']


class StockMovementSerializer(serializers.ModelSerializer):
    variant_sku = serializers.ReadOnlyField(source='variant.sku')

    class Meta:
        model = StockMovement
        fields = [
            'id', 'variant', 'variant_sku', 'quantity', 'movement_type',
            'reason', 'author_id', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class StockAdjustmentRequestSerializer(serializers.Serializer):
    quantity_change = serializers.IntegerField(help_text="Incrément (+10) ou décrément (-3)")
    movement_type = serializers.ChoiceField(choices=StockMovement.MovementType.choices, default=StockMovement.MovementType.ADJUSTMENT)
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    author_id = serializers.IntegerField(required=False, allow_null=True)
