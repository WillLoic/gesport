from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.banking.selectors.transaction_selector import list_bank_accounts, list_transactions
from apps.banking.serializers.transaction_serializer import BankAccountSerializer, BankTransactionSerializer
from apps.banking.services.transaction_service import create_bank_account, import_transaction, reconcile_transaction
from apps.banking.models.transaction import BankAccount, BankTransaction


class BankAccountListCreateView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        club_id = request.query_params.get('club_id', 1)
        return Response(BankAccountSerializer(list_bank_accounts(int(club_id)), many=True).data)

    def post(self, request: Request) -> Response:
        serializer = BankAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account = create_bank_account(**serializer.validated_data)
        return Response(BankAccountSerializer(account).data, status=status.HTTP_201_CREATED)


class BankTransactionListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, account_id: int) -> Response:
        txn_status = request.query_params.get('status')
        return Response(BankTransactionSerializer(list_transactions(account_id, status=txn_status), many=True).data)

    def post(self, request: Request, account_id: int) -> Response:
        serializer = BankTransactionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            account = BankAccount.objects.get(pk=account_id)
        except BankAccount.DoesNotExist:
            return Response({"detail": "Compte introuvable."}, status=status.HTTP_404_NOT_FOUND)
        data = serializer.validated_data
        data.pop('account', None)
        txn = import_transaction(account=account, **data)
        return Response(BankTransactionSerializer(txn).data, status=status.HTTP_201_CREATED)


class BankTransactionReconcileView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request, pk: int) -> Response:
        try:
            txn = BankTransaction.objects.get(pk=pk)
        except BankTransaction.DoesNotExist:
            return Response({"detail": "Transaction introuvable."}, status=status.HTTP_404_NOT_FOUND)
        journal_entry_id = request.data.get('journal_entry_id')
        if not journal_entry_id:
            return Response({"detail": "journal_entry_id requis."}, status=status.HTTP_400_BAD_REQUEST)
        txn = reconcile_transaction(transaction=txn, journal_entry_id=int(journal_entry_id))
        return Response(BankTransactionSerializer(txn).data)
