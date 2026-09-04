"""Routes URL de l'application ticketing."""

from django.urls import path
from apps.ticketing.views import (
    TicketEventListCreateView,
    TicketEventDetailView,
    TicketCategoryListCreateView,
    TicketPurchaseView,
    TicketScanView,
    TicketDetailByCodeView,
    PublicEventListView,
    PublicEventDetailView,
)

urlpatterns = [
    # Événements billetterie (Admin / Organisateur)
    path('events/', TicketEventListCreateView.as_view(), name='ticketing-events-list-create'),
    path('events/<int:pk>/', TicketEventDetailView.as_view(), name='ticketing-event-detail'),
    path('events/<int:event_id>/categories/', TicketCategoryListCreateView.as_view(), name='ticketing-event-categories'),

    # Achat & Scan de billets
    path('tickets/purchase/', TicketPurchaseView.as_view(), name='ticketing-purchase'),
    path('tickets/scan/', TicketScanView.as_view(), name='ticketing-scan'),
    path('tickets/code/<str:ticket_code>/', TicketDetailByCodeView.as_view(), name='ticketing-by-code'),

    # APIs Publiques
    path('public/<int:club_id>/events/', PublicEventListView.as_view(), name='ticketing-public-events'),
    path('public/<int:club_id>/events/<slug:slug>/', PublicEventDetailView.as_view(), name='ticketing-public-event-detail'),
]
