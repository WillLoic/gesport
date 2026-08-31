"""Serializers pour l'application rbac."""

from rest_framework import serializers
# pyrefly: ignore [missing-import]
from apps.rbac.models.role import Role
# pyrefly: ignore [missing-import]
from apps.rbac.models.user_role import UserClubRole


class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'code', 'name', 'description', 'is_system_role']
        read_only_fields = ['id']


class UserClubRoleSerializer(serializers.ModelSerializer):
    """Représentation complète d'une attribution de rôle."""
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_full_name = serializers.CharField(source='user.full_name', read_only=True)
    club_name = serializers.CharField(source='club.name', read_only=True)
    role_code = serializers.CharField(source='role.code', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    assigned_by_name = serializers.CharField(source='assigned_by.full_name', read_only=True, default='')

    class Meta:
        model = UserClubRole
        fields = [
            'id', 'user_email', 'user_full_name',
            'club_name', 'role_code', 'role_name',
            'assigned_by_name', 'assigned_at',
        ]
        read_only_fields = ['id', 'assigned_at']


class AssignRoleSerializer(serializers.Serializer):
    """Valide l'attribution d'un rôle."""
    user_email = serializers.EmailField(required=True)
    club_id = serializers.IntegerField(required=True)
    role_code = serializers.ChoiceField(
        choices=[(r[0], r[0]) for r in Role.ROLE_CHOICES],
        required=True
    )


class RevokeRoleSerializer(serializers.Serializer):
    """Valide la révocation d'un rôle."""
    user_email = serializers.EmailField(required=True)
    club_id = serializers.IntegerField(required=True)
    role_code = serializers.ChoiceField(
        choices=[(r[0], r[0]) for r in Role.ROLE_CHOICES],
        required=True
    )
