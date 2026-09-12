"""Vues API pour les paiements Stripe, PayLib, Pass'Sport et Webhooks."""

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.orders.models.order import Order
from apps.payments.selectors.payment_selector import list_payments_by_order
from apps.payments.serializers.payment_serializer import (
    PaymentTransactionSerializer,
    CreateStripeSessionRequestSerializer,
    PayLibPaymentRequestSerializer,
    PassSportPaymentRequestSerializer,
)
from apps.payments.services.stripe_service import create_stripe_checkout_session, handle_stripe_webhook_event
from apps.payments.services.paylib_service import process_paylib_payment, process_passsport_payment


class CreateStripeSessionView(APIView):
    """POST : initialiser une session de paiement Stripe."""
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = CreateStripeSessionRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.get(pk=serializer.validated_data['order_id'])
        except Order.DoesNotExist:
            return Response({"detail": "Commande introuvable."}, status=status.HTTP_404_NOT_FOUND)

        try:
            session_data = create_stripe_checkout_session(
                order=order,
                success_url=serializer.validated_data.get('success_url'),
                cancel_url=serializer.validated_data.get('cancel_url')
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(session_data, status=status.HTTP_201_CREATED)


class PayLibPaymentView(APIView):
    """POST : effectuer un paiement par PayLib."""
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = PayLibPaymentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.get(pk=serializer.validated_data['order_id'])
        except Order.DoesNotExist:
            return Response({"detail": "Commande introuvable."}, status=status.HTTP_404_NOT_FOUND)

        res = process_paylib_payment(
            order=order,
            phone_number=serializer.validated_data['phone_number']
        )
        return Response(res, status=status.HTTP_200_OK)


class PassSportPaymentView(APIView):
    """POST : effectuer un paiement via Pass'Sport."""
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = PassSportPaymentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = Order.objects.get(pk=serializer.validated_data['order_id'])
        except Order.DoesNotExist:
            return Response({"detail": "Commande introuvable."}, status=status.HTTP_404_NOT_FOUND)

        res = process_passsport_payment(
            order=order,
            passsport_code=serializer.validated_data['passsport_code']
        )
        return Response(res, status=status.HTTP_200_OK)


class StripeWebhookView(APIView):
    """POST : réception des webhooks asynchrones Stripe."""
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        payload = request.data
        result = handle_stripe_webhook_event(payload)
        return Response(result, status=status.HTTP_200_OK)


class OrderPaymentsListView(APIView):
    """GET : lister les transactions d'une commande."""
    permission_classes = [AllowAny]

    def get(self, request: Request, order_id: int) -> Response:
        txs = list_payments_by_order(order_id)
        return Response(PaymentTransactionSerializer(txs, many=True).data)
