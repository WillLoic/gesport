"""
Selectors accounts — Toutes les requêtes de lecture vers la base de données.

Règle : Aucune view ni service n'écrit de requête ORM directement.
        Elles appellent ces fonctions qui centralisent et optimisent les accès DB.

Convention CQRS légère :
  - selectors/ = READ (SELECT)
  - services/  = WRITE (INSERT / UPDATE / DELETE)
"""

from django.contrib.auth import get_user_model
from django.db.models import QuerySet

# pyrefly: ignore [missing-import]
from apps.accounts.models.profile import UserProfile

User = get_user_model()


def get_user_by_id(user_id: int) -> User:
    """
    Retourne un utilisateur par son ID.
    Lève User.DoesNotExist si introuvable.
    """
    return User.objects.select_related('profile').get(pk=user_id)


def get_user_by_email(email: str) -> User:
    """
    Retourne un utilisateur par son email (insensible à la casse).
    Lève User.DoesNotExist si introuvable.
    """
    return User.objects.select_related('profile').get(email__iexact=email)


def list_users(*, is_active: bool = True) -> QuerySet:
    """
    Liste tous les utilisateurs actifs.
    select_related('profile') évite le problème N+1 (une seule requête JOIN).
    """
    return (
        User.objects
        .select_related('profile')
        .filter(is_active=is_active)
        .order_by('-created_at')
    )


def user_exists_by_email(email: str) -> bool:
    """Vérifie si un email est déjà enregistré (utile lors de l'inscription)."""
    return User.objects.filter(email__iexact=email).exists()


def get_profile_by_user(user: User) -> UserProfile:
    """
    Retourne le profil d'un utilisateur.
    Lève UserProfile.DoesNotExist si non trouvé (ne devrait pas arriver
    grâce au signal post_save qui crée le profil automatiquement).
    """
    return UserProfile.objects.get(user=user)
