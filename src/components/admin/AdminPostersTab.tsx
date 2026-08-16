import React, { useState } from 'react';
import { PromotionalPoster, Product, SiteSettings } from '../../types';
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Upload,
  RefreshCw,
  Package,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  isSupabaseConfigured,
  uploadImageToSupabaseStorage,
  deleteStorageFileFromSupabase
} from '../../lib/supabase';
import { compressImage } from '../../lib/imageCompressor';

interface AdminPostersTabProps {
  promotionalPosters: PromotionalPoster[];
  products: Product[];
  siteSettings?: SiteSettings;
  onUpdateSiteSettings?: (settings: Partial<SiteSettings>) => Promise<void> | void;
  onAddPoster?: (poster: Omit<PromotionalPoster, 'id'>) => void;
  onUpdatePoster?: (id: string, poster: Partial<PromotionalPoster>) => void;
  onDeletePoster?: (id: string) => void;
  onTogglePosterActive?: (id: string) => void;
}

export const AdminPostersTab: React.FC<AdminPostersTabProps> = ({
  promotionalPosters,
  products,
  siteSettings,
  onUpdateSiteSettings,
  onAddPoster,
  onUpdatePoster,
  onDeletePoster,
  onTogglePosterActive,
}) => {
  const [editingPoster, setEditingPoster] = useState<PromotionalPoster | null>(null);
  const [isCreatingPoster, setIsCreatingPoster] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<PromotionalPoster, 'id'>>({
    title: '',
    subtitle: '',
    description: '',
    badge: 'SPECIAL DEAL • SUBX NEPAL',
    image: '',
    productId: products[0]?.id || '',
    ctaText: 'Get Now →',
    active: true,
    displayOrder: 1,
  });

  const startAdd = () => {
    setEditingPoster(null);
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      badge: 'SPECIAL DEAL • SUBX NEPAL',
      image: '',
      productId: products[0]?.id || '',
      ctaText: 'Get Now →',
      active: true,
      displayOrder: promotionalPosters.length + 1,
    });
    setIsCreatingPoster(true);
  };

  const startEdit = (poster: PromotionalPoster) => {
    setEditingPoster(poster);
    setFormData({
      title: poster.title || '',
      subtitle: poster.subtitle || '',
      description: poster.description || '',
      badge: poster.badge || 'SPECIAL DEAL • SUBX NEPAL',
      image: poster.image || '',
      productId: poster.productId || '',
      ctaText: poster.ctaText || 'Get Now →',
      active: poster.active !== false,
      displayOrder: poster.displayOrder || 1,
    });
    setIsCreatingPoster(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const prevImage = formData.image;

    try {
      const { file: optimizedFile, dataUrl: compressedDataUrl } = await compressImage(file, 1200, 800, 0.85);

      if (isSupabaseConfigured) {
        const res = await uploadImageToSupabaseStorage(optimizedFile, 'posters', optimizedFile.name);
        if (res.url) {
          if (prevImage && prevImage !== res.url && prevImage.includes('/storage/v1/object/public/')) {
            deleteStorageFileFromSupabase(prevImage).catch((err) => console.warn('Old poster cleanup warning:', err));
          }
          setFormData((prev) => ({ ...prev, image: res.url! }));
          setIsUploading(false);
          return;
        }
      }

      if (prevImage && prevImage.includes('/storage/v1/object/public/')) {
        deleteStorageFileFromSupabase(prevImage).catch((err) => console.warn('Old poster cleanup warning:', err));
      }
      setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
    } catch (err) {
      console.warn('Error compressing poster image:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingPoster && onUpdatePoster) {
      if (editingPoster.image && editingPoster.image !== formData.image && editingPoster.image.includes('/storage/v1/object/public/')) {
        deleteStorageFileFromSupabase(editingPoster.image).catch((err) => console.warn('Old poster cleanup error:', err));
      }
      onUpdatePoster(editingPoster.id, formData);
      setStatusMsg(`Updated poster "${formData.title}"`);
    } else if (onAddPoster) {
      onAddPoster(formData);
      setStatusMsg(`Created new poster "${formData.title}"`);
    }

    setEditingPoster(null);
    setIsCreatingPoster(false);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete poster "${title}"?`)) {
      const target = promotionalPosters.find((p) => p.id === id);
      if (target?.image && target.image.includes('/storage/v1/object/public/')) {
        deleteStorageFileFromSupabase(target.image).catch((err) => console.warn('Poster cleanup error:', err));
      }
      if (onDeletePoster) onDeletePoster(id);
      setStatusMsg(`Deleted poster "${title}"`);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      
      {/* Toast Feedback */}
      {statusMsg && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{statusMsg}</span>
        </div>
      )}

      {/* Header & Master Carousel ON/OFF Switch */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#2DD4BF]" />
            <span>Promotional Banner Carousel</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage interactive advertisement banners shown on the top homepage carousel
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (onUpdateSiteSettings) {
                onUpdateSiteSettings({
                  showPromotionalPosters: siteSettings?.showPromotionalPosters === false,
                });
              }
            }}
            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 border cursor-pointer ${
              siteSettings?.showPromotionalPosters !== false
                ? 'bg-[#06201B] border-[#059669] text-[#10B981] shadow-lg shadow-[#10B981]/10'
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                siteSettings?.showPromotionalPosters !== false ? 'bg-[#10B981] animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span>
              Carousel: {siteSettings?.showPromotionalPosters !== false ? 'ENABLED (ON)' : 'DISABLED (OFF)'}
            </span>
          </button>

          <button
            type="button"
            onClick={startAdd}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-purple-950/50 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Poster</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Poster Form */}
      {(isCreatingPoster || editingPoster) && (
        <form
          onSubmit={handleSave}
          className="p-5 bg-[#0D111A] border border-purple-500/50 rounded-2xl space-y-4 shadow-xl animate-fade-in"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#2DD4BF]" />
              <span>{editingPoster ? 'Edit Promotional Poster' : 'Create New Promotional Poster'}</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setIsCreatingPoster(false);
                setEditingPoster(null);
              }}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Poster Headline *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Google Gemini AI Pro"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Subtitle / Deal Highlight</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="e.g. 1 Year Premium Access • Rs. 2,699"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Badge Tag</label>
              <input
                type="text"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                placeholder="e.g. SPECIAL DEAL • SUBX NEPAL"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Button CTA Text</label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="e.g. Get Deal →"
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Linked Subscription Product</label>
              <select
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              >
                <option value="">-- Select Product Target --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Carousel Display Order</label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                min={1}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                placeholder="Short offer details..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Custom Graphic Image (Optional)</label>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Paste Image URL or upload file"
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none w-full"
                />
                <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 shrink-0 w-full sm:w-auto">
                  {isUploading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-purple-400" />
                  )}
                  <span>Upload Image</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs font-bold text-slate-300">Active (Visible in Carousel)</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsCreatingPoster(false);
                  setEditingPoster(null);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Poster</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Poster Cards Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
          All Promotional Posters ({promotionalPosters.length})
        </h4>

        {promotionalPosters.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No promotional posters added yet. Click "+ Add New Poster" above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promotionalPosters.map((poster) => {
              const linkedProd = products.find((p) => p.id === poster.productId);
              return (
                <div
                  key={poster.id}
                  className={`p-4 bg-slate-900/70 border rounded-2xl flex flex-col justify-between gap-3 transition-all ${
                    poster.active ? 'border-slate-800 hover:border-purple-500/40' : 'border-slate-800/40 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {poster.image ? (
                        <img
                          src={poster.image}
                          alt={poster.title}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center shrink-0 text-purple-400">
                          <Sparkles className="w-5 h-5" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-white">{poster.title}</span>
                          <span className="text-[10px] bg-slate-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                            #{poster.displayOrder}
                          </span>
                        </div>
                        <p className="text-xs text-purple-300 font-semibold mt-0.5">{poster.subtitle}</p>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{poster.description}</p>
                        {linkedProd && (
                          <div className="mt-2 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                            <Package className="w-3 h-3 text-emerald-400" />
                            <span>Linked: {linkedProd.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onTogglePosterActive && onTogglePosterActive(poster.id)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-all shrink-0 cursor-pointer ${
                        poster.active
                          ? 'bg-[#06201B] text-[#10B981] border-[#059669]/50'
                          : 'bg-slate-950 text-slate-500 border-slate-800'
                      }`}
                    >
                      {poster.active ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => startEdit(poster)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(poster.id, poster.title)}
                      className="p-1.5 bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-300 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
