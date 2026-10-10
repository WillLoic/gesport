from django.urls import path
from apps.fleet.views.fleet_view import (
    VehicleListCreateView,
    VehicleDetailView,
    VehicleReleaseView,
    ReservationListCreateView,
    ReservationCompleteView
)

urlpatterns = [
    path('vehicles/', VehicleListCreateView.as_view(), name='fleet-vehicle-list-create'),
    path('vehicles/<int:pk>/', VehicleDetailView.as_view(), name='fleet-vehicle-detail'),
    path('vehicles/<int:pk>/release/', VehicleReleaseView.as_view(), name='fleet-vehicle-release'),
    path('reservations/', ReservationListCreateView.as_view(), name='fleet-reservation-list-create'),
    path('reservations/<int:pk>/complete/', ReservationCompleteView.as_view(), name='fleet-reservation-complete'),
]

