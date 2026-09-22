import React, { useState } from 'react';
import { LogIn, Mail, Lock, ShieldCheck, AlertCircle, RefreshCw, Trophy, ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { authService, UserBackendProfile } from '../../services/authService';

interface LoginPageProps {
  onLoginSuccess: (user: UserBackendProfile) => void;
  onNavigateToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authService.login(email, password, totpCode);

      if (res.requires_2fa) {
        setRequires2FA(true);
        setError('Double authentification activée : veuillez renseigner votre code 2FA.');
        setLoading(false);
        return;
      }

      if (res.user) {
        onLoginSuccess(res.user);
      } else {
        const user = await authService.getMe();
        onLoginSuccess(user);
      }
    } catch (err: any) {
      if (err.details && typeof err.details === 'object') {
        const firstErrKey = Object.keys(err.details)[0];
        const firstErrMsg = err.details[firstErrKey];
        setError(Array.isArray(firstErrMsg) ? firstErrMsg[0] : firstErrMsg || 'Identifiants invalides.');
      } else {
        setError(err.message || 'Adresse email ou mot de passe incorrect.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col lg:flex-row font-sans text-slate-100 overflow-x-hidden">
      {/* Visual Left Hero Banner (Desktop ONLY for optimal UX on Mobile/Tablet) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-8 lg:p-16 flex-col justify-between overflow-hidden border-r border-slate-800">
        {/* Glow decoration */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">GeSport Pro</h1>
            <p className="text-xs text-blue-400 font-medium">Plateforme Omnisports Haute Performance</p>
          </div>
        </div>

        {/* Hero Features List */}
        <div className="relative z-10 my-12 space-y-8">
          <div>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider">
              Espace Sécurisé IAM
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-white mt-4 leading-tight">
              Pilotez l'ensemble de votre club sportif en toute sérénité.
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Authentification sécurisée avec rôles granulaires (RBAC), multi-tenancy et accès instantané à la gestion des équipes, membres et finances.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
              <CheckCircle2 className="w-5 h-5 text-blue-400 mb-2" />
              <h3 className="text-xs font-bold text-white">Multi-Tenancy & Saisons</h3>
              <p className="text-[11px] text-slate-400 mt-1">Gestion simultanée de plusieurs sections et catégories.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
              <h3 className="text-xs font-bold text-white">Sécurité & 2FA JWT</h3>
              <p className="text-[11px] text-slate-400 mt-1">Chiffrement de bout en bout et double authentification.</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-6">
          <span>© 2026 GeSport Technologies</span>
          <span className="font-mono text-[11px] text-slate-400">v3.4.2-IAM</span>
        </div>
      </div>

      {/* Right Login Form Container (Directly visible at the top on Mobile/Tablet) */}
      <div className="w-full lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-slate-950 min-h-screen">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Header Logo (Shown ONLY on mobile/tablet to avoid scrolling) */}
          <div className="flex lg:hidden items-center gap-3 pb-2 border-b border-slate-900">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-white">GeSport Pro</h1>
              <p className="text-[11px] text-blue-400">Espace Connexion</p>
            </div>
          </div>

          {/* Header text */}
          <div>
            <h2 className="text-2xl font-black text-white">Connexion à votre espace</h2>
            <p className="text-xs text-slate-400 mt-1">
              Entrez vos identifiants pour vous connecter à GeSport.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-2xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs font-medium flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Erreur d'authentification</span>
                  <p className="text-red-300 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Adresse Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@club-sport.fr"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-slate-300">Mot de Passe</label>
                <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] font-semibold text-blue-400 hover:underline">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {requires2FA && (
              <div className="animate-in fade-in duration-200">
                <label className="block text-xs font-bold text-amber-400 mb-1.5">Code de vérification 2FA (TOTP)</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-amber-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-amber-500/50 rounded-xl text-sm text-white font-mono tracking-widest text-center focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-500"
                />
                <span>Se souvenir de moi</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Se Connecter</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register link */}
          <div className="text-center text-xs text-slate-400 border-t border-slate-900 pt-6">
            <span>Vous n'avez pas encore de compte ? </span>
            <button
              type="button"
              onClick={onNavigateToRegister}
              className="font-bold text-blue-400 hover:text-blue-300 transition-colors ml-1 cursor-pointer"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
