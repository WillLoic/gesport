from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.inventory.serializers.inventory_serializer import EquipmentItemSerializer, StorageLocationSerializer
from apps.inventory.selectors.inventory_selector import (
    get_all_equipment, get_equipment_by_id, get_low_stock_alerts, get_all_storage_locations
)
from apps.inventory.services.inventory_service import create_equipment_item, update_stock_quantity
from apps.inventory.models import StorageLocation


class StorageLocationListCreateView(APIView):
    def get(self, request):
        locations = get_all_storage_locations()
        return Response(StorageLocationSerializer(locations, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = StorageLocationSerializer(data=request.data)
        if serializer.is_valid():
            loc = serializer.save()
            return Response(StorageLocationSerializer(loc).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EquipmentItemListCreateView(APIView):
    def get(self, request):
        category = request.query_params.get('category')
        items = get_all_equipment(category=category)
        return Response(EquipmentItemSerializer(items, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = EquipmentItemSerializer(data=request.data)
        if serializer.is_valid():
            loc_id = request.data.get('location')
            loc = StorageLocation.objects.filter(id=loc_id).first() if loc_id else None

            item = create_equipment_item(
                name=serializer.validated_data['name'],
                category=serializer.validated_data.get('category', 'OTHER'),
                quantity_in_stock=serializer.validated_data.get('quantity_in_stock', 0),
                min_stock_threshold=serializer.validated_data.get('min_stock_threshold', 5),
                location=loc
            )
            return Response(EquipmentItemSerializer(item).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EquipmentItemDetailView(APIView):
    def get(self, request, pk):
        item = get_equipment_by_id(pk)
        if not item:
            return Response({'error': 'Équipement non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        return Response(EquipmentItemSerializer(item).data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        item = get_equipment_by_id(pk)
        if not item:
            return Response({'error': 'Équipement non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        if 'quantity_in_stock' in request.data:
            item = update_stock_quantity(item, int(request.data['quantity_in_stock']))
        return Response(EquipmentItemSerializer(item).data, status=status.HTTP_200_OK)


class EquipmentStockAlertsView(APIView):
    def get(self, request):
        alerts = get_low_stock_alerts()
        return Response(EquipmentItemSerializer(alerts, many=True).data, status=status.HTTP_200_OK)
