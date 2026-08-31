from django.urls import path
from apps.invoicing.views.invoice_view import InvoiceListCreateView, InvoiceMarkPaidView, QuoteListCreateView

urlpatterns = [
    path('invoices/', InvoiceListCreateView.as_view(), name='invoicing-list-create'),
    path('invoices/<int:pk>/pay/', InvoiceMarkPaidView.as_view(), name='invoicing-mark-paid'),
    path('quotes/', QuoteListCreateView.as_view(), name='invoicing-quotes'),
]
