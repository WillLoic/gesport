"""Vues API pour la billetterie, gestion des événements, achat et contrôle d'accès (Scan)."""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ticketing.models.event import TicketEvent
from apps.ticketing.models.category import TicketCategory
from apps.ticketing.models.ticket import Ticket
from apps.ticketing.selectors.ticketing_selector import (
    list_events_by_club, list_public_open_events_by_club,
    get_event_by_id, get_event_by_slug,
    list_categories_by_event, list_tickets_by_event, get_ticket_by_code,
)
from apps.ticketing.serializers.ticketing_serializer import (
    TicketEventSerializer, TicketCategorySerializer, TicketSerializer,
    TicketPurchaseRequestSerializer, TicketScanRequestSerializer,
)
from apps.ticketing.services.ticketing_service import purchase_ticket, validate_ticket_scan


# ── Gestion Événements (Admin / Staff) ───────────────────────────────

class TicketEventListCreateView(APIView):
    """GET : lister les événements d'un club. POST : créer un événement."""
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        event_status = request.query_params.get('status')
        events = list_events_by_club(int(club_id), status=event_status)
        return Response(TicketEventSerializer(events, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = TicketEventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = serializer.save()
        return Response(TicketEventSerializer(event).data, status=status.HTTP_201_CREATED)


class TicketEventDetailView(APIView):
    """GET / PUT / DELETE un événement billetterie."""
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            event = get_event_by_id(pk)
        except TicketEvent.DoesNotExist:
            return Response({"detail": "Événement introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(TicketEventSerializer(event).data)

    def put(self, request: Request, pk: int) -> Response:
        try:
            event = get_event_by_id(pk)
        except TicketEvent.DoesNotExist:
            return Response({"detail": "Événement introuvable."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TicketEventSerializer(event, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(TicketEventSerializer(updated).data)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            event = get_event_by_id(pk)
            event.delete()
        except TicketEvent.DoesNotExist:
            return Response({"detail": "Événement introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Categories de billets ──────────────────────────────────────────

class TicketCategoryListCreateView(APIView):
    """GET : lister les catégories d'un événement. POST : créer une catégorie."""
    permission_classes = [AllowAny]

    def get(self, request: Request, event_id: int) -> Response:
        categories = list_categories_by_event(event_id)
        return Response(TicketCategorySerializer(categories, many=True).data)

    def post(self, request: Request, event_id: int) -> Response:
        try:
            event = get_event_by_id(event_id)
        except TicketEvent.DoesNotExist:
            return Response({"detail": "Événement introuvable."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        data['event'] = event.id
        serializer = TicketCategorySerializer(data=data)
        serializer.is_valid(raise_exception=True)
        cat = serializer.save()
        return Response(TicketCategorySerializer(cat).data, status=status.HTTP_201_CREATED)


# ── Achat et Scan de Billets ───────────────────────────────────────

class TicketPurchaseView(APIView):
    """POST : acheter / réserver un billet."""
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = TicketPurchaseRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            ticket = purchase_ticket(**serializer.validated_data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(TicketSerializer(ticket).data, status=status.HTTP_201_CREATED)


class TicketScanView(APIView):
    """POST : valider le scan d'un QR code de billet à l'entrée."""
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = TicketScanRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        res = validate_ticket_scan(
            ticket_code=serializer.validated_data['ticket_code'],
            checked_in_by_id=serializer.validated_data.get('checked_in_by_id')
        )

        ticket_obj = res.get('ticket')
        response_data = {
            "valid": res["valid"],
            "status": res["status"],
            "message": res["message"],
        }
        if ticket_obj:
            response_data["ticket"] = TicketSerializer(ticket_obj).data

        status_code = status.HTTP_200_OK if res["valid"] else status.HTTP_400_BAD_REQUEST
        return Response(response_data, status=status_code)


class TicketDetailByCodeView(APIView):
    """GET : consulter un billet par son code unique."""
    permission_classes = [AllowAny]

    def get(self, request: Request, ticket_code: str) -> Response:
        try:
            ticket = get_ticket_by_code(ticket_code)
        except Ticket.DoesNotExist:
            return Response({"detail": "Billet introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(TicketSerializer(ticket).data)


# ── Vues Publiques (Vitrine / Billetterie Client) ──────────────────

class PublicEventListView(APIView):
    """GET : liste des événements ouverts à la billetterie pour un club."""
    permission_classes = [AllowAny]

    def get(self, request: Request, club_id: int) -> Response:
        events = list_public_open_events_by_club(int(club_id))
        return Response(TicketEventSerializer(events, many=True).data)


class PublicEventDetailView(APIView):
    """GET : détail d'un événement ouvert par slug."""
    permission_classes = [AllowAny]

    def get(self, request: Request, club_id: int, slug: str) -> Response:
        try:
            event = get_event_by_slug(int(club_id), slug)
        except TicketEvent.DoesNotExist:
            return Response({"detail": "Événement introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(TicketEventSerializer(event).data)
