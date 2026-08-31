import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  BookOpen,
  TrendingUp,
  Award,
  Phone,
  X,
  User,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { AcademyStudent } from '../../types';

export const AcademyView: React.FC = () => {
  const { academy, setAcademy, staff, showToast } = useClub();
  const [selectedStudent, setSelectedStudent] = useState<AcademyStudent | null>(academy[0] || null);
  const [isNewStudentModalOpen, setIsNewStudentModalOpen] = useState(false);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('U18 Espoirs');
  const [newAge, setNewAge] = useState(16);
  const [newSchoolGrade, setNewSchoolGrade] = useState('1ère Générale (Lycée Sport-Études)');
  const [newParentsName, setNewParentsName] = useState('');
  const [newParentsPhone, setNewParentsPhone] = useState('');
  const [newTutorCoach, setNewTutorCoach] = useState('Marc Lemoine');
  const [newSchoolSupport, setNewSchoolSupport] = useState(false);
  const [newCoachComments, setNewCoachComments] = useState('Fort potentiel athlétique et excellente écoute tactique. Bon équilibre avec la scolarité.');

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Veuillez renseigner le nom de l\'académicien.');
      return;
    }

    const newStudent: AcademyStudent = {
      id: `acad-${Date.now()}`,
      memberId: `mem-${Date.now()}`,
      studentName: newName.trim(),
      category: newCategory as any,
      age: Number(newAge) || 16,
      schoolGrade: newSchoolGrade,
      parentsName: newParentsName.trim() || 'Parents Référents',
      parentsPhone: newParentsPhone.trim() || '06 11 22 33 44',
      tutorCoachName: newTutorCoach,
      schoolSupportNeeded: newSchoolSupport,
      coachComments: newCoachComments.trim(),
      progressScores: [
        {
          quarter: 'Trimestre en cours (Évaluation initiale)',
          technicalScore: 15,
          tacticalScore: 14,
          athleticScore: 16,
          attitudeScore: 18,
        },
      ],
    };

    setAcademy(prev => [newStudent, ...prev]);
    setSelectedStudent(newStudent);
    setIsNewStudentModalOpen(false);
    showToast(`Jeune espoir ${newStudent.studentName} inscrit à l'Académie !`);

    // Reset Form
    setNewName('');
    setNewParentsName('');
    setNewParentsPhone('');
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
          onClick={() => setIsNewStudentModalOpen(true)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {academy.map(student => {
              const isSelected = selectedStudent?.id === student.id;
              return (
                <div
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`p-5 rounded-2xl bg-white border transition-all cursor-pointer space-y-3 ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{student.studentName}</h3>
                      <p className="text-xs text-slate-500">
                        {student.category} • {student.age} ans • Classe : {student.schoolGrade}
                      </p>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      Tuteur : {student.tutorCoachName}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                    "{student.coachComments}"
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {student.parentsPhone}
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
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
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

      {/* New Student Modal */}
      {isNewStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Ajouter un Académicien</h3>
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

            <form onSubmit={handleCreateStudent} className="space-y-4">
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
                    value={newAge}
                    onChange={e => setNewAge(Number(e.target.value))}
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
                    placeholder="06 00 00 00 00"
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
                  placeholder="Nom du coach tuteur"
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
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Inscrire l'Académicien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
