from django.urls import path
from apps.tax_receipts.views.receipt_view import (
    DonorListCreateView, TaxReceiptListCreateView, TaxReceiptCancelView
)

urlpatterns = [
    path('donors/', DonorListCreateView.as_view(), name='donors-list-create'),
    path('receipts/', TaxReceiptListCreateView.as_view(), name='tax-receipts-list-create'),
    path('receipts/<int:pk>/cancel/', TaxReceiptCancelView.as_view(), name='tax-receipts-cancel'),
]

