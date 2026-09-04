"""Routes URL de l'application news."""

from django.urls import path
from apps.news.views.news_view import (
    WebsiteConfigView, WebsitePublicView,
    MediaListCreateView, MediaDetailView,
    ArticleListCreateView, ArticleDetailView,
    ArticlePublishView, ArticleArchiveView,
    ArticlePublicView, PublishedArticlesPublicView,
    CategoryListCreateView, TagListCreateView,
)
    
urlpatterns = [
    # Site web vitrine
    path('website/', WebsiteConfigView.as_view(), name='news-website-config'),
    path('website/public/<slug:subdomain>/', WebsitePublicView.as_view(), name='news-website-public'),

    # Médiathèque
    path('media/', MediaListCreateView.as_view(), name='news-media-list-create'),
    path('media/<int:pk>/', MediaDetailView.as_view(), name='news-media-detail'),

    # Articles (administration)
    path('articles/', ArticleListCreateView.as_view(), name='news-articles-list-create'),
    path('articles/<int:pk>/', ArticleDetailView.as_view(), name='news-articles-detail'),
    path('articles/<int:pk>/publish/', ArticlePublishView.as_view(), name='news-articles-publish'),
    path('articles/<int:pk>/archive/', ArticleArchiveView.as_view(), name='news-articles-archive'),

    # Articles (accès public par club)
    path('public/<int:club_id>/articles/', PublishedArticlesPublicView.as_view(), name='news-public-articles'),
    path('public/<int:club_id>/articles/<slug:slug>/', ArticlePublicView.as_view(), name='news-public-article-detail'),

    # Catégories & Tags
    path('categories/', CategoryListCreateView.as_view(), name='news-categories-list-create'),
    path('tags/', TagListCreateView.as_view(), name='news-tags-list-create'),
]
