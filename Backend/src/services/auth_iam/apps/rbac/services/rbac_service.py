"""Services rbac — Logique métier pour la gestion des rôles."""

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

# pyrefly: ignore [missing-import]
from apps.rbac.models.role import Role
# pyrefly: ignore [missing-import]
from apps.rbac.models.user_role import UserClubRole
# pyrefly: ignore [missing-import]
from apps.club.models.club import Club

User = get_user_model()


def init_default_roles() -> list[Role]:
    """
    Initialise les rôles système par défaut dans la base de données.
    Appelé via la commande Django 'python manage.py init_roles'
    ou au démarrage via AppConfig.ready().
    """
    default_roles = [
        {
            'code': Role.SUPER_ADMIN,
            'name': 'Président / Super Administrateur',
            'description': 'Accès total en lecture/écriture à tous les modules du club.',
        },
        {
            'code': Role.CLUB_ADMIN,
            'name': 'Administrateur du club',
            'description': 'Accès administratif délégué par le président.',
        },
        {
            'code': Role.TREASURER,
            'name': 'Trésorier / Comptable',
            'description': 'Accès au Grand Livre, facturation, bons de commande et sponsoring.',
        },
        {
            'code': Role.COACH,
            'name': 'Directeur Sportif / Entraîneur',
            'description': 'Convocations, compositions, schémas tactiques, académie et recrutement.',
        },
        {
            'code': Role.MEDICAL_STAFF,
            'name': 'Médecin / Kinésithérapeute',
            'description': 'Dossier médical des joueurs, soins et autorisations de reprise.',
        },
        {
            'code': Role.LOGISTICS,
            'name': 'Responsable Matériel & Logistique',
            'description': 'Gestion des minibus, stocks d\'équipements et réceptions fournisseurs.',
        },
        {
            'code': Role.MARKETING,
            'name': 'Responsable Communication & Marketing',
            'description': 'Campagnes emailing/SMS, articles CMS du site officiel, billetterie et médias.',
        },
        {
            'code': Role.MEMBER,
            'name': 'Joueur / Adhérent / Parent',
            'description': 'Consultation de ses convocations, justificatifs de licence et boutique.',
        },
    ]

    created_roles = []
    for role_data in default_roles:
        role, _ = Role.objects.get_or_create(
            code=role_data['code'],
            defaults={
                'name': role_data['name'],
                'description': role_data['description'],
                'is_system_role': True,
            }
        )
        created_roles.append(role)

    return created_roles


def assign_role_to_user(
    *,
    user: User,
    club: Club,
    role_code: str,
    assigned_by: User = None,
) -> UserClubRole:
    """
    Attribue un rôle à un utilisateur dans un club.
    Si l'attribution existe déjà, retourne l'existante sans erreur.
    """
    try:
        role = Role.objects.get(code=role_code)
    except Role.DoesNotExist:
        raise ValidationError({"role_code": f"Le rôle '{role_code}' n'existe pas."})

    assignment, created = UserClubRole.objects.get_or_create(
        user=user,
        club=club,
        role=role,
        defaults={'assigned_by': assigned_by}
    )

    return assignment


def revoke_role_from_user(*, user: User, club: Club, role_code: str) -> None:
    """
    Révoque un rôle d'un utilisateur dans un club.
    Lève ValidationError si l'attribution n'existe pas.
    """
    deleted_count, _ = UserClubRole.objects.filter(
        user=user, club=club, role__code=role_code
    ).delete()

    if deleted_count == 0:
        raise ValidationError({
            "detail": f"L'utilisateur n'a pas le rôle '{role_code}' dans ce club."
        })


def set_user_as_super_admin(*, user: User, club: Club, assigned_by: User = None) -> UserClubRole:
    """Raccourci pour nommer un président / super admin d'un club."""
    return assign_role_to_user(
        user=user,
        club=club,
        role_code=Role.SUPER_ADMIN,
        assigned_by=assigned_by,
    )
