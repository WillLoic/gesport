from rest_framework import serializers
from apps.invoicing.models.invoice import Quote, Invoice, InvoiceItem


class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['id', 'invoice', 'description', 'quantity', 'unit_price', 'total']


class QuoteSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Quote
        fields = [
            'id', 'club_id', 'reference', 'client_name', 'client_email',
            'issue_date', 'validity_date', 'status', 'status_label',
            'amount_excl_tax', 'tax_rate', 'amount_incl_tax', 'notes', 'created_at',
        ]


class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True, read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'club_id', 'number', 'quote', 'client_name', 'client_email', 'client_address',
            'issue_date', 'due_date', 'status', 'status_label',
            'amount_excl_tax', 'tax_rate', 'tax_amount', 'amount_incl_tax',
            'currency_code', 'notes', 'items', 'created_at',
        ]
