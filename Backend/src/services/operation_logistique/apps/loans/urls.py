from django.urls import path
from apps.loans.views.loan_view import EquipmentLoanListCreateView, EquipmentLoanReturnView

urlpatterns = [
    path('', EquipmentLoanListCreateView.as_view(), name='loan-list-create'),
    path('<int:pk>/return/', EquipmentLoanReturnView.as_view(), name='loan-return'),
]

