import React, { useState } from 'react';
import { X, User, Mail, Phone, ShieldCheck, QrCode, KeyRound, CheckCircle2, Lock, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/authApi';

export const UserProfileModal: React.FC = () => {
  const {
    currentUser,
    isProfileModalOpen,
    closeProfileModal,
    updateUser,
    enable2FA,
    disable2FA,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security_2fa'>('profile');

  // Formulaire profil
  const [firstName, setFirstName] = useState(currentUser?.first_name || '');
  const [lastName, setLastName] = useState(currentUser?.last_name || '');
  const [phone, setPhone] = useState(currentUser?.phone_number || '');
  const [bio, setBio] = useState(currentUser?.profile?.bio || '');
  const [emergencyName, setEmergencyName] = useState(currentUser?.profile?.emergency_contact_name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser?.profile?.emergency_contact_phone || '');
  const [profileSuccess, setProfileSuccess] = useState('');

  // 2FA Setup & Verification
  const [qrCodeUri, setQrCodeUri] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpInput, setTotpInput] = useState('');
  const [disablePasswordInput, setDisablePasswordInput] = useState('');
  const [totpError, setTotpError] = useState('');
  const [totpSuccess, setTotpSuccess] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);

  if (!isProfileModalOpen || !currentUser) return null;

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      phone_number: phone,
      profile: {
        ...currentUser.profile,
        bio,
        emergency_contact_name: emergencyName,
        emergency_contact_phone: emergencyPhone,
      }
    });
    setProfileSuccess('Profil mis à jour avec succès !');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handleStart2FASetup = async () => {
    setTotpError('');
    setIsSettingUp(true);
    try {
      const res = await authApi.setup2FA();
      setQrCodeUri(res.qr_code_uri);
      setTotpSecret(res.totp_secret);
    } catch (err: any) {
      setTotpError('Impossible de générer le QR code 2FA.');
    } finally {
      setIsSettingUp(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpError('');
    try {
      await enable2FA(totpInput);
      setTotpSuccess('La double authentification (2FA) est désormais activée ! 🛡️');
      setQrCodeUri(null);
      setTotpSecret(null);
      setTotpInput('');
    } catch (err: any) {
      setTotpError(err.message || 'Code 2FA invalide.');
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpError('');
    try {
      await disable2FA(disablePasswordInput);
      setTotpSuccess('La 2FA a été désactivée.');
      setDisablePasswordInput('');
    } catch (err: any) {
      setTotpError(err.message || 'Mot de passe incorrect.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
              {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">{currentUser.full_name}</h3>
              <p className="text-xs text-slate-400">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={closeProfileModal}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Onglets navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/20">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            Mon Profil
          </button>

          <button
            onClick={() => setActiveTab('security_2fa')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'security_2fa'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Sécurité & 2FA TOTP
            {currentUser.is_2fa_enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSave} className="space-y-4">
              {profileSuccess && (
                <div className="p-3 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {profileSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Prénom</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nom</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Téléphone mobile</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Contact d'urgence</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Nom du contact</label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={e => setEmergencyName(e.target.value)}
                      placeholder="Ex: Sophie Lefebvre"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Téléphone d'urgence</label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={e => setEmergencyPhone(e.target.value)}
                      placeholder="0698765432"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Biographie / Remarques</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Présentation au sein du club..."
                  className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20"
              >
                Enregistrer les modifications
              </button>
            </form>
          ) : (
            /* ONGLET 2FA TOTP */
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${currentUser.is_2fa_enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Statut Double Authentification</h4>
                    <p className="text-xs text-slate-400">
                      {currentUser.is_2fa_enabled ? 'Activable — Votre compte est hautement sécurisé' : 'Non activée — Recommandé pour les comptes staff et présidents'}
                    </p>
                  </div>
                </div>

                <span className={`px-3 py-1 text-xs font-bold rounded-full ${currentUser.is_2fa_enabled ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                  {currentUser.is_2fa_enabled ? 'ACTIVÉE 🛡️' : 'DÉSACTIVÉE'}
                </span>
              </div>

              {totpError && (
                <div className="p-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-xl">
                  {totpError}
                </div>
              )}

              {totpSuccess && (
                <div className="p-3 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  {totpSuccess}
                </div>
              )}

              {!currentUser.is_2fa_enabled ? (
                <div>
                  {!qrCodeUri ? (
                    <button
                      onClick={handleStart2FASetup}
                      disabled={isSettingUp}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
                    >
                      <QrCode className="w-4 h-4" />
                      {isSettingUp ? 'Génération du QR Code...' : 'Configurer la 2FA (TOTP)'}
                    </button>
                  ) : (
                    <form onSubmit={handleVerify2FA} className="p-4 bg-blue-950/20 border border-blue-800/40 rounded-xl space-y-4 text-center">
                      <h4 className="text-sm font-bold text-white">Scannez ce QR Code avec votre application TOTP</h4>
                      <p className="text-xs text-slate-400">Google Authenticator, Authy ou 1Password</p>

                      <div className="flex justify-center my-2">
                        <div className="p-3 bg-white rounded-xl shadow-lg border border-slate-200">
                          <img src={qrCodeUri} alt="QR Code 2FA TOTP" className="w-40 h-40 object-contain" />
                        </div>
                      </div>

                      {totpSecret && (
                        <p className="text-xs text-slate-400 font-mono">
                          Clé manuelle : <span className="text-blue-300 select-all font-bold">{totpSecret}</span>
                        </p>
                      )}

                      <div className="max-w-xs mx-auto text-left">
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Code à 6 chiffres</label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={totpInput}
                          onChange={e => setTotpInput(e.target.value)}
                          placeholder="123456"
                          className="w-full px-3 py-2 bg-slate-950 border border-blue-500/50 rounded-xl text-center text-lg font-mono text-white tracking-widest focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-500/20 transition-all"
                      >
                        Valider et Activer la 2FA
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <form onSubmit={handleDisable2FA} className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-300">Désactiver la Double Authentification</h4>
                  <p className="text-xs text-slate-400">Entrez votre mot de passe pour confirmer la désactivation.</p>

                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={disablePasswordInput}
                      onChange={e => setDisablePasswordInput(e.target.value)}
                      placeholder="Votre mot de passe"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-rose-600/80 hover:bg-rose-600 text-white font-semibold rounded-xl text-xs transition-all"
                  >
                    Désactiver la 2FA
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
