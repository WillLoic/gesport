from django.urls import path
from apps.sponsors.views.sponsor_view import (
    SponsorListCreateView, SponsorshipPackListCreateView,
    SponsorshipContractListCreateView, SponsorshipContractSignView, SponsorshipContractTerminateView
)

urlpatterns = [
    path('sponsors/', SponsorListCreateView.as_view(), name='sponsors-list-create'),
    path('packs/', SponsorshipPackListCreateView.as_view(), name='sponsorship-packs-list-create'),
    path('contracts/', SponsorshipContractListCreateView.as_view(), name='sponsorship-contracts-list-create'),
    path('contracts/<int:pk>/sign/', SponsorshipContractSignView.as_view(), name='sponsorship-contract-sign'),
    path('contracts/<int:pk>/terminate/', SponsorshipContractTerminateView.as_view(), name='sponsorship-contract-terminate'),
]

