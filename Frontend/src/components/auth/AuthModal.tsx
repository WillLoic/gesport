import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    login,
    register,
    authModalInitialTab,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalInitialTab);

  // État de connexion
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // État d'inscription Étape par Étape (Wizard 3 étapes)
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const res = await login(loginEmail, loginPassword, totpCode);
      if (res.requires_2fa && !totpCode) {
        setRequires2FA(true);
        setIsLoggingIn(false);
        return;
      }
      closeAuthModal();
    } catch (err: any) {
      setLoginError(err.message || 'Erreur lors de la connexion.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Validation étape 1
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setRegError('Veuillez renseigner votre prénom et votre nom.');
      return;
    }
    setRegError('');
    setRegStep(2);
  };

  // Validation étape 2
  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail.trim()) {
      setRegError('Veuillez renseigner une adresse email valide.');
      return;
    }
    setRegError('');
    setRegStep(3);
  };

  // Validation étape 3 (Soumission finale)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (password.length < 8) {
      setRegError('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }

    if (password !== passwordConfirm) {
      setRegError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsRegistering(true);
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email: regEmail,
        phone_number: phone,
        password,
        password_confirm: passwordConfirm,
      });
      closeAuthModal();
    } catch (err: any) {
      setRegError(err.message || 'Erreur lors de l\'inscription.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header avec onglets */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-800">
          <div className="flex gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <button
              onClick={() => { setActiveTab('login'); setRegError(''); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => { setActiveTab('register'); setRegError(''); setRegStep(1); }}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Inscription
            </button>
          </div>

          <button
            onClick={closeAuthModal}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenu Formulaire */}
        <div className="p-6">
          {activeTab === 'login' ? (
            /* ──────────── FORMULAIRE DE CONNEXION ──────────── */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Bienvenue sur GESPORT 🏟️</h3>
                <p className="text-xs text-slate-400">Connectez-vous pour accéder à votre espace club</p>
              </div>

              {loginError && (
                <div className="p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-xl">
                  {loginError}
                </div>
              )}

              {!requires2FA ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={e => setLoginEmail(e.target.value)}
                        placeholder="coach@gesport.fr"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* ÉTAPE CODE 2FA TOTP SI REQUIS */
                <div className="p-4 bg-blue-950/30 border border-blue-800/50 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    Double Authentification (2FA) requise
                  </div>
                  <p className="text-xs text-slate-400">
                    Saisissez le code à 6 chiffres affiché sur votre application Google Authenticator ou Authy.
                  </p>
                  <div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={totpCode}
                        onChange={e => setTotpCode(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-blue-500/50 rounded-xl text-lg tracking-widest text-center text-white font-mono focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoggingIn ? 'Connexion...' : requires2FA ? 'Valider le code 2FA' : 'Se connecter'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* ──────────── FORMULAIRE D'INSCRIPTION EN 3 ÉTAPES (WIZARD) ──────────── */
            <div>
              {/* Indicateur visuel d'étapes */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-blue-400">Étape {regStep} sur 3</span>
                  <span className="text-xs text-slate-400">
                    {regStep === 1 && 'Identité'}
                    {regStep === 2 && 'Contact'}
                    {regStep === 3 && 'Sécurité'}
                  </span>
                </div>
                {/* Barre de progression */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                    style={{ width: `${(regStep / 3) * 100}%` }}
                  />
                </div>
              </div>

              {regError && (
                <div className="mb-4 p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-xl">
                  {regError}
                </div>
              )}

              {/* ÉTAPE 1 : NOM & PRÉNOM */}
              {regStep === 1 && (
                <form onSubmit={handleStep1Next} className="space-y-4 animate-fadeIn">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-white">Comment vous appelez-vous ? 👋</h4>
                    <p className="text-xs text-slate-400">Renseignez votre nom officiel pour votre licence</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Prénom</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        placeholder="Jean"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Nom de famille</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="Dupont"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* ÉTAPE 2 : EMAIL & TÉLÉPHONE */}
              {regStep === 2 && (
                <form onSubmit={handleStep2Next} className="space-y-4 animate-fadeIn">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-white">Vos coordonnées 📧</h4>
                    <p className="text-xs text-slate-400">Pour recevoir vos convocations et informations du club</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Adresse email</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="jean.dupont@gesport.fr"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone mobile (optionnel)</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="06 12 34 56 78"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm flex items-center justify-center gap-1 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                    >
                      Suivant
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* ÉTAPE 3 : MOT DE PASSE & CONFIRMATION */}
              {regStep === 3 && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fadeIn">
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-bold text-white">Sécurisez votre compte 🔒</h4>
                    <p className="text-xs text-slate-400">Choisissez un mot de passe robuste d'au moins 8 caractères</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Confirmez le mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        required
                        minLength={8}
                        value={passwordConfirm}
                        onChange={e => setPasswordConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="w-1/3 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm flex items-center justify-center gap-1 transition-all"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Retour
                    </button>
                    <button
                      type="submit"
                      disabled={isRegistering}
                      className="w-2/3 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isRegistering ? 'Création...' : 'Créer mon compte'}
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
