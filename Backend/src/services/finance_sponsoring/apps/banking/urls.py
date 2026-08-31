from django.urls import path
from apps.banking.views.transaction_view import BankAccountListCreateView, BankTransactionListView, BankTransactionReconcileView

urlpatterns = [
    path('accounts/', BankAccountListCreateView.as_view(), name='banking-accounts'),
    path('accounts/<int:account_id>/transactions/', BankTransactionListView.as_view(), name='banking-transactions'),
    path('transactions/<int:pk>/reconcile/', BankTransactionReconcileView.as_view(), name='banking-reconcile'),
]
