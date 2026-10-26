import { apiFetch } from './apiClient';
import { DocumentItem, ClubMeeting, StaffContract, LeaveRequest } from '../types';

// ═══════════════════════════════════════════════════════════════════
//  INTERFACES BACKEND (Documents & Coffre-Fort Django Microservice)
// ═══════════════════════════════════════════════════════════════════

export interface BackendVaultDocument {
  id: number;
  title: string;
  description: string;
  file_path_or_s3_key: string;
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
  leave_type: 'PAID' | 'UNPAID' | 'SICK' | 'MATERNITY';
  start_date: string;
  end_date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
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
  // Déterminer l'extension
  const lowerPath = (doc.file_path_or_s3_key || '').toLowerCase();
  let fileType: DocumentItem['fileType'] = 'PDF';
  if (lowerPath.endsWith('.docx') || lowerPath.endsWith('.doc')) fileType = 'DOCX';
  else if (lowerPath.endsWith('.xlsx') || lowerPath.endsWith('.xls')) fileType = 'XLSX';

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

  return {
    id: String(doc.id),
    title: doc.title,
    category,
    fileType,
    fileSize: formatFileSize(doc.file_size),
    uploadDate: doc.created_at ? doc.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    author: doc.uploaded_by || 'Secrétaire Général',
    accessRole,
    downloadUrl: doc.file_path_or_s3_key,
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
    resolution: r.title,
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
  if (contract.status === 'TERMINATED' || contract.status === 'EXPIRED') status = 'Échu';
  else if (contract.status === 'PENDING_SIGNATURE' || contract.status === 'DRAFT') status = 'Renouvellement proche (<30j)';

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
  };
}

export function mapBackendLeaveToFrontend(leave: BackendLeaveRequest): LeaveRequest {
  let leaveType: LeaveRequest['leaveType'] = 'Congés Payés';
  if (leave.leave_type === 'SICK') leaveType = 'Arrêt Maladie';
  else if (leave.leave_type === 'UNPAID') leaveType = 'Événement Familial';

  let status: LeaveRequest['status'] = 'En attente';
  if (leave.status === 'APPROVED') status = 'Approuvé';
  else if (leave.status === 'REJECTED') status = 'Refusé';

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
  async voteResolution(resolutionId: number | string, votes: { votes_for: number; votes_against: number; votes_abstain?: number }): Promise<BackendResolution> {
    return apiFetch<BackendResolution>(`/governance/resolutions/${resolutionId}/vote/`, {
      method: 'POST',
      body: JSON.stringify(votes),
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
