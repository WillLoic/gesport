from django.urls import path
from apps.membres.views.member_view import MemberListCreateView, MemberDetailView

urlpatterns = [
    path('', MemberListCreateView.as_view(), name='membres-list-create'),
    path('<int:pk>/', MemberDetailView.as_view(), name='membres-detail'),
]
