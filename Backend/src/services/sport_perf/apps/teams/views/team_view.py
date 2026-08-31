from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.teams.selectors.team_selector import list_club_teams, get_team_by_id
from apps.teams.serializers.team_serializer import TeamSerializer, AddPlayerToTeamSerializer
from apps.teams.services.team_service import create_team, add_player_to_team, remove_player_from_team

class TeamListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        teams = list_club_teams(int(club_id))
        return Response(TeamSerializer(teams, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = TeamSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        team = create_team(**serializer.validated_data)
        return Response(TeamSerializer(team).data, status=status.HTTP_201_CREATED)

class TeamDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            team = get_team_by_id(pk)
        except Exception:
            return Response({"detail": "Équipe introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(TeamSerializer(team).data)

class TeamPlayersManageView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request, pk: int) -> Response:
        serializer = AddPlayerToTeamSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            team = get_team_by_id(pk)
            tp = add_player_to_team(
                team=team,
                member_id=serializer.validated_data['member_id'],
                jersey_number=serializer.validated_data.get('jersey_number'),
                position=serializer.validated_data.get('position', ''),
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Joueur ajouté à l'équipe avec succès."}, status=status.HTTP_201_CREATED)

    def delete(self, request: Request, pk: int) -> Response:
        member_id = request.data.get('member_id')
        if not member_id:
            return Response({"detail": "member_id requis."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            team = get_team_by_id(pk)
            remove_player_from_team(team=team, member_id=int(member_id))
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "Joueur retiré de l'équipe."}, status=status.HTTP_200_OK)
