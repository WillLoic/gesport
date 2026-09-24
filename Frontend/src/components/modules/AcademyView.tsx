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
  FileText,
  ShieldAlert,
  CheckCircle2,
  Users,
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

  const getStudentTeamName = (student: AcademyStudent) => {
    const foundMember = members.find(m => String(m.id) === String(student.memberId));
    return foundMember?.teamName || 'Sans équipe';
  };

  const getStudentAge = (student: AcademyStudent) => {
    if (student.age && student.age > 0) return student.age;
    const member = members.find(m => String(m.id) === String(student.memberId));
    if (member?.birthDate) {
      const birthYear = new Date(member.birthDate).getFullYear();
      if (!isNaN(birthYear)) return new Date().getFullYear() - birthYear;
    }
    return 16;
  };

  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    const defaultMember = members[0];
    setSelectedMemberId(defaultMember ? defaultMember.id : '');
    setNewName(defaultMember ? `${defaultMember.firstName} ${defaultMember.lastName}` : '');
    setNewCategory(defaultMember?.category || 'U18 Espoirs');
    setNewAge(16);
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
    const found = members.find(m => String(m.id) === String(memberId));
    if (found) {
      setNewName(`${found.firstName} ${found.lastName}`);
      if (found.category) setNewCategory(found.category);
      if (found.birthDate) {
        const birthYear = new Date(found.birthDate).getFullYear();
        if (!isNaN(birthYear)) setNewAge(new Date().getFullYear() - birthYear);
      }
    }
  };

  const handleOpenEditModal = (student: AcademyStudent, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingStudent(student);
    setSelectedMemberId(student.memberId || (members[0] ? members[0].id : ''));
    setNewName(student.studentName);
    setNewCategory(student.category);
    setNewAge(getStudentAge(student));
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
      age: typeof newAge === 'number' && newAge > 0 ? newAge : 16,
      schoolGrade: newSchoolGrade.trim() || 'Niveau non précisé',
      parentsName: newParentsName.trim() || 'Parents Référents',
      parentsPhone: newParentsPhone.trim() || '',
      tutorCoachName: newTutorCoach.trim() || 'Non assigné',
      schoolSupportNeeded: newSchoolSupport,
      coachComments: newCoachComments.trim() || 'Aucune observation enregistrée.',
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

  const escapeHtml = (str: string | number | null | undefined): string => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const handleGenerateBulletinPDF = (student: AcademyStudent) => {
    const teamName = getStudentTeamName(student);
    const age = getStudentAge(student);

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Bulletin Trimestriel - ${escapeHtml(student.studentName)}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; background: #ffffff; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .logo-title h1 { margin: 0; font-size: 24px; color: #1e293b; text-transform: uppercase; letter-spacing: 1px; }
          .logo-title p { margin: 5px 0 0 0; color: #2563eb; font-weight: bold; font-size: 13px; }
          .season-badge { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 6px 14px; font-weight: bold; font-size: 12px; border-radius: 20px; text-transform: uppercase; }
          
          .section { margin-bottom: 25px; }
          .section-title { font-size: 13px; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; }
          
          .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
          
          .card { background: #f8fafc; padding: 12px 16px; border-radius: 10px; border: 1px solid #e2e8f0; }
          .card label { font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 3px; }
          .card val { font-size: 14px; font-weight: 600; color: #0f172a; }

          .status-badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; }
          .status-ok { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
          .status-warn { background: #ffe4e6; color: #be123c; border: 1px solid #fecdd3; }

          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          th { background: #f1f5f9; color: #334155; font-weight: 700; text-transform: uppercase; font-size: 11px; }
          .score { font-weight: bold; color: #2563eb; font-size: 14px; }

          .obs-box { background: #fafafa; border: 1px solid #e2e8f0; border-left: 4px solid #2563eb; padding: 15px; border-radius: 6px; font-size: 13px; line-height: 1.6; color: #334155; }

          .signatures { display: flex; justify-content: space-between; margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
          .sig-block { width: 45%; text-align: center; border-top: 1px dashed #94a3b8; padding-top: 10px; font-size: 12px; font-weight: bold; color: #64748b; }
          
          @media print {
            @page { margin: 15mm; size: A4 portrait; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-title">
            <h1>GESPORT - ACADÉMIE SPORT-ÉTUDES</h1>
            <p>Bulletin Trimestriel d'Évaluation & Suivi de l'Académicien</p>
          </div>
          <div class="season-badge">Saison 2025 - 2026</div>
        </div>

        <div class="section">
          <div class="section-title">Profil & Informations Générales</div>
          <div class="grid-3">
            <div class="card"><label>Nom & Prénom</label><val>${escapeHtml(student.studentName)}</val></div>
            <div class="card"><label>Âge & Catégorie</label><val>${age} ans (${escapeHtml(student.category)})</val></div>
            <div class="card"><label>Équipe du Joueur</label><val>${escapeHtml(teamName)}</val></div>
            <div class="card"><label>Scolarité / Établissement</label><val>${escapeHtml(student.schoolGrade)}</val></div>
            <div class="card"><label>Parent / Tuteur Légal</label><val>${escapeHtml(student.parentsName)} (${escapeHtml(student.parentsPhone || 'Tél N/C')})</val></div>
            <div class="card"><label>Entraîneur Tuteur Référent</label><val>${escapeHtml(student.tutorCoachName)}</val></div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Bilan Scolaire & Sportif (Observations)</div>
          <div class="card" style="margin-bottom: 12px;">
            <label>Statut d'Accompagnement Scolaire</label>
            <div style="margin-top: 5px;">
              ${
                student.schoolSupportNeeded
                  ? '<span class="status-badge status-warn">⚠️ Besoins de soutien scolaire identifiés</span>'
                  : '<span class="status-badge status-ok">✓ Scolarité OK — Pas de problème scolaire</span>'
              }
            </div>
          </div>
          <div class="obs-box">
            <strong>Bilan & Appréciation de l'Entraîneur / Référent :</strong><br/>
            ${escapeHtml(student.coachComments || 'Aucune observation complémentaire.')}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Bilan des Évaluations (/20)</div>
          <table>
            <thead>
              <tr>
                <th>Trimestre / Période</th>
                <th>Technique</th>
                <th>Tactique</th>
                <th>Athlétique</th>
                <th>Attitude / Esprit</th>
              </tr>
            </thead>
            <tbody>
              ${(student.progressScores || [])
                .map(
                  score => `
                <tr>
                  <td><strong>${escapeHtml(score.quarter)}</strong></td>
                  <td class="score">${score.technicalScore}/20</td>
                  <td class="score">${score.tacticalScore}/20</td>
                  <td class="score">${score.athleticScore}/20</td>
                  <td class="score">${score.attitudeScore}/20</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </div>

        <div class="signatures">
          <div class="sig-block">Visa & Signature des Parents / Tuteur</div>
          <div class="sig-block">Signature du Directeur de l'Académie</div>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';

    document.body.appendChild(iframe);

    iframe.src = blobUrl;
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Erreur lors de l\'impression PDF:', e);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          URL.revokeObjectURL(blobUrl);
        }, 1000);
      }
    };

    showToast(`Impression/Téléchargement PDF lancé pour ${student.studentName}.`);
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
                const teamName = getStudentTeamName(student);
                const age = getStudentAge(student);

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
                        <p className="text-xs text-slate-500 mt-0.5">
                          {student.category} • <span className="font-semibold text-slate-700">{age} ans</span> • Classe : {student.schoolGrade}
                        </p>
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            <Users className="w-3 h-3 text-slate-400" /> Équipe : <strong className="text-blue-700">{teamName}</strong>
                          </span>
                        </div>
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

                    <div className="space-y-1 text-xs">
                      <div className="text-slate-600">
                        <span className="font-bold text-slate-500">Parent :</span> {student.parentsName}
                      </div>
                      <div className="text-slate-600">
                        <span className="font-bold text-blue-600">Entraîneur Tuteur :</span> {student.tutorCoachName}
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700 block mb-0.5">Bilan & Observations :</span>
                      <p className="line-clamp-2 italic">"{student.coachComments}"</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {student.parentsPhone || 'Non renseigné'}
                      </span>
                      {student.schoolSupportNeeded ? (
                        <span className="text-rose-600 font-bold text-[11px] bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Soutien requis
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Scolarité OK
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
                <div className="mt-1 space-y-1 text-xs text-slate-500">
                  <p>
                    <strong className="text-slate-700">Âge :</strong> {getStudentAge(selectedStudent)} ans • 
                    <strong className="text-slate-700">Équipe :</strong>{' '}
                    <span className="text-blue-700 font-bold">{getStudentTeamName(selectedStudent)}</span>
                  </p>
                  <p>Classe : {selectedStudent.schoolGrade}</p>
                  <p>
                    <strong className="text-slate-700">Parent :</strong> {selectedStudent.parentsName}
                  </p>
                  <p>
                    <strong className="text-blue-600">Entraîneur Tuteur Référent :</strong> {selectedStudent.tutorCoachName}
                  </p>
                </div>
              </div>

              {/* Bilan Scolaire & Sportif Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Bilan Scolaire & Sportif
                  </span>
                  {selectedStudent.schoolSupportNeeded ? (
                    <span className="text-rose-700 bg-rose-100 text-[11px] font-bold px-2 py-0.5 rounded">
                      Soutien Requis
                    </span>
                  ) : (
                    <span className="text-emerald-700 bg-emerald-100 text-[11px] font-bold px-2 py-0.5 rounded">
                      Scolarité OK
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 italic leading-relaxed">
                  "{selectedStudent.coachComments || 'Aucune observation renseignée.'}"
                </p>
              </div>

              {/* Progress Scores Breakdown */}
              {/* <div className="space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Évaluations Trimestrielles (/20)
                </span>
                {(selectedStudent.progressScores || []).map((score, i) => (
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
              </div> */}

              <button
                type="button"
                onClick={() => handleGenerateBulletinPDF(selectedStudent)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
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
                      {m.firstName} {m.lastName} ({m.category} - Équipe: {m.teamName || 'Sans équipe'})
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
                    <option value="Senior Régionale">Senior Régionale</option>
                    <option value="Centre de Formation Pro">Centre de Formation Pro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Âge (ans) *
                  </label>
                  <input
                    type="number"
                    min={8}
                    max={30}
                    required
                    placeholder="Ex: 16"
                    value={newAge}
                    onChange={e => setNewAge(e.target.value !== '' ? Number(e.target.value) : '')}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden font-bold text-blue-600"
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
                    Nom du Parent / Tuteur Légal
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: M. Jean Marc"
                    value={newParentsName}
                    onChange={e => setNewParentsName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Téléphone des Parents
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
                  Entraîneur Tuteur Référent
                </label>
                <input
                  type="text"
                  placeholder="Ex: Coach Marc Lemoine"
                  value={newTutorCoach}
                  onChange={e => setNewTutorCoach(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Bilan Scolaire & Sportif (Observations)
                </label>
                <textarea
                  rows={3}
                  placeholder="Observations sur les résultats scolaires, l'attitude et l'évaluation sportive de l'académicien..."
                  value={newCoachComments}
                  onChange={e => setNewCoachComments(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                ></textarea>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Diagnostic & Statut Scolaire
                </label>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="schoolSupportOption"
                      checked={!newSchoolSupport}
                      onChange={() => setNewSchoolSupport(false)}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-emerald-700 font-bold">Pas de problème scolaire (Scolarité OK)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="schoolSupportOption"
                      checked={newSchoolSupport}
                      onChange={() => setNewSchoolSupport(true)}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-rose-700 font-bold">Besoin de soutien scolaire / suivi aménagement</span>
                  </label>
                </div>
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

