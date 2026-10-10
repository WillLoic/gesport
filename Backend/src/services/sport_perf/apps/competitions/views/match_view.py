from apps.competitions.models.match import MatchEvent
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.competitions.selectors.match_selector import list_team_matches, get_match_by_id
from apps.competitions.serializers.match_serializer import MatchEventSerializer, CallupSerializer, MatchPlayerStatsSerializer
from apps.competitions.services.match_service import create_match, update_match, delete_match, add_callup, update_match_stats




class MatchListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        team_id = request.query_params.get('team_id')
        if team_id:
            try:
                matches = list_team_matches(int(team_id))
            except (ValueError, TypeError):
                matches = MatchEvent.objects.all().order_by('-match_date')
        else:
            matches = MatchEvent.objects.all().order_by('-match_date')
        return Response(MatchEventSerializer(matches, many=True).data)

    def post(self, request: Request) -> Response:
        data = request.data.copy()
        team_id = data.get('team')
        if not team_id or team_id == 'undefined':
            first_team = Team.objects.first()
            if not first_team:
                first_team = Team.objects.create(club_id=1, name='Gesport', category='Senior Régionale')
            data['team'] = first_team.id

        serializer = MatchEventSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data.copy()
        team = validated_data.pop('team')
        match = create_match(team=team, **validated_data)
        return Response(MatchEventSerializer(match).data, status=status.HTTP_201_CREATED)

class MatchDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            match = get_match_by_id(pk)
        except Exception:
            return Response({"detail": "Match introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(MatchEventSerializer(match).data)

    def put(self, request: Request, pk: int) -> Response:
        try:
            match = get_match_by_id(pk)
        except Exception:
            return Response({"detail": "Match introuvable."}, status=status.HTTP_404_NOT_FOUND)
        serializer = MatchEventSerializer(match, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(MatchEventSerializer(match).data)

    def patch(self, request: Request, pk: int) -> Response:
        return self.put(request, pk)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            delete_match(pk)
            return Response({"detail": "Match supprimé avec succès."}, status=status.HTTP_200_OK)
        except Exception:
            return Response({"detail": "Match introuvable."}, status=status.HTTP_404_NOT_FOUND)

class MatchCallupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request, pk: int) -> Response:
        serializer = CallupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            match = get_match_by_id(pk)
            callup = add_callup(
                match=match,
                member_id=serializer.validated_data['member'].id,
                status=serializer.validated_data.get('status', 'Convoqué'),
                notes=serializer.validated_data.get('notes', ''),
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(CallupSerializer(callup).data, status=status.HTTP_201_CREATED)

class MatchStatsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request, pk: int) -> Response:
        serializer = MatchPlayerStatsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            match = get_match_by_id(pk)
            data = serializer.validated_data
            member_id = data.pop('member').id
            data.pop('match', None)
            stats = update_match_stats(match=match, member_id=member_id, **data)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(MatchPlayerStatsSerializer(stats).data, status=status.HTTP_200_OK)
