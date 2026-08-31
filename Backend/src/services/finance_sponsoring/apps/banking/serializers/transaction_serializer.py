from rest_framework import serializers
from apps.banking.models.transaction import BankAccount, BankTransaction


class BankAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankAccount
        fields = ['id', 'club_id', 'name', 'bank_name', 'iban', 'bic', 'currency_code', 'current_balance', 'is_active']


class BankTransactionSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    direction_label = serializers.CharField(source='get_direction_display', read_only=True)
    category_label = serializers.CharField(source='get_category_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = BankTransaction
        fields = [
            'id', 'account', 'account_name', 'transaction_date', 'value_date',
            'label', 'reference', 'amount', 'direction', 'direction_label',
            'category', 'category_label', 'status', 'status_label',
            'journal_entry_id', 'created_at',
        ]
