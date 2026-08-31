from rest_framework import serializers
from apps.loans.models import EquipmentLoan


class EquipmentLoanSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentLoan
        fields = [
            'id', 'equipment', 'borrower_name', 'borrower_email',
            'quantity_borrowed', 'loan_date', 'expected_return_date',
            'actual_return_date', 'status', 'initial_condition_notes',
            'return_condition_notes'
        ]
        read_only_fields = ['id', 'loan_date', 'status', 'actual_return_date']
