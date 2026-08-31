from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

# pyrefly: ignore [missing-import]
from apps.membres.selectors.member_selector import list_club_members, get_member_by_id
# pyrefly: ignore [missing-import]
from apps.membres.serializers.member_serializer import MemberSerializer, MemberCreateUpdateSerializer
# pyrefly: ignore [missing-import]
from apps.membres.services.member_service import create_member, update_member, delete_member

class MemberListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        members = list_club_members(int(club_id))
        return Response(MemberSerializer(members, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = MemberCreateUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member = create_member(**serializer.validated_data)
        return Response(MemberSerializer(member).data, status=status.HTTP_201_CREATED)

class MemberDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, pk: int) -> Response:
        try:
            member = get_member_by_id(pk)
        except Exception:
            return Response({"detail": "Membre introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response(MemberSerializer(member).data)

    def put(self, request: Request, pk: int) -> Response:
        try:
            member = get_member_by_id(pk)
        except Exception:
            return Response({"detail": "Membre introuvable."}, status=status.HTTP_404_NOT_FOUND)

        serializer = MemberCreateUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        member = update_member(member=member, **serializer.validated_data)
        return Response(MemberSerializer(member).data)

    def delete(self, request: Request, pk: int) -> Response:
        try:
            member = get_member_by_id(pk)
            delete_member(member=member)
        except Exception:
            return Response({"detail": "Membre introuvable."}, status=status.HTTP_404_NOT_FOUND)
        return Response({"detail": "Membre supprimé avec succès."}, status=status.HTTP_200_OK)
