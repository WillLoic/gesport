from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.fleet.serializers.fleet_serializer import VehicleSerializer, VehicleReservationSerializer
from apps.fleet.selectors.fleet_selector import get_all_vehicles, get_vehicle_by_id, get_all_reservations
from apps.fleet.services.fleet_service import add_vehicle, create_vehicle_reservation, complete_reservation
from apps.fleet.models import Vehicle, VehicleReservation


class VehicleListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        status_param = request.query_params.get('status')
        vehicles = get_all_vehicles(status=status_param)
        return Response(VehicleSerializer(vehicles, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            v = add_vehicle(
                registration_number=serializer.validated_data['registration_number'],
                brand_model=serializer.validated_data['brand_model'],
                seating_capacity=serializer.validated_data.get('seating_capacity', 9),
                fuel_type=serializer.validated_data.get('fuel_type', 'DIESEL'),
                current_mileage=serializer.validated_data.get('current_mileage', 0)
            )
            return Response(VehicleSerializer(v).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VehicleDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        v = get_vehicle_by_id(pk)
        if not v:
            return Response({'error': 'Véhicule non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        return Response(VehicleSerializer(v).data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        v = get_vehicle_by_id(pk)
        if not v:
            return Response({'error': 'Véhicule non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        serializer = VehicleSerializer(v, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(VehicleSerializer(v).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        v = get_vehicle_by_id(pk)
        if not v:
            return Response({'error': 'Véhicule non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        v.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReservationListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        v_id = request.query_params.get('vehicle_id')
        reservations = get_all_reservations(vehicle_id=v_id)
        return Response(VehicleReservationSerializer(reservations, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = VehicleReservationSerializer(data=request.data)
        if serializer.is_valid():
            v = get_vehicle_by_id(request.data.get('vehicle'))
            if not v:
                return Response({'error': 'Véhicule non trouvé'}, status=status.HTTP_404_NOT_FOUND)
            try:
                res = create_vehicle_reservation(
                    vehicle=v,
                    driver_name=serializer.validated_data['driver_name'],
                    driver_email=serializer.validated_data['driver_email'],
                    purpose=serializer.validated_data['purpose'],
                    start_time=serializer.validated_data['start_time'],
                    end_time=serializer.validated_data['end_time'],
                    notes=serializer.validated_data.get('notes', '')
                )
                return Response(VehicleReservationSerializer(res).data, status=status.HTTP_201_CREATED)
            except ValueError as exc:
                return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReservationCompleteView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        res = VehicleReservation.objects.filter(pk=pk).first()
        if not res:
            return Response({'error': 'Réservation non trouvée'}, status=status.HTTP_404_NOT_FOUND)
        mileage = request.data.get('updated_mileage')
        updated_res = complete_reservation(res, updated_mileage=mileage)
        return Response(VehicleReservationSerializer(updated_res).data, status=status.HTTP_200_OK)

