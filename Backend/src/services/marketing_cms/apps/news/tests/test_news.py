"""Tests unitaires pour l'application news (Site vitrine, Articles, Médiathèque)."""

from django.test import TestCase
from apps.news.models import MediaItem
from apps.news.services.news_service import (
    create_or_update_website_config,
    create_article,
    publish_article,
    archive_article,
    create_category,
    create_tag,
)
from apps.news.selectors.news_selector import (
    get_website_config_by_club,
    get_website_config_by_subdomain,
    get_article_by_slug,
    list_published_articles_by_club,
    increment_article_views,
)


class NewsTestCase(TestCase):
    def setUp(self):
        self.config = create_or_update_website_config(
            club_id=1,
            club_name="FC Paris Stars",
            subdomain="paris-stars",
            is_published=True
        )
        self.category = create_category(club_id=1, name="Actualités Equipe Premier")
        self.tag = create_tag(club_id=1, name="Match")
        self.article = create_article(
            club_id=1,
            title="Victoire éclatante en finale",
            content="<p>Le FC Paris Stars s'impose 3-0.</p>",
            category=self.category,
            author_id=42
        )

    def test_website_config_creation(self):
        conf = get_website_config_by_club(1)
        self.assertEqual(conf.club_name, "FC Paris Stars")
        self.assertEqual(conf.subdomain, "paris-stars")
        
        conf_sub = get_website_config_by_subdomain("paris-stars")
        self.assertEqual(conf_sub.club_id, 1)

    def test_article_workflow(self):
        self.assertEqual(self.article.status, "DRAFT")
        self.assertIsNone(self.article.published_at)

        # Publication de l'article
        pub_article = publish_article(article_id=self.article.id)
        self.assertEqual(pub_article.status, "PUBLISHED")
        self.assertIsNotNone(pub_article.published_at)

        # Récupération publique
        published_list = list_published_articles_by_club(1)
        self.assertEqual(len(published_list), 1)

        fetched_article = get_article_by_slug(1, pub_article.slug)
        self.assertEqual(fetched_article.id, pub_article.id)

        # Incrémentation des vues
        increment_article_views(pub_article.id)
        fetched_article.refresh_from_db()
        self.assertEqual(fetched_article.views_count, 1)

        # Archivage
        arch_article = archive_article(article_id=pub_article.id)
        self.assertEqual(arch_article.status, "ARCHIVED")

    def test_media_item_creation(self):
        media = MediaItem.objects.create(
            club_id=1,
            title="Photo de l'équipe",
            media_type="IMAGE",
            file_url="https://cdn.gesport.com/media/team.jpg",
            category="Photos"
        )
        self.assertEqual(media.title, "Photo de l'équipe")
        self.assertEqual(media.media_type, "IMAGE")
