export type SportType = 'volleyball' | 'football' | 'basketball' | 'handball' | 'rugby' | 'tennis';

export interface TacticalPosition {
  positionNumber: string;
  role: string;
  x: string;
  y: string;
  number: number;
  label?: string;
}

export interface SportPresetConfig {
  id: SportType;
  name: string;
  clubName: string;
  shortName: string;
  badge: string;
  icon: string;
  color: string;
  courtName: string;
  positions: string[];
  matchFormat: string;
  systemName: string;
  tacticalLineup: TacticalPosition[];
  drillCategories: string[];
}

export type ClubRole =
  | 'admin'
  | 'sport_director'
  | 'coach'
  | 'secretary'
  | 'treasurer'
  | 'medical'
  | 'logistics'
  | 'volunteer';

export type SportCategory =
  | 'Baby/U9'
  | 'U11'
  | 'U13'
  | 'U15'
  | 'U18'
  | 'Senior Régionale'
  | 'Senior Nationale'
  | 'Loisir / Masters'
  | 'Pro Élite';

export type LicenseStatus = 'Validée' | 'En attente' | 'Expirée' | 'Paiement partiel';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: 'M' | 'F';
  birthDate: string;
  category: SportCategory;
  teamId: string;
  teamName: string;
  licenseNumber: string;
  licenseStatus: LicenseStatus;
  season: string;
  medicalCertDate: string;
  medicalCertValid: boolean;
  position: string;
  jerseyNumber: number;
  paymentStatus: 'À jour' | 'En attente' | 'Échelonné';
  amountDue: number;
  amountPaid: number;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  address: string;
  avatarUrl?: string;
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: 'Direction & Bureau' | 'Staff Technique' | 'Pôle Médical & Santé' | 'Logistique & Équipement' | 'Communication & Événements';
  email: string;
  phone: string;
  contractType: 'CDI' | 'CDD Sportif' | 'Vacataire' | 'Bénévole' | 'Prestataire' | 'Service Civique';
  contractEndDate?: string;
  qualifications: string[];
  assignedTeams: string[];
  accessLevel: 'Admin Total' | 'Coach & Sport' | 'Comptabilité' | 'Médical Strict' | 'Consultation';
  avatarUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  category: SportCategory;
  division: string;
  coachId: string;
  coachName: string;
  assistantCoach?: string;
  playerIds: string[];
  ranking: number;
  playedMatches: number;
  wins: number;
  losses: number;
  points: number;
  trainingDays: string;
  hallName: string;
  colorHex: string;
}

export type EventType = 'match_official' | 'match_friendly' | 'training' | 'tournament' | 'meeting' | 'medical';

export interface SportEvent {
  id: string;
  title: string;
  type: EventType;
  teamId?: string;
  teamName?: string;
  opponent?: string;
  isHome?: boolean;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  hall: string;
  convocationTime: string;
  status: 'Programmé' | 'En cours' | 'Terminé' | 'Reporté' | 'Annulé';
  score?: {
    home: number;
    away: number;
    sets?: string;
  };
  summonedPlayers: {
    playerId: string;
    playerName: string;
    status: 'Confirmé' | 'Absent' | 'En attente' | 'Blessé';
    transport: 'Club Mini-bus' | 'Voiture perso' | 'Covoiturage';
  }[];
  transportVehicleId?: string;
  referee?: string;
  notes?: string;
}

export interface TrainingExercise {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  intensity: 'Faible' | 'Moyenne' | 'Élevée';
  description: string;
  instructions: string[];
  diagramType?: string;
  sportId?: SportType;
  tags: string[];
}

export interface TrainingSession {
  id: string;
  title: string;
  teamId: string;
  teamName: string;
  date: string;
  startTime: string;
  endTime: string;
  coachName: string;
  theme: string;
  intensity: 'Faible' | 'Moyenne' | 'Haute';
  exercises: TrainingExercise[];
  attendanceCount: number;
  totalSummoned: number;
  coachFeedback?: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  date: string;
  playerId: string;
  playerName: string;
  teamName: string;
  status: 'Présent' | 'Absent excusé' | 'Absent non-excusé' | 'En retard' | 'Blessé';
  delayMinutes?: number;
  reason?: string;
}

export interface MatchStats {
  id: string;
  eventId: string;
  matchTitle: string;
  date: string;
  teamName: string;
  opponent: string;
  finalScore: string;
  result: 'Victoire' | 'Défaite';
  mvpPlayerName: string;
  setsDetail: { setNumber: number; scoreHome: number; scoreAway: number }[];
  playerStats: {
    playerId: string;
    playerName: string;
    pointsScored: number;
    aces: number;
    blocks: number;
    attackSuccessPct: number;
    serveFaults: number;
    rating: number; // 1-10
  }[];
  coachDebrief: string;
}

export interface MedicalRecord {
  id: string;
  playerId: string;
  playerName: string;
  teamName: string;
  injuryType: string;
  bodyPart: string;
  severity: 'Mineure (1-7j)' | 'Modérée (1-4 sem)' | 'Sévère (> 1 mois)';
  injuryDate: string;
  estimatedReturnDate: string;
  actualReturnDate?: string;
  status: 'Indisponible' | 'Réathlétisation' | 'Apte avec réserve' | 'Guéri / Feu vert';
  physioNotes: string;
  prescribedCare: string;
  doctorCleared: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Ballons' | 'Filets & Poteaux' | 'Maillots & Chasubles' | 'Matériel Pédagogique' | 'Médical & Soins' | 'Buvette';
  quantityTotal: number;
  quantityAvailable: number;
  condition: 'Neuf' | 'Bon état' | 'Usé' | 'À réparer/remplacer';
  storageLocation: string;
  minThresholdAlert: number;
  qrCode: string;
  borrowHistory: {
    borrowerName: string;
    borrowDate: string;
    returnDateExpected: string;
    qty: number;
    returned: boolean;
  }[];
}

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  capacity: number; // places (e.g. 9 places)
  type: 'Minibus Club' | 'Utilitaire Matériel' | 'Berline Direction';
  mileage: number;
  status: 'Disponible' | 'En déplacement' | 'En maintenance' | 'Réservé';
  fuelType: 'Diesel' | 'Électrique' | 'Hybride';
  nextInspectionDate: string;
  assignedDriver?: string;
  currentBooking?: {
    teamName: string;
    destination: string;
    date: string;
  };
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplierName: string;
  category: 'Matériel Sportif' | 'Textile & Flocage' | 'Médical' | 'Alimentaire Buvette' | 'Frais Transport';
  description: string;
  totalAmountTTC: number;
  requestedBy: string;
  requestDate: string;
  status: 'En attente validation' | 'Validé' | 'Commandé' | 'Livré' | 'Refusé';
  invoiceAttached: boolean;
}

export interface PosProduct {
  id: string;
  name: string;
  category: 'Boissons' | 'Snacks & Sandwichs' | 'Boutique Match' | 'Confiserie';
  price: number;
  stock: number;
  icon: string;
}

export interface PosOrder {
  id: string;
  date: string;
  time: string;
  items: { productId: string; name: string; qty: number; unitPrice: number }[];
  total: number;
  paymentMethod: 'Espèces' | 'Carte Bancaire' | 'Jetons Buvette' | 'Sans Contact';
  cashierName: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Statuts & AG' | 'Assurances & Sécurité' | 'Règlements & Chartes' | 'Conventions Mairie' | 'Formulaires Licences' | 'Comptabilité';
  fileType: 'PDF' | 'DOCX' | 'XLSX';
  fileSize: string;
  uploadDate: string;
  author: string;
  accessRole: 'Tous' | 'Staff & Bureau' | 'Bureau Seul';
  downloadUrl?: string;
}

export interface ClubMeeting {
  id: string;
  title: string;
  type: 'Bureau Directeur' | 'Assemblée Générale Ordinaire' | 'AG Extraordinaire' | 'Comité Technique' | 'Commission Discipline';
  date: string;
  time: string;
  location: string;
  quorumNeeded: number;
  attendeesCount: number;
  status: 'Planifiée' | 'En cours' | 'Clôturée';
  agendaItems: string[];
  votes: {
    resolution: string;
    votesFor: number;
    votesAgainst: number;
    abstentions: number;
    result: 'Adopté' | 'Rejeté';
  }[];
  minutesGenerated: boolean;
}

export interface StaffContract {
  id: string;
  staffName: string;
  role: string;
  contractType: 'CDI' | 'CDD Sportif' | 'Vacataire' | 'Indépendant' | 'Service Civique';
  monthlyGrossSalary: number;
  weeklyHours: number;
  startDate: string;
  endDate?: string;
  status: 'Actif' | 'Renouvellement proche (<30j)' | 'Échu' | 'Archivé';
  alertDaysLeft?: number;
}

export interface LeaveRequest {
  id: string;
  staffName: string;
  role: string;
  leaveType: 'Congés Payés' | 'Arrêt Maladie' | 'Formation Fédérale' | 'Événement Familial';
  startDate: string;
  endDate: string;
  daysCount: number;
  substituteStaffName: string;
  substituteHandledTeams: string[];
  status: 'En attente' | 'Approuvé' | 'Refusé';
}

export interface FinancialTransaction {
  id: string;
  date: string;
  label: string;
  type: 'Recette' | 'Dépense';
  category: 'Cotisations' | 'Subventions Mairie/Département' | 'Sponsors & Mécènes' | 'Buvette & Événements' | 'Billetterie' | 'Boutique' | 'Salaires & Charges' | 'Déplacements & Péages' | 'Matériel & Équipements' | 'Frais Arbitrage & Fédéraux';
  amount: number;
  paymentMethod: 'Virement' | 'Prélèvement' | 'Carte Bancaire' | 'Chèque' | 'Espèces';
  status: 'Rapproché' | 'En attente';
  invoiceReference?: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientName: string;
  type: 'Cotisation Membre' | 'Sponsoring Entreprise' | 'Location Gymnase' | 'Stage Vacances';
  amountHT: number;
  amountTTC: number;
  issueDate: string;
  dueDate: string;
  status: 'Payée' | 'En attente' | 'En retard' | 'Brouillon';
  recipientEmail: string;
}

export interface SponsorPartner {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  packageTier: 'Or / Majeur (10 000€+)' | 'Argent / Officiel (5 000€)' | 'Bronze / Soutien (2 000€)' | 'Partenaire Local (500€)' | 'Mécénat / Don';
  annualAmount: number;
  contractStartDate: string;
  contractEndDate: string;
  perks: string[];
  taxReceiptIssued: boolean;
  status: 'Actif' | 'En négociation' | 'À renouveler';
  logoUrl?: string;
}

export interface ExpenseClaim {
  id: string;
  claimantName: string;
  claimantRole: string;
  date: string;
  category: 'Kilomètres déplacement match' | 'Repas équipe' | 'Péages & Stationnement' | 'Achat d’urgence matériel';
  description: string;
  amount: number;
  distanceKm?: number;
  status: 'En attente trésorier' | 'Validé pour paiement' | 'Remboursé' | 'Rejeté';
  receiptAttached: boolean;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  type: 'Emailing / Newsletter' | 'Alerte SMS Urgente' | 'Campagne Réseaux Sociaux';
  targetAudience: 'Tous les membres' | 'Parents d’élèves' | 'Sponsors & Partenaires' | 'Équipes Compétition';
  sentDate?: string;
  status: 'Brouillon' | 'Planifiée' | 'Envoyée';
  recipientsCount: number;
  openRatePct?: number;
  clickRatePct?: number;
  content: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Compétition' | 'Vie du club' | 'Événements' | 'Formation';
  summary: string;
  content: string;
  publishDate: string;
  author: string;
  isPublished: boolean;
  featuredImage: string;
  viewsCount: number;
}

export interface ShopProduct {
  id: string;
  name: string;
  category: 'Maillots Officiels' | 'Survêtements & Vestes' | 'Sacs & Bagagerie' | 'Accessoires & Goodies';
  price: number;
  originalPrice?: number;
  sizes: string[];
  image: string;
  inStock: boolean;
  stockQty: number;
  description: string;
  canCustomPrint: boolean; // Flocage nom & numéro
}

export interface TournamentMatch {
  id: string;
  court: string;
  time: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  stage: 'Poules' | 'Quarts' | 'Demi-finales' | 'Finale';
  status: 'À venir' | 'En cours' | 'Terminé';
}

export interface TicketPass {
  id: string;
  matchTitle: string;
  date: string;
  time: string;
  hall: string;
  ticketType: 'Plein Tarif (10€)' | 'Tarif Réduit / Licencié (5€)' | 'Pack Famille (20€)' | 'VIP & Espace Réceptif (35€)';
  holderName: string;
  price: number;
  qrCodeString: string;
  scanned: boolean;
  scannedAt?: string;
}

export interface TalentCandidate {
  id: string;
  fullName: string;
  currentClub: string;
  age: number;
  position: string;
  heightCm: number;
  categoryTarget: SportCategory;
  stage: 'Prospecté' | 'Premier Contact' | 'Essai Programmé' | 'Évaluation Staff' | 'Offre / Signé' | 'Refusé';
  skillsRadar: {
    technique: number;
    physique: number;
    tactique: number;
    mental: number;
    collectif: number;
  };
  scoutReport: string;
  contactPhone: string;
  trialDate?: string;
}

export interface AcademyStudent {
  id: string;
  memberId: string;
  studentName: string;
  category: SportCategory;
  age: number;
  tutorCoachName: string;
  schoolGrade: string;
  schoolSupportNeeded: boolean;
  progressScores: {
    quarter: string;
    technicalScore: number;
    tacticalScore: number;
    athleticScore: number;
    attitudeScore: number;
  }[];
  parentsName: string;
  parentsPhone: string;
  coachComments: string;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderName: string;
  senderRole: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isPinned?: boolean;
  attachments?: { name: string; size: string; type: string }[];
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  category: 'Équipes' | 'Commissions' | 'Staff & Direction' | 'Général';
  membersCount: number;
  unreadCount?: number;
}
