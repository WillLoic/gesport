from django.db.models import QuerySet
from apps.tactics.models.tactics import TacticalBoard, TrainingExercise, TrainingSession

def list_tactical_boards(club_id: int) -> QuerySet:
    return TacticalBoard.objects.filter(club_id=club_id).order_by('-created_at')

def list_training_exercises(club_id: int) -> QuerySet:
    return TrainingExercise.objects.filter(club_id=club_id).order_by('category', 'title')

def list_team_training_sessions(team_id: int) -> QuerySet:
    return TrainingSession.objects.filter(team_id=team_id).prefetch_related('exercises').order_by('-session_date')
