import React, { useState, useRef } from 'react';
import {
  FolderLock,
  Plus,
  Search,
  Download,
  FileText,
  Shield,
  X,
  UploadCloud,
  File,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Table,
  Eye,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  HardDrive,
  ExternalLink,
  Lock,
  Key,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { DocumentItem } from '../../types';
import { vaultService } from '../../services/documentsService';

export const DocumentManagementView: React.FC = () => {
  const { documents, setDocuments, staff, showToast } = useClub();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preview Modal
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  // Edit Modal
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editAccessRole, setEditAccessRole] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Delete Confirmation Modal
  const [deletingDoc, setDeletingDoc] = useState<DocumentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // New Doc Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Statuts & AG');
  const [newAuthor, setNewAuthor] = useState(staff[0]?.name || 'Secrétaire Général');
  const [newAccessRole, setNewAccessRole] = useState('Staff & Coachs');
  const [newDescription, setNewDescription] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'Statuts & AG',
    'Assurances & Sécurité',
    'Règlements & Chartes',
    'Conventions Mairie',
    'Formulaires Licences',
    'Comptabilité',
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      searchTerm === '' ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.sha256 && doc.sha256.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Gestion du choix de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!newTitle.trim()) {
        // Enlève l'extension du nom de fichier pour le titre suggéré
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setNewTitle(nameWithoutExt);
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!newTitle.trim()) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setNewTitle(nameWithoutExt);
      }
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Veuillez renseigner le titre du document.');
      return;
    }

    setIsSubmitting(true);

    // Mappage du niveau de confidentialité vers le backend Django
    let confidentiality_level: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' = 'CONFIDENTIAL';
    if (newAccessRole === 'Public (Tous les adhérents)') confidentiality_level = 'PUBLIC';
    else if (newAccessRole === 'Bureau & Direction uniquement') confidentiality_level = 'RESTRICTED';
    else if (newAccessRole === 'Staff & Entraîneurs') confidentiality_level = 'INTERNAL';

    try {
      let createdDoc: DocumentItem;

      if (selectedFile) {
        // Envoi Multipart réel avec le fichier physique vers le stockage local (ou S3)
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', newTitle.trim());
        formData.append('category', newCategory);
        formData.append('description', newDescription.trim() || `Catégorie: ${newCategory} | Rôle: ${newAccessRole}`);
        formData.append('confidentiality_level', confidentiality_level);
        formData.append('uploaded_by', newAuthor.trim());
        formData.append('is_encrypted', 'true');
        formData.append('encryption_algorithm', 'AES-256');

        createdDoc = await vaultService.uploadDocument(formData);
      } else {
        // Création sans fichier physique (métadonnées seules)
        createdDoc = await vaultService.createDocument({
          title: newTitle.trim(),
          file_path_or_s3_key: `vault_documents/${Date.now()}_${newTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
          description: newDescription.trim() || `Catégorie: ${newCategory} | Rôle: ${newAccessRole}`,
          file_size: 1450000,
          mime_type: 'application/pdf',
          confidentiality_level,
          uploaded_by: newAuthor.trim(),
          is_encrypted: true,
          encryption_algorithm: 'AES-256',
        });
      }

      setDocuments((prev) => [createdDoc, ...prev.filter((d) => d.id !== createdDoc.id)]);
      showToast(`Document "${createdDoc.title}" stocké et chiffré dans le coffre-fort numérique !`);

      // Reset
      setIsNewDocModalOpen(false);
      setNewTitle('');
      setSelectedFile(null);
      setNewDescription('');
    } catch (err: any) {
      console.error('Erreur lors du dépôt backend:', err);
      showToast(`Erreur lors du dépôt : ${err.message || 'Serveur indisponible'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = async (doc: DocumentItem) => {
    // Si une URL de téléchargement directe est disponible (locale Django media ou S3)
    if (doc.downloadUrl) {
      window.open(doc.downloadUrl, '_blank');
      showToast(`Téléchargement de "${doc.title}" lancé.`);
      return;
    }

    const numericId = parseInt(doc.id, 10);
    if (!isNaN(numericId)) {
      try {
        const { presigned_url } = await vaultService.getPresignedUrl(numericId);
        if (presigned_url) {
          window.open(presigned_url, '_blank');
          showToast(`Lien sécurisé généré : Téléchargement de "${doc.title}"`);
          return;
        }
      } catch (err) {
        console.warn('Impossible de générer presigned-url:', err);
      }
    }
    showToast(`Document "${doc.title}" introuvable ou non disponible.`);
  };

  const handleOpenEdit = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setEditTitle(doc.title);
    setEditCategory(doc.category || 'Statuts & AG');
    setEditAccessRole(doc.accessRole || 'Staff & Coachs');
    setEditDescription(doc.description || '');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    let confidentiality_level = 'CONFIDENTIAL';
    if (editAccessRole === 'Tous' || editAccessRole.includes('Public')) confidentiality_level = 'PUBLIC';
    else if (editAccessRole === 'Bureau Seul' || editAccessRole.includes('Bureau')) confidentiality_level = 'RESTRICTED';
    else if (editAccessRole.includes('Staff')) confidentiality_level = 'INTERNAL';

    try {
      const numericId = parseInt(editingDoc.id, 10);
      if (!isNaN(numericId)) {
        const updated = await vaultService.updateDocument(numericId, {
          title: editTitle.trim(),
          description: editDescription.trim(),
          confidentiality_level,
        });
        setDocuments((prev) => prev.map((d) => (d.id === editingDoc.id ? { ...d, ...updated } : d)));
      } else {
        setDocuments((prev) =>
          prev.map((d) =>
            d.id === editingDoc.id
              ? {
                  ...d,
                  title: editTitle.trim(),
                  category: editCategory as any,
                  accessRole: editAccessRole as any,
                  description: editDescription.trim(),
                }
              : d
          )
        );
      }
      showToast(`Document "${editTitle}" mis à jour avec succès.`);
      setEditingDoc(null);
    } catch (err: any) {
      showToast(`Erreur mise à jour: ${err.message || 'Serveur indisponible'}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingDoc) return;
    setIsDeleting(true);

    try {
      const numericId = parseInt(deletingDoc.id, 10);
      if (!isNaN(numericId)) {
        await vaultService.deleteDocument(numericId);
      }
      setDocuments((prev) => prev.filter((d) => d.id !== deletingDoc.id));
      showToast(`Document "${deletingDoc.title}" supprimé définitivement du coffre-fort et du stockage.`);
      setDeletingDoc(null);
    } catch (err: any) {
      showToast(`Erreur suppression: ${err.message || 'Serveur indisponible'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper pour l'icône de type de fichier
  const getFileIcon = (fileType: string) => {
    const t = (fileType || '').toUpperCase();
    if (t === 'PDF') return <FileText className="w-5 h-5 text-rose-600" />;
    if (t === 'IMAGE' || t === 'SCAN') return <ImageIcon className="w-5 h-5 text-emerald-600" />;
    if (t === 'VIDEO') return <Video className="w-5 h-5 text-violet-600" />;
    if (t === 'AUDIO') return <Music className="w-5 h-5 text-amber-600" />;
    if (t === 'XLSX') return <Table className="w-5 h-5 text-teal-600" />;
    if (t === 'ZIP') return <Archive className="w-5 h-5 text-indigo-600" />;
    return <File className="w-5 h-5 text-blue-600" />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">GED Documents Officiels</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <HardDrive className="w-3 h-3 text-emerald-600" />
              Stockage S3 Local Actif
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Coffre-fort numérique chiffré AES-256 (statuts, AG, contrats, attestations, photos, vidéos et audios)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewDocModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Déposer un Document
        </button>
      </div>

      {/* Bannière Info Architecture Stockage S3 / Local */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/80 via-slate-50 to-indigo-50/80 border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-700">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">Environnement de Stockage Hybride (Dev &bull; Prod)</span>
            <span className="text-slate-500">
              En local, les fichiers sont stockés dans <code className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-blue-700 font-mono text-[10px]">media/vault_documents/</code> et servis par Django. En production, le bucket AWS S3 prend le relais sans modifier le code.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 font-medium text-slate-600">
          <Key className="w-3.5 h-3.5 text-blue-600" />
          <span>Empreintes SHA-256 &bull; Chiffrement au repos</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par titre, déposant, mot-clé, hash SHA-256..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-hidden"
        >
          <option value="all">Toutes les catégories ({documents.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Empty State */}
      {filteredDocs.length === 0 && (
        <div className="p-12 text-center rounded-3xl bg-white border border-slate-200 shadow-xs">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <FolderLock className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-base text-slate-800">Aucun document dans le coffre-fort</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {searchTerm || selectedCategory !== 'all'
              ? 'Aucun document ne correspond à vos filtres de recherche.'
              : 'Déposez votre premier document officiel (PV, contrat, statuts, assurance, photo, audio ou vidéo) pour l’archiver de façon sécurisée.'}
          </p>
          <button
            type="button"
            onClick={() => setIsNewDocModalOpen(true)}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all"
          >
            Déposer un document
          </button>
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                    {getFileIcon(doc.fileType)}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {doc.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-0.5 line-clamp-1">{doc.title}</h3>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                  {doc.fileSize}
                </span>
              </div>

              {doc.description && (
                <p className="text-xs text-slate-500 mt-3 line-clamp-2 bg-slate-50/60 p-2 rounded-xl border border-slate-100/80">
                  {doc.description}
                </p>
              )}

              <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] flex items-center justify-between">
                <span className="text-slate-500 truncate max-w-[150px]">Par {doc.author}</span>
                <span className="font-semibold text-slate-700">{doc.uploadDate}</span>
              </div>

              {doc.sha256 && (
                <div className="mt-2 text-[10px] text-slate-400 font-mono truncate" title={`SHA-256: ${doc.sha256}`}>
                  Hash: {doc.sha256.substring(0, 16)}...
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-1 truncate max-w-[120px]">
                <Shield className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{doc.accessRole}</span>
              </span>

              <div className="flex items-center gap-2">
                {/* Aperçu pour images / vidéos / audios */}
                {['IMAGE', 'VIDEO', 'AUDIO'].includes(doc.fileType?.toUpperCase()) && doc.downloadUrl && (
                  <button
                    type="button"
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Aperçu du média"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleOpenEdit(doc)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="Modifier les métadonnées"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingDoc(doc)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Supprimer du coffre-fort"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(doc)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-2xs transition-colors"
                  title="Télécharger"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Ouvrir</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Document Upload Modal */}
      {isNewDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FolderLock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Déposer un Document Officiel</h3>
                  <p className="text-xs text-slate-500">Stockage sécurisé (Local S3 Simulation / AWS S3 ready)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewDocModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-4">
              {/* Dropzone pour vrai fichier */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Fichier à déposer (PDF, Photos, Vidéos, Audios, Office, Zip) *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.xlsx,.csv,.png,.jpg,.jpeg,.webp,.svg,.mp4,.mov,.avi,.mp3,.wav,.zip"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                    selectedFile
                      ? 'border-emerald-300 bg-emerald-50/40'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-400'
                  }`}
                >
                  {selectedFile ? (
                    <div className="space-y-1">
                      <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Prêt pour chiffrement AES-256
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-[11px] text-rose-600 underline font-semibold mt-1"
                      >
                        Changer de fichier
                      </button>
                    </div>
                  ) : (
                    <div>
                      <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-700">Cliquez ou glissez un fichier ici</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        PDF, Images (JPG, PNG), Vidéos (MP4), Audios (MP3), Word, Excel, Zip (max 100 MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Titre du Document *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Procès-Verbal AG Ordinaire 2025, Attestation MAIF..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Catégorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Niveau de Confidentialité
                  </label>
                  <select
                    value={newAccessRole}
                    onChange={(e) => setNewAccessRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Public Club">Public (Tous les adhérents)</option>
                    <option value="Staff & Coachs">Staff & Entraîneurs</option>
                    <option value="Bureau & Direction">Bureau & Direction uniquement</option>
                    <option value="Trésorerie">Trésorerie & Expert-Comptable</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Auteur / Déposant
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Notes d'archivage (Optionnel)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes complémentaires, contexte légal, convention..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewDocModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-md transition-colors"
                >
                  {isSubmitting ? 'Chiffrement & Dépôt...' : 'Déposer le Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Modifier le Document</h3>
                  <p className="text-xs text-slate-500">Mise à jour des métadonnées du coffre-fort</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Titre du Document *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Catégorie
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Niveau de Confidentialité
                  </label>
                  <select
                    value={editAccessRole}
                    onChange={(e) => setEditAccessRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Tous">Public (Tous les adhérents)</option>
                    <option value="Staff & Bureau">Staff & Entraîneurs</option>
                    <option value="Bureau Seul">Bureau & Direction uniquement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description / Contexte
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-colors"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 font-display">Suppression Définitive</h3>
                <p className="text-xs text-slate-500">Action irréversible sur le stockage</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100 text-xs text-rose-800 leading-relaxed">
              <p className="font-semibold mb-1">
                Êtes-vous sûr de vouloir supprimer définitivement le document "{deletingDoc.title}" ?
              </p>
              <p className="text-rose-700">
                Cette opération va supprimer le fichier du stockage physique (dossier media/vault ou bucket S3) ainsi que son enregistrement dans la base de données du coffre-fort.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDoc(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
              >
                {isDeleting ? 'Suppression en cours...' : 'Oui, Supprimer Définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Media Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  {getFileIcon(previewDoc.fileType)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{previewDoc.title}</h3>
                  <span className="text-[11px] text-slate-400">
                    {previewDoc.category} &bull; {previewDoc.fileSize}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Media Content */}
            <div className="rounded-2xl bg-slate-900/5 p-4 flex items-center justify-center min-h-[250px] max-h-[450px] overflow-hidden">
              {previewDoc.fileType === 'IMAGE' && previewDoc.downloadUrl ? (
                <img
                  src={previewDoc.downloadUrl}
                  alt={previewDoc.title}
                  className="max-h-[400px] w-auto max-w-full rounded-xl object-contain shadow-xs"
                />
              ) : previewDoc.fileType === 'VIDEO' && previewDoc.downloadUrl ? (
                <video controls className="max-h-[400px] w-full rounded-xl">
                  <source src={previewDoc.downloadUrl} />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              ) : previewDoc.fileType === 'AUDIO' && previewDoc.downloadUrl ? (
                <div className="w-full text-center space-y-4 py-8">
                  <Music className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
                  <audio controls className="w-full max-w-md mx-auto">
                    <source src={previewDoc.downloadUrl} />
                    Votre navigateur ne supporte pas la lecture audio.
                  </audio>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600">Aperçu direct non disponible pour ce format.</p>
                  <button
                    type="button"
                    onClick={() => handleDownload(previewDoc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-xl"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Télécharger le fichier
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="font-mono text-[10px] truncate max-w-xs">
                {previewDoc.sha256 ? `SHA-256: ${previewDoc.sha256}` : 'Chiffré AES-256'}
              </span>
              <button
                type="button"
                onClick={() => handleDownload(previewDoc)}
                className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ouvrir en plein écran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
