from apps.tactics.models.tactics import TacticalBoard, TrainingExercise, TrainingSession
from apps.teams.models.team import Team

def create_tactical_board(club_id: int = 1, title: str = "Schéma Tactique", system_name: str = "4-3-3", **kwargs) -> TacticalBoard:
    if 'club_id' in kwargs:
        club_id = kwargs.pop('club_id')
    if 'title' in kwargs:
        title = kwargs.pop('title')
    if 'system_name' in kwargs:
        system_name = kwargs.pop('system_name')
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

def create_training_exercise(club_id: int = 1, title: str = "Exercice", **kwargs) -> TrainingExercise:
    if 'club_id' in kwargs:
        club_id = kwargs.pop('club_id')
    if 'title' in kwargs:
        title = kwargs.pop('title')
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

def create_training_session(team: Team = None, team_id: int = None, title: str = "Séance d'entraînement", session_date = None, **kwargs) -> TrainingSession:
    exercises = kwargs.pop('exercises', [])
    # Nettoyer les kwargs pour éviter les conflits
    kwargs.pop('team', None)
    kwargs.pop('team_id', None)

    if session_date is None:
        from django.utils import timezone
        session_date = timezone.now()

    # Résoudre l'équipe
    resolved_team = team
    if resolved_team is None and team_id is not None:
        try:
            resolved_team = Team.objects.get(pk=team_id)
        except Team.DoesNotExist:
            resolved_team = None

    if resolved_team is None:
        resolved_team = Team.objects.first()

    if resolved_team is None:
        # Créer une équipe par défaut si aucune n'existe
        resolved_team = Team.objects.create(
            club_id=1,
            name="Équipe Principale",
            sport_type="football",
            category="Senior"
        )

    ts = TrainingSession.objects.create(
        team=resolved_team,
        title=title,
        session_date=session_date,
        **kwargs
    )

    if exercises:
        # Filtrer les exercices valides (peuvent être des objets ou des IDs)
        valid_exercise_ids = []
        for ex in exercises:
            if isinstance(ex, TrainingExercise):
                valid_exercise_ids.append(ex.pk)
            elif isinstance(ex, int):
                if TrainingExercise.objects.filter(pk=ex).exists():
                    valid_exercise_ids.append(ex)
        if valid_exercise_ids:
            ts.exercises.set(valid_exercise_ids)
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
