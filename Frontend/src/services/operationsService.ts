import { apiFetch } from './apiClient';
import { InventoryItem, Vehicle, PurchaseOrder } from '../types';

// ═══════════════════════════════════════════
//  INTERFACES BACKEND (shape retournée par Django REST)
// ═══════════════════════════════════════════

export interface BackendEquipment {
  id: number;
  name: string;
  category: string;
  quantity_in_stock: number;
  min_stock_threshold: number;
  status: string;
  location: number | null;
  created_at: string;
  updated_at: string;
}

export interface BackendStorageLocation {
  id: number;
  name: string;
  building: string;
  description: string;
}

export interface BackendVehicle {
  id: number;
  registration_number: string;
  brand_model: string;
  seating_capacity: number;
  fuel_type: string;
  current_mileage: number;
  status: string;
  created_at: string;
  updated_at: string;
  reservations?: BackendReservation[];
}

export interface BackendReservation {
  id: number;
  vehicle: number;
  driver_name: string;
  driver_email: string;
  purpose: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
  created_at: string;
}

// ═══════════════════════════════════════════
//  MAPPERS : Backend → Frontend types
// ═══════════════════════════════════════════

const categoryMap: Record<string, InventoryItem['category']> = {
  'BALLS': 'Ballons',
  'NETS': 'Filets & Poteaux',
  'UNIFORMS': 'Maillots & Chasubles',
  'APPARATUS': 'Matériel Pédagogique',
  'PROTECTIVE': 'Médical & Soins',
  'OTHER': 'Buvette',
};

const reverseCategoryMap: Record<string, string> = {
  'Ballons': 'BALLS',
  'Filets & Poteaux': 'NETS',
  'Maillots & Chasubles': 'UNIFORMS',
  'Matériel Pédagogique': 'APPARATUS',
  'Médical & Soins': 'PROTECTIVE',
  'Buvette': 'OTHER',
};

const conditionFromStatus: Record<string, InventoryItem['condition']> = {
  'AVAILABLE': 'Bon état',
  'LOW_STOCK': 'Usé',
  'OUT_OF_STOCK': 'À réparer/remplacer',
  'DAMAGED': 'À réparer/remplacer',
};

function mapBackendEquipmentToFrontend(eq: BackendEquipment): InventoryItem {
  return {
    id: String(eq.id),
    name: eq.name,
    category: categoryMap[eq.category] || 'Ballons',
    quantityTotal: eq.quantity_in_stock,
    quantityAvailable: eq.quantity_in_stock,
    condition: conditionFromStatus[eq.status] || 'Bon état',
    storageLocation: `Emplacement #${eq.location || 'N/A'}`,
    minThresholdAlert: eq.min_stock_threshold,
    qrCode: `MAT-${String(eq.id).padStart(4, '0')}`,
    borrowHistory: [],
  };
}

const fuelTypeMap: Record<string, Vehicle['fuelType']> = {
  'DIESEL': 'Diesel',
  'GASOLINE': 'Diesel',
  'ELECTRIC': 'Électrique',
  'HYBRID': 'Hybride',
};

const vehicleStatusMap: Record<string, Vehicle['status']> = {
  'AVAILABLE': 'Disponible',
  'RESERVED': 'Réservé',
  'IN_MAINTENANCE': 'En maintenance',
  'OUT_OF_SERVICE': 'En maintenance',
};

function mapBackendVehicleToFrontend(v: BackendVehicle): Vehicle {
  const activeReservation = (v.reservations || []).find(
    r => r.status === 'APPROVED' || r.status === 'PENDING'
  );

  return {
    id: String(v.id),
    name: v.brand_model,
    plateNumber: v.registration_number,
    capacity: v.seating_capacity,
    type: 'Minibus Club',
    mileage: v.current_mileage,
    status: vehicleStatusMap[v.status] || 'Disponible',
    fuelType: fuelTypeMap[v.fuel_type] || 'Diesel',
    nextInspectionDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    currentBooking: activeReservation
      ? {
          teamName: activeReservation.driver_name,
          destination: activeReservation.purpose,
          date: activeReservation.start_time.split('T')[0],
        }
      : undefined,
  };
}

// ═══════════════════════════════════════════
//  SERVICE API : Inventory
// ═══════════════════════════════════════════

export const inventoryService = {
  /**
   * Récupère tous les équipements depuis le backend
   */
  async getEquipments(category?: string): Promise<InventoryItem[]> {
    const url = category
      ? `/ops/inventory/equipments/?category=${category}`
      : '/ops/inventory/equipments/';
    const data = await apiFetch<BackendEquipment[]>(url);
    return data.map(mapBackendEquipmentToFrontend);
  },

  /**
   * Récupère les lieux de stockage
   */
  async getLocations(): Promise<BackendStorageLocation[]> {
    return apiFetch<BackendStorageLocation[]>('/ops/inventory/locations/');
  },

  /**
   * Crée un nouvel équipement dans le backend
   */
  async createEquipment(item: Partial<InventoryItem>): Promise<InventoryItem> {
    const payload = {
      name: item.name || 'Équipement',
      category: reverseCategoryMap[item.category || 'Ballons'] || 'OTHER',
      quantity_in_stock: item.quantityTotal || item.quantityAvailable || 0,
      min_stock_threshold: item.minThresholdAlert || 5,
      location: null,
    };

    const created = await apiFetch<BackendEquipment>('/ops/inventory/equipments/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendEquipmentToFrontend(created);
  },

  /**
   * Met à jour le stock d'un équipement
   */
  async updateEquipmentStock(id: string | number, newQuantity: number): Promise<InventoryItem> {
    const updated = await apiFetch<BackendEquipment>(`/ops/inventory/equipments/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity_in_stock: newQuantity }),
    });
    return mapBackendEquipmentToFrontend(updated);
  },

  /**
   * Supprime un équipement
   */
  async deleteEquipment(id: string | number): Promise<void> {
    await apiFetch(`/ops/inventory/equipments/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Récupère les alertes stock bas
   */
  async getStockAlerts(): Promise<InventoryItem[]> {
    const data = await apiFetch<BackendEquipment[]>('/ops/inventory/alerts/');
    return data.map(mapBackendEquipmentToFrontend);
  },
};

// ═══════════════════════════════════════════
//  SERVICE API : Fleet (Flotte de véhicules)
// ═══════════════════════════════════════════

export const fleetService = {
  /**
   * Récupère tous les véhicules depuis le backend
   */
  async getVehicles(): Promise<Vehicle[]> {
    const data = await apiFetch<BackendVehicle[]>('/ops/fleet/vehicles/');
    return data.map(mapBackendVehicleToFrontend);
  },

  /**
   * Crée un nouveau véhicule
   */
  async createVehicle(vehicle: Partial<Vehicle>): Promise<Vehicle> {
    const reverseFuelMap: Record<string, string> = {
      'Diesel': 'DIESEL',
      'Électrique': 'ELECTRIC',
      'Hybride': 'HYBRID',
    };

    const payload = {
      registration_number: vehicle.plateNumber || 'XX-000-XX',
      brand_model: vehicle.name || 'Véhicule',
      seating_capacity: vehicle.capacity || 9,
      fuel_type: reverseFuelMap[vehicle.fuelType || 'Diesel'] || 'DIESEL',
      current_mileage: vehicle.mileage || 0,
    };

    const created = await apiFetch<BackendVehicle>('/ops/fleet/vehicles/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendVehicleToFrontend(created);
  },

  /**
   * Met à jour un véhicule (statut, kilométrage, etc.)
   */
  async updateVehicle(id: string | number, data: Partial<BackendVehicle>): Promise<Vehicle> {
    const updated = await apiFetch<BackendVehicle>(`/ops/fleet/vehicles/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return mapBackendVehicleToFrontend(updated);
  },

  /**
   * Supprime un véhicule
   */
  async deleteVehicle(id: string | number): Promise<void> {
    await apiFetch(`/ops/fleet/vehicles/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Crée une réservation pour un véhicule
   */
  async createReservation(reservation: {
    vehicleId: number;
    driverName: string;
    driverEmail: string;
    purpose: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }): Promise<BackendReservation> {
    const payload = {
      vehicle: reservation.vehicleId,
      driver_name: reservation.driverName,
      driver_email: reservation.driverEmail,
      purpose: reservation.purpose,
      start_time: reservation.startTime,
      end_time: reservation.endTime,
      notes: reservation.notes || '',
    };

    return apiFetch<BackendReservation>('/ops/fleet/reservations/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Termine une réservation (véhicule libéré)
   */
  async completeReservation(reservationId: number, updatedMileage?: number): Promise<BackendReservation> {
    return apiFetch<BackendReservation>(`/ops/fleet/reservations/${reservationId}/complete/`, {
      method: 'POST',
      body: JSON.stringify({ updated_mileage: updatedMileage }),
    });
  },
};
