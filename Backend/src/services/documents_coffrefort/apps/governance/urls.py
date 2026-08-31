from django.urls import path
from apps.governance.views.governance_view import (
    GeneralAssemblyListCreateView,
    GeneralAssemblyDetailView,
    ResolutionListCreateView,
    ResolutionVoteView,
    AssemblyMinutesDetailView
)

urlpatterns = [
    path('assemblies/', GeneralAssemblyListCreateView.as_view(), name='governance-assembly-list-create'),
    path('assemblies/<int:pk>/', GeneralAssemblyDetailView.as_view(), name='governance-assembly-detail'),
    path('assemblies/<int:assembly_pk>/resolutions/', ResolutionListCreateView.as_view(), name='governance-resolution-list-create'),
    path('resolutions/<int:pk>/vote/', ResolutionVoteView.as_view(), name='governance-resolution-vote'),
    path('assemblies/<int:assembly_pk>/minutes/', AssemblyMinutesDetailView.as_view(), name='governance-minutes-detail'),
]
