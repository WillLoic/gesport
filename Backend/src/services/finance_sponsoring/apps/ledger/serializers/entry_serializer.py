from rest_framework import serializers
from apps.ledger.models.entry import AccountPlan, FiscalYear, JournalEntry


class AccountPlanSerializer(serializers.ModelSerializer):
    account_type_label = serializers.CharField(source='get_account_type_display', read_only=True)

    class Meta:
        model = AccountPlan
        fields = ['id', 'club_id', 'code', 'label', 'account_type', 'account_type_label', 'parent_code', 'is_active']


class FiscalYearSerializer(serializers.ModelSerializer):
    status_label = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = FiscalYear
        fields = ['id', 'club_id', 'label', 'start_date', 'end_date', 'status', 'status_label']


class JournalEntrySerializer(serializers.ModelSerializer):
    account_code = serializers.CharField(source='account.code', read_only=True)
    account_label = serializers.CharField(source='account.label', read_only=True)
    fiscal_year_label = serializers.CharField(source='fiscal_year.label', read_only=True)
    journal_label = serializers.CharField(source='get_journal_display', read_only=True)

    class Meta:
        model = JournalEntry
        fields = [
            'id', 'club_id', 'fiscal_year', 'fiscal_year_label', 'account', 'account_code', 'account_label',
            'journal', 'journal_label', 'entry_date', 'reference', 'label',
            'debit', 'credit', 'currency_code', 'exchange_rate', 'is_validated', 'created_at',
        ]
