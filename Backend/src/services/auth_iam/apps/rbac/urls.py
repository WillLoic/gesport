"""Routes URL de l'application rbac."""

from django.urls import path
from apps.rbac.views.rbac_view import (
    RoleListView,
    AssignRoleView,
    RevokeRoleView,
    UserRolesInClubView,
    ClubRolesListView,
)

urlpatterns = [
    # GET  /api/v1/auth/rbac/roles/               → Liste tous les rôles disponibles
    path('roles/', RoleListView.as_view(), name='rbac-roles-list'),

    # POST /api/v1/auth/rbac/assign/              → Attribue un rôle à un utilisateur
    path('assign/', AssignRoleView.as_view(), name='rbac-assign'),

    # DELETE /api/v1/auth/rbac/revoke/            → Révoque un rôle
    path('revoke/', RevokeRoleView.as_view(), name='rbac-revoke'),

    # GET /api/v1/auth/rbac/clubs/<id>/roles/     → Tous les rôles d'un club
    path('clubs/<int:club_id>/roles/', ClubRolesListView.as_view(), name='rbac-club-roles'),

    # GET /api/v1/auth/rbac/clubs/<id>/users/<email>/roles/ → Rôles d'un user dans un club
    path(
        'clubs/<int:club_id>/users/<str:user_email>/roles/',
        UserRolesInClubView.as_view(),
        name='rbac-user-club-roles'
    ),
]
