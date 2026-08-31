import React, { useState } from 'react';
import {
  TrendingUp,
  PieChart,
  Download,
  Shield,
  Users,
  Award,
  Wallet,
  Building,
  CheckCircle,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';

export const ExecutiveReportingView: React.FC = () => {
  const { members, teams, finances, showToast } = useClub();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Rapports Stratégiques & Audit Dirigeants</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Tableaux de bord pour le Président, le Trésorier et les partenaires institutionnels (Mairie, Métropole, FFVB, ANS)
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast('Bilan d\'activité 2024-2025 officiel généré en PDF (32 pages) !')}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
        >
          <Download className="w-4 h-4" />
          Exporter Rapport d'Activité Annuel PDF
        </button>
      </div>

      {/* Strategic Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Member Growth */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Croissance des Licenciés</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 font-display">+{members.length}</span>
            <span className="text-xs font-bold text-emerald-600">+18% vs Saison N-1</span>
          </div>
          <p className="text-xs text-slate-500">Forte hausse sur les catégories Jeunes U15 & École de Volley</p>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Metric 2: Treasury Health Ratio */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Autonomie Financière</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-600 font-display">68%</span>
            <span className="text-xs font-bold text-slate-400">Fonds propres</span>
          </div>
          <p className="text-xs text-slate-500">Ratio Sponsoring / Cotisations / Subventions publiques équilibré</p>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }}></div>
          </div>
        </div>

        {/* Metric 3: Sporting Win Rate */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Performance Globale Club</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-600 font-display">74%</span>
            <span className="text-xs font-bold text-indigo-600">Victoires</span>
          </div>
          <p className="text-xs text-slate-500">2 équipes sur 4 en position de montée en division supérieure</p>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full" style={{ width: '74%' }}></div>
          </div>
        </div>
      </div>

      {/* Subsidies & Grants Tracking (Dossiers ANS / Mairie) */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
          <Building className="w-5 h-5 text-blue-600" />
          Suivi des Subventions & Aides Publiques (ANS, Métropole, Région)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Mairie de Lyon (Fonctionnement)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Versée</span>
            </div>
            <p className="text-xl font-bold text-slate-900">18 500 €</p>
            <p className="text-[11px] text-slate-500">Convention pluriannuelle d'objectifs 2024-2027</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Agence Nationale du Sport (ANS)</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Versée</span>
            </div>
            <p className="text-xl font-bold text-slate-900">7 200 €</p>
            <p className="text-[11px] text-slate-500">Projet sportif fédéral & emploi éducateur</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Région Auvergne-Rhône-Alpes</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Instruction</span>
            </div>
            <p className="text-xl font-bold text-slate-900">5 000 €</p>
            <p className="text-[11px] text-slate-500">Dossier équipement Minibus et matériel numérique</p>
          </div>
        </div>
      </div>
    </div>
  );
};
