from apps.tactics.models.tactics import TacticalBoard, TrainingExercise, TrainingSession
from apps.teams.models.team import Team

def create_tactical_board(*, club_id: int = 1, title: str = "Schéma Tactique", system_name: str = "4-3-3", **kwargs) -> TacticalBoard:
    return TacticalBoard.objects.create(club_id=club_id, title=title, system_name=system_name, **kwargs)

def update_tactical_board(board_id: int, **kwargs) -> TacticalBoard:
    board = TacticalBoard.objects.get(pk=board_id)
    for key, value in kwargs.items():
        if value is not None and hasattr(board, key):
            setattr(board, key, value)
    board.save()
    return board

def delete_tactical_board(board_id: int) -> bool:
    board = TacticalBoard.objects.get(pk=board_id)
    board.delete()
    return True

def create_training_exercise(*, club_id: int = 1, title: str = "Exercice", **kwargs) -> TrainingExercise:
    return TrainingExercise.objects.create(club_id=club_id, title=title, **kwargs)

def update_training_exercise(exercise_id: int, **kwargs) -> TrainingExercise:
    ex = TrainingExercise.objects.get(pk=exercise_id)
    for key, value in kwargs.items():
        if value is not None and hasattr(ex, key):
            setattr(ex, key, value)
    ex.save()
    return ex

def delete_training_exercise(exercise_id: int) -> bool:
    ex = TrainingExercise.objects.get(pk=exercise_id)
    ex.delete()
    return True

def create_training_session(*, team: Team = None, team_id: int = None, title: str = "Séance d'entraînement", session_date = None, **kwargs) -> TrainingSession:
    exercises = kwargs.pop('exercises', [])
    if session_date is None:
        from django.utils import timezone
        session_date = timezone.now()

    if team is not None:
        ts = TrainingSession.objects.create(team=team, title=title, session_date=session_date, **kwargs)
    elif team_id is not None:
        ts = TrainingSession.objects.create(team_id=team_id, title=title, session_date=session_date, **kwargs)
    else:
        ts = TrainingSession.objects.create(team_id=1, title=title, session_date=session_date, **kwargs)

    if exercises:
        ts.exercises.set(exercises)
    return ts

def update_training_session(session_id: int, **kwargs) -> TrainingSession:
    ts = TrainingSession.objects.get(pk=session_id)
    exercises = kwargs.pop('exercises', None)
    team = kwargs.pop('team', None)
    team_id = kwargs.pop('team_id', None)
    if team is not None:
        ts.team = team
    elif team_id is not None:
        ts.team_id = team_id

    for key, value in kwargs.items():
        if value is not None and hasattr(ts, key):
            setattr(ts, key, value)
    ts.save()

    if exercises is not None:
        ts.exercises.set(exercises)
    return ts

def delete_training_session(session_id: int) -> bool:
    ts = TrainingSession.objects.get(pk=session_id)
    ts.delete()
    return True
