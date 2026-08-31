import React, { useState } from 'react';
import { X, ShieldCheck, UserPlus, Trash2, Award } from 'lucide-react';
import { useAuth, RoleCode } from '../../context/AuthContext';
import { authApi } from '../../services/authApi';

const ROLE_LABELS: Record<RoleCode, { name: string; desc: string; badge: string }> = {
  SUPER_ADMIN: {
    name: 'Président / Super Admin',
    desc: 'Accès total en lecture et écriture à tous les modules',
    badge: 'bg-amber-950/60 text-amber-300 border-amber-800/60',
  },
  CLUB_ADMIN: {
    name: 'Administrateur Club',
    desc: 'Gestion déléguée du club et des membres',
    badge: 'bg-purple-950/60 text-purple-300 border-purple-800/60',
  },
  TREASURER: {
    name: 'Trésorier / Comptable',
    desc: 'Grand Livre, facturation, devis et reçus Cerfa',
    badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60',
  },
  COACH: {
    name: 'Entraîneur / Coach',
    desc: 'Convocations, matchs, entraînements et tactiques',
    badge: 'bg-blue-950/60 text-blue-300 border-blue-800/60',
  },
  MEDICAL_STAFF: {
    name: 'Médecin / Kiné',
    desc: 'Registre des blessures et autorisations de reprise',
    badge: 'bg-rose-950/60 text-rose-300 border-rose-800/60',
  },
  LOGISTICS: {
    name: 'Responsable Logistique',
    desc: 'Stocks matériel, minibus et bons de commande',
    badge: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/60',
  },
  MEMBER: {
    name: 'Joueur / Adhérent',
    desc: 'Accès aux convocations et boutique',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
  },
};

export const RoleManagementModal: React.FC = () => {
  const {
    isRoleModalOpen,
    closeRoleModal,
    activeClub,
  } = useAuth();

  const [memberEmail, setMemberEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleCode>('COACH');
  const [message, setMessage] = useState('');

  // Simulation des rôles attribués au sein du club
  const [roleAssignments, setRoleAssignments] = useState([
    { id: 1, email: 'president@gesport.fr', name: 'Alexandre Lefebvre', role: 'SUPER_ADMIN' as RoleCode },
    { id: 2, email: 'coach.foot@gesport.fr', name: 'Marc Benichou', role: 'COACH' as RoleCode },
    { id: 3, email: 'tresorier@gesport.fr', name: 'Valérie Moreau', role: 'TREASURER' as RoleCode },
  ]);

  if (!isRoleModalOpen) return null;

  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    try {
      if (activeClub) {
        await authApi.assignRole(memberEmail, activeClub.id, selectedRole);
      }
      setRoleAssignments(prev => [
        ...prev,
        {
          id: Date.now(),
          email: memberEmail,
          name: memberEmail.split('@')[0],
          role: selectedRole,
        }
      ]);
      setMessage(`Rôle '${ROLE_LABELS[selectedRole].name}' attribué à ${memberEmail} !`);
      setMemberEmail('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setMessage(err.message || 'Erreur lors de l\'attribution.');
    }
  };

  const handleRemoveRole = (id: number) => {
    setRoleAssignments(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5 text-white font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            Gestion des Rôles & Permissions (RBAC) — {activeClub?.name}
          </div>
          <button
            onClick={closeRoleModal}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {message && (
            <div className="p-3 text-xs text-purple-300 bg-purple-950/40 border border-purple-800/50 rounded-xl">
              {message}
            </div>
          )}

          {/* FORMULAIRE ATTRIBUTION */}
          <form onSubmit={handleAssignRole} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-400" />
              Attribuer un rôle à un membre
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Email du membre</label>
                <input
                  type="email"
                  required
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  placeholder="coach@gesport.fr"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Rôle à attribuer</label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value as RoleCode)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  {(Object.keys(ROLE_LABELS) as RoleCode[]).map(code => (
                    <option key={code} value={code}>
                      {ROLE_LABELS[code].name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-purple-500/20 transition-all"
            >
              Confirmer l'attribution
            </button>
          </form>

          {/* LISTE DES ATTRIBUTIONS EXISTANTES */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Attributions actuelles dans {activeClub?.name}
            </h4>

            <div className="space-y-2">
              {roleAssignments.map(item => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-white text-xs">{item.name}</div>
                    <div className="text-[11px] text-slate-400">{item.email}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border ${ROLE_LABELS[item.role].badge}`}>
                      {ROLE_LABELS[item.role].name}
                    </span>

                    {item.role !== 'SUPER_ADMIN' && (
                      <button
                        onClick={() => handleRemoveRole(item.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                        title="Révoquer ce rôle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
