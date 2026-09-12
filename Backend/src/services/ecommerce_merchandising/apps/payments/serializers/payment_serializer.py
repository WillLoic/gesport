"""Serializers DRF pour les transactions de paiement."""

from rest_framework import serializers
from apps.payments.models.transaction import PaymentTransaction


class PaymentTransactionSerializer(serializers.ModelSerializer):
    order_number = serializers.ReadOnlyField(source='order.order_number')

    class Meta:
        model = PaymentTransaction
        fields = [
            'id', 'order', 'order_number', 'provider', 'transaction_id',
            'amount', 'currency', 'status', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CreateStripeSessionRequestSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    success_url = serializers.URLField(required=False, allow_blank=True, default="")
    cancel_url = serializers.URLField(required=False, allow_blank=True, default="")


class PayLibPaymentRequestSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    phone_number = serializers.CharField(max_length=50)


class PassSportPaymentRequestSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    passsport_code = serializers.CharField(max_length=100)
