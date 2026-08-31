import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Phone,
  CheckCircle,
  X,
  User,
  Star,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { TalentCandidate } from '../../types';

export const RecruitmentView: React.FC = () => {
  const { talents, setTalents, currentSportConfig, showToast } = useClub();
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(talents[0] || null);
  const [isNewProspectModalOpen, setIsNewProspectModalOpen] = useState(false);

  // New Prospect Form State
  const [newFullName, setNewFullName] = useState('');
  const [newPosition, setNewPosition] = useState('Passeur');
  const [newCategoryTarget, setNewCategoryTarget] = useState('Nationale 1 Masculine');
  const [newAge, setNewAge] = useState(21);
  const [newHeightCm, setNewHeightCm] = useState(192);
  const [newCurrentClub, setNewCurrentClub] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newStage, setNewStage] = useState<any>('Prospecté');
  const [newScoutReport, setNewScoutReport] = useState('Vision de jeu exceptionnelle, très bonne qualité de main, grosse présence au bloc.');
  const [newTechScore, setNewTechScore] = useState(8.5);
  const [newTactScore, setNewTactScore] = useState(8.0);
  const [newPhysScore, setNewPhysScore] = useState(7.5);
  const [newMentalScore, setNewMentalScore] = useState(9.0);

  const stages = [
    'Prospecté',
    'Premier Contact',
    'Essai Programmé',
    'Évaluation Staff',
    'Offre / Signé',
    'Refusé',
  ];

  const handleUpdateStage = (candidateId: string, newStage: any) => {
    setTalents(prev =>
      prev.map(c => (c.id === candidateId ? { ...c, stage: newStage } : c))
    );
    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate(prev => (prev ? { ...prev, stage: newStage } : null));
    }
    showToast(`Statut de recrutement actualisé : ${newStage}`);
  };

  const handleCreateProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) {
      showToast('Veuillez renseigner le nom complet de la recrue.');
      return;
    }

    const newCandidate: TalentCandidate = {
      id: `talent-${Date.now()}`,
      fullName: newFullName.trim(),
      position: newPosition,
      categoryTarget: newCategoryTarget as any,
      age: Number(newAge) || 20,
      heightCm: Number(newHeightCm) || 190,
      currentClub: newCurrentClub.trim() || 'Club Libre',
      contactPhone: newContactPhone.trim() || '06 00 00 00 00',
      stage: newStage as any,
      trialDate: newStage === 'Essai Programmé' ? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] : undefined,
      scoutReport: newScoutReport.trim(),
      skillsRadar: {
        technique: Number(newTechScore) || 8,
        tactique: Number(newTactScore) || 8,
        physique: Number(newPhysScore) || 8,
        mental: Number(newMentalScore) || 8,
        collectif: 8,
      },
    };

    setTalents(prev => [newCandidate, ...prev]);
    setSelectedCandidate(newCandidate);
    setIsNewProspectModalOpen(false);
    showToast(`Prospect ${newCandidate.fullName} ajouté à la cellule de recrutement !`);

    // Reset Form
    setNewFullName('');
    setNewCurrentClub('');
    setNewContactPhone('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Cellule Recrutement & Scouting</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pipeline de détection des talents, suivi des essais sur le terrain et fiches de scouting
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewProspectModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter une Recrue
        </button>
      </div>

      {/* Main Grid: Talent Cards / Pipeline + Radar / Report Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidates List (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {talents.map(candidate => {
              const isSelected = selectedCandidate?.id === candidate.id;
              return (
                <div
                  key={candidate.id}
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer space-y-3 ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{candidate.fullName}</h3>
                      <p className="text-xs text-slate-500">
                        {candidate.position} • {candidate.age} ans • {candidate.heightCm} cm
                      </p>
                      <p className="text-xs text-blue-600 font-semibold mt-0.5">Club actuel : {candidate.currentClub}</p>
                    </div>

                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {candidate.stage}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{candidate.scoutReport}"
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {candidate.contactPhone}
                    </span>
                    {candidate.trialDate && (
                      <span className="font-semibold text-emerald-600">Essai : {candidate.trialDate}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Candidate Detailed Evaluation Sheet */}
        <div>
          {selectedCandidate ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 sticky top-24">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900">{selectedCandidate.fullName}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {selectedCandidate.categoryTarget}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedCandidate.position} • Club d'origine : {selectedCandidate.currentClub}
                </p>
              </div>

              {/* Skills Radar Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Évaluation Compétences Staff (/10)
                </span>
                <div className="space-y-2 text-xs">
                  {Object.entries(selectedCandidate.skillsRadar).map(([skill, rawVal]) => {
                    const val = Number(rawVal);
                    return (
                      <div key={skill} className="space-y-1">
                        <div className="flex justify-between font-semibold capitalize text-slate-700">
                          <span>{skill}</span>
                          <span>{val} / 10</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${(val / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pipeline Stage Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700">Changer l'étape de recrutement :</span>
                <select
                  value={selectedCandidate.stage}
                  onChange={e => handleUpdateStage(selectedCandidate.id, e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 outline-hidden font-semibold text-slate-800"
                >
                  {stages.map(s => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => showToast(`Convocation essai transmise à ${selectedCandidate.fullName}.`)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                Planifier un Essai Terrain
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-400">
              Sélectionnez une recrue pour visualiser son rapport de détection.
            </div>
          )}
        </div>
      </div>

      {/* New Prospect Modal */}
      {isNewProspectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Ajouter une Recrue / Prospect</h3>
                  <p className="text-xs text-slate-500">Enregistrement d'un profil scouté et intégration au pipeline</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewProspectModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProspect} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nom & Prénom du Joueur *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Mattéo Rossi"
                    value={newFullName}
                    onChange={e => setNewFullName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Poste de Jeu
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Passeur, Attaquant..."
                    value={newPosition}
                    onChange={e => setNewPosition(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Âge
                  </label>
                  <input
                    type="number"
                    min={14}
                    max={40}
                    value={newAge}
                    onChange={e => setNewAge(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Taille (cm)
                  </label>
                  <input
                    type="number"
                    min={140}
                    max={230}
                    value={newHeightCm}
                    onChange={e => setNewHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Étape Pipeline
                  </label>
                  <select
                    value={newStage}
                    onChange={e => setNewStage(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    {stages.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Club Actuel
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: AS Cannes Volley"
                    value={newCurrentClub}
                    onChange={e => setNewCurrentClub(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Téléphone / Agent
                  </label>
                  <input
                    type="text"
                    placeholder="06 00 00 00 00"
                    value={newContactPhone}
                    onChange={e => setNewContactPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              {/* Radar Scores initial */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Évaluation Initiale Staff (/10)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block mb-1">Technique</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      value={newTechScore}
                      onChange={e => setNewTechScore(Number(e.target.value))}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-center font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block mb-1">Tactique</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      value={newTactScore}
                      onChange={e => setNewTactScore(Number(e.target.value))}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-center font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block mb-1">Physique</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      value={newPhysScore}
                      onChange={e => setNewPhysScore(Number(e.target.value))}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-center font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-bold block mb-1">Mental</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      value={newMentalScore}
                      onChange={e => setNewMentalScore(Number(e.target.value))}
                      className="w-full p-2 text-xs rounded-lg border border-slate-200 bg-slate-50 text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Rapport de Scouting & Observations
                </label>
                <textarea
                  rows={2}
                  value={newScoutReport}
                  onChange={e => setNewScoutReport(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewProspectModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Ajouter au Pipeline Recrutement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
