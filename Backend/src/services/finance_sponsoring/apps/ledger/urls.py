from django.urls import path
from apps.ledger.views.entry_view import (
    AccountPlanListCreateView, FiscalYearListCreateView,
    JournalEntryListCreateView, AccountBalanceView, JournalEntryValidateView
)

urlpatterns = [
    path('accounts/', AccountPlanListCreateView.as_view(), name='ledger-accounts'),
    path('accounts/<int:account_id>/balance/', AccountBalanceView.as_view(), name='ledger-account-balance'),
    path('fiscal-years/', FiscalYearListCreateView.as_view(), name='ledger-fiscal-years'),
    path('entries/', JournalEntryListCreateView.as_view(), name='ledger-entries'),
    path('entries/<int:pk>/validate/', JournalEntryValidateView.as_view(), name='ledger-entry-validate'),
]
