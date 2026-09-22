import React, { useState } from 'react';
import { X, Building2, Plus, Check, Calendar } from 'lucide-react';
import { useClub } from '../../context/ClubContext';

export interface ClubItem {
  id: string | number;
  name: string;
  short_name?: string;
  primary_color?: string;
  city?: string;
}

export const ClubSwitchModal: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = false,
  onClose,
}) => {
  const { currentSeason, showToast } = useClub();

  const [isCreating, setIsCreating] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubShort, setNewClubShort] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#1e40af');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [clubs, setClubs] = useState<ClubItem[]>([
    { id: 1, name: 'GeSport Club Principal', short_name: 'GSP', primary_color: '#1e40af', city: 'Paris' },
  ]);
  const [activeClubId, setActiveClubId] = useState<string | number>(1);

  if (!isOpen) return null;

  const handleSelectClub = (club: ClubItem) => {
    setActiveClubId(club.id);
    showToast(`Club actif : ${club.name}`);
    if (onClose) onClose();
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) {
      setError('Le nom du club est obligatoire.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const newClub: ClubItem = {
        id: Date.now(),
        name: newClubName,
        short_name: newClubShort || newClubName.substring(0, 3).toUpperCase(),
        primary_color: primaryColor,
        city: 'Paris',
      };
      setClubs((prev) => [...prev, newClub]);
      setActiveClubId(newClub.id);
      showToast(`Club créé avec succès : ${newClub.name}`);
      setIsCreating(false);
      setNewClubName('');
      setNewClubShort('');
      if (onClose) onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du club.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <Building2 className="w-5 h-5 text-blue-400" />
            Mes Clubs & Structures Sportives
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!isCreating ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Sélectionnez la structure sportive active sur laquelle vous travaillez.
              </p>

              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {clubs.map((club) => {
                  const isCurrent = activeClubId === club.id;
                  return (
                    <button
                      key={club.id}
                      onClick={() => handleSelectClub(club)}
                      className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-md"
                          style={{ backgroundColor: club.primary_color || '#1e40af' }}
                        >
                          {club.short_name || club.name.substring(0, 3)}
                        </div>

                        <div>
                          <div className="font-bold text-white text-sm flex items-center gap-2">
                            {club.name}
                            {isCurrent && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full">
                                ACTIF
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                            <span>{club.city || 'Club Omnisports'}</span>
                            <span className="flex items-center gap-1 text-slate-500">
                              <Calendar className="w-3 h-3 text-blue-400" />
                              Saison {currentSeason}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isCurrent && <Check className="w-5 h-5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setIsCreating(true)}
                className="w-full mt-2 py-3 border border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-blue-950/20 text-slate-300 hover:text-blue-400 font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Créer un nouveau club
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <h4 className="text-sm font-bold text-white">Nouveau Club Omnisports 🏟️</h4>

              {error && (
                <div className="p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nom du club *</label>
                <input
                  type="text"
                  required
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  placeholder="Ex: US Versailles Handball"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nom court / Trigramme</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={newClubShort}
                    onChange={(e) => setNewClubShort(e.target.value)}
                    placeholder="Ex: USVH"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Couleur principale</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent border border-slate-800 cursor-pointer"
                    />
                    <span className="text-xs text-slate-400 font-mono">{primaryColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="w-1/3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  {isSubmitting ? 'Création...' : 'Créer et basculer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
