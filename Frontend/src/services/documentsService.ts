import { apiFetch } from './apiClient';
import { DocumentItem, ClubMeeting, StaffContract, LeaveRequest, StaffMember } from '../types';

// ═══════════════════════════════════════════════════════════════════
//  INTERFACES BACKEND (Documents & Coffre-Fort Django Microservice)
// ═══════════════════════════════════════════════════════════════════

export interface BackendVaultDocument {
  id: number;
  title: string;
  description: string;
  file_path_or_s3_key: string;
  file_url?: string;
  file_size: number;
  mime_type: string;
  sha256_hash: string;
  confidentiality_level: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  is_encrypted: boolean;
  encryption_algorithm: string;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
  access_logs?: Array<{
    id: number;
    accessed_by: string;
    access_type: string;
    ip_address: string;
    timestamp: string;
  }>;
}

export interface BackendResolution {
  id: number;
  assembly: number;
  title: string;
  description: string;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  status: 'DRAFT' | 'PASSED' | 'REJECTED';
}

export interface BackendAssemblyMinutes {
  id: number;
  assembly: number;
  vault_document: number | null;
  content_summary: string;
  signed_pv_status: string;
  created_at: string;
}

export interface BackendGeneralAssembly {
  id: number;
  title: string;
  assembly_type: 'ORDINARY' | 'EXTRAORDINARY' | 'SPECIAL';
  status: 'CONVOKED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduled_at: string;
  location: string;
  quorum_reached: boolean;
  created_at: string;
  updated_at: string;
  convocations?: Array<{
    id: number;
    recipient_email: string;
    sent_at: string;
    is_acknowledged: boolean;
  }>;
  resolutions?: BackendResolution[];
  minutes?: BackendAssemblyMinutes | null;
}

export interface BackendStaffReplacement {
  id: number;
  absent_employee_name: string;
  replacement_employee_name: string;
  leave_request: number | null;
  start_date: string;
  end_date: string;
  notes: string;
  created_at: string;
}

export interface BackendLeaveRequest {
  id: number;
  employee_name: string;
  employee_email: string;
  leave_type: 'PAID' | 'UNPAID' | 'SICK' | 'MATERNITY' | string;
  start_date: string;
  end_date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | string;
  reason: string;
  approved_by: string;
  created_at: string;
  replacements?: BackendStaffReplacement[];
}

export interface BackendHRContract {
  id: number;
  employee_name: string;
  employee_email: string;
  contract_type: 'CDI' | 'CDD' | 'PRESTATION' | 'STAGE' | 'BENEVOLAT';
  position_title: string;
  salary_monthly: string | number;
  start_date: string;
  end_date: string | null;
  status: 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'TERMINATED' | 'EXPIRED';
  vault_document: number | null;
  created_at: string;
  updated_at: string;
}

export interface BackendSigner {
  id: number;
  signature_request: number;
  name: string;
  email: string;
  role: string;
  status: 'PENDING' | 'SIGNED' | 'REJECTED';
  signed_at: string | null;
  signature_token: string;
  ip_address: string | null;
  rejection_reason?: string;
}

export interface BackendSignatureRequest {
  id: number;
  title: string;
  vault_document: number | null;
  hr_contract: number | null;
  status: 'DRAFT' | 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  security_otp_enabled: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  signers?: BackendSigner[];
}

// ═══════════════════════════════════════════════════════════════════
//  MAPPERS : Backend → Frontend types
// ═══════════════════════════════════════════════════════════════════

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 KB';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function mapBackendDocToFrontend(doc: BackendVaultDocument): DocumentItem {
  // Déterminer le type de média
  const lowerPath = ((doc.file_path_or_s3_key || '') + ' ' + (doc.title || '') + ' ' + (doc.mime_type || '')).toLowerCase();
  let fileType: DocumentItem['fileType'] = 'PDF';
  if (lowerPath.includes('.pdf') || lowerPath.includes('application/pdf')) fileType = 'PDF';
  else if (lowerPath.includes('.docx') || lowerPath.includes('.doc') || lowerPath.includes('word')) fileType = 'DOCX';
  else if (lowerPath.includes('.xlsx') || lowerPath.includes('.xls') || lowerPath.includes('.csv') || lowerPath.includes('spreadsheet') || lowerPath.includes('excel')) fileType = 'XLSX';
  else if (lowerPath.includes('.zip') || lowerPath.includes('.rar') || lowerPath.includes('.7z') || lowerPath.includes('.tar') || lowerPath.includes('.gz') || lowerPath.includes('zip')) fileType = 'ZIP';
  else if (lowerPath.includes('.png') || lowerPath.includes('.jpg') || lowerPath.includes('.jpeg') || lowerPath.includes('.webp') || lowerPath.includes('.gif') || lowerPath.includes('image/')) fileType = 'IMAGE';
  else if (lowerPath.includes('.mp4') || lowerPath.includes('.mov') || lowerPath.includes('.avi') || lowerPath.includes('.mkv') || lowerPath.includes('.webm') || lowerPath.includes('video/')) fileType = 'VIDEO';
  else if (lowerPath.includes('.mp3') || lowerPath.includes('.wav') || lowerPath.includes('.ogg') || lowerPath.includes('.m4a') || lowerPath.includes('audio/')) fileType = 'AUDIO';
  else if (lowerPath.includes('scan')) fileType = 'SCAN';

  // Role mapping
  let accessRole: DocumentItem['accessRole'] = 'Staff & Bureau';
  if (doc.confidentiality_level === 'PUBLIC') accessRole = 'Tous';
  else if (doc.confidentiality_level === 'RESTRICTED') accessRole = 'Bureau Seul';

  // Catégorie fallback
  const validCategories: DocumentItem['category'][] = [
    'Statuts & AG',
    'Assurances & Sécurité',
    'Règlements & Chartes',
    'Conventions Mairie',
    'Formulaires Licences',
    'Comptabilité'
  ];
  let category: DocumentItem['category'] = 'Statuts & AG';
  for (const cat of validCategories) {
    if (doc.description?.includes(cat) || doc.title?.includes(cat)) {
      category = cat;
      break;
    }
  }

  // URL directe de téléchargement ou affichage
  let downloadUrl = doc.file_url;
  if (!downloadUrl && doc.file_path_or_s3_key) {
    if (doc.file_path_or_s3_key.startsWith('http://') || doc.file_path_or_s3_key.startsWith('https://')) {
      downloadUrl = doc.file_path_or_s3_key;
    } else if (doc.file_path_or_s3_key.startsWith('s3://')) {
      downloadUrl = doc.file_path_or_s3_key.replace('s3://gesport-vault/', 'https://gesport-vault.s3.eu-west-3.amazonaws.com/');
    } else {
      downloadUrl = `http://localhost:8007/media/${doc.file_path_or_s3_key}`;
    }
  }

  return {
    id: String(doc.id),
    title: doc.title,
    category,
    fileType,
    fileSize: formatFileSize(doc.file_size),
    uploadDate: doc.created_at ? doc.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    author: doc.uploaded_by || 'Secrétaire Général',
    accessRole,
    downloadUrl,
    description: doc.description,
    sha256: doc.sha256_hash,
  };
}

export function mapBackendAssemblyToFrontend(assembly: BackendGeneralAssembly): ClubMeeting {
  let type: ClubMeeting['type'] = 'Bureau Directeur';
  if (assembly.assembly_type === 'ORDINARY') type = 'Assemblée Générale Ordinaire';
  else if (assembly.assembly_type === 'EXTRAORDINARY') type = 'AG Extraordinaire';

  let status: ClubMeeting['status'] = 'Planifiée';
  if (assembly.status === 'IN_PROGRESS') status = 'En cours';
  else if (assembly.status === 'COMPLETED') status = 'Clôturée';

  const scheduled = assembly.scheduled_at || new Date().toISOString();
  const date = scheduled.split('T')[0];
  const time = scheduled.split('T')[1]?.slice(0, 5) || '19:00';

  const votes = (assembly.resolutions || []).map((r) => ({
    id: r.id,
    resolution: r.title,
    description: r.description,
    votesFor: r.votes_for,
    votesAgainst: r.votes_against,
    abstentions: r.votes_abstain,
    result: (r.votes_for >= r.votes_against ? 'Adopté' : 'Rejeté') as 'Adopté' | 'Rejeté',
  }));

  return {
    id: String(assembly.id),
    title: assembly.title,
    type,
    date,
    time,
    location: assembly.location || 'Siège du Club',
    quorumNeeded: 5,
    attendeesCount: assembly.convocations?.length || 5,
    status,
    agendaItems: [
      '1. Approbation de l’ordre du jour',
      '2. Bilan sportif et organisationnel',
      '3. Point financier et clôture',
    ],
    votes,
    minutesGenerated: Boolean(assembly.minutes),
  };
}

export function mapBackendContractToFrontend(contract: BackendHRContract): StaffContract {
  let contractType: StaffContract['contractType'] = 'CDI';
  if (contract.contract_type === 'CDD') contractType = 'CDD Sportif';
  else if (contract.contract_type === 'PRESTATION') contractType = 'Indépendant';
  else if (contract.contract_type === 'BENEVOLAT') contractType = 'Service Civique';

  let status: StaffContract['status'] = 'Actif';
  let alertDaysLeft: number | undefined;
  if (contract.status === 'TERMINATED') {
    status = 'Échu';
  } else if (contract.status === 'EXPIRED') {
    status = 'Échu';
  } else if (contract.end_date) {
    const end = new Date(contract.end_date).getTime();
    const now = new Date().getTime();
    const days = Math.round((end - now) / (1000 * 3600 * 24));
    if (days >= 0 && days <= 60) {
      alertDaysLeft = days;
      status = 'Renouvellement proche (<30j)';
    }
  }

  return {
    id: String(contract.id),
    staffName: contract.employee_name,
    role: contract.position_title || 'Entraîneur',
    contractType,
    monthlyGrossSalary: Number(contract.salary_monthly) || 0,
    weeklyHours: 35,
    startDate: contract.start_date,
    endDate: contract.end_date || undefined,
    status,
    alertDaysLeft,
  };
}

export function mapBackendLeaveToFrontend(leave: BackendLeaveRequest): LeaveRequest {
  let leaveType: LeaveRequest['leaveType'] = 'Congés Payés';
  if (leave.leave_type === 'SICK') leaveType = 'Arrêt Maladie';
  else if (leave.leave_type === 'UNPAID') leaveType = 'Événement Familial';

  let status: LeaveRequest['status'] = 'En attente';
  if (leave.status === 'APPROVED') status = 'Approuvé';
  else if (leave.status === 'REJECTED') status = 'Refusé';
  else if (leave.status === 'COMPLETED') status = 'Terminé';

  const d1 = new Date(leave.start_date).getTime();
  const d2 = new Date(leave.end_date).getTime();
  const diffDays = Math.max(1, Math.round((d2 - d1) / (1000 * 3600 * 24)) + 1);

  const sub = leave.replacements?.[0]?.replacement_employee_name || 'Coach Adjoint';

  return {
    id: String(leave.id),
    staffName: leave.employee_name,
    role: 'Staff Technique',
    leaveType,
    startDate: leave.start_date,
    endDate: leave.end_date,
    daysCount: isNaN(diffDays) ? 1 : diffDays,
    substituteStaffName: sub,
    substituteHandledTeams: ['Équipe Pro', 'U18'],
    status,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  SERVICES API
// ═══════════════════════════════════════════════════════════════════

export const vaultService = {
  /**
   * Récupère tous les documents du coffre-fort
   */
  async getDocuments(confidentiality?: string): Promise<DocumentItem[]> {
    const query = confidentiality ? `?confidentiality=${confidentiality}` : '';
    const docs = await apiFetch<BackendVaultDocument[]>(`/vault/documents/${query}`);
    return (docs || []).map(mapBackendDocToFrontend);
  },

  /**
   * Récupère un document par ID
   */
  async getDocument(id: number | string): Promise<DocumentItem> {
    const doc = await apiFetch<BackendVaultDocument>(`/vault/documents/${id}/`);
    return mapBackendDocToFrontend(doc);
  },

  /**
   * Dépose un nouveau document dans le coffre-fort numérique
   */
  async createDocument(data: {
    title: string;
    file_path_or_s3_key: string;
    description?: string;
    file_size?: number;
    mime_type?: string;
    confidentiality_level?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
    uploaded_by?: string;
    is_encrypted?: boolean;
    encryption_algorithm?: string;
  }): Promise<DocumentItem> {
    const res = await apiFetch<BackendVaultDocument>('/vault/documents/', {
      method: 'POST',
      body: JSON.stringify({
        confidentiality_level: 'CONFIDENTIAL',
        is_encrypted: true,
        encryption_algorithm: 'AES-256',
        ...data,
      }),
    });
    return mapBackendDocToFrontend(res);
  },

  /**
   * Génère une URL pré-signée S3 / accès sécurisé
   */
  async getPresignedUrl(documentId: number | string, accessedBy = 'user'): Promise<{ presigned_url: string; expires_in: number }> {
    return apiFetch<{ presigned_url: string; expires_in: number }>(`/vault/documents/${documentId}/presigned-url/`, {
      method: 'POST',
      body: JSON.stringify({ accessed_by: accessedBy }),
    });
  },

  /**
   * Upload direct d'un fichier physique (multipart/form-data) vers le stockage local (ou S3 en prod)
   */
  async uploadDocument(formData: FormData): Promise<DocumentItem> {
    const res = await apiFetch<BackendVaultDocument>('/vault/documents/upload/', {
      method: 'POST',
      body: formData,
    });
    return mapBackendDocToFrontend(res);
  },

  /**
   * Met à jour les métadonnées d'un document
   */
  async updateDocument(id: number | string, data: {
    title?: string;
    description?: string;
    confidentiality_level?: string;
  }): Promise<DocumentItem> {
    const res = await apiFetch<BackendVaultDocument>(`/vault/documents/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return mapBackendDocToFrontend(res);
  },

  /**
   * Supprime un document (fichier physique et entrée BD)
   */
  async deleteDocument(id: number | string): Promise<void> {
    await apiFetch(`/vault/documents/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Récupère les logs d'accès à un document
   */
  async getAccessLogs(documentId: number | string) {
    return apiFetch<any[]>(`/vault/documents/${documentId}/logs/`);
  },
};

export const governanceService = {
  /**
   * Récupère toutes les assemblées générales
   */
  async getAssemblies(status?: string): Promise<ClubMeeting[]> {
    const query = status ? `?status=${status}` : '';
    const assemblies = await apiFetch<BackendGeneralAssembly[]>(`/governance/assemblies/${query}`);
    return (assemblies || []).map(mapBackendAssemblyToFrontend);
  },

  /**
   * Convoque une nouvelle Assemblée Générale
   */
  async createAssembly(data: {
    title: string;
    scheduled_at: string;
    assembly_type?: 'ORDINARY' | 'EXTRAORDINARY' | 'SPECIAL';
    location?: string;
    recipient_emails?: string[];
  }): Promise<ClubMeeting> {
    const res = await apiFetch<BackendGeneralAssembly>('/governance/assemblies/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapBackendAssemblyToFrontend(res);
  },

  /**
   * Mettre à jour une Assemblée Générale / Réunion
   */
  async updateAssembly(id: number | string, data: {
    title?: string;
    scheduled_at?: string;
    assembly_type?: 'ORDINARY' | 'EXTRAORDINARY' | 'SPECIAL' | string;
    location?: string;
    status?: string;
  }): Promise<ClubMeeting> {
    const res = await apiFetch<BackendGeneralAssembly>(`/governance/assemblies/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return mapBackendAssemblyToFrontend(res);
  },

  /**
   * Supprimer une Assemblée Générale / Réunion
   */
  async deleteAssembly(id: number | string): Promise<void> {
    await apiFetch(`/governance/assemblies/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Ajoute une résolution à une AG
   */
  async addResolution(assemblyId: number | string, data: { title: string; description?: string }): Promise<BackendResolution> {
    return apiFetch<BackendResolution>(`/governance/assemblies/${assemblyId}/resolutions/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Vote sur une résolution
   */
  async voteResolution(
    resolutionId: number | string,
    data: {
      type?: 'pour' | 'contre' | 'abstention';
      votes_for?: number;
      votes_against?: number;
      votes_abstain?: number;
    }
  ): Promise<BackendResolution> {
    return apiFetch<BackendResolution>(`/governance/resolutions/${resolutionId}/vote/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Finalise le procès-verbal (PV) d'une AG
   */
  async finalizeMinutes(assemblyId: number | string, data: { content_summary: string; vault_document_id?: number }): Promise<BackendAssemblyMinutes> {
    return apiFetch<BackendAssemblyMinutes>(`/governance/assemblies/${assemblyId}/minutes/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const hrContractsService = {
  /**
   * Liste des contrats RH
   */
  async getContracts(status?: string): Promise<StaffContract[]> {
    const query = status ? `?status=${status}` : '';
    const contracts = await apiFetch<BackendHRContract[]>(`/hr-contracts/contracts/${query}`);
    return (contracts || []).map(mapBackendContractToFrontend);
  },

  /**
   * Enregistre un contrat de travail
   */
  async createContract(data: {
    employee_name: string;
    employee_email: string;
    position_title: string;
    start_date: string;
    contract_type?: 'CDI' | 'CDD' | 'PRESTATION' | 'STAGE' | 'BENEVOLAT';
    salary_monthly?: number;
    end_date?: string | null;
    vault_document?: number | null;
  }): Promise<StaffContract> {
    const res = await apiFetch<BackendHRContract>('/hr-contracts/contracts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapBackendContractToFrontend(res);
  },

  /**
   * Mettre à jour un contrat de travail
   */
  async updateContract(id: number | string, data: {
    employee_name?: string;
    employee_email?: string;
    position_title?: string;
    start_date?: string;
    end_date?: string | null;
    contract_type?: string;
    salary_monthly?: number;
    status?: string;
  }): Promise<StaffContract> {
    const res = await apiFetch<BackendHRContract>(`/hr-contracts/contracts/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return mapBackendContractToFrontend(res);
  },

  /**
   * Renouveler un contrat de travail (prolongation d'échéance et ajustement salarial)
   */
  async renewContract(id: number | string, data: {
    end_date: string;
    salary_monthly?: number;
    contract_type?: string;
  }): Promise<StaffContract> {
    const res = await apiFetch<BackendHRContract>(`/hr-contracts/contracts/${id}/renew/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapBackendContractToFrontend(res);
  },

  /**
   * Résilier un contrat
   */
  async terminateContract(id: number | string, terminationDate?: string): Promise<StaffContract> {
    const res = await apiFetch<BackendHRContract>(`/hr-contracts/contracts/${id}/terminate/`, {
      method: 'POST',
      body: JSON.stringify({ termination_date: terminationDate }),
    });
    return mapBackendContractToFrontend(res);
  },

  /**
   * Supprimer un contrat de travail (rupture / suppression définitive)
   */
  async deleteContract(id: number | string): Promise<void> {
    await apiFetch(`/hr-contracts/contracts/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Liste des demandes de congés
   */
  async getLeaves(status?: string): Promise<LeaveRequest[]> {
    const query = status ? `?status=${status}` : '';
    const leaves = await apiFetch<BackendLeaveRequest[]>(`/hr-contracts/leaves/${query}`);
    return (leaves || []).map(mapBackendLeaveToFrontend);
  },

  /**
   * Dépose une demande de congé
   */
  async createLeave(data: {
    employee_name: string;
    employee_email: string;
    start_date: string;
    end_date: string;
    leave_type?: 'PAID' | 'UNPAID' | 'SICK' | 'MATERNITY';
    reason?: string;
  }): Promise<LeaveRequest> {
    const res = await apiFetch<BackendLeaveRequest>('/hr-contracts/leaves/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapBackendLeaveToFrontend(res);
  },

  /**
   * Valide ou refuse une demande de congé
   */
  async approveRejectLeave(id: number | string, approve: boolean, managerName = 'Directeur des Opérations'): Promise<LeaveRequest> {
    const res = await apiFetch<BackendLeaveRequest>(`/hr-contracts/leaves/${id}/approve-reject/`, {
      method: 'POST',
      body: JSON.stringify({ approve, manager_name: managerName }),
    });
    return mapBackendLeaveToFrontend(res);
  },

  /**
   * Marquer un congé comme terminé (séjour/période d'absence achevée)
   */
  async completeLeave(id: number | string): Promise<LeaveRequest> {
    const res = await apiFetch<BackendLeaveRequest>(`/hr-contracts/leaves/${id}/complete/`, {
      method: 'POST',
    });
    return mapBackendLeaveToFrontend(res);
  },

  /**
   * Mettre à jour une demande de congé
   */
  async updateLeave(id: number | string, data: {
    employee_name?: string;
    employee_email?: string;
    start_date?: string;
    end_date?: string;
    leave_type?: string;
    status?: string;
    reason?: string;
  }): Promise<LeaveRequest> {
    const res = await apiFetch<BackendLeaveRequest>(`/hr-contracts/leaves/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return mapBackendLeaveToFrontend(res);
  },

  /**
   * Supprimer une demande de congé
   */
  async deleteLeave(id: number | string): Promise<void> {
    await apiFetch(`/hr-contracts/leaves/${id}/`, {
      method: 'DELETE',
    });
  },

  /**
   * Liste des remplacements staff
   */
  async getReplacements(): Promise<BackendStaffReplacement[]> {
    return apiFetch<BackendStaffReplacement[]>('/hr-contracts/replacements/');
  },

  /**
   * Assigne un remplacement de coach/staff
   */
  async createReplacement(data: {
    absent_employee_name: string;
    replacement_employee_name: string;
    start_date: string;
    end_date: string;
    leave_request?: number | null;
    notes?: string;
  }): Promise<BackendStaffReplacement> {
    return apiFetch<BackendStaffReplacement>('/hr-contracts/replacements/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const signaturesService = {
  /**
   * Liste des demandes de signature électronique
   */
  async getRequests(status?: string): Promise<BackendSignatureRequest[]> {
    const query = status ? `?status=${status}` : '';
    return apiFetch<BackendSignatureRequest[]>(`/signatures/requests/${query}`);
  },

  /**
   * Crée une demande de signature de document / contrat
   */
  async createRequest(data: {
    title: string;
    signers: Array<{ name: string; email: string; role?: string }>;
    vault_document?: number | null;
    hr_contract?: number | null;
    security_otp_enabled?: boolean;
  }): Promise<BackendSignatureRequest> {
    return apiFetch<BackendSignatureRequest>('/signatures/requests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Signer un document par token de signature
   */
  async signDocument(token: string, otpCode?: string): Promise<BackendSigner> {
    return apiFetch<BackendSigner>(`/signatures/signers/${token}/sign/`, {
      method: 'POST',
      body: JSON.stringify({ otp_code: otpCode }),
    });
  },

  /**
   * Refuser de signer
   */
  async declineSignature(token: string, reason?: string): Promise<BackendSigner> {
    return apiFetch<BackendSigner>(`/signatures/signers/${token}/decline/`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// ═══════════════════════════════════════════════════════════════════
//  INTERFACE BACKEND : Membres du Staff (ClubStaffMember)
// ═══════════════════════════════════════════════════════════════════

export interface BackendStaffMember {
  id: number;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  contract_type: string;
  qualifications: string[];
  assigned_teams: string[];
  access_level: 'Admin' | 'Manager' | 'Coach' | 'Medical' | 'Staff';
  created_at: string;
  updated_at: string;
}

export function mapBackendStaffMemberToFrontend(member: BackendStaffMember): StaffMember {
  return {
    id: String(member.id),
    name: member.name,
    role: member.role,
    department: member.department,
    email: member.email,
    phone: member.phone || '—',
    contractType: member.contract_type || 'CDI',
    qualifications: member.qualifications || [],
    assignedTeams: member.assigned_teams || [],
    accessLevel: member.access_level || 'Staff',
  };
}

export const staffMemberService = {
  /**
   * Liste tous les membres du staff (filtrable par département)
   */
  async getStaffMembers(department?: string): Promise<StaffMember[]> {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    const members = await apiFetch<BackendStaffMember[]>(`/hr-contracts/staff-members/${query}`);
    return (members || []).map(mapBackendStaffMemberToFrontend);
  },

  /**
   * Crée un nouveau membre du staff
   */
  async createStaffMember(data: {
    name: string;
    role: string;
    department: string;
    email: string;
    phone?: string;
    contract_type?: string;
    qualifications?: string[];
    assigned_teams?: string[];
    access_level?: 'Admin' | 'Manager' | 'Coach' | 'Medical' | 'Staff';
  }): Promise<StaffMember> {
    const res = await apiFetch<BackendStaffMember>('/hr-contracts/staff-members/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return mapBackendStaffMemberToFrontend(res);
  },

  /**
   * Met à jour un membre du staff existant
   */
  async updateStaffMember(
    id: number | string,
    data: Partial<{
      name: string;
      role: string;
      department: string;
      email: string;
      phone: string;
      contract_type: string;
      qualifications: string[];
      assigned_teams: string[];
      access_level: 'Admin' | 'Manager' | 'Coach' | 'Medical' | 'Staff';
    }>
  ): Promise<StaffMember> {
    const res = await apiFetch<BackendStaffMember>(`/hr-contracts/staff-members/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return mapBackendStaffMemberToFrontend(res);
  },

  /**
   * Licencie (supprime) un membre du staff
   */
  async deleteStaffMember(id: number | string): Promise<void> {
    await apiFetch<void>(`/hr-contracts/staff-members/${id}/`, {
      method: 'DELETE',
    });
  },
};

