from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.recruitment.selectors.prospect_selector import list_prospects
from apps.recruitment.serializers.prospect_serializer import TalentProspectSerializer
from apps.recruitment.services.prospect_service import create_prospect, update_prospect
from apps.recruitment.models.prospect import TalentProspect

class ProspectListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        prospects = list_prospects(int(club_id))
        return Response(TalentProspectSerializer(prospects, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = TalentProspectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        prospect = create_prospect(**serializer.validated_data)
        return Response(TalentProspectSerializer(prospect).data, status=status.HTTP_201_CREATED)

class ProspectDetailView(APIView):
    permission_classes = [AllowAny]

    def put(self, request: Request, pk: int) -> Response:
        try:
            prospect = TalentProspect.objects.get(pk=pk)
        except TalentProspect.DoesNotExist:
            return Response({"detail": "Prospect introuvable."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TalentProspectSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        prospect = update_prospect(prospect=prospect, **serializer.validated_data)
        return Response(TalentProspectSerializer(prospect).data, status=status.HTTP_200_OK)
