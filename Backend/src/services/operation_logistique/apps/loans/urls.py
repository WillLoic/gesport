from django.urls import path
from apps.loans.views.loan_view import (
    EquipmentLoanListCreateView,
    EquipmentLoanDetailView,
    EquipmentLoanReturnView
)

urlpatterns = [
    path('loans/', EquipmentLoanListCreateView.as_view(), name='loans-list-create'),
    path('loans/<int:pk>/', EquipmentLoanDetailView.as_view(), name='loans-detail'),
    path('loans/<int:pk>/return/', EquipmentLoanReturnView.as_view(), name='loans-return'),
]
