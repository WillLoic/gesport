import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Mail,
  Phone,
  Shield,
  Award,
  X,
  User,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { StaffMember } from '../../types';

export const StaffHierarchyView: React.FC = () => {
  const { staff, setStaff, showToast } = useClub();
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isNewStaffModalOpen, setIsNewStaffModalOpen] = useState(false);

  // New Staff Form State
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Entraîneur Adjoint & Analyste');
  const [newDepartment, setNewDepartment] = useState('Staff Technique');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newContractType, setNewContractType] = useState('CDD Temps Plein');
  const [newQualifications, setNewQualifications] = useState('DEJEPS Volley-ball, Prépa Physique Universitaire');
  const [newAssignedTeams, setNewAssignedTeams] = useState('Équipe Réserve, U18 France');
  const [newAccessLevel, setNewAccessLevel] = useState<'Admin' | 'Manager' | 'Coach' | 'Medical' | 'Staff'>('Coach');

  const departments = [
    'Direction & Bureau',
    'Staff Technique',
    'Pôle Médical & Santé',
    'Logistique & Équipement',
    'Communication & Événements',
  ];

  const filteredStaff = staff.filter(s =>
    selectedDepartment === 'all' ? true : s.department === selectedDepartment
  );

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast('Veuillez renseigner le nom complet du membre du staff.');
      return;
    }

    const newMember: StaffMember = {
      id: `staff-${Date.now()}`,
      name: newName.trim(),
      role: newRole.trim(),
      department: newDepartment,
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@club.fr`,
      phone: newPhone.trim() || '06 00 00 00 00',
      contractType: newContractType,
      qualifications: newQualifications
        .split(',')
        .map(q => q.trim())
        .filter(Boolean),
      assignedTeams: newAssignedTeams
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      accessLevel: newAccessLevel,
    };

    setStaff(prev => [newMember, ...prev]);
    setIsNewStaffModalOpen(false);
    showToast(`Membre du staff ${newMember.name} (${newMember.role}) ajouté à l'organigramme !`);

    // Reset Form
    setNewName('');
    setNewEmail('');
    setNewPhone('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Organigramme & Staff Club</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Structure des pôles de responsabilités, entraîneurs diplômés, staff médical et permissions d'accès
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewStaffModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Membre Staff
        </button>
      </div>

      {/* Department filter tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedDepartment('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedDepartment === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tous les pôles ({staff.length})
        </button>
        {departments.map(d => (
          <button
            key={d}
            type="button"
            onClick={() => setSelectedDepartment(d)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedDepartment === d
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map(member => (
          <div
            key={member.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 font-bold text-sm flex items-center justify-center">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{member.name}</h3>
                    <p className="text-xs font-semibold text-blue-600">{member.role}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{member.department}</span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {member.contractType}
                </span>
              </div>

              {/* Qualifications / Diplomas */}
              <div className="mt-4 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Diplômes & Compétences :
                </span>
                <div className="flex flex-wrap gap-1">
                  {member.qualifications.map((q, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold"
                    >
                      <Award className="w-3 h-3 text-blue-500" />
                      {q}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assigned Teams */}
              {member.assignedTeams.length > 0 && (
                <div className="mt-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-500">Équipes confiées : </span>
                  <span className="font-bold text-slate-800">{member.assignedTeams.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {member.phone}
              </span>
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <Shield className="w-3.5 h-3.5 text-indigo-500" /> {member.accessLevel}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* New Staff Member Modal */}
      {isNewStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Ajouter un Membre du Staff</h3>
                  <p className="text-xs text-slate-500">Intégration à l'organigramme officiel et affectation aux équipes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewStaffModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nom & Prénom *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: David Dupont"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Rôle / Intitulé du Poste *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Entraîneur Adjoint, Kiné, Trésorier..."
                    value={newRole}
                    onChange={e => setNewRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Pôle / Département
                  </label>
                  <select
                    value={newDepartment}
                    onChange={e => setNewDepartment(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Type de Contrat
                  </label>
                  <select
                    value={newContractType}
                    onChange={e => setNewContractType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="CDI">CDI</option>
                    <option value="CDD">CDD</option>
                    <option value="Bénévolat / Dirigeant">Bénévolat / Dirigeant</option>
                    <option value="Prestataire / Indépendant">Prestataire / Indépendant</option>
                    <option value="Service Civique / Alternant">Service Civique / Alternant</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Professionnel
                  </label>
                  <input
                    type="email"
                    placeholder="david.dupont@club.fr"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    placeholder="06 00 00 00 00"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Diplômes & Titres (séparés par des virgules)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Licence STAPS, DESJEPS, Titre Kiné D.E."
                  value={newQualifications}
                  onChange={e => setNewQualifications(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Équipes Confiées
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Équipe Pro, U15 Régionale"
                    value={newAssignedTeams}
                    onChange={e => setNewAssignedTeams(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Niveau d'Accès Plateforme
                  </label>
                  <select
                    value={newAccessLevel}
                    onChange={e => setNewAccessLevel(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Admin">Admin Total (Complet)</option>
                    <option value="Manager">Manager Sportif / Bureau</option>
                    <option value="Coach">Entraîneur / Coach</option>
                    <option value="Medical">Pôle Médical & Soins</option>
                    <option value="Staff">Staff Opérationnel</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewStaffModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Ajouter à l'Organigramme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
