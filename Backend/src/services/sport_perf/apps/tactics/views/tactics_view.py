from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.tactics.selectors.tactics_selector import list_tactical_boards, list_training_exercises, list_team_training_sessions
from apps.tactics.serializers.tactics_serializer import TacticalBoardSerializer, TrainingExerciseSerializer, TrainingSessionSerializer
from apps.tactics.services.tactics_service import create_tactical_board, create_training_exercise, create_training_session

class TacticalBoardListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        boards = list_tactical_boards(int(club_id))
        return Response(TacticalBoardSerializer(boards, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = TacticalBoardSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        board = create_tactical_board(**serializer.validated_data)
        return Response(TacticalBoardSerializer(board).data, status=status.HTTP_201_CREATED)

class TrainingExerciseListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        exercises = list_training_exercises(int(club_id))
        return Response(TrainingExerciseSerializer(exercises, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = TrainingExerciseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        exercise = create_training_exercise(**serializer.validated_data)
        return Response(TrainingExerciseSerializer(exercise).data, status=status.HTTP_201_CREATED)

class TrainingSessionListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        team_id = request.query_params.get('team_id', 1)
        sessions = list_team_training_sessions(int(team_id))
        return Response(TrainingSessionSerializer(sessions, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = TrainingSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = create_training_session(**serializer.validated_data)
        return Response(TrainingSessionSerializer(session).data, status=status.HTTP_201_CREATED)
