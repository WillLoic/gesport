import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Phone,
  CheckCircle,
  X,
  User,
  Star,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { TalentCandidate } from '../../types';
import { recruitmentService } from '../../services/recruitmentService';

export const RecruitmentView: React.FC = () => {
  const { talents, setTalents, currentSportConfig, showToast } = useClub();
  const [selectedCandidate, setSelectedCandidate] = useState<TalentCandidate | null>(talents[0] || null);
  const [isNewProspectModalOpen, setIsNewProspectModalOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<TalentCandidate | null>(null);

  useEffect(() => {
    if (talents.length > 0 && (!selectedCandidate || !talents.some(t => t.id === selectedCandidate.id))) {
      setSelectedCandidate(talents[0]);
    }
  }, [talents]);

  // New Prospect Form State
  const [newFullName, setNewFullName] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [newCategoryTarget, setNewCategoryTarget] = useState('');
  const [newAge, setNewAge] = useState<number | ''>('');
  const [newHeightCm, setNewHeightCm] = useState<number | ''>('');
  const [newCurrentClub, setNewCurrentClub] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newStage, setNewStage] = useState<any>('Prospecté');
  const [newScoutReport, setNewScoutReport] = useState('');
  const [newTechScore, setNewTechScore] = useState<number | ''>('');
  const [newTactScore, setNewTactScore] = useState<number | ''>('');
  const [newPhysScore, setNewPhysScore] = useState<number | ''>('');
  const [newMentalScore, setNewMentalScore] = useState<number | ''>('');

  const stages = [
    'Prospecté',
    'Premier Contact',
    'Essai Programmé',
    'Évaluation Staff',
    'Offre / Signé',
    'Refusé',
  ];

  const handleUpdateStage = async (candidateId: string, newStage: any) => {
    const candidate = talents.find(c => c.id === candidateId);
    if (!candidate) return;

    const updatedCandidate: TalentCandidate = { ...candidate, stage: newStage };

    setTalents(prev =>
      prev.map(c => (c.id === candidateId ? updatedCandidate : c))
    );
    if (selectedCandidate && selectedCandidate.id === candidateId) {
      setSelectedCandidate(updatedCandidate);
    }

    try {
      await recruitmentService.createOrUpdateProspect(updatedCandidate);
      showToast(`Statut de recrutement actualisé : ${newStage}`);
    } catch (err) {
      console.error('Erreur mise à jour prospect:', err);
      showToast(`Statut actualisé en local : ${newStage}`);
    }
  };

  const resetForm = () => {
    setNewFullName('');
    setNewPosition('');
    setNewCategoryTarget('');
    setNewAge('');
    setNewHeightCm('');
    setNewCurrentClub('');
    setNewContactPhone('');
    setNewStage('Prospecté');
    setNewScoutReport('');
    setNewTechScore('');
    setNewTactScore('');
    setNewPhysScore('');
    setNewMentalScore('');
    setEditingProspect(null);
  };

  const openEditModal = (candidate: TalentCandidate) => {
    setEditingProspect(candidate);
    setNewFullName(candidate.fullName);
    setNewPosition(candidate.position);
    setNewCategoryTarget(candidate.categoryTarget);
    setNewAge(candidate.age);
    setNewHeightCm(candidate.heightCm);
    setNewCurrentClub(candidate.currentClub);
    setNewContactPhone(candidate.contactPhone);
    setNewStage(candidate.stage);
    setNewScoutReport(candidate.scoutReport);
    setNewTechScore(candidate.skillsRadar.technique);
    setNewTactScore(candidate.skillsRadar.tactique);
    setNewPhysScore(candidate.skillsRadar.physique);
    setNewMentalScore(candidate.skillsRadar.mental);
    setIsNewProspectModalOpen(true);
  };

  const handleDeleteProspect = async (candidate: TalentCandidate) => {
    try {
      await recruitmentService.deleteProspect(candidate.id);
      setTalents(prev => prev.filter(c => c.id !== candidate.id));
      if (selectedCandidate?.id === candidate.id) {
        setSelectedCandidate(null);
      }
      showToast(`Prospect ${candidate.fullName} supprimé avec succès.`);
    } catch (err) {
      console.error('Erreur suppression prospect:', err);
      setTalents(prev => prev.filter(c => c.id !== candidate.id));
      if (selectedCandidate?.id === candidate.id) {
        setSelectedCandidate(null);
      }
      showToast(`Prospect ${candidate.fullName} supprimé en local.`);
    }
  };

  const handleCreateProspect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim()) {
      showToast('Veuillez renseigner le nom complet de la recrue.');
      return;
    }

    const tempCandidate: TalentCandidate = {
      id: editingProspect ? editingProspect.id : `talent-${Date.now()}`,
      fullName: newFullName.trim(),
      position: newPosition || 'Joueur Polyvalent',
      categoryTarget: (newCategoryTarget || 'Nationale 1 Masculine') as any,
      age: Number(newAge) || 20,
      heightCm: Number(newHeightCm) || 190,
      currentClub: newCurrentClub.trim() || 'Club Libre',
      contactPhone: newContactPhone.trim() || '06 00 00 00 00',
      stage: newStage as any,
      trialDate: newStage === 'Essai Programmé' ? new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0] : undefined,
      scoutReport: newScoutReport.trim() || 'Aucun rapport rédigé.',
      skillsRadar: {
        technique: Number(newTechScore) || 8,
        tactique: Number(newTactScore) || 8,
        physique: Number(newPhysScore) || 8,
        mental: Number(newMentalScore) || 8,
        collectif: 8,
      },
    };

    try {
      const savedCandidate = await recruitmentService.createOrUpdateProspect(tempCandidate);
      if (editingProspect) {
        setTalents(prev => prev.map(c => c.id === editingProspect.id ? savedCandidate : c));
      } else {
        setTalents(prev => [savedCandidate, ...prev]);
      }
      setSelectedCandidate(savedCandidate);
      showToast(`Prospect ${savedCandidate.fullName} ${editingProspect ? 'modifié' : 'enregistré'} en base de données !`);
    } catch (err) {
      console.error('Erreur création prospect backend:', err);
      if (editingProspect) {
        setTalents(prev => prev.map(c => c.id === editingProspect.id ? tempCandidate : c));
      } else {
        setTalents(prev => [tempCandidate, ...prev]);
      }
      setSelectedCandidate(tempCandidate);
      showToast(`Prospect ${tempCandidate.fullName} ${editingProspect ? 'modifié' : 'ajouté'} en local.`);
    }

    setIsNewProspectModalOpen(false);
    resetForm();
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
          onClick={() => { resetForm(); setIsNewProspectModalOpen(true); }}
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

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {candidate.stage}
                      </span>
                      <button
                        type="button"
                        title="Modifier ce prospect"
                        onClick={(e) => { e.stopPropagation(); openEditModal(candidate); }}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-400 hover:text-amber-600 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Supprimer ce prospect"
                        onClick={(e) => { e.stopPropagation(); handleDeleteProspect(candidate); }}
                        className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                  <h3 className="font-bold text-lg text-slate-900 font-display">{editingProspect ? 'Modifier le Prospect' : 'Ajouter une Recrue / Prospect'}</h3>
                  <p className="text-xs text-slate-500">{editingProspect ? 'Mise à jour des informations du prospect' : 'Enregistrement d\'un profil scouté et intégration au pipeline'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsNewProspectModalOpen(false); resetForm(); }}
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
                    placeholder="Ex: Will Loic"
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
                    placeholder="21"
                    value={newAge}
                    onChange={e => setNewAge(e.target.value === '' ? '' : Number(e.target.value))}
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
                    placeholder="192"
                    value={newHeightCm}
                    onChange={e => setNewHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
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
                    placeholder="Ex: AS Gesport"
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
                      placeholder="8.5"
                      value={newTechScore}
                      onChange={e => setNewTechScore(e.target.value === '' ? '' : Number(e.target.value))}
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
                      placeholder="8.0"
                      value={newTactScore}
                      onChange={e => setNewTactScore(e.target.value === '' ? '' : Number(e.target.value))}
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
                      placeholder="7.5"
                      value={newPhysScore}
                      onChange={e => setNewPhysScore(e.target.value === '' ? '' : Number(e.target.value))}
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
                      placeholder="9.0"
                      value={newMentalScore}
                      onChange={e => setNewMentalScore(e.target.value === '' ? '' : Number(e.target.value))}
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
                  placeholder="Ex: Vision de jeu exceptionnelle, très bonne qualité de main, grosse présence au bloc."
                  value={newScoutReport}
                  onChange={e => setNewScoutReport(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsNewProspectModalOpen(false); resetForm(); }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  {editingProspect ? 'Enregistrer les Modifications' : 'Ajouter au Pipeline Recrutement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
