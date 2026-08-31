from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.loans.serializers.loan_serializer import EquipmentLoanSerializer
from apps.loans.selectors.loan_selector import get_all_loans, get_loan_by_id
from apps.loans.services.loan_service import create_loan, return_loan
from apps.inventory.selectors.inventory_selector import get_equipment_by_id


class EquipmentLoanListCreateView(APIView):
    """GET/POST /api/loans/"""

    def get(self, request):
        loan_status = request.query_params.get('status', None)
        loans = get_all_loans(status=loan_status)
        serializer = EquipmentLoanSerializer(loans, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        equipment_id = request.data.get('equipment')
        equipment = get_equipment_by_id(equipment_id) if equipment_id else None

        if not equipment:
            return Response({"error": "Équipement non trouvé"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = EquipmentLoanSerializer(data=request.data)
        if serializer.is_valid():
            try:
                loan = create_loan(
                    equipment=equipment,
                    borrower_name=serializer.validated_data['borrower_name'],
                    borrower_email=serializer.validated_data['borrower_email'],
                    expected_return_date=serializer.validated_data['expected_return_date'],
                    quantity_borrowed=serializer.validated_data.get('quantity_borrowed', 1),
                    initial_condition_notes=serializer.validated_data.get('initial_condition_notes', 'Bon état'),
                )
                return Response(EquipmentLoanSerializer(loan).data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EquipmentLoanReturnView(APIView):
    """POST /api/loans/<pk>/return/"""

    def post(self, request, pk: int):
        loan = get_loan_by_id(pk)
        if not loan:
            return Response({"error": "Emprunt introuvable"}, status=status.HTTP_404_NOT_FOUND)

        return_notes = request.data.get('return_condition_notes', '')
        returned = return_loan(loan=loan, return_notes=return_notes)
        return Response(EquipmentLoanSerializer(returned).data, status=status.HTTP_200_OK)

