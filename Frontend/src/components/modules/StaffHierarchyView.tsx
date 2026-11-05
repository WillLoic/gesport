import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Phone,
  Shield,
  Award,
  X,
  Edit3,
  UserMinus,
  AlertTriangle,
  Mail,
  Loader2,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { StaffMember } from '../../types';
import { staffMemberService } from '../../services/documentsService';

export const StaffHierarchyView: React.FC = () => {
  const { staff, setStaff, showToast } = useClub();
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isNewStaffModalOpen, setIsNewStaffModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Modal d'édition
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Modal de licenciement
  const [memberToFire, setMemberToFire] = useState<StaffMember | null>(null);
  const [isFireModalOpen, setIsFireModalOpen] = useState(false);
  const [isFiring, setIsFiring] = useState(false);

  // Form state (partagé création & édition)
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('Entraîneur Adjoint & Analyste');
  const [formDepartment, setFormDepartment] = useState('Staff Technique');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formContractType, setFormContractType] = useState('CDI');
  const [formQualifications, setFormQualifications] = useState('');
  const [formAssignedTeams, setFormAssignedTeams] = useState('');
  const [formAccessLevel, setFormAccessLevel] = useState<'Admin' | 'Manager' | 'Coach' | 'Medical' | 'Staff'>('Coach');

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

  const resetForm = () => {
    setFormName('');
    setFormRole('Entraîneur Adjoint & Analyste');
    setFormDepartment('Staff Technique');
    setFormEmail('');
    setFormPhone('');
    setFormContractType('CDI');
    setFormQualifications('');
    setFormAssignedTeams('');
    setFormAccessLevel('Coach');
  };

  const openEditModal = (member: StaffMember) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormRole(member.role);
    setFormDepartment(member.department);
    setFormEmail(member.email);
    setFormPhone(member.phone === '—' ? '' : member.phone);
    setFormContractType(member.contractType);
    setFormQualifications(member.qualifications.join(', '));
    setFormAssignedTeams(member.assignedTeams.join(', '));
    setFormAccessLevel(member.accessLevel as any);
    setIsEditModalOpen(true);
  };

  const openFireModal = (member: StaffMember) => {
    setMemberToFire(member);
    setIsFireModalOpen(true);
  };

  // Création d'un nouveau membre
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Veuillez renseigner le nom complet du membre du staff.');
      return;
    }
    setIsLoading(true);
    try {
      const created = await staffMemberService.createStaffMember({
        name: formName.trim(),
        role: formRole.trim(),
        department: formDepartment,
        email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '.')}@club.fr`,
        phone: formPhone.trim() || '',
        contract_type: formContractType,
        qualifications: formQualifications.split(',').map(q => q.trim()).filter(Boolean),
        assigned_teams: formAssignedTeams.split(',').map(t => t.trim()).filter(Boolean),
        access_level: formAccessLevel,
      });
      setStaff(prev => [created, ...prev]);
      setIsNewStaffModalOpen(false);
      resetForm();
      showToast(`✅ ${created.name} (${created.role}) ajouté à l'organigramme !`);
    } catch (err: any) {
      showToast(`Erreur lors de la création : ${err?.message || 'Vérifiez les données saisies.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Modification d'un membre
  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    if (!formName.trim()) {
      showToast('Veuillez renseigner le nom complet du membre du staff.');
      return;
    }
    setIsLoading(true);
    try {
      const updated = await staffMemberService.updateStaffMember(editingMember.id, {
        name: formName.trim(),
        role: formRole.trim(),
        department: formDepartment,
        email: formEmail.trim(),
        phone: formPhone.trim(),
        contract_type: formContractType,
        qualifications: formQualifications.split(',').map(q => q.trim()).filter(Boolean),
        assigned_teams: formAssignedTeams.split(',').map(t => t.trim()).filter(Boolean),
        access_level: formAccessLevel,
      });
      setStaff(prev => prev.map(m => m.id === editingMember.id ? updated : m));
      setIsEditModalOpen(false);
      setEditingMember(null);
      resetForm();
      showToast(`✅ Fiche de ${updated.name} mise à jour avec succès.`);
    } catch (err: any) {
      showToast(`Erreur lors de la modification : ${err?.message || 'Vérifiez les données saisies.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Licenciement (suppression)
  const handleFireStaff = async () => {
    if (!memberToFire) return;
    setIsFiring(true);
    try {
      await staffMemberService.deleteStaffMember(memberToFire.id);
      setStaff(prev => prev.filter(m => m.id !== memberToFire.id));
      setIsFireModalOpen(false);
      setMemberToFire(null);
      showToast(`🔴 ${memberToFire.name} a été licencié(e) et supprimé(e) de la base de données.`);
    } catch (err: any) {
      showToast(`Erreur lors du licenciement : ${err?.message || 'Une erreur est survenue.'}`);
    } finally {
      setIsFiring(false);
    }
  };

  // Formulaire partagé (création & édition)
  const StaffForm = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => Promise<void>; submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Nom & Prénom *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: David Dupont"
            value={formName}
            onChange={e => setFormName(e.target.value)}
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
            value={formRole}
            onChange={e => setFormRole(e.target.value)}
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
            value={formDepartment}
            onChange={e => setFormDepartment(e.target.value)}
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
            value={formContractType}
            onChange={e => setFormContractType(e.target.value)}
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
            value={formEmail}
            onChange={e => setFormEmail(e.target.value)}
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
            value={formPhone}
            onChange={e => setFormPhone(e.target.value)}
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
          value={formQualifications}
          onChange={e => setFormQualifications(e.target.value)}
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
            value={formAssignedTeams}
            onChange={e => setFormAssignedTeams(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Niveau d'Accès Plateforme
          </label>
          <select
            value={formAccessLevel}
            onChange={e => setFormAccessLevel(e.target.value as any)}
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
          onClick={() => {
            setIsNewStaffModalOpen(false);
            setIsEditModalOpen(false);
            setEditingMember(null);
            resetForm();
          }}
          className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl shadow-md transition-colors"
        >
          {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );

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
          onClick={() => {
            resetForm();
            setIsNewStaffModalOpen(true);
          }}
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

      {/* Empty state */}
      {filteredStaff.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <Briefcase className="w-12 h-12 mb-3 opacity-30" />
          <p className="font-semibold text-sm">Aucun membre du staff</p>
          <p className="text-xs mt-1">Ajoutez votre premier membre en cliquant sur le bouton ci-dessus.</p>
        </div>
      )}

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

              {/* Contact */}
              <div className="mt-3 flex flex-col gap-1">
                {member.email && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {member.email}
                  </span>
                )}
                {member.phone && member.phone !== '—' && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {member.phone}
                  </span>
                )}
              </div>

              {/* Qualifications / Diplomas */}
              {member.qualifications.length > 0 && (
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
              )}

              {/* Assigned Teams */}
              {member.assignedTeams.length > 0 && (
                <div className="mt-3 text-xs text-slate-600">
                  <span className="font-semibold text-slate-500">Équipes confiées : </span>
                  <span className="font-bold text-slate-800">{member.assignedTeams.join(', ')}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-1 text-xs text-slate-700 font-medium">
                <Shield className="w-3.5 h-3.5 text-indigo-500" /> {member.accessLevel}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(member)}
                  title="Modifier"
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => openFireModal(member)}
                  title="Licencier"
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  Licencier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── Modal : Ajouter un Membre ─── */}
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
                onClick={() => { setIsNewStaffModalOpen(false); resetForm(); }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <StaffForm onSubmit={handleCreateStaff} submitLabel="Ajouter à l'Organigramme" />
          </div>
        </div>
      )}

      {/* ─── Modal : Modifier un Membre ─── */}
      {isEditModalOpen && editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Modifier la Fiche Staff</h3>
                  <p className="text-xs text-slate-500">{editingMember.name} — {editingMember.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsEditModalOpen(false); setEditingMember(null); resetForm(); }}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <StaffForm onSubmit={handleEditStaff} submitLabel="Enregistrer les Modifications" />
          </div>
        </div>
      )}

      {/* ─── Modal : Confirmer Licenciement ─── */}
      {isFireModalOpen && memberToFire && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-red-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-4 border-b border-red-100">
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Confirmer le Licenciement</h3>
                <p className="text-xs text-red-500 font-semibold">Action irréversible</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 space-y-2">
              <p className="text-sm font-semibold text-slate-800">
                Vous êtes sur le point de licencier <span className="text-red-700">{memberToFire.name}</span> ({memberToFire.role}).
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                ⚠️ <strong>Attention :</strong> Le licenciement entraîne la <strong>suppression définitive</strong> de cette fiche dans la base de données. Cette action est <strong>irréversible</strong>. Toutes les informations liées à ce membre (contrat, affectations, diplômes) seront perdues.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => { setIsFireModalOpen(false); setMemberToFire(null); }}
                disabled={isFiring}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleFireStaff}
                disabled={isFiring}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-xl shadow-md transition-colors"
              >
                {isFiring ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <UserMinus className="w-3.5 h-3.5" />
                )}
                Confirmer le Licenciement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
