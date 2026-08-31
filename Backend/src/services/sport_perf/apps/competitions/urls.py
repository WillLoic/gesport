from django.urls import path
from apps.competitions.views.match_view import MatchListCreateView, MatchDetailView, MatchCallupView, MatchStatsView

urlpatterns = [
    path('', MatchListCreateView.as_view(), name='competitions-list-create'),
    path('<int:pk>/', MatchDetailView.as_view(), name='competitions-detail'),
    path('<int:pk>/callup/', MatchCallupView.as_view(), name='competitions-callup'),
    path('<int:pk>/stats/', MatchStatsView.as_view(), name='competitions-stats'),
]
