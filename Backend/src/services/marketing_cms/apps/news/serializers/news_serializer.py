"""Serializers pour l'application news."""

from rest_framework import serializers
from apps.news.models.website import ClubWebsiteConfig
from apps.news.models.media import MediaItem
from apps.news.models.article import ArticleCategory, ArticleTag, Article


class ClubWebsiteConfigSerializer(serializers.ModelSerializer):
    full_url = serializers.SerializerMethodField()

    class Meta:
        model = ClubWebsiteConfig
        fields = [
            'id', 'club_id', 'club_name', 'subdomain', 'full_url',
            'logo_url', 'banner_url', 'primary_color', 'secondary_color',
            'meta_title', 'meta_description',
            'facebook_url', 'instagram_url', 'twitter_url', 'youtube_url',
            'is_published', 'created_at', 'updated_at',
        ]

    def get_full_url(self, obj) -> str:
        return f"https://{obj.subdomain}.gesport.com"


class MediaItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaItem
        fields = [
            'id', 'club_id', 'title', 'media_type', 'file', 'file_url',
            'file_size', 'mime_type', 'category', 'alt_text',
            'uploaded_by_id', 'created_at',
        ]


class ArticleCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleCategory
        fields = ['id', 'club_id', 'name', 'slug']


class ArticleTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArticleTag
        fields = ['id', 'club_id', 'name']


class ArticleSerializer(serializers.ModelSerializer):
    category_detail = ArticleCategorySerializer(source='category', read_only=True)
    tags_detail = ArticleTagSerializer(source='tags', many=True, read_only=True)

    class Meta:
        model = Article
        fields = [
            'id', 'club_id', 'title', 'slug', 'summary', 'content',
            'cover_image_url', 'category', 'category_detail',
            'tags', 'tags_detail', 'status', 'published_at',
            'views_count', 'author_id', 'created_at', 'updated_at',
        ]
