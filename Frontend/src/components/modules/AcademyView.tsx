import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  BookOpen,
  TrendingUp,
  Award,
  Phone,
  X,
  User,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { AcademyStudent } from '../../types';
import { academyService } from '../../services/academyService';

export const AcademyView: React.FC = () => {
  const { academy, setAcademy, members, showToast } = useClub();
  const [selectedStudent, setSelectedStudent] = useState<AcademyStudent | null>(null);
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<AcademyStudent | null>(null);

  // Form State
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('U18 Espoirs');
  const [newAge, setNewAge] = useState<number | ''>('');
  const [newSchoolGrade, setNewSchoolGrade] = useState('');
  const [newParentsName, setNewParentsName] = useState('');
  const [newParentsPhone, setNewParentsPhone] = useState('');
  const [newTutorCoach, setNewTutorCoach] = useState('');
  const [newSchoolSupport, setNewSchoolSupport] = useState(false);
  const [newCoachComments, setNewCoachComments] = useState('');

  // Keep selectedStudent in sync with academy list updates
  useEffect(() => {
    if (academy.length > 0) {
      if (!selectedStudent || !academy.some(s => s.id === selectedStudent.id)) {
        setSelectedStudent(academy[0]);
      }
    } else {
      setSelectedStudent(null);
    }
  }, [academy]);

  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    const defaultMember = members[0];
    setSelectedMemberId(defaultMember ? defaultMember.id : '');
    setNewName(defaultMember ? `${defaultMember.firstName} ${defaultMember.lastName}` : '');
    setNewCategory(defaultMember?.category || 'U18 Espoirs');
    setNewAge('');
    setNewSchoolGrade('');
    setNewParentsName('');
    setNewParentsPhone('');
    setNewTutorCoach('');
    setNewSchoolSupport(false);
    setNewCoachComments('');
    setIsNewStudentModalOpen(true);
  };

  const handleMemberSelect = (memberId: string) => {
    setSelectedMemberId(memberId);
    const found = members.find(m => m.id === memberId);
    if (found) {
      setNewName(`${found.firstName} ${found.lastName}`);
      if (found.category) setNewCategory(found.category);
    }
  };

  const handleOpenEditModal = (student: AcademyStudent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStudent(student);
    setSelectedMemberId(student.memberId || (members[0] ? members[0].id : ''));
    setNewName(student.studentName);
    setNewCategory(student.category);
    setNewAge(student.age || '');
    setNewSchoolGrade(student.schoolGrade || '');
    setNewParentsName(student.parentsName || '');
    setNewParentsPhone(student.parentsPhone || '');
    setNewTutorCoach(student.tutorCoachName || '');
    setNewSchoolSupport(student.schoolSupportNeeded);
    setNewCoachComments(student.coachComments || '');
    setIsNewStudentModalOpen(true);
  };

  const handleDeleteStudent = async (studentId: string, studentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Voulez-vous vraiment supprimer le dossier de ${studentName} ?`)) return;

    try {
      await academyService.deleteStudent(studentId);
      setAcademy(prev => prev.filter(s => s.id !== studentId));
      if (selectedStudent?.id === studentId) {
        setSelectedStudent(null);
      }
      showToast(`Dossier académicien ${studentName} supprimé.`);
    } catch (err) {
      showToast('Erreur lors de la suppression.');
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Veuillez renseigner le nom de l\'académicien.');
      return;
    }

    const payload: Partial<AcademyStudent> = {
      ...(editingStudent ? { id: editingStudent.id } : {}),
      memberId: selectedMemberId,
      studentName: newName.trim(),
      category: newCategory as any,
      age: Number(newAge) || 16,
      schoolGrade: newSchoolGrade.trim() || 'Niveau non précisé',
      parentsName: newParentsName.trim() || 'Parents Référents',
      parentsPhone: newParentsPhone.trim() || '',
      tutorCoachName: newTutorCoach.trim() || 'Coach Tuteur',
      schoolSupportNeeded: newSchoolSupport,
      coachComments: newCoachComments.trim(),
    };

    try {
      const saved = await academyService.createOrUpdateStudent(payload);
      if (editingStudent) {
        setAcademy(prev => prev.map(s => (s.id === saved.id ? saved : s)));
        showToast(`Fiche de ${saved.studentName} mise à jour.`);
      } else {
        setAcademy(prev => [saved, ...prev]);
        showToast(`Jeune espoir ${saved.studentName} inscrit à l'Académie !`);
      }
      setSelectedStudent(saved);
      setIsNewStudentModalOpen(false);
    } catch (err) {
      showToast('Erreur lors de l\'enregistrement.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Académie & Double Projet Sport-Études</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Suivi des jeunes espoirs, bulletins scolaires, bilans trimestriels et entretiens avec les parents
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Académicien
        </button>
      </div>

      {/* Main Grid: Student Cards + Detailed Record */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Students Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {academy.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-base">Aucun académicien inscrit</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Aucun dossier de suivi sport-études n'est actuellement enregistré dans la base de données.
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Ajouter un Académicien
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {academy.map(student => {
                const isSelected = selectedStudent?.id === student.id;
                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer space-y-3 relative ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-base text-slate-900">{student.studentName}</h3>
                        <p className="text-xs text-slate-500">
                          {student.category} • {student.age} ans • Classe : {student.schoolGrade}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={e => handleOpenEditModal(student, e)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier le dossier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={e => handleDeleteStudent(student.id, student.studentName, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Supprimer le dossier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 inline-block">
                      Tuteur : {student.tutorCoachName}
                    </span>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                      "{student.coachComments}"
                    </p>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {student.parentsPhone || 'Non renseigné'}
                      </span>
                      {student.schoolSupportNeeded ? (
                        <span className="text-rose-600 font-bold text-[11px] bg-rose-50 px-2 py-0.5 rounded">
                          Soutien requis
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded">
                          Scolarité OK
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Student Detailed Record */}
        <div>
          {selectedStudent ? (
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 sticky top-24">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900">{selectedStudent.studentName}</h3>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {selectedStudent.category}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Classe : {selectedStudent.schoolGrade} • Parents : {selectedStudent.parentsName}
                </p>
              </div>

              {/* Progress Scores Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Bilan Trimestriel Sport & Scolaire (/20)
                </span>
                {selectedStudent.progressScores.map((score, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                    <div className="font-bold text-blue-700">{score.quarter}</div>
                    <div className="grid grid-cols-2 gap-2 text-slate-700 font-medium">
                      <div>Technique : <span className="font-bold">{score.technicalScore}/20</span></div>
                      <div>Tactique : <span className="font-bold">{score.tacticalScore}/20</span></div>
                      <div>Athlétique : <span className="font-bold">{score.athleticScore}/20</span></div>
                      <div>Attitude / Esprit : <span className="font-bold">{score.attitudeScore}/20</span></div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => showToast(`Bilan complet généré pour les parents de ${selectedStudent.studentName}.`)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors"
              >
                Générer Bulletin Trimestriel PDF
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-400">
              Sélectionnez un académicien pour afficher son livret de suivi.
            </div>
          )}
        </div>
      </div>

      {/* New / Edit Student Modal */}
      {isNewStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">
                    {editingStudent ? 'Modifier le dossier Académicien' : 'Ajouter un Académicien'}
                  </h3>
                  <p className="text-xs text-slate-500">Inscription au pôle espoir et double projet sport-études</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewStudentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Membre / Joueur associé
                </label>
                <select
                  value={selectedMemberId}
                  onChange={e => handleMemberSelect(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                >
                  {members.length === 0 && <option value="">Aucun membre disponible en base</option>}
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.category} - {m.teamName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nom & Prénom de l'Élève *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Raphaël Dupré"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Catégorie Sportive
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="U13 Pépinière">U13 Pépinière</option>
                    <option value="U15 Espoirs">U15 Espoirs</option>
                    <option value="U18 Espoirs">U18 Espoirs</option>
                    <option value="Centre de Formation Pro">Centre de Formation Pro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Âge (ans)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={23}
                    placeholder="Ex: 16"
                    value={newAge}
                    onChange={e => setNewAge(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Classe & Établissement
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Seconde Générale (Lycée Victor Hugo)"
                    value={newSchoolGrade}
                    onChange={e => setNewSchoolGrade(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nom des Parents / Tuteurs
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: M. et Mme Dupré"
                    value={newParentsName}
                    onChange={e => setNewParentsName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Téléphone Parents
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 06 11 22 33 44"
                    value={newParentsPhone}
                    onChange={e => setNewParentsPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Coach Tuteur Référent
                </label>
                <input
                  type="text"
                  placeholder="Ex: Marc Lemoine"
                  value={newTutorCoach}
                  onChange={e => setNewTutorCoach(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Appréciation Initiale & Objectifs
                </label>
                <textarea
                  rows={2}
                  placeholder="Appréciation globale du comportement et niveau sportif..."
                  value={newCoachComments}
                  onChange={e => setNewCoachComments(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="schoolSupport"
                  checked={newSchoolSupport}
                  onChange={e => setNewSchoolSupport(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="schoolSupport" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Nécessite un aménagement / soutien scolaire club
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewStudentModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  {editingStudent ? 'Mettre à jour' : "Inscrire l'Académicien"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
