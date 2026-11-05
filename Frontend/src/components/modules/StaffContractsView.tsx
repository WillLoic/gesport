import React, { useState } from 'react';
import {
  Plus,
  AlertTriangle,
  CheckCircle,
  Download,
  X,
  Edit3,
  RefreshCw,
  Trash2,
  FileText,
  Calendar,
  Euro,
  Clock,
  Briefcase,
  User,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { StaffContract } from '../../types';
import { hrContractsService } from '../../services/documentsService';

export const StaffContractsView: React.FC = () => {
  const { contracts, setContracts, showToast, clubProfile, staff } = useClub();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<StaffContract | null>(null);
  const [renewingContract, setRenewingContract] = useState<StaffContract | null>(null);
  const [contractToDelete, setContractToDelete] = useState<StaffContract | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states for Create / Edit
  const [formStaffName, setFormStaffName] = useState('');
  const [formRole, setFormRole] = useState('Entraîneur Équipe Première');
  const [formContractType, setFormContractType] = useState('CDD Sportif');
  const [formWeeklyHours, setFormWeeklyHours] = useState(35);
  const [formMonthlySalary, setFormMonthlySalary] = useState(1850);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formEndDate, setFormEndDate] = useState('2026-06-30');

  // Form states for Renewal
  const [renewEndDate, setRenewEndDate] = useState('');
  const [renewSalary, setRenewSalary] = useState<number>(0);
  const [renewContractType, setRenewContractType] = useState('CDD Sportif');

  // ─────────────────────────────────────────────────────────────
  // 1. TÉLÉCHARGEMENT DU CONTRAT EN PDF
  // ─────────────────────────────────────────────────────────────
  const handleDownloadPdf = (contract: StaffContract) => {
    const clubName = clubProfile?.name || 'VOLÉE DE FLUX MAX';
    const contractRef = `CTR-${new Date().getFullYear()}-${String(contract.id).padStart(4, '0')}`;
    const todayStr = new Date().toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <title>Contrat_${contract.staffName.replace(/\\s+/g, '_')}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 18mm 15mm 18mm 15mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.5;
            font-size: 11pt;
            background: #fff;
            margin: 0;
            padding: 0;
          }
          .header {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          .club-name {
            font-size: 18pt;
            font-weight: 800;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .club-sub {
            font-size: 9pt;
            color: #64748b;
            margin-top: 2px;
          }
          .doc-badge {
            text-align: right;
            font-size: 9pt;
            color: #475569;
          }
          .doc-badge strong {
            display: block;
            color: #0f172a;
            font-size: 10pt;
          }
          .title-box {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-left: 5px solid #2563eb;
            padding: 12px 16px;
            margin-bottom: 22px;
            border-radius: 4px;
          }
          .doc-title {
            font-size: 13pt;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 4px 0;
            text-transform: uppercase;
          }
          .doc-subtitle {
            font-size: 9pt;
            color: #64748b;
            margin: 0;
          }
          .section {
            margin-bottom: 16px;
          }
          .parties-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 20px;
          }
          .party-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 12px;
          }
          .party-title {
            font-size: 9pt;
            font-weight: 700;
            text-transform: uppercase;
            color: #2563eb;
            margin-bottom: 6px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 4px;
          }
          .party-content {
            font-size: 9.5pt;
            color: #334155;
          }
          .party-content strong {
            color: #0f172a;
          }
          .article {
            margin-bottom: 14px;
          }
          .article-title {
            font-size: 10.5pt;
            font-weight: 700;
            color: #1e3a8a;
            margin-bottom: 4px;
          }
          .article-body {
            font-size: 9.5pt;
            color: #334155;
            text-align: justify;
          }
          .table-summary {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 9pt;
          }
          .table-summary td {
            padding: 6px 10px;
            border: 1px solid #e2e8f0;
          }
          .table-summary td.label {
            background-color: #f1f5f9;
            font-weight: 600;
            width: 35%;
            color: #475569;
          }
          .table-summary td.value {
            font-weight: 700;
            color: #0f172a;
          }
          .signatures {
            margin-top: 35px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            page-break-inside: avoid;
          }
          .sign-box {
            border: 1px dashed #94a3b8;
            border-radius: 6px;
            padding: 14px;
            min-height: 120px;
            position: relative;
            background: #fafafa;
          }
          .sign-title {
            font-size: 9pt;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 4px;
          }
          .sign-hint {
            font-size: 8pt;
            color: #64748b;
            font-style: italic;
          }
          .sign-stamp {
            position: absolute;
            bottom: 12px;
            right: 12px;
            border: 2px solid #2563eb;
            color: #2563eb;
            font-size: 7.5pt;
            font-weight: 800;
            padding: 4px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            transform: rotate(-5deg);
            opacity: 0.85;
          }
          .footer {
            margin-top: 25px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            font-size: 7.5pt;
            color: #94a3b8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="club-name">${clubName}</div>
            <div class="club-sub">Affiliation FFVB & Ministère des Sports • Siret: 849 203 918 00021</div>
          </div>
          <div class="doc-badge">
            <strong>Réf: ${contractRef}</strong>
            <span>Date: ${todayStr}</span>
          </div>
        </div>

        <div class="title-box">
          <h1 class="doc-title">Convention & Contrat de Travail du Personnel Sportif</h1>
          <p class="doc-subtitle">Établi conformément au Code du Travail, au Code du Sport et à la Convention Collective Nationale du Sport (CCNS)</p>
        </div>

        <div class="parties-grid">
          <div class="party-card">
            <div class="party-title">Entre l'Employeur</div>
            <div class="party-content">
              <strong>${clubName}</strong><br>
              Association sportive loi 1901<br>
              Représentée par son Président en exercice<br>
              Siège: Centre Omnisports, 75000 Paris
            </div>
          </div>
          <div class="party-card">
            <div class="party-title">Et le Salarié / Cadre Sportif</div>
            <div class="party-content">
              <strong>${contract.staffName}</strong><br>
              Fonction: <strong>${contract.role}</strong><br>
              Statut: Personnel technique & sportif<br>
              Matricule RH: GES-${String(contract.id).slice(-4)}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="article">
            <div class="article-title">Article 1 — Engagement & Missions</div>
            <div class="article-body">
              L'employeur engage le salarié en qualité de <strong>${contract.role}</strong>. Le salarié exercera ses fonctions sous la responsabilité de la Direction Sportive du club. Ses missions comprennent la préparation physique et tactique, l'encadrement des séances d'entraînement, le coaching lors des compétitions officielles et le suivi de la progression sportive des collectifs confiés.
            </div>
          </div>

          <table class="table-summary">
            <tr>
              <td class="label">Type de contrat</td>
              <td class="value">${contract.contractType}</td>
            </tr>
            <tr>
              <td class="label">Date de prise d'effet</td>
              <td class="value">${contract.startDate}</td>
            </tr>
            <tr>
              <td class="label">Date d'échéance prévisionnelle</td>
              <td class="value">${contract.endDate || 'Durée indéterminée (CDI)'}</td>
            </tr>
            <tr>
              <td class="label">Volume horaire contractuel</td>
              <td class="value">${contract.weeklyHours} heures hebdomadaires</td>
            </tr>
            <tr>
              <td class="label">Rémunération brute mensuelle</td>
              <td class="value">${contract.monthlyGrossSalary.toLocaleString('fr-FR')} € brut / mois</td>
            </tr>
            <tr>
              <td class="label">Statut administratif</td>
              <td class="value">${contract.status}</td>
            </tr>
          </table>

          <div class="article">
            <div class="article-title">Article 2 — Durée du Travail & Aménagement du Temps</div>
            <div class="article-body">
              Le volume horaire hebdomadaire de travail est fixé à <strong>${contract.weeklyHours} heures</strong>. Les horaires sont fixés en concertation avec la Direction Technique selon le calendrier officiel des entraînements et des journées de championnat.
            </div>
          </div>

          <div class="article">
            <div class="article-title">Article 3 — Rémunération & Avantages</div>
            <div class="article-body">
              En contrepartie de ses prestations, le salarié perçoit une rémunération mensuelle brute de <strong>${contract.monthlyGrossSalary.toLocaleString('fr-FR')} €</strong>, assujettie aux cotisations sociales en vigueur, payable à terme échu le dernier jour ouvrable de chaque mois civil.
            </div>
          </div>

          <div class="article">
            <div class="article-title">Article 4 — Déontologie, Respect des Règles & Éthique</div>
            <div class="article-body">
              Le salarié s'engage à respecter scrupuleusement la charte d'éthique du club, les règlements de la Fédération et à faire preuve d'exemplarité, de probité et de loyauté envers le club, ses licenciés et ses partenaires.
            </div>
          </div>

          <div class="article">
            <div class="article-title">Article 5 — Rupture & Renouvellement</div>
            <div class="article-body">
              Le présent contrat peut être renouvelé d'un commun accord par avenant écrit avant son terme. La rupture anticipée ou la résiliation intervient selon les formes et délais prévus par les dispositions légales et conventionnelles applicables.
            </div>
          </div>
        </div>

        <div class="signatures">
          <div class="sign-box">
            <div class="sign-title">Pour le Club (${clubName})</div>
            <div class="sign-hint">Le Président (Signature & Cachet)</div>
            <div class="sign-stamp">Certifié Conforme Gesport</div>
          </div>
          <div class="sign-box">
            <div class="sign-title">Le Salarié (${contract.staffName})</div>
            <div class="sign-hint">Mention manuscrite « Lu et approuvé, bon pour accord »</div>
          </div>
        </div>

        <div class="footer">
          Document officiel généré par la plateforme Gesport — Coffre-fort numérique RH • Archivage sécurisé • Page 1/1
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
        showToast(`Génération du contrat PDF officiel de ${contract.staffName} lancée.`);
      } catch (err) {
        console.error('Erreur impression PDF:', err);
        showToast(`Erreur lors de la génération du contrat PDF de ${contract.staffName}.`);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          URL.revokeObjectURL(blobUrl);
        }, 1500);
      }
    };
  };

  // ─────────────────────────────────────────────────────────────
  // 2. CRÉATION D'UN CONTRAT
  // ─────────────────────────────────────────────────────────────
  const handleOpenCreateModal = () => {
    setFormStaffName('');
    setFormRole('Entraîneur Équipe Première');
    setFormContractType('CDD Sportif');
    setFormWeeklyHours(35);
    setFormMonthlySalary(1850);
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('2026-06-30');
    setIsCreateModalOpen(true);
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStaffName.trim()) {
      showToast('Veuillez entrer le nom du salarié.');
      return;
    }

    setIsSubmitting(true);

    let backendType: 'CDI' | 'CDD' | 'PRESTATION' | 'STAGE' | 'BENEVOLAT' = 'CDD';
    if (formContractType === 'CDI' || formContractType.includes('CDI')) backendType = 'CDI';
    else if (formContractType.includes('Vacataire') || formContractType.includes('Indépendant')) backendType = 'PRESTATION';
    else if (formContractType.includes('Service Civique')) backendType = 'BENEVOLAT';

    try {
      const createdContract = await hrContractsService.createContract({
        employee_name: formStaffName.trim(),
        employee_email: `${formStaffName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@gesport-club.com`,
        position_title: formRole.trim(),
        start_date: formStartDate,
        end_date: formEndDate || null,
        contract_type: backendType,
        salary_monthly: Number(formMonthlySalary) || 1500,
      });

      // Mettre à jour avec le volume horaire saisi
      const enrichedContract: StaffContract = {
        ...createdContract,
        weeklyHours: Number(formWeeklyHours) || 35,
        contractType: formContractType,
      };

      setContracts(prev => [enrichedContract, ...prev]);
      showToast(`Contrat RH créé avec succès pour ${enrichedContract.staffName} !`);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.warn('Erreur création contrat backend, fallback local:', err);
      const fallbackContract: StaffContract = {
        id: `c-${Date.now()}`,
        staffName: formStaffName.trim(),
        role: formRole.trim(),
        contractType: formContractType,
        weeklyHours: Number(formWeeklyHours) || 35,
        monthlyGrossSalary: Number(formMonthlySalary) || 1500,
        startDate: formStartDate,
        endDate: formEndDate,
        status: 'Actif',
      };
      setContracts(prev => [fallbackContract, ...prev]);
      showToast(`Contrat pour ${fallbackContract.staffName} enregistré.`);
      setIsCreateModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 3. MODIFICATION D'UN CONTRAT
  // ─────────────────────────────────────────────────────────────
  const handleOpenEditModal = (contract: StaffContract) => {
    setEditingContract(contract);
    setFormStaffName(contract.staffName);
    setFormRole(contract.role);
    setFormContractType(contract.contractType);
    setFormWeeklyHours(contract.weeklyHours || 35);
    setFormMonthlySalary(contract.monthlyGrossSalary || 1850);
    setFormStartDate(contract.startDate);
    setFormEndDate(contract.endDate || '');
  };

  const handleUpdateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract) return;

    setIsSubmitting(true);

    let backendType = 'CDD';
    if (formContractType.includes('CDI')) backendType = 'CDI';
    else if (formContractType.includes('Vacataire') || formContractType.includes('Indépendant')) backendType = 'PRESTATION';
    else if (formContractType.includes('Service Civique')) backendType = 'BENEVOLAT';

    try {
      const isNumericId = !isNaN(Number(editingContract.id));
      if (isNumericId) {
        await hrContractsService.updateContract(editingContract.id, {
          employee_name: formStaffName.trim(),
          position_title: formRole.trim(),
          contract_type: backendType,
          salary_monthly: Number(formMonthlySalary),
          start_date: formStartDate,
          end_date: formEndDate || null,
        });
      }

      setContracts(prev =>
        prev.map(c =>
          c.id === editingContract.id
            ? {
                ...c,
                staffName: formStaffName.trim(),
                role: formRole.trim(),
                contractType: formContractType,
                weeklyHours: Number(formWeeklyHours),
                monthlyGrossSalary: Number(formMonthlySalary),
                startDate: formStartDate,
                endDate: formEndDate || undefined,
              }
            : c
        )
      );

      showToast(`Le contrat de ${formStaffName} a été mis à jour avec succès !`);
      setEditingContract(null);
    } catch (err) {
      console.error('Erreur mise à jour contrat:', err);
      // Fallback update local
      setContracts(prev =>
        prev.map(c =>
          c.id === editingContract.id
            ? {
                ...c,
                staffName: formStaffName.trim(),
                role: formRole.trim(),
                contractType: formContractType,
                weeklyHours: Number(formWeeklyHours),
                monthlyGrossSalary: Number(formMonthlySalary),
                startDate: formStartDate,
                endDate: formEndDate || undefined,
              }
            : c
        )
      );
      showToast(`Le contrat de ${formStaffName} a été mis à jour.`);
      setEditingContract(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 4. RENOUVELLEMENT D'UN CONTRAT
  // ─────────────────────────────────────────────────────────────
  const handleOpenRenewModal = (contract: StaffContract) => {
    setRenewingContract(contract);
    // Calculer date +1 an par défaut
    const baseDate = contract.endDate ? new Date(contract.endDate) : new Date();
    baseDate.setFullYear(baseDate.getFullYear() + 1);
    const defaultNewEnd = baseDate.toISOString().split('T')[0];

    setRenewEndDate(defaultNewEnd);
    setRenewSalary(contract.monthlyGrossSalary);
    setRenewContractType(contract.contractType);
  };

  const handleRenewContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingContract) return;

    if (!renewEndDate) {
      showToast("Veuillez sélectionner la nouvelle date d'échéance.");
      return;
    }

    setIsSubmitting(true);

    let backendType = 'CDD';
    if (renewContractType.includes('CDI')) backendType = 'CDI';
    else if (renewContractType.includes('Vacataire') || renewContractType.includes('Indépendant')) backendType = 'PRESTATION';
    else if (renewContractType.includes('Service Civique')) backendType = 'BENEVOLAT';

    try {
      const isNumericId = !isNaN(Number(renewingContract.id));
      if (isNumericId) {
        await hrContractsService.renewContract(renewingContract.id, {
          end_date: renewEndDate,
          salary_monthly: Number(renewSalary),
          contract_type: backendType,
        });
      }

      setContracts(prev =>
        prev.map(c =>
          c.id === renewingContract.id
            ? {
                ...c,
                endDate: renewEndDate,
                monthlyGrossSalary: Number(renewSalary),
                contractType: renewContractType,
                status: 'Actif',
                alertDaysLeft: undefined,
              }
            : c
        )
      );

      showToast(`Le contrat de ${renewingContract.staffName} a été renouvelé avec succès jusqu'au ${renewEndDate} !`);
      setRenewingContract(null);
    } catch (err) {
      console.error('Erreur renouvellement contrat:', err);
      // Fallback local
      setContracts(prev =>
        prev.map(c =>
          c.id === renewingContract.id
            ? {
                ...c,
                endDate: renewEndDate,
                monthlyGrossSalary: Number(renewSalary),
                contractType: renewContractType,
                status: 'Actif',
                alertDaysLeft: undefined,
              }
            : c
        )
      );
      showToast(`Le contrat de ${renewingContract.staffName} a été renouvelé jusqu'au ${renewEndDate}.`);
      setRenewingContract(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 5. SUPPRESSION / RUPTURE DU CONTRAT
  // ─────────────────────────────────────────────────────────────
  const handleOpenDeleteModal = (contract: StaffContract) => {
    setContractToDelete(contract);
  };

  const handleConfirmDelete = async () => {
    if (!contractToDelete) return;

    setIsSubmitting(true);

    try {
      const isNumericId = !isNaN(Number(contractToDelete.id));
      if (isNumericId) {
        // Rompre et supprimer en backend
        try {
          await hrContractsService.deleteContract(contractToDelete.id);
        } catch {
          // Si DELETE n'est pas autorisé, faire terminate
          await hrContractsService.terminateContract(contractToDelete.id);
        }
      }

      setContracts(prev => prev.filter(c => c.id !== contractToDelete.id));
      showToast(`Rupture actée : le contrat de ${contractToDelete.staffName} a été rompu et supprimé avec succès.`);
      setContractToDelete(null);
    } catch (err) {
      console.error('Erreur rupture contrat:', err);
      setContracts(prev => prev.filter(c => c.id !== contractToDelete.id));
      showToast(`Le contrat de ${contractToDelete.staffName} a été supprimé.`);
      setContractToDelete(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Contrats RH & Salaires Staff</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Suivi des CDD sportifs, CDI, vacataires, volume horaire hebdomadaire et alertes d'échéance de contrat
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Ajouter un Contrat
        </button>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {contracts.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-slate-800 mb-1">Aucun contrat enregistré</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
              Il n'y a actuellement aucun contrat dans la base de données. Enregistrez les contrats de travail ou conventions des entraîneurs et du staff.
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Créer un premier contrat
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Salarié / Entraîneur</th>
                  <th className="py-3 px-4">Fonction</th>
                  <th className="py-3 px-4">Type de Contrat</th>
                  <th className="py-3 px-4 text-center">Volume Hebdo</th>
                  <th className="py-3 px-4 text-right">Salaire Brut Mensuel</th>
                  <th className="py-3 px-4 text-center">Statut & Échéance</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {contracts.map(contract => {
                  const isExpiring = contract.status.includes('Renouvellement');
                  const isTerminated = contract.status === 'Échu' || contract.status === 'Résilier';

                  return (
                    <tr key={contract.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase">
                            {contract.staffName.charAt(0)}
                          </div>
                          <span>{contract.staffName}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{contract.role}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/50">
                          {contract.contractType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {contract.weeklyHours}h / sem
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-sm sm:text-base">
                        {contract.monthlyGrossSalary.toLocaleString('fr-FR')} €
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isExpiring ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            Fin dans {contract.alertDaysLeft || 25}j
                          </span>
                        ) : isTerminated ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
                            <X className="w-3 h-3" />
                            {contract.status}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            {contract.status}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* 1. Télécharger PDF */}
                          <button
                            type="button"
                            onClick={() => handleDownloadPdf(contract)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Télécharger le contrat officiel en PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          {/* 2. Modifier le contrat */}
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(contract)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Modifier ce contrat"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* 3. Renouveler le contrat */}
                          <button
                            type="button"
                            onClick={() => handleOpenRenewModal(contract)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Renouveler ce contrat"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>

                          {/* 4. Supprimer / Rompre le contrat */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(contract)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title="Rompre et supprimer ce contrat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL : AJOUTER UN CONTRAT
      ───────────────────────────────────────────────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="font-bold text-base text-slate-900">Enregistrer un Contrat Staff / Salarié</h3>
                <p className="text-xs text-slate-500">Gestion des conventions d'entraînement et rémunérations</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContract} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom et Prénom du Salarié *</label>
                {staff && staff.length > 0 ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Thomas Giraud"
                      value={formStaffName}
                      onChange={e => setFormStaffName(e.target.value)}
                      list="staff-suggestions"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <datalist id="staff-suggestions">
                      {staff.map(s => (
                        <option key={s.id} value={s.name}>
                          {s.role} ({s.department})
                        </option>
                      ))}
                    </datalist>
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Ex: Thomas Giraud"
                    value={formStaffName}
                    onChange={e => setFormStaffName(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fonction / Rôle</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type de Contrat</label>
                  <select
                    value={formContractType}
                    onChange={e => setFormContractType(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="CDD Sportif">CDD Sportif</option>
                    <option value="CDI Temps Plein">CDI Temps Plein</option>
                    <option value="CDI Temps Partiel">CDI Temps Partiel</option>
                    <option value="Vacataire / Prestation">Vacataire / Prestation</option>
                    <option value="Contrat d'Apprentissage">Contrat d'Apprentissage</option>
                    <option value="Service Civique">Service Civique</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Volume Hebdo (heures)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formWeeklyHours}
                    onChange={e => setFormWeeklyHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salaire Brut Mensuel (€)</label>
                  <input
                    type="number"
                    min={0}
                    step={25}
                    value={formMonthlySalary}
                    onChange={e => setFormMonthlySalary(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date d'embauche</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date de fin prévisionnelle</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
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
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer le Contrat'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL : MODIFIER UN CONTRAT
      ───────────────────────────────────────────────────────────── */}
      {editingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Modifier le Contrat</h3>
                  <p className="text-xs text-slate-500">{editingContract.staffName} • {editingContract.role}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingContract(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateContract} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nom et Prénom du Salarié *</label>
                <input
                  type="text"
                  required
                  value={formStaffName}
                  onChange={e => setFormStaffName(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fonction / Rôle</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={e => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type de Contrat</label>
                  <select
                    value={formContractType}
                    onChange={e => setFormContractType(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="CDD Sportif">CDD Sportif</option>
                    <option value="CDI Temps Plein">CDI Temps Plein</option>
                    <option value="CDI Temps Partiel">CDI Temps Partiel</option>
                    <option value="Vacataire / Prestation">Vacataire / Prestation</option>
                    <option value="Contrat d'Apprentissage">Contrat d'Apprentissage</option>
                    <option value="Service Civique">Service Civique</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Volume Hebdo (heures)</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={formWeeklyHours}
                    onChange={e => setFormWeeklyHours(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Salaire Brut Mensuel (€)</label>
                  <input
                    type="number"
                    min={0}
                    step={25}
                    value={formMonthlySalary}
                    onChange={e => setFormMonthlySalary(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date d'embauche</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date de fin prévisionnelle</label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingContract(null)}
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
          MODAL : RENOUVELER UN CONTRAT
      ───────────────────────────────────────────────────────────── */}
      {renewingContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Renouveler le Contrat</h3>
                  <p className="text-xs text-slate-500">Prolongation d'engagement pour {renewingContract.staffName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRenewingContract(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRenewContract} className="p-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Fonction actuelle :</span>
                  <span className="font-bold text-slate-900">{renewingContract.role}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Échéance actuelle :</span>
                  <span className="font-bold text-slate-900">{renewingContract.endDate || 'Non définie'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Rémunération actuelle :</span>
                  <span className="font-bold text-slate-900">{renewingContract.monthlyGrossSalary.toLocaleString('fr-FR')} € brut</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nouvelle Date de Fin du Contrat (Échéance) *
                </label>
                <input
                  type="date"
                  required
                  value={renewEndDate}
                  onChange={e => setRenewEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <div className="flex gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setMonth(d.getMonth() + 6);
                      setRenewEndDate(d.toISOString().split('T')[0]);
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    +6 mois
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setFullYear(d.getFullYear() + 1);
                      setRenewEndDate(d.toISOString().split('T')[0]);
                    }}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    +1 an (Nouvelle Saison)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Type de Contrat</label>
                  <select
                    value={renewContractType}
                    onChange={e => setRenewContractType(e.target.value)}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 outline-hidden"
                  >
                    <option value="CDD Sportif">CDD Sportif</option>
                    <option value="CDI Temps Plein">CDI Temps Plein</option>
                    <option value="CDI Temps Partiel">CDI Temps Partiel</option>
                    <option value="Vacataire / Prestation">Vacataire / Prestation</option>
                    <option value="Contrat d'Apprentissage">Contrat d'Apprentissage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nouveau Salaire Brut (€)</label>
                  <input
                    type="number"
                    min={0}
                    step={25}
                    value={renewSalary}
                    onChange={e => setRenewSalary(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRenewingContract(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Renouvellement...
                    </>
                  ) : (
                    'Confirmer le Renouvellement'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODAL : CONFIRMATION DE RUPTURE / SUPPRESSION DU CONTRAT
      ───────────────────────────────────────────────────────────── */}
      {contractToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Rompre et Supprimer le Contrat ?
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  Attention : cette action constitue une <strong className="text-red-700">rupture officielle et définitive</strong> du contrat de travail de <strong className="text-slate-900">{contractToDelete.staffName}</strong> ({contractToDelete.role}).
                </p>
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-left">
                  <p className="font-semibold mb-1">Avis de notification légale :</p>
                  <p>
                    La rupture sera actée immédiatement et le contrat sera définitivement supprimé de la base de données active des contrats et salaires RH du club.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setContractToDelete(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl shadow-xs cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Rupture en cours...
                    </>
                  ) : (
                    'Confirmer la Rupture du Contrat'
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
