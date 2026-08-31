"""Views pour l'application club."""

from django.core.exceptions import ValidationError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

# pyrefly: ignore [missing-import]
from apps.club.selectors.club_selector import (
    get_club_by_slug, list_all_clubs, list_user_clubs,
    list_club_seasons, list_club_members,
)
# pyrefly: ignore [missing-import]
from apps.club.serializers.club_serializer import (
    ClubSerializer, ClubCreateSerializer,
    SeasonSerializer, UserClubMembershipSerializer, AddMemberSerializer,
)
# pyrefly: ignore [missing-import]
from apps.club.services.club_service import (
    create_club, update_club, create_season, add_user_to_club, remove_user_from_club,
)
# pyrefly: ignore [missing-import]
from apps.accounts.selectors.user_selector import get_user_by_email


class ClubListCreateView(APIView):
    """
    GET  /api/v1/auth/clubs/       → Liste tous les clubs
    POST /api/v1/auth/clubs/       → Crée un nouveau club
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        clubs = list_user_clubs(request.user)
        return Response(ClubSerializer(clubs, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = ClubCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            club = create_club(creator=request.user, **serializer.validated_data)
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        return Response(ClubSerializer(club).data, status=status.HTTP_201_CREATED)


class ClubDetailView(APIView):
    """
    GET   /api/v1/auth/clubs/<slug>/  → Détail d'un club
    PUT   /api/v1/auth/clubs/<slug>/  → Modifier un club
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, slug: str) -> Response:
        try:
            club = get_club_by_slug(slug)
        except Exception:
            return Response({"detail": "Club introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(ClubSerializer(club).data)

    def put(self, request: Request, slug: str) -> Response:
        try:
            club = get_club_by_slug(slug)
        except Exception:
            return Response({"detail": "Club introuvable."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ClubCreateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        club = update_club(club=club, **serializer.validated_data)
        return Response(ClubSerializer(club).data)


class SeasonListCreateView(APIView):
    """
    GET  /api/v1/auth/clubs/<slug>/seasons/   → Liste les saisons d'un club
    POST /api/v1/auth/clubs/<slug>/seasons/   → Crée une nouvelle saison
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, slug: str) -> Response:
        try:
            club = get_club_by_slug(slug)
        except Exception:
            return Response({"detail": "Club introuvable."}, status=status.HTTP_404_NOT_FOUND)
        seasons = list_club_seasons(club)
        return Response(SeasonSerializer(seasons, many=True).data)

    def post(self, request: Request, slug: str) -> Response:
        try:
            club = get_club_by_slug(slug)
        except Exception:
            return Response({"detail": "Club introuvable."}, status=status.HTTP_404_NOT_FOUND)

        serializer = SeasonSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            season = create_season(
                club=club,
                name=serializer.validated_data['name'],
                start_date=serializer.validated_data['start_date'],
                end_date=serializer.validated_data['end_date'],
                set_as_current=serializer.validated_data.get('is_current', False),
            )
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        return Response(SeasonSerializer(season).data, status=status.HTTP_201_CREATED)


class ClubMemberListView(APIView):
    """
    GET  /api/v1/auth/clubs/<slug>/members/        → Liste les membres du club
    POST /api/v1/auth/clubs/<slug>/members/        → Ajouter un membre
    DELETE /api/v1/auth/clubs/<slug>/members/      → Retirer un membre
    """
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, slug: str) -> Response:
        try:
            club = get_club_by_slug(slug)
        except Exception:
            return Response({"detail": "Club introuvable."}, status=status.HTTP_404_NOT_FOUND)
        members = list_club_members(club)
        return Response(UserClubMembershipSerializer(members, many=True).data)

    def post(self, request: Request, slug: str) -> Response:
        serializer = AddMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            club = get_club_by_slug(slug)
            user = get_user_by_email(serializer.validated_data['user_email'])
            membership = add_user_to_club(user=user, club=club)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(UserClubMembershipSerializer(membership).data, status=status.HTTP_201_CREATED)

    def delete(self, request: Request, slug: str) -> Response:
        serializer = AddMemberSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            club = get_club_by_slug(slug)
            user = get_user_by_email(serializer.validated_data['user_email'])
            remove_user_from_club(user=user, club=club)
        except ValidationError as e:
            return Response(e.message_dict, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Membre retiré du club."}, status=status.HTTP_200_OK)
