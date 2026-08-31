from django.urls import path
from apps.hr_contracts.views.hr_view import (
    HRContractListCreateView,
    HRContractDetailView,
    HRContractTerminateView,
    LeaveRequestListCreateView,
    LeaveRequestApproveRejectView,
    StaffReplacementListCreateView
)

urlpatterns = [
    path('contracts/', HRContractListCreateView.as_view(), name='hr-contract-list-create'),
    path('contracts/<int:pk>/', HRContractDetailView.as_view(), name='hr-contract-detail'),
    path('contracts/<int:pk>/terminate/', HRContractTerminateView.as_view(), name='hr-contract-terminate'),
    path('leaves/', LeaveRequestListCreateView.as_view(), name='hr-leave-list-create'),
    path('leaves/<int:pk>/approve-reject/', LeaveRequestApproveRejectView.as_view(), name='hr-leave-approve-reject'),
    path('replacements/', StaffReplacementListCreateView.as_view(), name='hr-replacement-list-create'),
]
