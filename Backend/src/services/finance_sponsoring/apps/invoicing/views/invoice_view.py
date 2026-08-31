from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.invoicing.selectors.invoice_selector import list_invoices, list_quotes
from apps.invoicing.serializers.invoice_serializer import InvoiceSerializer, QuoteSerializer
from apps.invoicing.services.invoice_service import create_invoice, create_quote, mark_invoice_paid
from apps.invoicing.models.invoice import Invoice


class InvoiceListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        inv_status = request.query_params.get('status')
        return Response(InvoiceSerializer(list_invoices(int(club_id), status=inv_status), many=True).data)

    def post(self, request: Request) -> Response:
        serializer = InvoiceSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        data.pop('items', None)
        invoice = create_invoice(**data)
        return Response(InvoiceSerializer(invoice).data, status=status.HTTP_201_CREATED)


class InvoiceMarkPaidView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request, pk: int) -> Response:
        try:
            invoice = Invoice.objects.get(pk=pk)
        except Invoice.DoesNotExist:
            return Response({"detail": "Facture introuvable."}, status=status.HTTP_404_NOT_FOUND)
        invoice = mark_invoice_paid(invoice=invoice)
        return Response(InvoiceSerializer(invoice).data)


class QuoteListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        return Response(QuoteSerializer(list_quotes(int(club_id)), many=True).data)

    def post(self, request: Request) -> Response:
        serializer = QuoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quote = create_quote(**serializer.validated_data)
        return Response(QuoteSerializer(quote).data, status=status.HTTP_201_CREATED)
