import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  Mail,
  Phone,
  Calendar,
  Shield,
  FileCheck,
  Edit,
  Trash2,
  X,
  CreditCard,
  User,
  HeartPulse,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { Member, SportCategory, LicenseStatus } from '../../types';

export const MembersView: React.FC = () => {
  const { members, setMembers, teams, currentSportConfig, showToast } = useClub();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);

  // New Member Form States
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGender, setNewGender] = useState<'M' | 'F'>('M');
  const [newBirthDate, setNewBirthDate] = useState('2001-04-12');
  const [newTeamId, setNewTeamId] = useState(teams[0]?.id || 't1');
  const [newCategory, setNewCategory] = useState<SportCategory>('Senior Régionale');
  const [newPosition, setNewPosition] = useState(currentSportConfig.positions[0] || 'Joueur');
  const [newJerseyNumber, setNewJerseyNumber] = useState<number>(10);
  const [newLicenseNumber, setNewLicenseNumber] = useState(`LIC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [newAmountDue, setNewAmountDue] = useState(290);
  const [newAmountPaid, setNewAmountPaid] = useState(290);
  const [newEmergencyName, setNewEmergencyName] = useState('');
  const [newEmergencyPhone, setNewEmergencyPhone] = useState('');
  const [newEmergencyRelation, setNewEmergencyRelation] = useState('Parent / Proche');

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFirstName.trim() || !newLastName.trim()) {
      showToast('Veuillez remplir au minimum le prénom et le nom du licencié.');
      return;
    }
    const assignedTeam = teams.find(t => t.id === newTeamId) || teams[0];
    const newMember: Member = {
      id: `m-${Date.now()}`,
      firstName: newFirstName.trim(),
      lastName: newLastName.trim(),
      email: newEmail.trim() || `${newFirstName.toLowerCase()}.${newLastName.toLowerCase()}@club.fr`,
      phone: newPhone.trim() || '06 12 34 56 78',
      gender: newGender,
      birthDate: newBirthDate,
      category: newCategory,
      teamId: assignedTeam ? assignedTeam.id : 't1',
      teamName: assignedTeam ? assignedTeam.name : 'Équipe Principale',
      licenseNumber: newLicenseNumber.trim() || `LIC-${Math.floor(100000 + Math.random() * 900000)}`,
      licenseStatus: 'Validée',
      season: '2024-2025',
      medicalCertDate: new Date().toISOString().split('T')[0],
      medicalCertValid: true,
      position: newPosition,
      jerseyNumber: Number(newJerseyNumber) || 1,
      paymentStatus: Number(newAmountPaid) >= Number(newAmountDue) ? 'À jour' : 'Échelonné',
      amountDue: Number(newAmountDue) || 290,
      amountPaid: Number(newAmountPaid) || 290,
      emergencyContact: {
        name: newEmergencyName.trim() || 'Contact d\'urgence',
        phone: newEmergencyPhone.trim() || '06 00 00 00 00',
        relation: newEmergencyRelation,
      },
      address: 'Métropole',
    };

    setMembers(prev => [newMember, ...prev]);
    setIsNewMemberModalOpen(false);
    showToast(`Licencié ${newMember.firstName} ${newMember.lastName} enregistré avec succès !`);
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewPhone('');
  };

  // Filter members
  const filteredMembers = members.filter(m => {
    const matchesSearch =
      searchTerm === '' ||
      m.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesTeam = selectedTeam === 'all' || m.teamId === selectedTeam;
    const matchesStatus = selectedStatus === 'all' || m.licenseStatus === selectedStatus;

    return matchesSearch && matchesCategory && matchesTeam && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = 'ID,Prenom,Nom,Licence,Statut,Equipe,Categorie,Email,Telephone,CertificatMedical,Paiement\n';
    const rows = filteredMembers
      .map(
        m =>
          `"${m.id}","${m.firstName}","${m.lastName}","${m.licenseNumber}","${m.licenseStatus}","${m.teamName}","${m.category}","${m.email}","${m.phone}","${m.medicalCertValid ? 'Valide' : 'Expiré'}","${m.paymentStatus}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `licencies_volleypro_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export CSV des licenciés téléchargé avec succès !');
  };

  const handleToggleLicenseValidation = (memberId: string) => {
    setMembers(prev =>
      prev.map(m => {
        if (m.id === memberId) {
          const nextStatus: LicenseStatus = m.licenseStatus === 'Validée' ? 'En attente' : 'Validée';
          return { ...m, licenseStatus: nextStatus };
        }
        return m;
      })
    );
    showToast('Statut de la licence mis à jour !');
  };

  const handleDeleteMember = (memberId: string) => {
    if (confirm('Confirmez-vous la suppression de ce licencié ?')) {
      setMembers(prev => prev.filter(m => m.id !== memberId));
      if (selectedMember?.id === memberId) {
        setSelectedMember(null);
      }
      showToast('Licencié supprimé du registre.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Gestion des Licenciés</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {filteredMembers.length} membres
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Dossiers sportifs, licences FFVB, certificats médicaux et cotisations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Exporter CSV
          </button>
          <button
            type="button"
            onClick={() => setIsNewMemberModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau Licencié
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Nom, prénom, licence..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-600 outline-hidden bg-slate-50/50"
            />
          </div>

          {/* Team Filter */}
          <div>
            <select
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:border-blue-600 outline-hidden text-slate-700"
            >
              <option value="all">Toutes les équipes ({members.length})</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* License Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:border-blue-600 outline-hidden text-slate-700"
            >
              <option value="all">Tous les statuts de licence</option>
              <option value="Validée">Licence Validée</option>
              <option value="En attente">En attente / Incomplet</option>
              <option value="Expirée">Licence Expirée</option>
              <option value="Paiement partiel">Paiement Partiel</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 focus:border-blue-600 outline-hidden text-slate-700"
            >
              <option value="all">Toutes les catégories</option>
              <option value="Senior Nationale">Senior Nationale</option>
              <option value="Senior Régionale">Senior Régionale</option>
              <option value="U18">U18</option>
              <option value="U15">U15</option>
              <option value="U13">U13</option>
              <option value="Loisir / Masters">Loisir / Masters</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Licencié</th>
                <th className="py-3 px-4">Équipe & Poste</th>
                <th className="py-3 px-4">N° Licence</th>
                <th className="py-3 px-4">Statut Licence</th>
                <th className="py-3 px-4">Certificat Médical</th>
                <th className="py-3 px-4">Cotisation</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucun licencié ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredMembers.map(member => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => setSelectedMember(member)}
                  >
                    {/* Name + Jersey */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                          #{member.jerseyNumber}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-xs text-slate-400">{member.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Team & Position */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{member.teamName}</div>
                      <div className="text-xs text-slate-500">{member.position} • {member.category}</div>
                    </td>

                    {/* License Number */}
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {member.licenseNumber}
                    </td>

                    {/* License Status */}
                    <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleToggleLicenseValidation(member.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-transform hover:scale-105 ${
                          member.licenseStatus === 'Validée'
                            ? 'bg-emerald-100 text-emerald-800'
                            : member.licenseStatus === 'En attente'
                            ? 'bg-amber-100 text-amber-800'
                            : member.licenseStatus === 'Expirée'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {member.licenseStatus === 'Validée' && <CheckCircle className="w-3 h-3" />}
                        {member.licenseStatus === 'En attente' && <Clock className="w-3 h-3" />}
                        {member.licenseStatus === 'Expirée' && <AlertTriangle className="w-3 h-3" />}
                        <span>{member.licenseStatus}</span>
                      </button>
                    </td>

                    {/* Medical Certificate */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                          member.medicalCertValid
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <HeartPulse className="w-3 h-3" />
                        {member.medicalCertValid ? 'Valide' : 'Expiré'}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="py-3 px-4">
                      <div className="text-xs font-semibold text-slate-800">
                        {member.amountPaid} / {member.amountDue} €
                      </div>
                      <span
                        className={`text-[10px] font-bold ${
                          member.paymentStatus === 'À jour' ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {member.paymentStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedMember(member)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                          title="Voir la fiche détaillée"
                        >
                          <User className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Details Drawer Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                  #{selectedMember.jerseyNumber}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">{selectedMember.licenseNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 flex-1">
              {/* Status Badges Row */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {selectedMember.teamName}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Poste : {selectedMember.position}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Saison {selectedMember.season}
                </span>
              </div>

              {/* Personal & Contact Details */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Coordonnées</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{selectedMember.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{selectedMember.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 col-span-full">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>Né(e) le : {selectedMember.birthDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 col-span-full">
                    <span className="font-semibold text-slate-500">Adresse :</span>
                    <span>{selectedMember.address}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2">
                <h3 className="text-xs font-bold uppercase text-amber-800 tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Contact en cas d'urgence
                </h3>
                <div className="text-xs text-slate-800 font-medium">
                  <p>{selectedMember.emergencyContact.name} ({selectedMember.emergencyContact.relation})</p>
                  <p className="text-amber-900 font-bold mt-0.5">{selectedMember.emergencyContact.phone}</p>
                </div>
              </div>

              {/* Medical & Financial Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    Certificat Médical
                  </div>
                  <p className="text-xs text-slate-600">
                    Dernière date : <span className="font-semibold">{selectedMember.medicalCertDate}</span>
                  </p>
                  <p className={`text-xs font-bold mt-1 ${selectedMember.medicalCertValid ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedMember.medicalCertValid ? '✓ Homologué & Valide' : '⚠ Expiré — À renouveler'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                    <CreditCard className="w-4 h-4 text-blue-500" />
                    Cotisation Club
                  </div>
                  <p className="text-xs text-slate-600">
                    Payé : <span className="font-semibold">{selectedMember.amountPaid} €</span> / {selectedMember.amountDue} €
                  </p>
                  <p className="text-xs font-bold text-emerald-600 mt-1">
                    Statut : {selectedMember.paymentStatus}
                  </p>
                </div>
              </div>

              {selectedMember.notes && (
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                  <p className="text-xs font-bold text-blue-900 mb-1">Notes du staff</p>
                  <p className="text-xs text-slate-700">{selectedMember.notes}</p>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleToggleLicenseValidation(selectedMember.id)}
                className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-100 rounded-xl"
              >
                Basculer Statut Licence
              </button>
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nouveau Licencié */}
      {isNewMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">Enregistrer un Nouveau Licencié</h3>
                <p className="text-xs text-slate-500">Dossier administratif, affiliation fédérale et affectation d'équipe</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewMemberModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Thomas"
                    value={newFirstName}
                    onChange={e => setNewFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dupuis"
                    value={newLastName}
                    onChange={e => setNewLastName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="licencie@email.fr"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    placeholder="06 12 34 56 78"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Genre</label>
                  <select
                    value={newGender}
                    onChange={e => setNewGender(e.target.value as 'M' | 'F')}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date de Naissance</label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={e => setNewBirthDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">N° Maillot</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={newJerseyNumber}
                    onChange={e => setNewJerseyNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Équipe Affectée</label>
                  <select
                    value={newTeamId}
                    onChange={e => setNewTeamId(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    {teams.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Poste de Jeu ({currentSportConfig.name})</label>
                  <select
                    value={newPosition}
                    onChange={e => setNewPosition(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    {currentSportConfig.positions.map(p => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Montant Cotisation (€)</label>
                  <input
                    type="number"
                    min="0"
                    value={newAmountDue}
                    onChange={e => setNewAmountDue(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Montant Déjà Encaissé (€)</label>
                  <input
                    type="number"
                    min="0"
                    value={newAmountPaid}
                    onChange={e => setNewAmountPaid(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block uppercase">Contact d'urgence</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nom du contact"
                    value={newEmergencyName}
                    onChange={e => setNewEmergencyName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white outline-hidden"
                  />
                  <input
                    type="tel"
                    placeholder="Téléphone urgence"
                    value={newEmergencyPhone}
                    onChange={e => setNewEmergencyPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="Lien de parenté"
                    value={newEmergencyRelation}
                    onChange={e => setNewEmergencyRelation(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewMemberModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Créer et Valider Licence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
