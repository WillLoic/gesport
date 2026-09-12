"""Serializers DRF pour les paniers et commandes."""

from rest_framework import serializers
from apps.orders.models.cart import Cart, CartItem
from apps.orders.models.order import Order, OrderItem
from apps.inventory_variants.serializers.inventory_serializer import ProductVariantSerializer
from apps.custom_prints.serializers.custom_print_serializer import CustomPrintDetailSerializer


class CartItemSerializer(serializers.ModelSerializer):
    variant_details = ProductVariantSerializer(source='variant', read_only=True)
    print_detail_info = CustomPrintDetailSerializer(source='print_detail', read_only=True)
    unit_price = serializers.ReadOnlyField()
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = [
            'id', 'cart', 'variant', 'variant_details', 'quantity',
            'print_detail', 'print_detail_info', 'unit_price', 'subtotal', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id', 'session_id', 'user_id', 'club_id', 'items', 'total_price', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    print_detail_info = CustomPrintDetailSerializer(source='print_detail', read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            'id', 'order', 'variant', 'product_name', 'variant_sku',
            'unit_price', 'quantity', 'total_price', 'print_detail', 'print_detail_info'
        ]
        read_only_fields = ['id']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'club_id', 'user_id', 'customer_name',
            'customer_email', 'customer_phone', 'shipping_address', 'status',
            'subtotal', 'shipping_cost', 'total_price', 'currency', 'items',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'order_number', 'status', 'subtotal', 'shipping_cost',
            'total_price', 'currency', 'created_at', 'updated_at'
        ]


class AddToCartRequestSerializer(serializers.Serializer):
    variant_id = serializers.IntegerField()
    quantity = serializers.IntegerField(default=1)
    custom_print = serializers.JSONField(required=False, default=dict)


class CheckoutRequestSerializer(serializers.Serializer):
    session_id = serializers.CharField(max_length=100)
    club_id = serializers.IntegerField()
    customer_name = serializers.CharField(max_length=255)
    customer_email = serializers.EmailField()
    customer_phone = serializers.CharField(max_length=50, required=False, allow_blank=True, default="")
    shipping_address = serializers.CharField()
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)
