from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.tactics.selectors.tactics_selector import list_tactical_boards, list_training_exercises, list_team_training_sessions
from apps.tactics.serializers.tactics_serializer import TacticalBoardSerializer, TrainingExerciseSerializer, TrainingSessionSerializer
from apps.tactics.services.tactics_service import (
    create_tactical_board, update_tactical_board, delete_tactical_board,
    create_training_exercise, update_training_exercise, delete_training_exercise,
    create_training_session, update_training_session, delete_training_session
)
from apps.tactics.models.tactics import TacticalBoard, TrainingExercise, TrainingSession

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

class TacticalBoardDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            board = TacticalBoard.objects.get(pk=pk)
            return Response(TacticalBoardSerializer(board).data)
        except TacticalBoard.DoesNotExist:
            return Response({"detail": "Schéma tactique introuvable."}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request: Request, pk: int) -> Response:
        try:
            board = TacticalBoard.objects.get(pk=pk)
            serializer = TacticalBoardSerializer(board, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(TacticalBoardSerializer(board).data)
        except TacticalBoard.DoesNotExist:
            return Response({"detail": "Schéma tactique introuvable."}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request: Request, pk: int) -> Response:
        return self.put(request, pk)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            delete_tactical_board(pk)
            return Response({"detail": "Schéma tactique supprimé."}, status=status.HTTP_200_OK)
        except TacticalBoard.DoesNotExist:
            return Response({"detail": "Schéma tactique introuvable."}, status=status.HTTP_404_NOT_FOUND)

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

class TrainingExerciseDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            ex = TrainingExercise.objects.get(pk=pk)
            return Response(TrainingExerciseSerializer(ex).data)
        except TrainingExercise.DoesNotExist:
            return Response({"detail": "Exercice introuvable."}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request: Request, pk: int) -> Response:
        try:
            ex = TrainingExercise.objects.get(pk=pk)
            serializer = TrainingExerciseSerializer(ex, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(TrainingExerciseSerializer(ex).data)
        except TrainingExercise.DoesNotExist:
            return Response({"detail": "Exercice introuvable."}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request: Request, pk: int) -> Response:
        return self.put(request, pk)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            delete_training_exercise(pk)
            return Response({"detail": "Exercice supprimé."}, status=status.HTTP_200_OK)
        except TrainingExercise.DoesNotExist:
            return Response({"detail": "Exercice introuvable."}, status=status.HTTP_404_NOT_FOUND)

class TrainingSessionListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        team_id = request.query_params.get('team_id', 1)
        sessions = list_team_training_sessions(int(team_id))
        return Response(TrainingSessionSerializer(sessions, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = TrainingSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data.copy()
        team = data.pop('team')
        session = create_training_session(team=team, **data)
        return Response(TrainingSessionSerializer(session).data, status=status.HTTP_201_CREATED)

class TrainingSessionDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            session = TrainingSession.objects.get(pk=pk)
            return Response(TrainingSessionSerializer(session).data)
        except TrainingSession.DoesNotExist:
            return Response({"detail": "Séance introuvable."}, status=status.HTTP_404_NOT_FOUND)

    def put(self, request: Request, pk: int) -> Response:
        try:
            session = TrainingSession.objects.get(pk=pk)
            serializer = TrainingSessionSerializer(session, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(TrainingSessionSerializer(session).data)
        except TrainingSession.DoesNotExist:
            return Response({"detail": "Séance introuvable."}, status=status.HTTP_404_NOT_FOUND)

    def patch(self, request: Request, pk: int) -> Response:
        return self.put(request, pk)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            delete_training_session(pk)
            return Response({"detail": "Séance supprimée."}, status=status.HTTP_200_OK)
        except TrainingSession.DoesNotExist:
            return Response({"detail": "Séance introuvable."}, status=status.HTTP_404_NOT_FOUND)
