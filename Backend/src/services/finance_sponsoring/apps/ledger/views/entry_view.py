from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.ledger.selectors.entry_selector import list_accounts, list_fiscal_years, list_journal_entries, get_account_balance
from apps.ledger.serializers.entry_serializer import AccountPlanSerializer, FiscalYearSerializer, JournalEntrySerializer
from apps.ledger.services.entry_service import create_account, create_fiscal_year, create_journal_entry, validate_entry
from apps.ledger.models.entry import JournalEntry


class AccountPlanListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        return Response(AccountPlanSerializer(list_accounts(int(club_id)), many=True).data)

    def post(self, request: Request) -> Response:
        serializer = AccountPlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = create_account(**serializer.validated_data)
        return Response(AccountPlanSerializer(account).data, status=status.HTTP_201_CREATED)


class FiscalYearListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        return Response(FiscalYearSerializer(list_fiscal_years(int(club_id)), many=True).data)

    def post(self, request: Request) -> Response:
        serializer = FiscalYearSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        fy = create_fiscal_year(**serializer.validated_data)
        return Response(FiscalYearSerializer(fy).data, status=status.HTTP_201_CREATED)


class JournalEntryListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        fiscal_year_id = request.query_params.get('fiscal_year_id')
        journal = request.query_params.get('journal')
        entries = list_journal_entries(int(club_id), fiscal_year_id=int(fiscal_year_id) if fiscal_year_id else None, journal=journal)
        return Response(JournalEntrySerializer(entries, many=True).data)

    def post(self, request: Request) -> Response:
        serializer = JournalEntrySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        entry = create_journal_entry(
            club_id=data['club_id'],
            fiscal_year_id=data['fiscal_year'].id,
            account_id=data['account'].id,
            journal=data['journal'],
            entry_date=data['entry_date'],
            reference=data['reference'],
            label=data['label'],
            debit=data.get('debit', 0),
            credit=data.get('credit', 0),
            currency_code=data.get('currency_code', 'EUR'),
            exchange_rate=data.get('exchange_rate', 1),
        )
        return Response(JournalEntrySerializer(entry).data, status=status.HTTP_201_CREATED)


class AccountBalanceView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, account_id: int) -> Response:
        club_id = request.query_params.get('club_id', 1)
        balance = get_account_balance(int(club_id), account_id)
        return Response(balance)


class JournalEntryValidateView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request, pk: int) -> Response:
        try:
            entry = JournalEntry.objects.get(pk=pk)
        except JournalEntry.DoesNotExist:
            return Response({"detail": "Écriture introuvable."}, status=status.HTTP_404_NOT_FOUND)
        if entry.is_validated:
            return Response({"detail": "Écriture déjà validée."}, status=status.HTTP_400_BAD_REQUEST)
        entry = validate_entry(entry=entry)
        return Response(JournalEntrySerializer(entry).data)
