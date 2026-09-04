"""Vues API pour l'application news (Site web, articles, médiathèque)."""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.news.selectors.news_selector import (
    get_website_config_by_club, get_website_config_by_subdomain,
    list_media_by_club, get_media_by_id,
    list_articles_by_club, list_published_articles_by_club,
    get_article_by_id, get_article_by_slug, increment_article_views,
    list_categories_by_club, list_tags_by_club,
)
from apps.news.serializers.news_serializer import (
    ClubWebsiteConfigSerializer, MediaItemSerializer,
    ArticleSerializer, ArticleCategorySerializer, ArticleTagSerializer,
)
from apps.news.services.news_service import (
    create_or_update_website_config, upload_media, delete_media,
    create_article, update_article, publish_article, archive_article, delete_article,
    create_category, create_tag,
)


# ── Site Web Vitrine ───────────────────────────────────────────────

class WebsiteConfigView(APIView):
    """GET / PUT : configuration du site web du club."""
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        try:
            config = get_website_config_by_club(int(club_id))
        except Exception:
            return Response({"detail": "Configuration du site introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ClubWebsiteConfigSerializer(config).data)

    def put(self, request: Request) -> Response:
        club_id = request.data.get('club_id')
        if not club_id:
            return Response({"detail": "club_id requis."}, status=status.HTTP_400_BAD_REQUEST)
        config = create_or_update_website_config(club_id=int(club_id), **{
            k: v for k, v in request.data.items() if k != 'club_id'
        })
        return Response(ClubWebsiteConfigSerializer(config).data)


class WebsitePublicView(APIView):
    """GET : récupérer la config d'un site publié par sous-domaine (accès public)."""
    permission_classes = [AllowAny]

    def get(self, request: Request, subdomain: str) -> Response:
        try:
            config = get_website_config_by_subdomain(subdomain)
        except Exception:
            return Response({"detail": "Site introuvable ou non publié."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ClubWebsiteConfigSerializer(config).data)


# ── Médiathèque ────────────────────────────────────────────────────

class MediaListCreateView(APIView):
    """GET : lister les médias du club. POST : uploader un fichier."""
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        media_type = request.query_params.get('media_type')
        media = list_media_by_club(int(club_id), media_type=media_type)
        return Response(MediaItemSerializer(media, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = MediaItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        media = upload_media(**serializer.validated_data)
        return Response(MediaItemSerializer(media).data, status=status.HTTP_201_CREATED)


class MediaDetailView(APIView):
    """GET / DELETE un média par ID."""
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            media = get_media_by_id(pk)
        except Exception:
            return Response({"detail": "Média introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(MediaItemSerializer(media).data)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            delete_media(media_id=pk)
        except Exception:
            return Response({"detail": "Média introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Articles ───────────────────────────────────────────────────────

class ArticleListCreateView(APIView):
    """GET : lister les articles d'un club. POST : créer un article."""
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        article_status = request.query_params.get('status')
        articles = list_articles_by_club(int(club_id), status=article_status)
        return Response(ArticleSerializer(articles, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = ArticleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        article = create_article(**serializer.validated_data)
        return Response(ArticleSerializer(article).data, status=status.HTTP_201_CREATED)


class ArticleDetailView(APIView):
    """GET / PUT / DELETE un article par ID."""
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            article = get_article_by_id(pk)
            increment_article_views(pk)
        except Exception:
            return Response({"detail": "Article introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ArticleSerializer(article).data)

    def put(self, request: Request, pk: int) -> Response:
        try:
            article = update_article(article_id=pk, **request.data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ArticleSerializer(article).data)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            delete_article(article_id=pk)
        except Exception:
            return Response({"detail": "Article introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class ArticlePublishView(APIView):
    """POST : publier un article (passer de DRAFT à PUBLISHED)."""
    permission_classes = [AllowAny]

    def post(self, request: Request, pk: int) -> Response:
        try:
            article = publish_article(article_id=pk)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ArticleSerializer(article).data)


class ArticleArchiveView(APIView):
    """POST : archiver un article."""
    permission_classes = [AllowAny]

    def post(self, request: Request, pk: int) -> Response:
        try:
            article = archive_article(article_id=pk)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(ArticleSerializer(article).data)


class ArticlePublicView(APIView):
    """GET : accès public à un article par slug (site vitrine)."""
    permission_classes = [AllowAny]

    def get(self, request: Request, club_id: int, slug: str) -> Response:
        try:
            article = get_article_by_slug(club_id, slug)
            increment_article_views(article.id)
        except Exception:
            return Response({"detail": "Article introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ArticleSerializer(article).data)


class PublishedArticlesPublicView(APIView):
    """GET : liste publique des articles publiés d'un club."""
    permission_classes = [AllowAny]

    def get(self, request: Request, club_id: int) -> Response:
        articles = list_published_articles_by_club(int(club_id))
        return Response(ArticleSerializer(articles, many=True).data)


# ── Catégories & Tags ──────────────────────────────────────────────

class CategoryListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        return Response(ArticleCategorySerializer(list_categories_by_club(int(club_id)), many=True).data)

    def post(self, request: Request) -> Response:
        serializer = ArticleCategorySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cat = create_category(**serializer.validated_data)
        return Response(ArticleCategorySerializer(cat).data, status=status.HTTP_201_CREATED)


class TagListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        return Response(ArticleTagSerializer(list_tags_by_club(int(club_id)), many=True).data)

    def post(self, request: Request) -> Response:
        serializer = ArticleTagSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tag = create_tag(**serializer.validated_data)
        return Response(ArticleTagSerializer(tag).data, status=status.HTTP_201_CREATED)
