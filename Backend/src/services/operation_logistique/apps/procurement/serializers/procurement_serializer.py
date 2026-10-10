from rest_framework import serializers
from ..models.purchase_order import PurchaseOrder

class PurchaseOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = PurchaseOrder
        fields = [
            'id',
            'code',
            'supplier_name',
            'category',
            'description',
            'requested_by',
            'request_date',
            'total_amount_ttc',
            'status',
            'invoice_attached',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'code', 'request_date', 'created_at', 'updated_at']
