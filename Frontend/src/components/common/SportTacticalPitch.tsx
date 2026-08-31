import React from 'react';
import { SportType, TacticalPosition } from '../../types';

interface SportTacticalPitchProps {
  sport: SportType;
  title?: string;
  subtitle?: string;
  positions?: TacticalPosition[];
  selectedPosition?: string | null;
  onSelectPosition?: (pos: TacticalPosition) => void;
  interactive?: boolean;
}

export const SportTacticalPitch: React.FC<SportTacticalPitchProps> = ({
  sport,
  title,
  subtitle,
  positions = [],
  selectedPosition,
  onSelectPosition,
  interactive = true,
}) => {
  const renderFieldBackground = () => {
    switch (sport) {
      case 'football':
        return (
          <div className="relative w-full aspect-16/10 bg-emerald-700 rounded-xl overflow-hidden border-2 border-emerald-400 shadow-inner flex flex-col justify-between p-3">
            {/* Field Stripes */}
            <div className="absolute inset-0 flex">
              <div className="w-1/6 h-full bg-emerald-600/30"></div>
              <div className="w-1/6 h-full bg-emerald-700/0"></div>
              <div className="w-1/6 h-full bg-emerald-600/30"></div>
              <div className="w-1/6 h-full bg-emerald-700/0"></div>
              <div className="w-1/6 h-full bg-emerald-600/30"></div>
              <div className="w-1/6 h-full bg-emerald-700/0"></div>
            </div>

            {/* Pitch Lines (SVG overlay) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/70" fill="none" strokeWidth="2">
              {/* Outer boundary */}
              <rect x="12" y="12" width="calc(100% - 24px)" height="calc(100% - 24px)" rx="2" />
              {/* Half-way line */}
              <line x1="12" y1="50%" x2="calc(100% - 12px)" y2="50%" />
              {/* Center circle */}
              <circle cx="50%" cy="50%" r="38" />
              <circle cx="50%" cy="50%" r="2" fill="white" />
              {/* Top Penalty Box (Opponent) */}
              <rect x="30%" y="12" width="40%" height="22%" />
              <rect x="38%" y="12" width="24%" height="9%" />
              <path d="M 44% 34% A 18 18 0 0 0 56% 34%" />
              {/* Bottom Penalty Box (Home) */}
              <rect x="30%" y="calc(78% - 12px)" width="40%" height="22%" />
              <rect x="38%" y="calc(91% - 12px)" width="24%" height="9%" />
              <path d="M 44% calc(78% - 12px) A 18 18 0 0 1 56% calc(78% - 12px)" />
            </svg>
          </div>
        );

      case 'basketball':
        return (
          <div className="relative w-full aspect-16/10 bg-amber-800 rounded-xl overflow-hidden border-2 border-amber-500 shadow-inner flex flex-col justify-between p-3">
            {/* Parquet wooden texture styling */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 opacity-90"></div>

            {/* Basketball Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/80" fill="none" strokeWidth="2">
              {/* Boundary */}
              <rect x="12" y="12" width="calc(100% - 24px)" height="calc(100% - 24px)" rx="2" />
              {/* Half court */}
              <line x1="12" y1="50%" x2="calc(100% - 12px)" y2="50%" />
              <circle cx="50%" cy="50%" r="32" />
              {/* Bottom Key (Home) */}
              <rect x="36%" y="calc(68% - 12px)" width="28%" height="32%" fill="rgba(249, 115, 22, 0.25)" />
              <circle cx="50%" cy="calc(68% - 12px)" r="24" />
              {/* 3-Point Line Bottom */}
              <path d="M 20% calc(100% - 12px) L 20% 75% Q 50% 38% 80% 75% L 80% calc(100% - 12px)" />
              {/* Basket Hoop */}
              <circle cx="50%" cy="calc(93% - 12px)" r="6" stroke="rgb(234, 88, 12)" strokeWidth="3" fill="rgba(255,255,255,0.2)" />
              <line x1="44%" y1="calc(96% - 12px)" x2="56%" y2="calc(96% - 12px)" strokeWidth="4" />
            </svg>
          </div>
        );

      case 'handball':
        return (
          <div className="relative w-full aspect-16/10 bg-indigo-900 rounded-xl overflow-hidden border-2 border-indigo-400 shadow-inner flex flex-col justify-between p-3">
            {/* Handball Court 6m D-Zone Area */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/80" fill="none" strokeWidth="2">
              <rect x="12" y="12" width="calc(100% - 24px)" height="calc(100% - 24px)" rx="2" />
              <line x1="12" y1="50%" x2="calc(100% - 12px)" y2="50%" />
              <circle cx="50%" cy="50%" r="30" />
              {/* 6m Goal Area (Filled) */}
              <path d="M 28% calc(100% - 12px) Q 50% 64% 72% calc(100% - 12px)" fill="rgba(244, 63, 94, 0.3)" stroke="rgba(255,255,255,0.9)" />
              {/* 9m Free Throw Dotted Line */}
              <path d="M 22% calc(100% - 12px) Q 50% 50% 78% calc(100% - 12px)" strokeDasharray="6 4" stroke="rgba(251, 191, 36, 0.9)" />
              {/* Goal */}
              <rect x="42%" y="calc(100% - 16px)" width="16%" height="5px" fill="white" />
            </svg>
          </div>
        );

      case 'rugby':
        return (
          <div className="relative w-full aspect-16/10 bg-emerald-800 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-inner flex flex-col justify-between p-3">
            {/* Rugby Pitch Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/70" fill="none" strokeWidth="2">
              <rect x="12" y="12" width="calc(100% - 24px)" height="calc(100% - 24px)" rx="2" />
              {/* Try lines (In-goal areas) */}
              <line x1="12" y1="20%" x2="calc(100% - 12px)" y2="20%" stroke="rgba(255,255,255,0.9)" />
              <line x1="12" y1="80%" x2="calc(100% - 12px)" y2="80%" stroke="rgba(255,255,255,0.9)" />
              {/* 22m lines */}
              <line x1="12" y1="35%" x2="calc(100% - 12px)" y2="35%" strokeDasharray="8 6" />
              <line x1="12" y1="65%" x2="calc(100% - 12px)" y2="65%" strokeDasharray="8 6" />
              {/* 50m center line */}
              <line x1="12" y1="50%" x2="calc(100% - 12px)" y2="50%" />
              {/* Rugby H Posts */}
              <line x1="45%" y1="80%" x2="55%" y2="80%" stroke="rgb(250, 204, 21)" strokeWidth="3" />
              <circle cx="45%" cy="80%" r="3" fill="yellow" />
              <circle cx="55%" cy="80%" r="3" fill="yellow" />
            </svg>
          </div>
        );

      case 'tennis':
        return (
          <div className="relative w-full aspect-16/10 bg-amber-700 rounded-xl overflow-hidden border-2 border-amber-300 shadow-inner flex flex-col justify-between p-3">
            {/* Clay / Terre battue court */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/90" fill="none" strokeWidth="2">
              {/* Doubles outer */}
              <rect x="16" y="16" width="calc(100% - 32px)" height="calc(100% - 32px)" />
              {/* Singles side lines */}
              <line x1="22%" y1="16" x2="22%" y2="calc(100% - 16px)" />
              <line x1="78%" y1="16" x2="78%" y2="calc(100% - 16px)" />
              {/* Net in center */}
              <line x1="12" y1="50%" x2="calc(100% - 12px)" y2="50%" stroke="rgb(254, 240, 138)" strokeWidth="4" />
              {/* Service boxes */}
              <line x1="22%" y1="32%" x2="78%" y2="32%" />
              <line x1="22%" y1="68%" x2="78%" y2="68%" />
              <line x1="50%" y1="32%" x2="50%" y2="68%" />
            </svg>
          </div>
        );

      default:
        // Volleyball
        return (
          <div className="relative w-full aspect-16/10 bg-blue-900 rounded-xl overflow-hidden border-2 border-blue-400 shadow-inner flex flex-col justify-between p-3">
            {/* Volleyball Court Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/80" fill="none" strokeWidth="2">
              <rect x="16" y="16" width="calc(100% - 32px)" height="calc(100% - 32px)" rx="2" />
              {/* Net */}
              <line x1="16" y1="20%" x2="calc(100% - 16px)" y2="20%" stroke="rgb(250, 204, 21)" strokeWidth="4" />
              {/* 3m Attack Line */}
              <line x1="16" y1="48%" x2="calc(100% - 16px)" y2="48%" strokeDasharray="6 4" />
            </svg>
          </div>
        );
    }
  };

  const getSportBannerLabel = () => {
    switch (sport) {
      case 'football':
        return 'Pelouse Officielle (Football 11 vs 11)';
      case 'basketball':
        return 'Parquet Arena (Basketball 5 vs 5)';
      case 'handball':
        return 'Court Intérieur (Handball 7 vs 7)';
      case 'rugby':
        return 'Terrain Honneur (Rugby à XV)';
      case 'tennis':
        return 'Court Central (Terre Battue / Simple & Double)';
      default:
        return 'Terrain de Volley (6 vs 6)';
    }
  };

  return (
    <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center w-full">
      <div className="flex items-center justify-between w-full mb-3 text-xs font-bold text-slate-300">
        <span className="uppercase tracking-wider text-blue-400 text-[11px]">
          {title || `Schéma Tactique (${getSportBannerLabel()})`}
        </span>
        {subtitle && (
          <span className="bg-slate-800 text-amber-400 px-2.5 py-0.5 rounded-full text-[10px] border border-slate-700">
            {subtitle}
          </span>
        )}
      </div>

      <div className="relative w-full max-w-xl">
        {renderFieldBackground()}

        {/* Position Markers */}
        {positions.map(pos => {
          const isSelected = selectedPosition === pos.positionNumber;
          return (
            <div
              key={pos.positionNumber}
              style={{ left: pos.x, top: pos.y }}
              onClick={() => interactive && onSelectPosition && onSelectPosition(pos)}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group ${
                interactive ? 'cursor-pointer' : 'pointer-events-none'
              }`}
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center shadow-lg transition-all duration-200 ${
                  isSelected
                    ? 'bg-yellow-400 text-slate-950 scale-125 ring-4 ring-yellow-300/80 ring-offset-2 ring-offset-slate-900'
                    : 'bg-white text-slate-900 group-hover:scale-110 group-hover:bg-blue-50 ring-2 ring-slate-900/60'
                }`}
              >
                #{pos.number}
              </div>
              <span className="text-[10px] font-bold text-white bg-slate-950/80 px-1.5 py-0.5 rounded mt-1 whitespace-nowrap shadow-xs">
                {pos.label || pos.positionNumber}
              </span>
              {pos.role && (
                <span className="text-[9px] text-slate-300 max-w-[90px] truncate text-center hidden sm:block">
                  {pos.role}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
