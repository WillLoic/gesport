import { apiFetch } from './apiClient';
import { FinancialTransaction, Invoice, SponsorPartner } from '../types';

// ═══════════════════════════════════════════════════════════════════
//  INTERFACES BACKEND (Finance & Sponsoring Microservice #03)
// ═══════════════════════════════════════════════════════════════════

export interface BackendAccountPlan {
  id: number;
  club_id: number;
  code: string;
  label: string;
  account_type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  account_type_label: string;
  parent_code: string;
  is_active: boolean;
}

export interface BackendFiscalYear {
  id: number;
  club_id: number;
  label: string;
  start_date: string;
  end_date: string;
  status: 'open' | 'closed' | 'archived';
  status_label: string;
}

export interface BackendJournalEntry {
  id: number;
  club_id: number;
  fiscal_year: number;
  fiscal_year_label?: string;
  account: number;
  account_code?: string;
  account_label?: string;
  journal: 'ACH' | 'VTE' | 'BNQ' | 'OD' | 'SAL' | 'IMM';
  journal_label?: string;
  entry_date: string;
  reference: string;
  label: string;
  debit: string | number;
  credit: string | number;
  currency_code: string;
  exchange_rate: string | number;
  is_validated: boolean;
  created_at: string;
}

export interface BackendInvoice {
  id: number;
  club_id: number;
  number: string;
  quote?: number | null;
  client_name: string;
  client_email: string;
  client_address: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'credited';
  status_label?: string;
  amount_excl_tax: string | number;
  tax_rate: string | number;
  tax_amount: string | number;
  amount_incl_tax: string | number;
  currency_code: string;
  notes: string;
  created_at: string;
}

export interface BackendQuote {
  id: number;
  club_id: number;
  reference: string;
  client_name: string;
  client_email: string;
  issue_date: string;
  validity_date: string;
  status: 'draft' | 'sent' | 'accepted' | 'refused' | 'expired';
  amount_excl_tax: string | number;
  tax_rate: string | number;
  amount_incl_tax: string | number;
  notes: string;
  created_at: string;
}

export interface BackendSponsor {
  id: number;
  club_id: number;
  company_name: string;
  sponsor_type: 'corporate' | 'institutional' | 'local_business' | 'patron';
  sponsor_type_display?: string;
  siret: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  logo_url: string;
  status: 'prospect' | 'active' | 'inactive';
  status_display?: string;
  created_at: string;
  updated_at: string;
}

export interface BackendSponsorshipPack {
  id: number;
  club_id: number;
  name: string;
  price: string | number;
  description: string;
  benefits: string;
  is_active: boolean;
}

export interface BackendSponsorshipContract {
  id: number;
  club_id: number;
  contract_number: string;
  sponsor: number;
  sponsor_detail?: BackendSponsor;
  pack?: number | null;
  pack_detail?: BackendSponsorshipPack;
  start_date: string;
  end_date: string;
  amount: string | number;
  status: 'draft' | 'signed' | 'terminated' | 'expired';
  status_display?: string;
  notes: string;
  invoice_id?: number | null;
  tax_receipt_id?: number | null;
  created_at: string;
}

export interface BackendBankAccount {
  id: number;
  club_id: number;
  name: string;
  bank_name: string;
  iban: string;
  bic: string;
  currency_code: string;
  current_balance: string | number;
  is_active: boolean;
}

export interface BackendBankTransaction {
  id: number;
  account: number;
  account_name?: string;
  transaction_date: string;
  value_date: string;
  label: string;
  reference: string;
  amount: string | number;
  direction: 'credit' | 'debit';
  direction_label?: string;
  category: 'operating' | 'investing' | 'financing';
  category_label?: string;
  status: 'pending' | 'reconciled' | 'disputed';
  status_label?: string;
  journal_entry_id?: number | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════════════════
//  MAPPERS : Backend → Frontend types
// ═══════════════════════════════════════════════════════════════════

export function mapJournalEntryToFinancialTransaction(entry: BackendJournalEntry): FinancialTransaction {
  const isCredit = Number(entry.credit) > 0;
  const amount = isCredit ? Number(entry.credit) : Number(entry.debit);
  const type: 'Recette' | 'Dépense' = isCredit ? 'Recette' : 'Dépense';

  let category: FinancialTransaction['category'] = 'Cotisations';
  if (entry.journal === 'VTE') category = 'Cotisations';
  else if (entry.journal === 'ACH') category = 'Matériel & Équipements';
  else if (entry.journal === 'SAL') category = 'Salaires & Charges';
  else if (entry.journal === 'BNQ') category = 'Subventions Mairie/Département';

  // Recherche dans le libellé pour affiner la catégorie
  const lbl = (entry.label || '').toLowerCase();
  if (lbl.includes('sponsor') || lbl.includes('mécénat')) category = 'Sponsors & Mécènes';
  else if (lbl.includes('buvette')) category = 'Buvette & Événements';
  else if (lbl.includes('billet')) category = 'Billetterie';
  else if (lbl.includes('boutique')) category = 'Boutique';
  else if (lbl.includes('arbitr') || lbl.includes('fédér')) category = 'Frais Arbitrage & Fédéraux';
  else if (lbl.includes('déplacement') || lbl.includes('péage') || lbl.includes('car')) category = 'Déplacements & Péages';

  return {
    id: String(entry.id),
    date: entry.entry_date,
    label: entry.label,
    type,
    category,
    amount: Math.abs(amount),
    paymentMethod: entry.journal === 'BNQ' ? 'Virement' : 'Prélèvement',
    status: entry.is_validated ? 'Rapproché' : 'En attente',
    invoiceReference: entry.reference || undefined,
  };
}

export function mapBackendInvoiceToFrontend(inv: BackendInvoice): Invoice {
  let status: Invoice['status'] = 'En attente';
  if (inv.status === 'paid') status = 'Payée';
  else if (inv.status === 'overdue') status = 'En retard';
  else if (inv.status === 'draft') status = 'Brouillon';

  let type: Invoice['type'] = 'Cotisation Membre';
  const notesLower = (inv.notes || '').toLowerCase();
  const clientLower = (inv.client_name || '').toLowerCase();
  if (notesLower.includes('sponsor') || clientLower.includes('spons') || clientLower.includes('sas') || clientLower.includes('sarl')) {
    type = 'Sponsoring Entreprise';
  } else if (notesLower.includes('gymnase') || notesLower.includes('location')) {
    type = 'Location Gymnase';
  } else if (notesLower.includes('stage')) {
    type = 'Stage Vacances';
  }

  return {
    id: String(inv.id),
    number: inv.number,
    clientName: inv.client_name,
    type,
    amountHT: Number(inv.amount_excl_tax) || 0,
    amountTTC: Number(inv.amount_incl_tax) || 0,
    issueDate: inv.issue_date,
    dueDate: inv.due_date,
    status,
    recipientEmail: inv.client_email,
  };
}

export function mapBackendSponsorToFrontend(sp: BackendSponsor, contract?: BackendSponsorshipContract): SponsorPartner {
  let packageTier: SponsorPartner['packageTier'] = 'Partenaire Local (500€)';
  if (sp.sponsor_type === 'corporate') packageTier = 'Argent / Officiel (5 000€)';
  else if (sp.sponsor_type === 'patron') packageTier = 'Mécénat / Don';
  else if (sp.sponsor_type === 'institutional') packageTier = 'Or / Majeur (10 000€+)';

  const amount = contract ? Number(contract.amount) : 3000;
  const startDate = contract ? contract.start_date : new Date().toISOString().split('T')[0];
  const endDate = contract ? contract.end_date : '2026-06-30';

  let status: SponsorPartner['status'] = 'Actif';
  if (sp.status === 'prospect') status = 'En négociation';
  else if (sp.status === 'inactive') status = 'À renouveler';

  let perks = ['Visibilité maillot', 'Panneaux gymnase', 'Pass VIP matchs'];
  if (contract?.pack_detail?.benefits) {
    perks = contract.pack_detail.benefits.split(',').map((b) => b.trim());
  }

  return {
    id: String(sp.id),
    companyName: sp.company_name,
    contactPerson: sp.contact_name,
    email: sp.contact_email,
    phone: sp.contact_phone || '04 91 00 00 00',
    packageTier,
    annualAmount: amount,
    contractStartDate: startDate,
    contractEndDate: endDate,
    perks,
    taxReceiptIssued: Boolean(contract?.tax_receipt_id),
    status,
    logoUrl: sp.logo_url || undefined,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  SERVICES API
// ═══════════════════════════════════════════════════════════════════

export const ledgerService = {
  /**
   * Récupère les écritures comptables du grand livre
   */
  async getJournalEntries(clubId = 1, journal?: string): Promise<FinancialTransaction[]> {
    const query = journal ? `?club_id=${clubId}&journal=${journal}` : `?club_id=${clubId}`;
    const entries = await apiFetch<BackendJournalEntry[]>(`/finance/ledger/entries/${query}`);
    return (entries || []).map(mapJournalEntryToFinancialTransaction);
  },

  /**
   * Crée une écriture comptable dans le grand livre
   */
  async createJournalEntry(data: {
    club_id?: number;
    fiscal_year: number;
    account: number;
    journal: 'ACH' | 'VTE' | 'BNQ' | 'OD' | 'SAL' | 'IMM';
    entry_date: string;
    reference?: string;
    label: string;
    debit?: number;
    credit?: number;
    currency_code?: string;
  }): Promise<FinancialTransaction> {
    const payload = {
      club_id: data.club_id || 1,
      debit: data.debit || 0,
      credit: data.credit || 0,
      currency_code: data.currency_code || 'EUR',
      exchange_rate: 1.0,
      reference: data.reference || `REF-${Date.now()}`,
      ...data,
    };
    const res = await apiFetch<BackendJournalEntry>('/finance/ledger/entries/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapJournalEntryToFinancialTransaction(res);
  },

  /**
   * Valide une écriture comptable (rapprochement)
   */
  async validateEntry(id: number | string): Promise<BackendJournalEntry> {
    return apiFetch<BackendJournalEntry>(`/finance/ledger/entries/${id}/validate/`, {
      method: 'POST',
    });
  },

  /**
   * Liste des comptes du plan comptable
   */
  async getAccounts(clubId = 1): Promise<BackendAccountPlan[]> {
    return apiFetch<BackendAccountPlan[]>(`/finance/ledger/accounts/?club_id=${clubId}`);
  },

  /**
   * Liste des exercices comptables
   */
  async getFiscalYears(clubId = 1): Promise<BackendFiscalYear[]> {
    return apiFetch<BackendFiscalYear[]>(`/finance/ledger/fiscal-years/?club_id=${clubId}`);
  },
};

export const invoicingService = {
  /**
   * Récupère la liste des factures
   */
  async getInvoices(clubId = 1, status?: string): Promise<Invoice[]> {
    const query = status ? `?club_id=${clubId}&status=${status}` : `?club_id=${clubId}`;
    const invoices = await apiFetch<BackendInvoice[]>(`/finance/invoicing/invoices/${query}`);
    return (invoices || []).map(mapBackendInvoiceToFrontend);
  },

  /**
   * Crée une nouvelle facture client
   */
  async createInvoice(data: {
    club_id?: number;
    number: string;
    client_name: string;
    client_email?: string;
    client_address?: string;
    issue_date: string;
    due_date: string;
    amount_excl_tax: number;
    tax_rate?: number;
    currency_code?: string;
    notes?: string;
    status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  }): Promise<Invoice> {
    const payload = {
      club_id: data.club_id || 1,
      tax_rate: data.tax_rate ?? 20.0,
      currency_code: data.currency_code || 'EUR',
      status: data.status || 'draft',
      ...data,
    };
    const res = await apiFetch<BackendInvoice>('/finance/invoicing/invoices/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendInvoiceToFrontend(res);
  },

  /**
   * Marque une facture comme réglée / payée
   */
  async markPaid(id: number | string): Promise<Invoice> {
    const res = await apiFetch<BackendInvoice>(`/finance/invoicing/invoices/${id}/pay/`, {
      method: 'POST',
    });
    return mapBackendInvoiceToFrontend(res);
  },

  /**
   * Récupère les devis
   */
  async getQuotes(clubId = 1): Promise<BackendQuote[]> {
    return apiFetch<BackendQuote[]>(`/finance/invoicing/quotes/?club_id=${clubId}`);
  },
};

export const sponsorshipService = {
  /**
   * Récupère tous les sponsors / partenaires avec leurs contrats
   */
  async getSponsors(clubId = 1): Promise<SponsorPartner[]> {
    const [sponsors, contracts] = await Promise.all([
      apiFetch<BackendSponsor[]>(`/finance/sponsors/sponsors/?club_id=${clubId}`),
      apiFetch<BackendSponsorshipContract[]>(`/finance/sponsors/contracts/?club_id=${clubId}`).catch(() => []),
    ]);

    return (sponsors || []).map((sp) => {
      const matchContract = (contracts || []).find((c) => c.sponsor === sp.id || c.sponsor_detail?.id === sp.id);
      return mapBackendSponsorToFrontend(sp, matchContract);
    });
  },

  /**
   * Crée un nouveau sponsor
   */
  async createSponsor(data: {
    club_id?: number;
    company_name: string;
    contact_name: string;
    contact_email: string;
    contact_phone?: string;
    sponsor_type?: 'corporate' | 'institutional' | 'local_business' | 'patron';
    siret?: string;
    website?: string;
    logo_url?: string;
    status?: 'prospect' | 'active' | 'inactive';
  }): Promise<BackendSponsor> {
    const payload = {
      club_id: data.club_id || 1,
      sponsor_type: data.sponsor_type || 'corporate',
      status: data.status || 'active',
      ...data,
    };
    return apiFetch<BackendSponsor>('/finance/sponsors/sponsors/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Liste des packs de partenariat
   */
  async getPacks(clubId = 1): Promise<BackendSponsorshipPack[]> {
    return apiFetch<BackendSponsorshipPack[]>(`/finance/sponsors/packs/?club_id=${clubId}`);
  },

  /**
   * Crée un contrat de partenariat
   */
  async createContract(data: {
    club_id?: number;
    sponsor: number;
    pack?: number;
    start_date: string;
    end_date: string;
    amount: number;
    notes?: string;
  }): Promise<BackendSponsorshipContract> {
    const payload = {
      club_id: data.club_id || 1,
      status: 'signed',
      ...data,
    };
    return apiFetch<BackendSponsorshipContract>('/finance/sponsors/contracts/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Signer un contrat de partenariat
   */
  async signContract(id: number | string): Promise<BackendSponsorshipContract> {
    return apiFetch<BackendSponsorshipContract>(`/finance/sponsors/contracts/${id}/sign/`, {
      method: 'POST',
    });
  },
};

export const bankingService = {
  /**
   * Récupère les comptes bancaires du club
   */
  async getAccounts(clubId = 1): Promise<BackendBankAccount[]> {
    return apiFetch<BackendBankAccount[]>(`/finance/banking/accounts/?club_id=${clubId}`);
  },

  /**
   * Récupère les transactions d'un compte bancaire
   */
  async getTransactions(accountId: number | string, status?: string): Promise<BackendBankTransaction[]> {
    const query = status ? `?status=${status}` : '';
    return apiFetch<BackendBankTransaction[]>(`/finance/banking/accounts/${accountId}/transactions/${query}`);
  },

  /**
   * Rapproche une transaction bancaire avec une écriture du grand livre
   */
  async reconcileTransaction(id: number | string, journalEntryId: number): Promise<BackendBankTransaction> {
    return apiFetch<BackendBankTransaction>(`/finance/banking/transactions/${id}/reconcile/`, {
      method: 'POST',
      body: JSON.stringify({ journal_entry_id: journalEntryId }),
    });
  },
};
