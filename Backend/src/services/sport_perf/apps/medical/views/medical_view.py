from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.medical.selectors.medical_selector import list_club_medical_records
from apps.medical.serializers.medical_serializer import MedicalRecordSerializer
from apps.medical.services.medical_service import create_medical_record, update_medical_record
from apps.medical.models.medical import MedicalRecord

class MedicalRecordListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        records = list_club_medical_records(int(club_id))
        return Response(MedicalRecordSerializer(records, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = MedicalRecordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        member_id = data.pop('member').id
        record = create_medical_record(member_id=member_id, **data)
        return Response(MedicalRecordSerializer(record).data, status=status.HTTP_201_CREATED)

class MedicalRecordDetailView(APIView):
    permission_classes = [AllowAny]

    def put(self, request: Request, pk: int) -> Response:
        try:
            record = MedicalRecord.objects.get(pk=pk)
        except MedicalRecord.DoesNotExist:
            return Response({"detail": "Dossier médical introuvable."}, status=status.HTTP_404_NOT_FOUND)

        serializer = MedicalRecordSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        data.pop('member', None)
        record = update_medical_record(record=record, **data)
        return Response(MedicalRecordSerializer(record).data, status=status.HTTP_200_OK)
