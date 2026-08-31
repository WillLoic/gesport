import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Users,
  Calendar,
  Gauge,
  CheckCircle,
  X,
  MapPin,
  Clock,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { Vehicle } from '../../types';

export const VehicleFleetView: React.FC = () => {
  const { vehicles, setVehicles, teams, staff, showToast } = useClub();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isNewVehicleModalOpen, setIsNewVehicleModalOpen] = useState(false);

  // Booking Form State
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || 'v1');
  const [bookingTeamId, setBookingTeamId] = useState(teams[0]?.id || 't1');
  const [bookingDestination, setBookingDestination] = useState('Gymnase Municipal d\'Aix-en-Provence');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingDriver, setBookingDriver] = useState(staff[0]?.name || 'Entraîneur Référent');

  // New Vehicle Form State
  const [newVehicleName, setNewVehicleName] = useState('');
  const [newPlate, setNewPlate] = useState('');
  const [newCapacity, setNewCapacity] = useState(9);
  const [newMileage, setNewMileage] = useState(25000);
  const [newInspectionDate, setNewInspectionDate] = useState(
    new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]
  );

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTeam = teams.find(t => t.id === bookingTeamId) || teams[0];
    const targetVehicle = vehicles.find(v => v.id === selectedVehicleId);

    if (!targetVehicle) return;

    setVehicles(prev =>
      prev.map(v => {
        if (v.id === selectedVehicleId) {
          return {
            ...v,
            status: 'En déplacement' as const,
            currentBooking: {
              teamName: targetTeam ? targetTeam.name : 'Équipe Club',
              destination: bookingDestination.trim(),
              date: bookingDate,
            },
          };
        }
        return v;
      })
    );

    setIsBookingModalOpen(false);
    showToast(`Réservation confirmée pour le ${targetVehicle.name} (${targetTeam?.name} -> ${bookingDestination}) !`);
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleName.trim() || !newPlate.trim()) {
      showToast('Veuillez renseigner le nom et l\'immatriculation du véhicule.');
      return;
    }

    const newVeh: Vehicle = {
      id: `veh-${Date.now()}`,
      name: newVehicleName.trim(),
      plateNumber: newPlate.trim().toUpperCase(),
      capacity: Number(newCapacity) || 9,
      type: 'Minibus Club',
      fuelType: 'Diesel',
      mileage: Number(newMileage) || 0,
      status: 'Disponible',
      nextInspectionDate: newInspectionDate,
    };

    setVehicles(prev => [newVeh, ...prev]);
    setIsNewVehicleModalOpen(false);
    showToast(`Nouveau véhicule "${newVeh.name}" ajouté à la flotte !`);

    // Reset
    setNewVehicleName('');
    setNewPlate('');
  };

  const handleReleaseVehicle = (vehicleId: string) => {
    setVehicles(prev =>
      prev.map(v => {
        if (v.id === vehicleId) {
          return { ...v, status: 'Disponible' as const, currentBooking: undefined };
        }
        return v;
      })
    );
    showToast('Véhicule libéré et de retour au club !');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Parc Minibus & Déplacements</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Gestion de la flotte de minibus du club, plannings de réservation matchs à l'extérieur et révisions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNewVehicleModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            Nouveau Véhicule
          </button>

          <button
            type="button"
            onClick={() => setIsBookingModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
            Réserver un Trajet
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(veh => {
          const isAvailable = veh.status === 'Disponible';
          return (
            <div
              key={veh.id}
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{veh.name}</h3>
                      <p className="text-xs font-mono font-bold text-slate-500">{veh.plateNumber}</p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {veh.status}
                  </span>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Capacité</span>
                      <span className="font-bold text-slate-800">{veh.capacity} places</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-slate-500" />
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Kilométrage</span>
                      <span className="font-bold text-slate-800">{veh.mileage.toLocaleString('fr-FR')} km</span>
                    </div>
                  </div>
                </div>

                {/* Current booking info if booked */}
                {veh.currentBooking ? (
                  <div className="mt-3 p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-xs space-y-2">
                    <div>
                      <span className="font-bold text-blue-900">Déplacement en cours :</span>
                      <p className="text-blue-800 mt-0.5 font-medium">
                        {veh.currentBooking.teamName} &rarr; {veh.currentBooking.destination}
                      </p>
                      <span className="text-[10px] text-blue-600 block mt-1">Date : {veh.currentBooking.date}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReleaseVehicle(veh.id)}
                      className="w-full py-1.5 px-3 bg-white border border-blue-200 text-blue-700 font-bold text-xs rounded-lg hover:bg-blue-100/60 transition-colors"
                    >
                      Clôturer le trajet / Libérer le véhicule
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                    Véhicule libre au parking du club.
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Contrôle tech : {veh.nextInspectionDate}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVehicleId(veh.id);
                    setIsBookingModalOpen(true);
                  }}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Réserver
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Réserver un Minibus</h3>
                  <p className="text-xs text-slate-500">Planification d'un déplacement match ou stage</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Véhicule à Réserver *
                </label>
                <select
                  value={selectedVehicleId}
                  onChange={e => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.plateNumber}) - {v.capacity} places [{v.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Équipe Concerneé *
                  </label>
                  <select
                    value={bookingTeamId}
                    onChange={e => setBookingTeamId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Date du Déplacement
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={e => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Destination / Salle Extérieure *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Palais des Sports de Marseille, Gymnase Jean Moulin..."
                  value={bookingDestination}
                  onChange={e => setBookingDestination(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Chauffeur Désigné / Accompagnateur
                </label>
                <input
                  type="text"
                  placeholder="Nom du conducteur titulaire du permis"
                  value={bookingDriver}
                  onChange={e => setBookingDriver(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Confirmer la Réservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Vehicle Modal */}
      {isNewVehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Ajouter un Véhicule</h3>
                  <p className="text-xs text-slate-500">Enregistrement d'un nouveau minibus dans le parc automobile</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewVehicleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Modèle du Véhicule *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Minibus Renault Master 3"
                    value={newVehicleName}
                    onChange={e => setNewVehicleName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Immatriculation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: GH-456-JK"
                    value={newPlate}
                    onChange={e => setNewPlate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nombre de Places
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    value={newCapacity}
                    onChange={e => setNewCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Kilométrage Actuel
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newMileage}
                    onChange={e => setNewMileage(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Prochain Contrôle
                  </label>
                  <input
                    type="date"
                    value={newInspectionDate}
                    onChange={e => setNewInspectionDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewVehicleModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Ajouter le Véhicule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
