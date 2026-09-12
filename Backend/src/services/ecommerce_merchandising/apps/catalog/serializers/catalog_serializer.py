"""Serializers DRF pour les catégories et produits du catalogue."""

from rest_framework import serializers
from apps.catalog.models.category import Category
from apps.catalog.models.product import Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            'id', 'club_id', 'name', 'slug', 'description', 'image_url',
            'parent', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'club_id', 'name', 'slug', 'description', 'base_price',
            'currency', 'main_image_url', 'images_gallery', 'category',
            'category_details', 'status', 'is_customizable', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
