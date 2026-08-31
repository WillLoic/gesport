"""Routes URL de l'application club."""

from django.urls import path
from apps.club.views.club_view import (
    ClubListCreateView,
    ClubDetailView,
    SeasonListCreateView,
    ClubMemberListView,
)

urlpatterns = [
    # GET/POST /api/v1/auth/clubs/
    path('', ClubListCreateView.as_view(), name='club-list-create'),

    # GET/PUT /api/v1/auth/clubs/<slug>/
    path('<slug:slug>/', ClubDetailView.as_view(), name='club-detail'),

    # GET/POST /api/v1/auth/clubs/<slug>/seasons/
    path('<slug:slug>/seasons/', SeasonListCreateView.as_view(), name='club-seasons'),

    # GET/POST/DELETE /api/v1/auth/clubs/<slug>/members/
    path('<slug:slug>/members/', ClubMemberListView.as_view(), name='club-members'),
]
