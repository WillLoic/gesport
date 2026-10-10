from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from apps.loans.serializers.loan_serializer import EquipmentLoanSerializer
from apps.loans.selectors.loan_selector import get_all_loans, get_loan_by_id
from apps.loans.services.loan_service import create_loan, return_loan
from apps.inventory.selectors.inventory_selector import get_equipment_by_id


class EquipmentLoanListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        status_param = request.query_params.get('status')
        loans = get_all_loans(status=status_param)
        return Response(EquipmentLoanSerializer(loans, many=True).data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = EquipmentLoanSerializer(data=request.data)
        if serializer.is_valid():
            eq_id = request.data.get('equipment')
            equipment = get_equipment_by_id(eq_id)
            if not equipment:
                return Response({'error': 'Équipement non trouvé'}, status=status.HTTP_404_NOT_FOUND)

            try:
                loan = create_loan(
                    equipment=equipment,
                    borrower_name=serializer.validated_data['borrower_name'],
                    borrower_email=serializer.validated_data['borrower_email'],
                    expected_return_date=serializer.validated_data['expected_return_date'],
                    quantity_borrowed=serializer.validated_data.get('quantity_borrowed', 1),
                    initial_condition_notes=serializer.validated_data.get('initial_condition_notes', 'Bon état')
                )
                return Response(EquipmentLoanSerializer(loan).data, status=status.HTTP_201_CREATED)
            except ValueError as exc:
                return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EquipmentLoanDetailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        loan = get_loan_by_id(pk)
        if not loan:
            return Response({'error': 'Emprunt non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        return Response(EquipmentLoanSerializer(loan).data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        loan = get_loan_by_id(pk)
        if not loan:
            return Response({'error': 'Emprunt non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        serializer = EquipmentLoanSerializer(loan, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(EquipmentLoanSerializer(loan).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        loan = get_loan_by_id(pk)
        if not loan:
            return Response({'error': 'Emprunt non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        loan.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class EquipmentLoanReturnView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, pk):
        loan = get_loan_by_id(pk)
        if not loan:
            return Response({'error': 'Emprunt non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        return_notes = request.data.get('return_condition_notes', '')
        updated_loan = return_loan(loan, return_notes=return_notes)
        return Response(EquipmentLoanSerializer(updated_loan).data, status=status.HTTP_200_OK)
