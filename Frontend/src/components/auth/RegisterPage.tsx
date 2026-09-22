import React, { useState } from 'react';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  RefreshCw,
  Trophy,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { authService } from '../../services/authService';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin, onRegisterSuccess }) => {
  // Step State (1: Identity, 2: Contact, 3: Security)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Password Visibility Toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Async & Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password Strength Calculations
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isConfirmTyped = confirmPassword.length > 0;

  // Step Navigations & Validations
  const handleNextFromStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setError('Veuillez renseigner votre prénom et votre nom.');
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Veuillez renseigner une adresse email valide.');
      return;
    }
    setError(null);
    setCurrentStep(3);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isPasswordValid) {
      setError('Votre mot de passe doit respecter les critères de sécurité.');
      return;
    }

    if (!passwordsMatch) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (!agreeTerms) {
      setError('Vous devez accepter les conditions d\'utilisation.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.register({
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        password,
      });

      setSuccessMessage(res.detail || 'Inscription réussie ! Votre compte a été créé avec succès.');
      if (onRegisterSuccess) onRegisterSuccess();
    } catch (err: any) {
      if (err.details && typeof err.details === 'object') {
        const firstErrKey = Object.keys(err.details)[0];
        const firstErrMsg = err.details[firstErrKey];
        setError(`${firstErrKey.toUpperCase()}: ${Array.isArray(firstErrMsg) ? firstErrMsg[0] : firstErrMsg}`);
      } else {
        setError(err.message || 'Erreur lors de la création du compte.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col lg:flex-row font-sans text-slate-100 overflow-x-hidden">
      {/* Visual Left Hero Banner (Desktop ONLY for optimal UX on Mobile/Tablet) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 lg:p-16 flex-col justify-between overflow-hidden border-r border-slate-800">
        {/* Glow decoration */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Top Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">GeSport Pro</h1>
            <p className="text-xs text-indigo-400 font-medium">Création de Compte IAM</p>
          </div>
        </div>

        {/* Hero Features List */}
        <div className="relative z-10 my-12 space-y-8">
          <div>
            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider">
              Étape {currentStep} sur 3
            </span>
            <h2 className="text-3xl lg:text-4xl font-black text-white mt-4 leading-tight">
              Rejoignez l'écosystème omnisports de nouvelle génération.
            </h2>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              Créez votre profil en 3 étapes simples pour accéder à vos espaces de gestion sportive, financière et administrative.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <span className="text-xs font-medium text-slate-300">Accès multi-tenancy sécurisé & contrôlé</span>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
              <span className="text-xs font-medium text-slate-300">Chiffrement de bout en bout et double authentification</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-6">
          <span>© 2026 GeSport Technologies</span>
          <span className="font-mono text-[11px] text-slate-400">v3.4.2-IAM</span>
        </div>
      </div>

      {/* Right Register Form Panel (Directly visible at top on Mobile/Tablet without scrolling) */}
      <div className="w-full lg:w-1/2 p-6 sm:p-12 lg:p-16 flex items-center justify-center bg-slate-950 min-h-screen">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Header Logo (Shown ONLY on mobile/tablet to avoid scrolling) */}
          <div className="flex lg:hidden items-center gap-3 pb-2 border-b border-slate-900">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-white">GeSport Pro</h1>
              <p className="text-[11px] text-indigo-400">Inscription — Étape {currentStep}/3</p>
            </div>
          </div>

          {/* 3-Step Wizard Progress Bar */}
          {!successMessage && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className={currentStep >= 1 ? 'text-indigo-400 font-black' : ''}>1. Identité</span>
                <span className={currentStep >= 2 ? 'text-indigo-400 font-black' : ''}>2. Contact</span>
                <span className={currentStep >= 3 ? 'text-indigo-400 font-black' : ''}>3. Sécurité</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-indigo-600 to-blue-500 h-full transition-all duration-300 ease-out"
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {successMessage ? (
            /* Success View */
            <div className="space-y-6 p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 animate-in fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-white">Inscription Réussie !</h3>
                  <p className="text-xs text-emerald-300 mt-1">{successMessage}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onNavigateToLogin}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Se connecter maintenant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              {error && (
                <div className="mb-4 p-4 rounded-2xl bg-red-950/50 border border-red-800/60 text-red-200 text-xs font-medium flex items-start gap-3 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Information requise</span>
                    <p className="text-red-300 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* ── STEP 1: QUI ÊTES-VOUS ? ────────────────────────────────────────── */}
              {currentStep === 1 && (
                <form onSubmit={handleNextFromStep1} className="space-y-5 animate-in fade-in">
                  <div>
                    <h2 className="text-2xl font-black text-white">Qui êtes-vous ?</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Étape 1/3 — Renseignez votre prénom et votre nom officiels.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Prénom *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        autoFocus
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ex: Thomas"
                        className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Nom *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Ex: Dupont"
                        className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Continuer vers l'étape 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* ── STEP 2: TES IDENTIFIANTS & CONTACT ───────────────────────────── */}
              {currentStep === 2 && (
                <form onSubmit={handleNextFromStep2} className="space-y-5 animate-in fade-in">
                  <div>
                    <h2 className="text-2xl font-black text-white">Vos coordonnées</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Étape 2/3 — Indiquez l'email qui vous servira d'identifiant de connexion.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Adresse Email *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="thomas.dupont@club.fr"
                        className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Numéro de Téléphone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+33 6 12 34 56 78"
                        className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setCurrentStep(1);
                      }}
                      className="w-1/3 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Précédent</span>
                    </button>

                    <button
                      type="submit"
                      className="w-2/3 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <span>Continuer vers l'étape 3</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* ── STEP 3: MOT DE PASSE & VALIDATION CGU ────────────────────────── */}
              {currentStep === 3 && (
                <form onSubmit={handleFinalSubmit} className="space-y-5 animate-in fade-in">
                  <div>
                    <h2 className="text-2xl font-black text-white">Sécurité de votre compte</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Étape 3/3 — Choisissez un mot de passe fort pour protéger votre accès.
                    </p>
                  </div>

                  {/* Field 1: Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Mot de Passe *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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

                    {/* Live Password Strength Requirements Checklist */}
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-[11px]">
                      <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-1">
                        Critères du mot de passe fort :
                      </div>
                      <div className={`flex items-center gap-2 font-medium ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 text-center">•</span>}
                        <span>Au moins 8 caractères</span>
                      </div>
                      <div className={`flex items-center gap-2 font-medium ${hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasUppercase ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 text-center">•</span>}
                        <span>Au moins une lettre majuscule (A-Z)</span>
                      </div>
                      <div className={`flex items-center gap-2 font-medium ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {hasNumber ? <Check className="w-3.5 h-3.5" /> : <span className="w-3.5 text-center">•</span>}
                        <span>Au moins un chiffre (0-9)</span>
                      </div>
                    </div>
                  </div>

                  {/* Field 2: Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">Confirmer le Mot de Passe *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full pl-10 pr-10 py-3 bg-slate-900 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                          isConfirmTyped
                            ? passwordsMatch
                              ? 'border-emerald-500/60 ring-1 ring-emerald-500/30'
                              : 'border-rose-500/60 ring-1 ring-rose-500/30'
                            : 'border-slate-800 focus:border-indigo-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Real-time Match Detection Status Badge */}
                    {isConfirmTyped && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold">
                        {passwordsMatch ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Les mots de passe correspondent parfaitement.
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1">
                            <X className="w-3.5 h-3.5 text-rose-400" />
                            Les mots de passe ne correspondent pas.
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Checkbox CGU */}
                  <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500 mt-0.5 shrink-0"
                      />
                      <span className="leading-snug">
                        J'accepte les <span className="text-indigo-400 underline font-semibold">conditions d'utilisation</span> et la <span className="text-indigo-400 underline font-semibold">politique de confidentialité</span>.
                      </span>
                    </label>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setCurrentStep(2);
                      }}
                      className="w-1/3 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-slate-800 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Précédent</span>
                    </button>

                    <button
                      type="submit"
                      disabled={!agreeTerms || !passwordsMatch || !isPasswordValid || loading}
                      className="w-2/3 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Création en cours...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Terminer l'inscription</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Switch to Login link */}
          <div className="text-center text-xs text-slate-400 border-t border-slate-900 pt-6">
            <span>Vous avez déjà un compte ? </span>
            <button
              type="button"
              onClick={onNavigateToLogin}
              className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors ml-1 cursor-pointer"
            >
              Se Connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
