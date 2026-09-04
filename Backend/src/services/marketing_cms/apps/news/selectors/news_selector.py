"""Selectors (requêtes ORM) pour l'application news."""

from django.db.models import QuerySet, F
from apps.news.models.website import ClubWebsiteConfig
from apps.news.models.media import MediaItem
from apps.news.models.article import Article, ArticleCategory, ArticleTag


# ── ClubWebsiteConfig ──────────────────────────────────────────────

def get_website_config_by_club(club_id: int) -> ClubWebsiteConfig:
    return ClubWebsiteConfig.objects.get(club_id=club_id)


def get_website_config_by_subdomain(subdomain: str) -> ClubWebsiteConfig:
    return ClubWebsiteConfig.objects.get(subdomain=subdomain, is_published=True)


# ── MediaItem ──────────────────────────────────────────────────────

def list_media_by_club(club_id: int, media_type: str | None = None) -> QuerySet:
    qs = MediaItem.objects.filter(club_id=club_id)
    if media_type:
        qs = qs.filter(media_type=media_type)
    return qs


def get_media_by_id(media_id: int) -> MediaItem:
    return MediaItem.objects.get(pk=media_id)


# ── Article ────────────────────────────────────────────────────────

def list_articles_by_club(club_id: int, status: str | None = None) -> QuerySet:
    qs = Article.objects.filter(club_id=club_id).select_related('category').prefetch_related('tags')
    if status:
        qs = qs.filter(status=status)
    return qs


def list_published_articles_by_club(club_id: int) -> QuerySet:
    return list_articles_by_club(club_id, status='PUBLISHED')


def get_article_by_id(article_id: int) -> Article:
    return Article.objects.select_related('category').prefetch_related('tags').get(pk=article_id)


def get_article_by_slug(club_id: int, slug: str) -> Article:
    return Article.objects.select_related('category').prefetch_related('tags').get(club_id=club_id, slug=slug)


def increment_article_views(article_id: int) -> None:
    Article.objects.filter(pk=article_id).update(views_count=F('views_count') + 1)


# ── Categories & Tags ─────────────────────────────────────────────

def list_categories_by_club(club_id: int) -> QuerySet:
    return ArticleCategory.objects.filter(club_id=club_id)


def list_tags_by_club(club_id: int) -> QuerySet:
    return ArticleTag.objects.filter(club_id=club_id)
