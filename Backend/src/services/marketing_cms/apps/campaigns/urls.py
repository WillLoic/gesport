"""Routes URL de l'application campaigns."""

from django.urls import path
from apps.campaigns.views import (
    AudienceSegmentListCreateView,
    AudienceSegmentDetailView,
    CampaignListCreateView,
    CampaignDetailView,
    CampaignDispatchView,
    CampaignStatsView,
)

urlpatterns = [
    # Segments d'audience
    path('segments/', AudienceSegmentListCreateView.as_view(), name='campaign-segments-list-create'),
    path('segments/<int:pk>/', AudienceSegmentDetailView.as_view(), name='campaign-segment-detail'),

    # Campagnes
    path('', CampaignListCreateView.as_view(), name='campaigns-list-create'),
    path('<int:pk>/', CampaignDetailView.as_view(), name='campaign-detail'),
    path('<int:pk>/dispatch/', CampaignDispatchView.as_view(), name='campaign-dispatch'),
    path('<int:pk>/stats/', CampaignStatsView.as_view(), name='campaign-stats'),
]
