import React, { useState } from 'react';
import {
  Globe,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  Sparkles,
  X,
  FileText,
} from 'lucide-react';
import { useClub } from '../../context/ClubContext';
import { NewsArticle } from '../../types';

export const ClubWebsiteCMSView: React.FC = () => {
  const { news, setNews, showToast } = useClub();
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(news[0] || null);
  const [isNewArticleModalOpen, setIsNewArticleModalOpen] = useState(false);

  // New Article Form State
  const [articleTitle, setArticleTitle] = useState('');
  const [articleCategory, setArticleCategory] = useState('Résultats Matchs');
  const [articleSummary, setArticleSummary] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [authorName, setAuthorName] = useState('Alexandre Laurent');
  const [isPublished, setIsPublished] = useState(true);

  const handleTogglePublish = (articleId: string) => {
    setNews(prev =>
      prev.map(art => (art.id === articleId ? { ...art, isPublished: !art.isPublished } : art))
    );
    if (selectedArticle && selectedArticle.id === articleId) {
      setSelectedArticle(prev => (prev ? { ...prev, isPublished: !prev.isPublished } : null));
    }
    showToast('Statut de publication sur le site web synchronisé !');
  };

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim() || !articleSummary.trim()) {
      showToast('Veuillez renseigner le titre et le résumé de l’article.');
      return;
    }

    const newArt: NewsArticle = {
      id: `art-${Date.now()}`,
      title: articleTitle.trim(),
      category: articleCategory as any,
      summary: articleSummary.trim(),
      content: articleContent.trim() || articleSummary.trim(),
      publishDate: new Date().toISOString().split('T')[0],
      isPublished,
      viewsCount: 0,
      featuredImage: '',
      author: authorName.trim() || 'Pôle Communication',
    };

    setNews(prev => [newArt, ...prev]);
    setSelectedArticle(newArt);
    setIsNewArticleModalOpen(false);
    showToast(
      isPublished
        ? `Article "${newArt.title}" publié en ligne sur le site web !`
        : `Article "${newArt.title}" sauvegardé comme brouillon !`
    );

    // Reset Form
    setArticleTitle('');
    setArticleSummary('');
    setArticleContent('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">Site Public & CMS Actualités</h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Édition et publication des articles du club, résultats de week-end, galeries photos et billetterie publique
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewArticleModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          Rédiger un Article
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {news.map(art => (
          <div
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-blue-700">{art.category}</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-semibold ${
                    art.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {art.isPublished ? 'En ligne' : 'Brouillon'}
                </span>
              </div>

              <h3 className="font-bold text-base text-slate-900 mt-2 line-clamp-2">{art.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">{art.summary}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" /> {art.viewsCount} lectures
              </span>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handleTogglePublish(art.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  art.isPublished
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {art.isPublished ? 'Dépublier' : 'Mettre en Ligne'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Article Modal */}
      {isNewArticleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 font-display">Rédiger un Article pour le Site</h3>
                  <p className="text-xs text-slate-500">Publication dans le fil d'actualités public du club</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewArticleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Titre de l'Article *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Victoire héroïque 3-2 en Coupe Régionale face à Aix..."
                  value={articleTitle}
                  onChange={e => setArticleTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Rubrique / Catégorie
                  </label>
                  <select
                    value={articleCategory}
                    onChange={e => setArticleCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  >
                    <option value="Résultats Matchs">Résultats Matchs & Coupes</option>
                    <option value="Vie du Club">Vie du Club & Bénévolat</option>
                    <option value="École de Volley">École de Sport / Formation</option>
                    <option value="Événements & Tournois">Événements & Tournois</option>
                    <option value="Communiqué Officiel">Communiqué Officiel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Auteur
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium text-slate-800 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Chapeau / Résumé (visible en vignette) *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Bref résumé accrocheur pour les réseaux sociaux et la page d'accueil..."
                  value={articleSummary}
                  onChange={e => setArticleSummary(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 outline-hidden resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Corps complet de l'article
                </label>
                <textarea
                  rows={4}
                  placeholder="Racontez le déroulé du match, les déclarations du coach, les moments forts..."
                  value={articleContent}
                  onChange={e => setArticleContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-800 outline-hidden resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="publishedDirectly"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="publishedDirectly" className="text-xs font-medium text-slate-700">
                  Publier immédiatement en ligne sur le site web officiel
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewArticleModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  {isPublished ? 'Publier l\'Article' : 'Enregistrer le Brouillon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
