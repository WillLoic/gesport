"""Services métier pour l'achat de billets et le contrôle d'accès (Scan QR Code)."""

import logging
from django.db import transaction
from django.db.models import F
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.ticketing.models.event import TicketEvent
from apps.ticketing.models.category import TicketCategory
from apps.ticketing.models.ticket import Ticket
from apps.ticketing.services.qrcode_service import generate_qr_code_payload

logger = logging.getLogger(__name__)


def purchase_ticket(
    event_id: int,
    category_id: int,
    buyer_name: str,
    buyer_email: str,
    buyer_phone: str = ""
) -> Ticket:
    """Réserve et génère un billet individuel pour un événement.
    
    Gestion atomique du quota de places vendues.
    """
    with transaction.atomic():
        try:
            event = TicketEvent.objects.get(pk=event_id)
        except TicketEvent.DoesNotExist:
            raise ValidationError("L'événement spécifié n'existe pas.")

        if event.status != TicketEvent.Status.OPEN:
            raise ValidationError("La billetterie pour cet événement n'est pas ouverte.")

        try:
            category = TicketCategory.objects.select_for_update().get(pk=category_id, event=event)
        except TicketCategory.DoesNotExist:
            raise ValidationError("Catégorie de billet introuvable pour cet événement.")

        if not category.is_active:
            raise ValidationError("Cette catégorie de billet n'est plus active.")

        if category.sold_count >= category.total_capacity:
            raise ValidationError("Cette catégorie de billet est complète (épuisée).")

        # Décrémentation atomique / Incrémentation du compteur vendus
        TicketCategory.objects.filter(pk=category_id).update(sold_count=F('sold_count') + 1)
        category.refresh_from_db()

        ticket = Ticket.objects.create(
            event=event,
            category=category,
            buyer_name=buyer_name,
            buyer_email=buyer_email,
            buyer_phone=buyer_phone,
            price_paid=category.price,
            status=Ticket.Status.VALID
        )

        # Génération du QR Code Payload
        ticket.qr_code_data = generate_qr_code_payload(ticket.ticket_code, event.id, buyer_name)
        ticket.save(update_fields=['qr_code_data'])

        logger.info(f"Billet #{ticket.ticket_code} acheté avec succès par {buyer_name} pour l'événement '{event.title}'.")
        return ticket


def validate_ticket_scan(ticket_code: str, checked_in_by_id: int = None) -> dict:
    """Valide et enregistre le passage au portique lors du scan d'un QR code de billet."""
    try:
        ticket = Ticket.objects.select_related('event', 'category').get(ticket_code=ticket_code)
    except Ticket.DoesNotExist:
        return {
            "valid": False,
            "status": "NOT_FOUND",
            "message": "Billet introuvable / Code QR invalide."
        }

    if ticket.status == Ticket.Status.USED:
        return {
            "valid": False,
            "status": "ALREADY_USED",
            "message": f"Billet DÉJÀ UTILISÉ le {ticket.checked_in_at.strftime('%d/%m/%Y à %H:%M') if ticket.checked_in_at else 'auparavant'}.",
            "ticket": ticket
        }

    if ticket.status == Ticket.Status.CANCELLED:
        return {
            "valid": False,
            "status": "CANCELLED",
            "message": "Billet ANNULÉ / REMBOURSÉ. Accès refusé.",
            "ticket": ticket
        }

    # Billet valide -> enregistrement de l'entrée
    ticket.status = Ticket.Status.USED
    ticket.checked_in_at = timezone.now()
    ticket.checked_in_by_id = checked_in_by_id
    ticket.save(update_fields=['status', 'checked_in_at', 'checked_in_by_id'])

    logger.info(f"Billet #{ticket_code} scanné et validé à l'entrée avec succès.")
    return {
        "valid": True,
        "status": "SUCCESS",
        "message": f"Entrée validée ! Bienvenue {ticket.buyer_name} ({ticket.category.name}).",
        "ticket": ticket
    }
