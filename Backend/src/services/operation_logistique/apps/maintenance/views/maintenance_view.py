from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.maintenance.serializers.maintenance_serializer import MaintenanceRecordSerializer
from apps.maintenance.selectors.maintenance_selector import get_all_maintenance_records, get_maintenance_record_by_id
from apps.maintenance.services.maintenance_service import schedule_maintenance, complete_maintenance
from apps.fleet.selectors.fleet_selector import get_vehicle_by_id
from apps.inventory.selectors.inventory_selector import get_equipment_by_id


class MaintenanceRecordListCreateView(APIView):
    """GET/POST /api/maintenance/"""

    def get(self, request):
        maintenance_status = request.query_params.get('status', None)
        records = get_all_maintenance_records(status=maintenance_status)
        serializer = MaintenanceRecordSerializer(records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        vehicle_id = request.data.get('vehicle')
        equipment_id = request.data.get('equipment')

        vehicle = get_vehicle_by_id(vehicle_id) if vehicle_id else None
        equipment = get_equipment_by_id(equipment_id) if equipment_id else None

        serializer = MaintenanceRecordSerializer(data=request.data)
        if serializer.is_valid():
            record = schedule_maintenance(
                performed_date=serializer.validated_data['performed_date'],
                maintenance_type=serializer.validated_data.get('maintenance_type', 'REVISION'),
                vehicle=vehicle,
                equipment=equipment,
                cost=serializer.validated_data.get('cost', 0),
                next_due_date=serializer.validated_data.get('next_due_date'),
                provider=serializer.validated_data.get('provider', ''),
                notes=serializer.validated_data.get('notes', ''),
            )
            return Response(MaintenanceRecordSerializer(record).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MaintenanceRecordCompleteView(APIView):
    """POST /api/maintenance/<pk>/complete/"""

    def post(self, request, pk: int):
        record = get_maintenance_record_by_id(pk)
        if not record:
            return Response({"error": "Fiche de maintenance introuvable"}, status=status.HTTP_404_NOT_FOUND)

        final_cost = request.data.get('cost', None)
        completed = complete_maintenance(record=record, final_cost=final_cost)
        return Response(MaintenanceRecordSerializer(completed).data, status=status.HTTP_200_OK)

