"""
Vues REST API pour l'application tax_receipts.
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.tax_receipts.serializers.receipt_serializer import DonorSerializer, TaxReceiptSerializer
from apps.tax_receipts.selectors.receipt_selector import (
    get_donors_for_club, get_donor_by_id, get_tax_receipts_for_club, get_tax_receipt_by_id
)
from apps.tax_receipts.services.receipt_service import (
    create_donor, issue_tax_receipt, cancel_tax_receipt
)


class DonorListCreateView(APIView):
    """GET/POST /api/v1/finance/tax-receipts/donors/"""

    def get(self, request):
        club_id = request.query_params.get('club_id', 1)
        donors = get_donors_for_club(club_id=int(club_id))
        serializer = DonorSerializer(donors, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = DonorSerializer(data=request.data)
        if serializer.is_valid():
            donor = create_donor(
                club_id=serializer.validated_data['club_id'],
                last_name=serializer.validated_data['last_name'],
                email=serializer.validated_data['email'],
                donor_type=serializer.validated_data.get('donor_type', 'individual'),
                first_name=serializer.validated_data.get('first_name', ''),
                address=serializer.validated_data.get('address', ''),
                tax_id=serializer.validated_data.get('tax_id', ''),
            )
            return Response(DonorSerializer(donor).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaxReceiptListCreateView(APIView):
    """GET/POST /api/v1/finance/tax-receipts/receipts/"""

    def get(self, request):
        club_id = request.query_params.get('club_id', 1)
        receipt_status = request.query_params.get('status', None)
        receipts = get_tax_receipts_for_club(club_id=int(club_id), status=receipt_status)
        serializer = TaxReceiptSerializer(receipts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        club_id = request.data.get('club_id', 1)
        donor_id = request.data.get('donor')
        donor = get_donor_by_id(club_id=int(club_id), donor_id=int(donor_id)) if donor_id else None
        
        if not donor:
            return Response({"error": "Donateur non trouvé ou invalide"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = TaxReceiptSerializer(data=request.data)
        if serializer.is_valid():
            receipt = issue_tax_receipt(
                club_id=int(club_id),
                donor=donor,
                donation_date=serializer.validated_data['donation_date'],
                amount=serializer.validated_data['amount'],
                donation_type=serializer.validated_data.get('donation_type', 'money'),
                description=serializer.validated_data.get('description', ''),
            )
            return Response(TaxReceiptSerializer(receipt).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TaxReceiptCancelView(APIView):
    """POST /api/v1/finance/tax-receipts/receipts/<pk>/cancel/"""

    def post(self, request, pk: int):
        club_id = request.data.get('club_id', 1)
        receipt = get_tax_receipt_by_id(club_id=int(club_id), receipt_id=pk)
        if not receipt:
            return Response({"error": "Reçu fiscal introuvable"}, status=status.HTTP_404_NOT_FOUND)

        cancelled = cancel_tax_receipt(receipt=receipt)
        return Response(TaxReceiptSerializer(cancelled).data, status=status.HTTP_200_OK)

