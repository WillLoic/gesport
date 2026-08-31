from django.urls import path
from apps.maintenance.views.maintenance_view import MaintenanceRecordListCreateView, MaintenanceRecordCompleteView

urlpatterns = [
    path('', MaintenanceRecordListCreateView.as_view(), name='maintenance-list-create'),
    path('<int:pk>/complete/', MaintenanceRecordCompleteView.as_view(), name='maintenance-complete'),
]

