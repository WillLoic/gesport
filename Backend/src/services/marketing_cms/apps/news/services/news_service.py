"""Services (logique métier) pour l'application news."""

from django.utils import timezone
from apps.news.models.website import ClubWebsiteConfig
from apps.news.models.media import MediaItem
from apps.news.models.article import Article, ArticleCategory, ArticleTag


# ── ClubWebsiteConfig ──────────────────────────────────────────────

def create_or_update_website_config(*, club_id: int, **kwargs) -> ClubWebsiteConfig:
    config, _ = ClubWebsiteConfig.objects.update_or_create(
        club_id=club_id, defaults=kwargs
    )
    return config


# ── MediaItem ──────────────────────────────────────────────────────

def upload_media(*, club_id: int, title: str, media_type: str, file=None, **kwargs) -> MediaItem:
    media = MediaItem.objects.create(
        club_id=club_id, title=title, media_type=media_type, file=file, **kwargs
    )
    # Calculer la taille du fichier automatiquement si un fichier est fourni
    if file and hasattr(file, 'size'):
        media.file_size = file.size
        media.save(update_fields=['file_size'])
    return media


def delete_media(*, media_id: int) -> None:
    media = MediaItem.objects.get(pk=media_id)
    if media.file:
        media.file.delete(save=False)
    media.delete()


# ── Article ────────────────────────────────────────────────────────

def create_article(*, club_id: int, title: str, content: str, **kwargs) -> Article:
    return Article.objects.create(club_id=club_id, title=title, content=content, **kwargs)


def update_article(*, article_id: int, **kwargs) -> Article:
    Article.objects.filter(pk=article_id).update(**kwargs)
    return Article.objects.get(pk=article_id)


def publish_article(*, article_id: int) -> Article:
    article = Article.objects.get(pk=article_id)
    article.status = 'PUBLISHED'
    article.published_at = timezone.now()
    article.save(update_fields=['status', 'published_at'])
    return article


def archive_article(*, article_id: int) -> Article:
    article = Article.objects.get(pk=article_id)
    article.status = 'ARCHIVED'
    article.save(update_fields=['status'])
    return article


def delete_article(*, article_id: int) -> None:
    Article.objects.filter(pk=article_id).delete()


# ── Categories & Tags ─────────────────────────────────────────────

def create_category(*, club_id: int, name: str, **kwargs) -> ArticleCategory:
    return ArticleCategory.objects.create(club_id=club_id, name=name, **kwargs)


def create_tag(*, club_id: int, name: str) -> ArticleTag:
    tag, _ = ArticleTag.objects.get_or_create(club_id=club_id, name=name)
    return tag
