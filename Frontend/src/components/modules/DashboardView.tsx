import React from 'react';
import {
  Users,
  Trophy,
  Wallet,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  HeartPulse,
  Receipt,
  Store,
  Boxes,
  Truck,
  Sparkles,
  Ticket,
  ChevronRight,
  Clock,
  MapPin,
  Flame,
} from 'lucide-react';
import { useClub, ActiveModule } from '../../context/ClubContext';

export const DashboardView: React.FC = () => {
  const {
    members,
    teams,
    events,
    finances,
    medicalRecords,
    invoices,
    inventory,
    setActiveModule,
  } = useClub();

  // Financial calculations
  const totalRevenue = finances
    .filter(f => f.type === 'Recette')
    .reduce((acc, f) => acc + f.amount, 0);
  const totalExpense = finances
    .filter(f => f.type === 'Dépense')
    .reduce((acc, f) => acc + f.amount, 0);
  const netTreasury = totalRevenue - totalExpense;

  // Active & valid licenses
  const validLicensesCount = members.filter(m => m.licenseStatus === 'Validée').length;
  const expiredCount = members.filter(m => m.licenseStatus === 'Expirée' || m.licenseStatus === 'En attente').length;
  const injuredCount = medicalRecords.filter(m => m.status === 'Indisponible' || m.status === 'Réathlétisation').length;

  // Upcoming matches
  const upcomingMatches = events
    .filter(e => e.type === 'match_official' && e.status === 'Programmé')
    .slice(0, 3);
  const nextMatch = upcomingMatches[0];

  // Global win rate
  const totalWins = teams.reduce((acc, t) => acc + t.wins, 0);
  const totalPlayed = teams.reduce((acc, t) => acc + t.playedMatches, 0);
  const globalWinRate = totalPlayed > 0 ? Math.round((totalWins / totalPlayed) * 100) : 75;

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner with Club Identity */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Saison Sportive 2024-2025 • Élite & Formation
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
              Bienvenue sur le cockpit VolleyPro Elite
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Supervision transversale du club : {members.length} licenciés enregistrés, {teams.length} équipes engagées en championnat et 4 gymnases gérés.
            </p>
          </div>

          {/* Quick Action Pills in Header */}
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveModule('attendance')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              Pointage Rapide
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('pos')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              Caisse Buvette
            </button>
            <button
              type="button"
              onClick={() => setActiveModule('ai_assistant')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Assistant Club IA
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Members */}
        <div
          onClick={() => setActiveModule('members')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Licenciés & Membres</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">{members.length}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs">
              <span className="font-semibold text-emerald-600">{validLicensesCount} validées</span>
              <span className="text-slate-400">•</span>
              <span className="text-amber-600 font-medium">{expiredCount} en attente</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Treasury */}
        <div
          onClick={() => setActiveModule('finance')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trésorerie Nette</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600">
              {netTreasury.toLocaleString('fr-FR')} €
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Recettes : +{totalRevenue.toLocaleString('fr-FR')} €</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Sport Win Rate */}
        <div
          onClick={() => setActiveModule('teams')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Taux de Victoires</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-indigo-600">{globalWinRate}%</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
              <span>{totalWins} victoires sur {totalPlayed} matchs joués</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Medical Health */}
        <div
          onClick={() => setActiveModule('medical')}
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Disponibilité Effectif</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900">
              {members.length - injuredCount} / {members.length}
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-rose-600 font-medium">
              <span>{injuredCount} joueur{injuredCount > 1 ? 's' : ''} en soins / réathlétisation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Section: Next Big Match Banner + Urgent Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Highlight Match Card (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-bold text-slate-900">Prochaine Rencontre Officielle</h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                Nationale 1 Masculine
              </span>
            </div>

            {nextMatch ? (
              <div className="mt-5 space-y-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-4 rounded-xl bg-slate-50/80 border border-slate-200/60">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                      VP
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{nextMatch.teamName}</h3>
                      <p className="text-xs text-slate-500">2ème du championnat • Domicile</p>
                    </div>
                  </div>

                  <div className="text-center px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <span className="text-xs font-bold text-slate-400 uppercase">Samedi 01 Mars</span>
                    <div className="text-xl font-bold text-blue-600 font-display">20:00</div>
                    <span className="text-[10px] text-slate-500">Gymnase Gerland</span>
                  </div>

                  <div className="flex items-center gap-3 text-center sm:text-right flex-row-reverse sm:flex-row">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{nextMatch.opponent}</h3>
                      <p className="text-xs text-slate-500">1er du championnat • Extérieur</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-700 text-white font-bold text-lg flex items-center justify-center shadow-md">
                      GV
                    </div>
                  </div>
                </div>

                {/* Match Operations Checklist */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Convocations</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">
                      {nextMatch.summonedPlayers.filter(p => p.status === 'Confirmé').length} / {nextMatch.summonedPlayers.length} Confirmés
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Billetterie</p>
                    <p className="text-sm font-bold text-emerald-600 mt-0.5">320 / 400 Places</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Buvette & Régie</p>
                    <p className="text-sm font-bold text-purple-700 mt-0.5">Prête & Approvisionnée</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase">Arbitrage FFVB</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">Désigné & Confirmé</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>RDV Joueurs : {nextMatch.convocationTime}</span>
                    <span className="text-slate-300">•</span>
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>{nextMatch.hall}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveModule('calendar')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl border border-blue-200 transition-colors"
                    >
                      Feuille de Convocation
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModule('ticketing')}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                    >
                      Guichet Billetterie
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 py-6 text-center">Aucun match programmé pour le moment.</p>
            )}
          </div>

          {/* Teams Division Standings Ticker */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Classement & Résultats des Équipes</h2>
              <button
                type="button"
                onClick={() => setActiveModule('teams')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                Toutes les équipes <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {teams.map(t => (
                <div
                  key={t.id}
                  onClick={() => setActiveModule('teams')}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-xs"
                      style={{ backgroundColor: t.colorHex }}
                    >
                      #{t.ranking}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{t.name}</h4>
                      <p className="text-xs text-slate-500">{t.division}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="hidden sm:block text-xs">
                      <span className="text-emerald-600 font-semibold">{t.wins}V</span>
                      <span className="text-slate-400 mx-1">-</span>
                      <span className="text-rose-600 font-semibold">{t.losses}D</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900">{t.points} pts</span>
                      <p className="text-[10px] text-slate-400">{t.playedMatches} matchs</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Operational Alert Center & Quick Tools */}
        <div className="space-y-6">
          {/* Urgent Action Center */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Actions Requises
              </h2>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Prioritaire
              </span>
            </div>

            <div className="space-y-3">
              {/* Medical Alert Item */}
              {injuredCount > 0 && (
                <div
                  onClick={() => setActiveModule('medical')}
                  className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 hover:bg-rose-100/60 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
                    <span className="flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                      {injuredCount} Joueur(s) blessé(s)
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-rose-500" />
                  </div>
                  <p className="text-xs text-rose-700 mt-1">
                    Suivi kiné requis pour Hugo Bernard (entorse) et Camille Vidal.
                  </p>
                </div>
              )}

              {/* License / Cert Alert */}
              {expiredCount > 0 && (
                <div
                  onClick={() => setActiveModule('members')}
                  className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 hover:bg-amber-100/60 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      {expiredCount} Licences à valider
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    Certificats médicaux ou paiements manquants pour la saison en cours.
                  </p>
                </div>
              )}

              {/* Invoice overdue */}
              {invoices.filter(i => i.status === 'En retard').length > 0 && (
                <div
                  onClick={() => setActiveModule('invoices')}
                  className="p-3 rounded-xl bg-red-50/70 border border-red-200 hover:bg-red-100/60 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-red-900">
                    <span className="flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-red-600" />
                      1 Facture sponsor en retard
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    Relance automatique disponible pour CE Sanofi Lyon (1 500 €).
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Module Shortcuts Bento */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Raccourcis Directs</h2>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setActiveModule('trainings')}
                className="flex flex-col items-start p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Exercices & Schémas</span>
                <span className="text-[10px] text-slate-400">Bibliothèque tactique</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModule('vehicles')}
                className="flex flex-col items-start p-3 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Minibus & Trajets</span>
                <span className="text-[10px] text-slate-400">Planning déplacements</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModule('inventory')}
                className="flex flex-col items-start p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Boxes className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">Stocks Ballons</span>
                <span className="text-[10px] text-slate-400">Prêts et réassorts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveModule('documents')}
                className="flex flex-col items-start p-3 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 text-left transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Receipt className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-slate-800">GED & Statuts</span>
                <span className="text-[10px] text-slate-400">PV & conventions</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
