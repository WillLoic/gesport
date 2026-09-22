import React, { useState, useEffect } from 'react';
import { X, LogIn, LogOut, KeyRound, ShieldCheck, UserCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { authService, UserBackendProfile } from '../../services/authService';
import { getAccessToken, clearTokens } from '../../services/apiClient';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: UserBackendProfile) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('willloic36@gmail.com');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserBackendProfile | null>(null);

  // Vérifier si un token existe au chargement
  useEffect(() => {
    if (isOpen && getAccessToken()) {
      fetchCurrentUser();
    }
  }, [isOpen]);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const user = await authService.getMe();
      setCurrentUser(user);
    } catch (err: any) {
      clearTokens();
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.login(email, password, totpCode);

      if (res.requires_2fa) {
        setRequires2FA(true);
        setError('Code 2FA requis.');
        setLoading(false);
        return;
      }

      if (res.user) {
        setCurrentUser(res.user);
        if (onLoginSuccess) onLoginSuccess(res.user);
      } else {
        await fetchCurrentUser();
      }
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects ou serveur inaccessible.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setRequires2FA(false);
    setPassword('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-lg shadow-lg">
              🔑
            </div>
            <div>
              <h3 className="text-base font-bold">Connexion Backend (Auth IAM)</h3>
              <p className="text-xs text-slate-400">Microservice #01 — Authentification JWT</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentUser ? (
            /* Connected User Profile Box */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950">Session Active (JWT Validé)</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Connecté en tant que <span className="font-bold">{currentUser.email}</span>
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Nom complet :</span>
                  <span className="font-bold text-slate-800">
                    {currentUser.first_name} {currentUser.last_name || '(Superuser)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500 font-medium">Statut Superadmin :</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full ${currentUser.is_superuser ? 'bg-purple-100 text-purple-700' : 'bg-slate-200 text-slate-700'}`}>
                    {currentUser.is_superuser ? 'Oui (Superuser)' : 'Non'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">2FA Activé :</span>
                  <span className="font-bold text-slate-800">
                    {currentUser.is_2fa_enabled ? 'Oui' : 'Non'}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-red-200 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se Déconnecter</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center justify-center cursor-pointer transition-colors"
                >
                  Continuer vers l'App
                </button>
              </div>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adresse Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="willloic36@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mot de Passe</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {requires2FA && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Code Authentificateur 2FA</label>
                  <input
                    type="text"
                    required
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono tracking-widest text-center"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Connexion au Backend...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Se Connecter au Backend</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
