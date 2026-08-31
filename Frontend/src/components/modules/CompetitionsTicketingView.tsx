import React, { useState } from 'react';
import {
  Ticket,
  Trophy,
  Plus,
  QrCode,
  CheckCircle,
  Clock,
  Scan,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { TournamentMatch, TicketPass } from '../../types';

export const CompetitionsTicketingView: React.FC = () => {
  const { tournaments, setTournaments, tickets, setTickets, showToast } = useClub();
  const [activeTab, setActiveTab] = useState<'tournaments' | 'ticketing'>('tournaments');

  const handleScanTicket = (ticketId: string) => {
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              scanned: true,
              scannedAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            }
          : t
      )
    );
    showToast('Billet validé à l\'entrée avec succès ! QR Code vérifié.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Tournois & Billetterie Matchs</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Organisation des tournois officiels, grilles des poules, billetterie électronique et scan QR aux entrées
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('tournaments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'tournaments'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tableau du Tournoi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ticketing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ticketing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Guichet & Billets ({tickets.length})
          </button>
        </div>
      </div>

      {activeTab === 'tournaments' ? (
        /* Tournament Bracket Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Rencontres du Tournoi National de Printemps
            </h3>
            <button
              type="button"
              onClick={() => showToast('Assistant d\'ajout de match au tournoi.')}
              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter un match
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Terrain</th>
                  <th className="py-3 px-4">Horaire</th>
                  <th className="py-3 px-4">Étape</th>
                  <th className="py-3 px-4">Équipe A</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4">Équipe B</th>
                  <th className="py-3 px-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {tournaments.map(match => (
                  <tr key={match.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-700">{match.court}</td>
                    <td className="py-3 px-4 text-slate-600">{match.time}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold text-xs">
                        {match.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{match.teamA}</td>
                    <td className="py-3 px-4 text-center font-black text-slate-900 text-base">
                      {match.scoreA} - {match.scoreB}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{match.teamB}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          match.status === 'Terminé'
                            ? 'bg-emerald-100 text-emerald-800'
                            : match.status === 'En cours'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {match.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Ticketing Passes Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">{ticket.qrCodeString}</span>
                    <h3 className="font-bold text-base text-slate-900 mt-1">{ticket.matchTitle}</h3>
                    <p className="text-xs text-slate-500">{ticket.hall} • {ticket.date} à {ticket.time}</p>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      ticket.scanned ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {ticket.scanned ? 'Composté' : 'Valide'}
                  </span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-3 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 font-semibold block">Détenteur :</span>
                    <span className="font-bold text-slate-800">{ticket.holderName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-semibold block">Tarif :</span>
                    <span className="font-bold text-blue-700">{ticket.price} €</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {ticket.scanned ? (
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Scanné à {ticket.scannedAt}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleScanTicket(ticket.id)}
                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Scan className="w-4 h-4" />
                    Composter l'Entrée (Scan QR)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
