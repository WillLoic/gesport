import React, { useState } from 'react';
import {
  FolderLock,
  Plus,
  Search,
  Download,
  FileText,
  Shield,
  X,
  UploadCloud,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { DocumentItem } from '../../types';

export const DocumentManagementView: React.FC = () => {
  const { documents, setDocuments, staff, showToast } = useClub();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);

  // New Doc Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Statuts & AG');
  const [newFileType, setNewFileType] = useState('PDF');
  const [newAuthor, setNewAuthor] = useState(staff[0]?.name || 'Secrétaire Général');
  const [newAccessRole, setNewAccessRole] = useState('Staff & Coachs');
  const [newFileSize, setNewFileSize] = useState('1.4 MB');

  const categories = [
    'Statuts & AG',
    'Assurances & Sécurité',
    'Règlements & Chartes',
    'Conventions Mairie',
    'Formulaires Licences',
    'Comptabilité',
  ];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch =
      searchTerm === '' ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Veuillez renseigner le titre du document.');
      return;
    }

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      fileType: newFileType,
      fileSize: newFileSize,
      uploadDate: new Date().toISOString().split('T')[0],
      author: newAuthor.trim(),
      accessRole: newAccessRole,
    };

    setDocuments(prev => [newDoc, ...prev]);
    setIsNewDocModalOpen(false);
    showToast(`Document "${newDoc.title}" déposé dans le coffre-fort numérique !`);

    // Reset
    setNewTitle('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">GED Documents Officiels</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Coffre-fort numérique, statuts associatifs préfecture, polices d'assurance MAIF et conventions municipales
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewDocModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Déposer un Document
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher document, convention, auteur..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/50 outline-hidden"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-hidden"
        >
          <option value="all">Toutes les catégories ({documents.length})</option>
          {categories.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {doc.fileType}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {doc.category}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-0.5 line-clamp-1">{doc.title}</h3>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {doc.fileSize}
                </span>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                <span className="text-slate-500">Ajouté par {doc.author}</span>
                <span className="font-semibold text-slate-700">{doc.uploadDate}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                {doc.accessRole}
              </span>

              <button
                type="button"
                onClick={() => showToast(`Document "${doc.title}" téléchargé avec succès.`)}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Télécharger
              </button>
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
                  <p className="text-xs text-slate-500">Enregistrement sécurisé dans le coffre-fort du club</p>
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
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Titre du Document *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Procès-Verbal AG Ordinaire 2025, Attestation MAIF..."
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
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
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Format de Fichier
                  </label>
                  <select
                    value={newFileType}
                    onChange={e => setNewFileType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="PDF">PDF (.pdf)</option>
                    <option value="DOCX">Word (.docx)</option>
                    <option value="XLSX">Excel (.xlsx)</option>
                    <option value="ZIP">Archive (.zip)</option>
                    <option value="SCAN">Scan Image (.png, .jpg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Auteur / Déposant
                  </label>
                  <input
                    type="text"
                    value={newAuthor}
                    onChange={e => setNewAuthor(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Niveau de Confidentialité
                  </label>
                  <select
                    value={newAccessRole}
                    onChange={e => setNewAccessRole(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Public Club">Public (Tous les adhérents)</option>
                    <option value="Staff & Coachs">Staff & Entraîneurs</option>
                    <option value="Bureau & Direction">Bureau & Direction uniquement</option>
                    <option value="Trésorerie">Trésorerie & Expert-Comptable</option>
                  </select>
                </div>
              </div>

              {/* Upload Dropzone Preview */}
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-slate-700">Fichier prêt pour le coffre-fort</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Taille estimée : {newFileSize} &bull; Chiffrement AES-256</p>
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
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Déposer le Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
