from django.urls import path
from apps.teams.views.team_view import TeamListCreateView, TeamDetailView, TeamPlayersManageView

urlpatterns = [
    path('', TeamListCreateView.as_view(), name='teams-list-create'),
    path('<int:pk>/', TeamDetailView.as_view(), name='teams-detail'),
    path('<int:pk>/players/', TeamPlayersManageView.as_view(), name='teams-players'),
]
