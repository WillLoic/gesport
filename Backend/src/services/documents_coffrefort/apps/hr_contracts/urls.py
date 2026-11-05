from django.urls import path
from apps.hr_contracts.views.hr_view import (
    HRContractListCreateView,
    HRContractDetailView,
    HRContractRenewView,
    HRContractTerminateView,
    LeaveRequestListCreateView,
    LeaveRequestDetailView,
    LeaveRequestApproveRejectView,
    LeaveRequestCompleteView,
    StaffReplacementListCreateView,
    ClubStaffMemberListCreateView,
    ClubStaffMemberDetailView,
)

urlpatterns = [
    path('contracts/', HRContractListCreateView.as_view(), name='hr-contract-list-create'),
    path('contracts/<int:pk>/', HRContractDetailView.as_view(), name='hr-contract-detail'),
    path('contracts/<int:pk>/renew/', HRContractRenewView.as_view(), name='hr-contract-renew'),
    path('contracts/<int:pk>/terminate/', HRContractTerminateView.as_view(), name='hr-contract-terminate'),
    path('leaves/', LeaveRequestListCreateView.as_view(), name='hr-leave-list-create'),
    path('leaves/<int:pk>/', LeaveRequestDetailView.as_view(), name='hr-leave-detail'),
    path('leaves/<int:pk>/approve-reject/', LeaveRequestApproveRejectView.as_view(), name='hr-leave-approve-reject'),
    path('leaves/<int:pk>/complete/', LeaveRequestCompleteView.as_view(), name='hr-leave-complete'),
    path('replacements/', StaffReplacementListCreateView.as_view(), name='hr-replacement-list-create'),
    path('staff-members/', ClubStaffMemberListCreateView.as_view(), name='club-staff-list-create'),
    path('staff-members/<int:pk>/', ClubStaffMemberDetailView.as_view(), name='club-staff-detail'),
]
