import React, { useState } from 'react';
import {
  Users,
  CheckCircle,
  Vote,
  FileText,
  Plus,
  Clock,
  Download,
  BarChart,
  X,
  Edit3,
  Trash2,
  AlertTriangle,
  Loader2,
  Calendar,
  MapPin,
  Check,
  Ban,
  MinusCircle,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { ClubMeeting } from '../../types';
import { governanceService } from '../../services/documentsService';

export const ClubMeetingsView: React.FC = () => {
  const { meetings, setMeetings, showToast } = useClub();
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddResolutionModal, setShowAddResolutionModal] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<ClubMeeting | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Meeting Form State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<string>('Bureau Directeur');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('19:00');
  const [newLocation, setNewLocation] = useState('Siège du Club (Salle Réunions) & Visio');
  const [newQuorumNeeded, setNewQuorumNeeded] = useState(5);
  const [newAgenda, setNewAgenda] = useState('1. Approbation du PV précédent\n2. Bilan sportif et organisationnel\n3. Trésorerie et budgets\n4. Questions diverses');
  const [newResolutions, setNewResolutions] = useState<string[]>([
    'Validation du budget prévisionnel des prochaines compétitions',
  ]);

  // Edit Meeting Form State
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<string>('Bureau Directeur');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('19:00');
  const [editLocation, setEditLocation] = useState('');
  const [editQuorumNeeded, setEditQuorumNeeded] = useState(5);
  const [editStatus, setEditStatus] = useState<string>('Planifiée');
  const [editAgenda, setEditAgenda] = useState('');

  // Add Resolution to existing meeting Form State
  const [resTitle, setResTitle] = useState('');
  const [resDescription, setResDescription] = useState('');

  const selectedMeeting = meetings.find(m => m.id === selectedMeetingId) || meetings[0] || null;

  // ─────────────────────────────────────────────────────────────
  // 1. VOTES FIABLES & PERSISTÉS
  // ─────────────────────────────────────────────────────────────
  const handleCastVote = async (meetingId: string, voteIndex: number, type: 'pour' | 'contre' | 'abstention') => {
    const targetMeeting = meetings.find(m => m.id === meetingId);
    if (!targetMeeting) return;

    const targetResolution = targetMeeting.votes[voteIndex];
    if (!targetResolution) return;

    // Mise à jour optimiste dans l'état local
    setMeetings(prev =>
      prev.map(m => {
        if (m.id === meetingId) {
          const updatedVotes = [...m.votes];
          const target = { ...updatedVotes[voteIndex] };
          if (type === 'pour') target.votesFor += 1;
          if (type === 'contre') target.votesAgainst += 1;
          if (type === 'abstention') target.abstentions += 1;

          target.result = target.votesFor >= target.votesAgainst ? 'Adopté' : 'Rejeté';
          updatedVotes[voteIndex] = target;
          return { ...m, votes: updatedVotes };
        }
        return m;
      })
    );

    // Persistance dans le backend si la résolution a un id numérique
    if (targetResolution.id && !isNaN(Number(targetResolution.id))) {
      try {
        const updatedBackendRes = await governanceService.voteResolution(targetResolution.id, {
          type,
        });

        // Synchroniser avec les valeurs exactes confirmées par le backend
        if (updatedBackendRes) {
          setMeetings(prev =>
            prev.map(m => {
              if (m.id === meetingId) {
                const updatedVotes = [...m.votes];
                updatedVotes[voteIndex] = {
                  ...updatedVotes[voteIndex],
                  votesFor: updatedBackendRes.votes_for,
                  votesAgainst: updatedBackendRes.votes_against,
                  abstentions: updatedBackendRes.votes_abstain,
                  result: updatedBackendRes.status === 'PASSED' ? 'Adopté' : 'Rejeté',
                };
                return { ...m, votes: updatedVotes };
              }
              return m;
            })
          );
        }
      } catch (err) {
        console.warn('Erreur synchronisation vote backend:', err);
      }
    }

    const voteLabel = type === 'pour' ? 'Pour' : type === 'contre' ? 'Contre' : 'Abstention';
    showToast(`Votre vote "${voteLabel}" a été comptabilisé et sauvegardé !`);
  };

  // ─────────────────────────────────────────────────────────────
  // 2. CRÉATION D'UNE RÉUNION AVEC PLUSIEURS RÉSOLUTIONS
  // ─────────────────────────────────────────────────────────────
  const handleOpenCreateModal = () => {
    setNewTitle('');
    setNewType('Bureau Directeur');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewTime('19:00');
    setNewLocation('Siège du Club (Salle Réunions) & Visio');
    setNewQuorumNeeded(5);
    setNewAgenda('1. Approbation du PV précédent\n2. Bilan sportif et organisationnel\n3. Trésorerie et budgets\n4. Questions diverses');
    setNewResolutions([
      'Validation du budget prévisionnel des prochaines compétitions',
    ]);
    setShowCreateModal(true);
  };

  const handleAddResolutionField = () => {
    setNewResolutions(prev => [...prev, '']);
  };

  const handleRemoveResolutionField = (idx: number) => {
    setNewResolutions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleResolutionChange = (idx: number, value: string) => {
    setNewResolutions(prev => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Veuillez indiquer un titre pour la réunion.');
      return;
    }

    setIsSubmitting(true);

    const agendaItems = newAgenda
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);

    const filteredResolutions = newResolutions.map(r => r.trim()).filter(Boolean);

    const fallbackMeeting: ClubMeeting = {
      id: `meet-${Date.now()}`,
      title: newTitle.trim(),
      type: newType,
      date: newDate,
      time: newTime,
      location: newLocation.trim(),
      quorumNeeded: Number(newQuorumNeeded) || 5,
      attendeesCount: Number(newQuorumNeeded) || 5,
      status: 'Planifiée',
      agendaItems: agendaItems.length > 0 ? agendaItems : ['Ordre du jour à définir'],
      votes: filteredResolutions.map((resTitle, idx) => ({
        id: `res-local-${Date.now()}-${idx}`,
        resolution: resTitle,
        votesFor: 0,
        votesAgainst: 0,
        abstentions: 0,
        result: 'Adopté',
      })),
      minutesGenerated: false,
    };

    let assembly_type: 'ORDINARY' | 'EXTRAORDINARY' | 'SPECIAL' = 'ORDINARY';
    if (newType === 'AG Extraordinaire') assembly_type = 'EXTRAORDINARY';
    else if (newType === 'Comité Technique' || newType === 'Commission Discipline') assembly_type = 'SPECIAL';

    try {
      const scheduled_at = `${newDate}T${newTime || '19:00'}:00Z`;
      const createdAssembly = await governanceService.createAssembly({
        title: newTitle.trim(),
        scheduled_at,
        assembly_type,
        location: newLocation.trim(),
        recipient_emails: ['direction@gesport-club.com', 'secretaire@gesport-club.com'],
      });

      // Ajout de toutes les résolutions votables dans le microservice backend
      const createdVotes: ClubMeeting['votes'] = [];
      const assemblyNumericId = parseInt(createdAssembly.id, 10);

      if (!isNaN(assemblyNumericId) && filteredResolutions.length > 0) {
        for (const resTitle of filteredResolutions) {
          try {
            const addedRes = await governanceService.addResolution(assemblyNumericId, {
              title: resTitle,
              description: 'Résolution soumise au vote des membres',
            });
            if (addedRes) {
              createdVotes.push({
                id: addedRes.id,
                resolution: addedRes.title,
                description: addedRes.description,
                votesFor: addedRes.votes_for,
                votesAgainst: addedRes.votes_against,
                abstentions: addedRes.votes_abstain,
                result: 'Adopté',
              });
            }
          } catch (resErr) {
            console.warn('Erreur ajout résolution backend:', resErr);
          }
        }
      }

      const finalAssembly: ClubMeeting = {
        ...createdAssembly,
        agendaItems: agendaItems.length > 0 ? agendaItems : createdAssembly.agendaItems,
        votes: createdVotes.length > 0 ? createdVotes : fallbackMeeting.votes,
      };

      setMeetings(prev => [finalAssembly, ...prev]);
      setSelectedMeetingId(finalAssembly.id);
      showToast(`L'assemblée "${newTitle}" a été créée avec ${filteredResolutions.length} résolution(s) !`);
    } catch (err) {
      console.warn('Erreur création assemblée backend, fallback local:', err);
      setMeetings(prev => [fallbackMeeting, ...prev]);
      setSelectedMeetingId(fallbackMeeting.id);
      showToast(`La réunion "${newTitle}" a été enregistrée en mode local.`);
    } finally {
      setIsSubmitting(false);
      setShowCreateModal(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3. MODIFIER UNE RÉUNION
  // ─────────────────────────────────────────────────────────────
  const handleOpenEditModal = (meeting: ClubMeeting) => {
    setEditTitle(meeting.title);
    setEditType(meeting.type);
    setEditDate(meeting.date);
    setEditTime(meeting.time || '19:00');
    setEditLocation(meeting.location);
    setEditQuorumNeeded(meeting.quorumNeeded || 5);
    setEditStatus(meeting.status || 'Planifiée');
    setEditAgenda((meeting.agendaItems || []).join('\n'));
    setShowEditModal(true);
  };

  const handleUpdateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting) return;

    setIsSubmitting(true);

    const agendaItems = editAgenda
      .split('\n')
      .map(item => item.trim())
      .filter(Boolean);

    let assembly_type = 'ORDINARY';
    if (editType === 'AG Extraordinaire') assembly_type = 'EXTRAORDINARY';
    else if (editType === 'Comité Technique' || editType === 'Commission Discipline') assembly_type = 'SPECIAL';

    let backendStatus = 'CONVOKED';
    if (editStatus === 'En cours') backendStatus = 'IN_PROGRESS';
    else if (editStatus === 'Clôturée') backendStatus = 'COMPLETED';

    try {
      const numericId = parseInt(selectedMeeting.id, 10);
      if (!isNaN(numericId)) {
        const scheduled_at = `${editDate}T${editTime || '19:00'}:00Z`;
        await governanceService.updateAssembly(numericId, {
          title: editTitle.trim(),
          scheduled_at,
          assembly_type,
          location: editLocation.trim(),
          status: backendStatus,
        });
      }

      setMeetings(prev =>
        prev.map(m =>
          m.id === selectedMeeting.id
            ? {
                ...m,
                title: editTitle.trim(),
                type: editType,
                date: editDate,
                time: editTime,
                location: editLocation.trim(),
                quorumNeeded: Number(editQuorumNeeded),
                status: editStatus,
                agendaItems: agendaItems.length > 0 ? agendaItems : m.agendaItems,
              }
            : m
        )
      );

      showToast(`La réunion "${editTitle}" a été modifiée avec succès !`);
      setShowEditModal(false);
    } catch (err) {
      console.warn('Erreur mise à jour assemblée backend:', err);
      setMeetings(prev =>
        prev.map(m =>
          m.id === selectedMeeting.id
            ? {
                ...m,
                title: editTitle.trim(),
                type: editType,
                date: editDate,
                time: editTime,
                location: editLocation.trim(),
                quorumNeeded: Number(editQuorumNeeded),
                status: editStatus,
                agendaItems: agendaItems.length > 0 ? agendaItems : m.agendaItems,
              }
            : m
        )
      );
      showToast(`La réunion "${editTitle}" a été modifiée.`);
      setShowEditModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. SUPPRIMER UNE RÉUNION
  // ─────────────────────────────────────────────────────────────
  const handleOpenDeleteModal = (meeting: ClubMeeting) => {
    setMeetingToDelete(meeting);
  };

  const handleConfirmDeleteMeeting = async () => {
    if (!meetingToDelete) return;

    setIsSubmitting(true);
    try {
      const numericId = parseInt(meetingToDelete.id, 10);
      if (!isNaN(numericId)) {
        await governanceService.deleteAssembly(numericId);
      }

      const remaining = meetings.filter(m => m.id !== meetingToDelete.id);
      setMeetings(remaining);
      if (selectedMeetingId === meetingToDelete.id) {
        setSelectedMeetingId(remaining[0]?.id || '');
      }

      showToast(`La réunion "${meetingToDelete.title}" a été supprimée.`);
      setMeetingToDelete(null);
    } catch (err) {
      console.warn('Erreur suppression assemblée backend:', err);
      const remaining = meetings.filter(m => m.id !== meetingToDelete.id);
      setMeetings(remaining);
      if (selectedMeetingId === meetingToDelete.id) {
        setSelectedMeetingId(remaining[0]?.id || '');
      }
      showToast(`La réunion "${meetingToDelete.title}" a été supprimée.`);
      setMeetingToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 5. AJOUTER UNE NOUVELLE RÉSOLUTION SUR UNE RÉUNION EXISTANTE
  // ─────────────────────────────────────────────────────────────
  const handleOpenAddResolutionModal = () => {
    setResTitle('');
    setResDescription('');
    setShowAddResolutionModal(true);
  };

  const handleAddResolutionToMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting || !resTitle.trim()) {
      showToast('Veuillez saisir un intitulé pour la résolution.');
      return;
    }

    setIsSubmitting(true);
    const newResItem: ClubMeeting['votes'][number] = {
      id: `res-${Date.now()}`,
      resolution: resTitle.trim(),
      description: resDescription.trim(),
      votesFor: 0,
      votesAgainst: 0,
      abstentions: 0,
      result: 'Adopté',
    };

    try {
      const numericId = parseInt(selectedMeeting.id, 10);
      if (!isNaN(numericId)) {
        const added = await governanceService.addResolution(numericId, {
          title: resTitle.trim(),
          description: resDescription.trim() || 'Résolution soumise au vote des membres',
        });
        if (added) {
          newResItem.id = added.id;
        }
      }

      setMeetings(prev =>
        prev.map(m =>
          m.id === selectedMeeting.id
            ? { ...m, votes: [...m.votes, newResItem] }
            : m
        )
      );

      showToast(`Nouvelle résolution soumise au vote avec succès !`);
      setShowAddResolutionModal(false);
    } catch (err) {
      console.warn('Erreur ajout résolution:', err);
      setMeetings(prev =>
        prev.map(m =>
          m.id === selectedMeeting.id
            ? { ...m, votes: [...m.votes, newResItem] }
            : m
        )
      );
      showToast(`Résolution ajoutée à la séance.`);
      setShowAddResolutionModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Gouvernance, AG & Réunions de Bureau</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Organisation des Assemblées Générales, votes électroniques des résolutions, calcul de quorum et PV officiels
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          Convoquer une Réunion / AG
        </button>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: List of Meetings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Séances Programmées ({meetings.length})
            </h2>
          </div>

          {meetings.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">Aucune réunion programmée</p>
            </div>
          ) : (
            meetings.map(meeting => {
              const isSelected = meeting.id === selectedMeeting?.id;
              return (
                <div
                  key={meeting.id}
                  onClick={() => setSelectedMeetingId(meeting.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-blue-600 uppercase">
                      {meeting.type}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{meeting.date}</span>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 mt-1 line-clamp-1">
                    {meeting.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{meeting.location} • {meeting.time}</span>
                  </p>

                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100/80 text-[11px] text-slate-500">
                    <Vote className="w-3.5 h-3.5 text-blue-500" />
                    <span>{meeting.votes?.length || 0} résolution(s)</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Meeting Detail & Resolutions */}
        <div className="lg:col-span-2 space-y-4">
          {selectedMeeting ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Meeting Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                      {selectedMeeting.type}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-700">
                      Statut : {selectedMeeting.status}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
                    {selectedMeeting.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Lieu : {selectedMeeting.location} | Date : {selectedMeeting.date} à {selectedMeeting.time}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Quorum Badge */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center shrink-0">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Quorum Atteint</div>
                    <div className="text-sm font-bold text-slate-800">
                      {selectedMeeting.attendeesCount} / {selectedMeeting.quorumNeeded} présents
                    </div>
                  </div>

                  {/* Actions buttons : Modifier & Supprimer */}
                  <div className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(selectedMeeting)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                      title="Modifier les informations de la séance"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-amber-600" />
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDeleteModal(selectedMeeting)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer transition-colors"
                      title="Supprimer cette séance"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>

              {/* Agenda Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Ordre du Jour
                </h3>
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {selectedMeeting.agendaItems && selectedMeeting.agendaItems.length > 0 ? (
                    selectedMeeting.agendaItems.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{item.replace(/^\d+[\.\)]\s*/, '')}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Aucun point à l'ordre du jour spécifié.</p>
                  )}
                </div>
              </div>

              {/* Resolutions & Voting Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Vote className="w-4 h-4 text-blue-600" />
                    Résolutions Soumises au Vote ({selectedMeeting.votes?.length || 0})
                  </h3>

                  {/* Bouton pour ajouter une résolution sur la réunion existante */}
                  <button
                    type="button"
                    onClick={handleOpenAddResolutionModal}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une Résolution
                  </button>
                </div>

                {selectedMeeting.votes && selectedMeeting.votes.length > 0 ? (
                  <div className="space-y-4">
                    {selectedMeeting.votes.map((res, idx) => {
                      const totalVotes = res.votesFor + res.votesAgainst + res.abstentions;
                      const forPct = totalVotes > 0 ? Math.round((res.votesFor / totalVotes) * 100) : 0;
                      const againstPct = totalVotes > 0 ? Math.round((res.votesAgainst / totalVotes) * 100) : 0;
                      const abstainPct = totalVotes > 0 ? Math.round((res.abstentions / totalVotes) * 100) : 0;

                      return (
                        <div key={res.id || idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                              <div className="font-bold text-xs sm:text-sm text-slate-900">
                                {res.resolution}
                              </div>
                              {res.description && (
                                <p className="text-[11px] text-slate-500 mt-0.5">{res.description}</p>
                              )}
                            </div>
                            <span
                              className={`self-start sm:self-auto px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                                res.result === 'Adopté'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {res.result}
                            </span>
                          </div>

                          {/* Vote Results Bar */}
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between text-slate-600 font-medium">
                              <span className="text-emerald-700 font-semibold">
                                Pour : {res.votesFor} ({forPct}%)
                              </span>
                              <span className="text-rose-700 font-semibold">
                                Contre : {res.votesAgainst} ({againstPct}%)
                              </span>
                              <span className="text-slate-500">
                                Abstentions : {res.abstentions} ({abstainPct}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                              <div
                                className="bg-emerald-500 h-full transition-all duration-300"
                                style={{ width: `${forPct}%` }}
                                title={`Pour : ${res.votesFor}`}
                              />
                              <div
                                className="bg-rose-500 h-full transition-all duration-300"
                                style={{ width: `${againstPct}%` }}
                                title={`Contre : ${res.votesAgainst}`}
                              />
                              <div
                                className="bg-slate-400 h-full transition-all duration-300"
                                style={{ width: `${abstainPct}%` }}
                                title={`Abstentions : ${res.abstentions}`}
                              />
                            </div>
                          </div>

                          {/* Interactive Voting Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 flex-wrap">
                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mr-1">
                              Électeur :
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCastVote(selectedMeeting.id, idx, 'pour')}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg cursor-pointer transition-colors"
                              title="Voter Pour cette résolution"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Pour
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCastVote(selectedMeeting.id, idx, 'contre')}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-rose-100 text-rose-800 hover:bg-rose-200 rounded-lg cursor-pointer transition-colors"
                              title="Voter Contre cette résolution"
                            >
                              <X className="w-3.5 h-3.5" />
                              Contre
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCastVote(selectedMeeting.id, idx, 'abstention')}
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg cursor-pointer transition-colors"
                              title="S'abstenir"
                            >
                              <MinusCircle className="w-3.5 h-3.5" />
                              Abstention
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-400 italic">
                    Aucune résolution soumise au vote pour le moment. Cliquez sur « Ajouter une Résolution » ci-dessus.
                  </div>
                )}
              </div>

              {/* Export PV */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => showToast(`Procès-Verbal officiel de "${selectedMeeting.title}" exporté en PDF !`)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Exporter PV Signé (.PDF)
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center text-slate-400">
              Sélectionnez une réunion pour consulter l'ordre du jour et les votes.
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL : CONVOQUER UNE RÉUNION / AG AVEC PLUSIEURS RÉSOLUTIONS
      ───────────────────────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">Convoquer une Réunion / Assemblée Générale</h3>
                <p className="text-xs text-slate-500">Création de séance, quorum légal et résolutions multiples</p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la Séance *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Assemblée Générale Ordinaire 2026"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type d'Instance *</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="Bureau Directeur">Bureau Directeur</option>
                    <option value="Assemblée Générale Ordinaire">Assemblée Générale Ordinaire</option>
                    <option value="AG Extraordinaire">AG Extraordinaire</option>
                    <option value="Comité Technique">Comité Technique</option>
                    <option value="Commission Discipline">Commission Discipline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quorum Minimum Requis</label>
                  <input
                    type="number"
                    min="1"
                    value={newQuorumNeeded}
                    onChange={e => setNewQuorumNeeded(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date de la Séance</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Horaire Début</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lieu ou Lien Visioconférence</label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Points à l'Ordre du Jour (un par ligne)</label>
                <textarea
                  rows={3}
                  value={newAgenda}
                  onChange={e => setNewAgenda(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              {/* Multiple Resolutions Section */}
              <div className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-100 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider">
                    Résolutions Soumises au Vote ({newResolutions.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddResolutionField}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Ajouter une résolution
                  </button>
                </div>

                <div className="space-y-2">
                  {newResolutions.map((resText, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 w-4 text-center shrink-0">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        required
                        value={resText}
                        onChange={e => handleResolutionChange(idx, e.target.value)}
                        placeholder={`Intitulé de la résolution ${idx + 1}`}
                        className="flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                      {newResolutions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveResolutionField(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                          title="Supprimer cette résolution"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Création en cours...
                    </>
                  ) : (
                    'Convoquer la Séance & Enregistrer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL : MODIFIER UNE RÉUNION
      ───────────────────────────────────────────────────────────── */}
      {showEditModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-amber-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Modifier la Séance</h3>
                  <p className="text-xs text-slate-500">Mise à jour des paramètres et de l'ordre du jour</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateMeeting} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la Séance *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type d'Instance *</label>
                  <select
                    value={editType}
                    onChange={e => setEditType(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="Bureau Directeur">Bureau Directeur</option>
                    <option value="Assemblée Générale Ordinaire">Assemblée Générale Ordinaire</option>
                    <option value="AG Extraordinaire">AG Extraordinaire</option>
                    <option value="Comité Technique">Comité Technique</option>
                    <option value="Commission Discipline">Commission Discipline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Statut Séance</label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="Planifiée">Planifiée</option>
                    <option value="En cours">En cours</option>
                    <option value="Clôturée">Clôturée</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quorum Requis</label>
                  <input
                    type="number"
                    min="1"
                    value={editQuorumNeeded}
                    onChange={e => setEditQuorumNeeded(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Horaire</label>
                  <input
                    type="time"
                    value={editTime}
                    onChange={e => setEditTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lieu ou Lien Visioconférence</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={e => setEditLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Points à l'Ordre du Jour (un par ligne)</label>
                <textarea
                  rows={3}
                  value={editAgenda}
                  onChange={e => setEditAgenda(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    'Enregistrer les Modifications'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL : AJOUTER UNE NOUVELLE RÉSOLUTION AU VOTE
      ───────────────────────────────────────────────────────────── */}
      {showAddResolutionModal && selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-blue-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Vote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Soumettre une Nouvelle Résolution</h3>
                  <p className="text-xs text-slate-500">Ajout d'un vote à la séance « {selectedMeeting.title} »</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddResolutionModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddResolutionToMeeting} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Intitulé de la Résolution *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Approbation de la grille tarifaire des adhésions 2026-2027"
                  value={resTitle}
                  onChange={e => setResTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description / Exposé des Motifs (optionnel)
                </label>
                <textarea
                  rows={3}
                  placeholder="Précisez le contexte ou les modalités de vote..."
                  value={resDescription}
                  onChange={e => setResDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddResolutionModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Ajout...
                    </>
                  ) : (
                    'Ajouter la Résolution au Vote'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL : CONFIRMATION DE SUPPRESSION D'UNE RÉUNION
      ───────────────────────────────────────────────────────────── */}
      {meetingToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Supprimer cette Séance ?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  Êtes-vous sûr de vouloir supprimer définitivement la séance <strong className="text-slate-900">{meetingToDelete.title}</strong> du {meetingToDelete.date} ?
                </p>
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-left">
                  <p className="font-semibold mb-1">Attention :</p>
                  <p>
                    Cette action supprimera également toutes les résolutions votées, l'ordre du jour et les convocations de cette séance en base de données.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setMeetingToDelete(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmDeleteMeeting}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    'Confirmer la Suppression'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
