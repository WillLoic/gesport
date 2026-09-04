"""Selectors de données pour l'application ticketing."""

from apps.ticketing.models.event import TicketEvent
from apps.ticketing.models.category import TicketCategory
from apps.ticketing.models.ticket import Ticket


def list_events_by_club(club_id: int, status: str = None):
    """Liste les événements de billetterie d'un club."""
    qs = TicketEvent.objects.filter(club_id=club_id)
    if status:
        qs = qs.filter(status=status)
    return qs.prefetch_related('categories')


def list_public_open_events_by_club(club_id: int):
    """Liste publique des événements dont la billetterie est OUVERTE."""
    return TicketEvent.objects.filter(
        club_id=club_id,
        status=TicketEvent.Status.OPEN
    ).prefetch_related('categories')


def get_event_by_id(event_id: int) -> TicketEvent:
    """Récupère un événement par ID."""
    return TicketEvent.objects.prefetch_related('categories').get(pk=event_id)


def get_event_by_slug(club_id: int, slug: str) -> TicketEvent:
    """Récupère un événement par slug et club_id."""
    return TicketEvent.objects.prefetch_related('categories').get(club_id=club_id, slug=slug)


def list_categories_by_event(event_id: int):
    """Liste les catégories de billets pour un événement."""
    return TicketCategory.objects.filter(event_id=event_id, is_active=True)


def list_tickets_by_event(event_id: int):
    """Liste les billets émis pour un événement."""
    return Ticket.objects.filter(event_id=event_id).select_related('category')


def get_ticket_by_code(ticket_code: str) -> Ticket:
    """Récupère un billet par son code unique."""
    return Ticket.objects.select_related('event', 'category').get(ticket_code=ticket_code)
