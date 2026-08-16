import React, { useState } from 'react';
import { Product, Plan } from '../../types';
import {
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Check,
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Package,
  Layers
} from 'lucide-react';
import { ProductBanner } from '../ProductBanners';
import {
  isSupabaseConfigured,
  uploadImageToSupabaseStorage,
  deleteStorageFileFromSupabase
} from '../../lib/supabase';
import { compressImage } from '../../lib/imageCompressor';

interface AdminProductsTabProps {
  products: Product[];
  onAddProduct: (product: Product) => Promise<void> | void;
  onUpdateProduct: (product: Product) => Promise<void> | void;
  onDeleteProduct: (productId: string) => Promise<void> | void;
  onResetProducts: () => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [productSaveError, setProductSaveError] = useState<string | null>(null);
  const [productSuccessMsg, setProductSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const blankProduct: Product = {
    id: `prod-${Date.now()}`,
    name: '',
    category: 'AI Tools',
    description: '',
    badge: 'HOT DEAL',
    discountPercent: 10,
    image: '',
    bannerType: 'custom',
    stock: 'In Stock',
    requiresEmailInput: false,
    plans: [
      {
        id: `plan-${Date.now()}-1`,
        name: 'Standard Plan',
        price: 999,
        billingCycle: 'Month',
        features: ['Instant Activation', 'Full Guarantee', '24/7 Support']
      }
    ]
  };

  const [formData, setFormData] = useState<Product>(blankProduct);

  const startCreate = () => {
    setFormData({
      ...blankProduct,
      id: `prod-${Date.now()}`
    });
    setIsCreatingProduct(true);
    setEditingProduct(null);
    setProductSaveError(null);
    setUploadError(null);
  };

  const startEdit = (prod: Product) => {
    const clone: Product = JSON.parse(JSON.stringify(prod));
    const plansVal = Array.isArray(clone.plans) && clone.plans.length > 0
      ? clone.plans
      : Array.isArray(clone.options) && clone.options.length > 0
      ? clone.options
      : [];

    if (plansVal.length === 0) {
      plansVal.push({
        id: `plan-${Date.now()}-1`,
        name: 'Standard Plan',
        price: clone.price || 0,
        billingCycle: 'Month',
        features: clone.features || ['Instant Activation']
      });
    }

    clone.plans = plansVal;
    clone.options = plansVal;
    clone.price = clone.price || plansVal[0]?.price || 0;

    setFormData(clone);
    setEditingProduct(prod);
    setIsCreatingProduct(false);
    setProductSaveError(null);
    setUploadError(null);
  };

  const handleStockToggle = async (prod: Product) => {
    let nextStock: 'In Stock' | 'Limited Stock' | 'Out of Stock' = 'In Stock';
    if (prod.stock === 'In Stock') nextStock = 'Limited Stock';
    else if (prod.stock === 'Limited Stock') nextStock = 'Out of Stock';
    else nextStock = 'In Stock';

    try {
      await onUpdateProduct({ ...prod, stock: nextStock });
      setProductSuccessMsg(`Updated "${prod.name}" stock status to ${nextStock}!`);
      setTimeout(() => setProductSuccessMsg(null), 3000);
    } catch (err: any) {
      setProductSaveError(err?.message || 'Failed to update stock status');
    }
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploadingImage(true);

    const prevProdImage = formData.image || formData.image_url || formData.logo_url;

    try {
      // 1. Compress image to fast lightweight webp (max 512x512, ~30-50KB)
      const { file: optimizedFile, dataUrl: compressedDataUrl } = await compressImage(file, 512, 512, 0.85);

      // 2. If Supabase is configured, attempt upload
      if (isSupabaseConfigured) {
        const uploadRes = await uploadImageToSupabaseStorage(optimizedFile, 'product-images', optimizedFile.name);
        if (uploadRes.url) {
          if (prevProdImage && prevProdImage !== uploadRes.url && prevProdImage.includes('/storage/v1/object/public/')) {
            deleteStorageFileFromSupabase(prevProdImage).catch((err) => console.warn('Old product image cleanup warning:', err));
          }
          setFormData((prev) => ({
            ...prev,
            image: uploadRes.url!,
            image_url: uploadRes.url!,
            logo_url: uploadRes.url!,
            banner_image_url: uploadRes.url!
          }));
          setIsUploadingImage(false);
          return;
        }
      }

      // 3. Fallback to ultra-compact compressed dataUrl (prevents quota exceeded errors)
      if (prevProdImage && prevProdImage.includes('/storage/v1/object/public/')) {
        deleteStorageFileFromSupabase(prevProdImage).catch((err) => console.warn('Old product image cleanup warning:', err));
      }
      setFormData((prev) => ({
        ...prev,
        image: compressedDataUrl,
        image_url: compressedDataUrl,
        logo_url: compressedDataUrl,
        banner_image_url: compressedDataUrl
      }));
    } catch (err: any) {
      console.error('Error optimizing and uploading image:', err);
      setUploadError('Failed to process image. Please try another image file.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleClearImage = async () => {
    const currentImg = formData.image || formData.image_url || formData.logo_url;
    if (currentImg && currentImg.includes('/storage/v1/object/public/')) {
      deleteStorageFileFromSupabase(currentImg).catch((err) => console.warn('Clean image error:', err));
    }
    setFormData((prev) => ({
      ...prev,
      image: '',
      image_url: '',
      logo_url: '',
      banner_image_url: ''
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductSaveError(null);

    if (!formData.name.trim()) {
      setProductSaveError('Product name is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (isCreatingProduct) {
        await onAddProduct(formData);
        setProductSuccessMsg(`Successfully created "${formData.name}" and synced to Supabase!`);
      } else {
        // If editing and image was changed from old Supabase storage image, clean up old file
        if (editingProduct) {
          const oldImg = editingProduct.image || editingProduct.image_url || editingProduct.logo_url;
          const newImg = formData.image || formData.image_url || formData.logo_url;
          if (oldImg && oldImg !== newImg && oldImg.includes('/storage/v1/object/public/')) {
            deleteStorageFileFromSupabase(oldImg).catch((err) => console.warn('Old image cleanup error:', err));
          }
        }
        await onUpdateProduct(formData);
        setProductSuccessMsg(`Successfully updated "${formData.name}" and synced to Supabase!`);
      }
      setIsCreatingProduct(false);
      setEditingProduct(null);
      setTimeout(() => setProductSuccessMsg(null), 4000);
    } catch (err: any) {
      setProductSaveError(err?.message || 'Failed to save product to Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (prodId: string, prodName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${prodName}" from Supabase database?`)) return;
    try {
      const targetProd = products.find((p) => p.id === prodId);
      if (targetProd) {
        const prodImg = targetProd.image || targetProd.image_url || targetProd.logo_url;
        if (prodImg && prodImg.includes('/storage/v1/object/public/')) {
          deleteStorageFileFromSupabase(prodImg).catch((err) => console.warn('Clean image error:', err));
        }
      }
      await onDeleteProduct(prodId);
      setProductSuccessMsg(`Deleted "${prodName}" from store & database.`);
      setTimeout(() => setProductSuccessMsg(null), 3000);
    } catch (err: any) {
      setProductSaveError(err?.message || 'Failed to delete product.');
    }
  };

  // Plan management
  const addPlan = () => {
    const newPlan: Plan = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
      name: 'Pro Plan',
      price: 1499,
      billingCycle: 'Month',
      features: ['24/7 Support', 'Full Guarantee']
    };
    const updated = [...(formData.plans || []), newPlan];
    setFormData({ ...formData, plans: updated, options: updated });
  };

  const updatePlan = (idx: number, field: keyof Plan, value: any) => {
    const updated = [...(formData.plans || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    const newPrice = idx === 0 && field === 'price' ? Number(value) : (formData.price || updated[0]?.price || 0);
    setFormData({ ...formData, plans: updated, options: updated, price: newPrice });
  };

  const removePlan = (idx: number) => {
    if ((formData.plans || []).length <= 1) return;
    const updated = formData.plans.filter((_, i) => i !== idx);
    const newPrice = updated[0]?.price || formData.price || 0;
    setFormData({ ...formData, plans: updated, options: updated, price: newPrice });
  };

  const addFeatureToPlan = (planIdx: number, featureText: string) => {
    const text = featureText.trim();
    if (!text) return;
    const updated = [...(formData.plans || [])];
    if (!updated[planIdx]) return;
    const currentFeats = updated[planIdx].features || [];
    if (currentFeats.includes(text)) return;
    updated[planIdx] = { ...updated[planIdx], features: [...currentFeats, text] };
    setFormData({ ...formData, plans: updated, options: updated, features: updated[0]?.features || [] });
  };

  const removeFeatureFromPlan = (planIdx: number, featIdx: number) => {
    const updated = [...(formData.plans || [])];
    if (!updated[planIdx]) return;
    const currentFeats = updated[planIdx].features || [];
    const newFeats = currentFeats.filter((_, i) => i !== featIdx);
    updated[planIdx] = { ...updated[planIdx], features: newFeats };
    setFormData({ ...formData, plans: updated, options: updated, features: updated[0]?.features || [] });
  };

  // Filtered Products
  const categories = ['All', 'AI Tools', 'Entertainment', 'Video Editing', 'Productivity'];
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const inStockCount = products.filter((p) => p.stock === 'In Stock').length;
  const limitedStockCount = products.filter((p) => p.stock === 'Limited Stock').length;
  const outOfStockCount = products.filter((p) => p.stock === 'Out of Stock').length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      
      {/* Toast Notifications */}
      {productSuccessMsg && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{productSuccessMsg}</span>
        </div>
      )}

      {productSaveError && (
        <div className="p-3.5 bg-red-950/90 border border-red-500/50 rounded-xl text-xs text-red-300 flex items-center gap-2 animate-fade-in shadow-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="font-semibold">{productSaveError}</span>
        </div>
      )}

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Products</div>
            <div className="text-xl font-black text-white">{products.length}</div>
          </div>
          <Package className="w-5 h-5 text-purple-400" />
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-emerald-900/40 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-emerald-400 font-semibold uppercase">In Stock</div>
            <div className="text-xl font-black text-emerald-300">{inStockCount}</div>
          </div>
          <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-amber-900/40 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-amber-400 font-semibold uppercase">Limited Stock</div>
            <div className="text-xl font-black text-amber-300">{limitedStockCount}</div>
          </div>
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-red-900/40 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-red-400 font-semibold uppercase">Out of Stock</div>
            <div className="text-xl font-black text-red-300">{outOfStockCount}</div>
          </div>
          <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
        </div>
      </div>

      {/* Toolbar: Search, Category Filter, and Action Buttons */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-slate-950 border border-slate-800/80 rounded-xl">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onResetProducts}
            className="px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reset catalog to standard default subscriptions"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={startCreate}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-950/50 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Product</span>
          </button>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL FORM */}
      {(isCreatingProduct || editingProduct) && (
        <form
          onSubmit={handleSaveProduct}
          className="p-5 bg-[#0D111A] border-2 border-purple-500/60 rounded-2xl space-y-5 shadow-2xl shadow-purple-950/60 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-500/40">
                {isCreatingProduct ? <Plus className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              </div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">
                {isCreatingProduct ? 'Create New Subscription Product' : `Edit Product: ${editingProduct?.name}`}
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsCreatingProduct(false);
                setEditingProduct(null);
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Product Title *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-semibold"
                placeholder="e.g. Spotify Premium 1 Year (Individual)"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="AI Tools">AI Tools</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Video Editing">Video Editing</option>
                <option value="Productivity">Productivity</option>
              </select>
            </div>

            {/* Stock Status Selector */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">Stock Availability Status</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, stock: 'In Stock' })}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                    formData.stock === 'In Stock'
                      ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-md shadow-emerald-950/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>In Stock</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, stock: 'Limited Stock' })}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                    formData.stock === 'Limited Stock'
                      ? 'bg-amber-950/90 text-amber-300 border-amber-500 shadow-md shadow-amber-950/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Limited</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, stock: 'Out of Stock' })}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 border cursor-pointer ${
                    formData.stock === 'Out of Stock'
                      ? 'bg-red-950/90 text-red-300 border-red-500 shadow-md shadow-red-950/50'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>Out of Stock</span>
                </button>
              </div>
            </div>

            {/* Badge Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Badge Tag / Offer</label>
              <input
                type="text"
                value={formData.badge || ''}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                placeholder="e.g. 50% OFF, BESTSELLER, 4K UHD"
              />
            </div>

            {/* Requires Email Input Toggle */}
            <div className="flex items-center gap-2 pt-2 sm:col-span-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiresEmailInput || false}
                  onChange={(e) => setFormData({ ...formData, requiresEmailInput: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs font-bold text-slate-300">
                  Customer Email Required at Checkout (e.g. for Gemini / YouTube invite activation)
                </span>
              </label>
            </div>

            {/* Description */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-300 mb-1">Product Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                placeholder="Describe features, activation details, warranty..."
              />
            </div>

            {/* Image / Logo Upload Section */}
            <div className="sm:col-span-3 p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <label className="block text-xs font-extrabold text-cyan-300 flex items-center gap-2 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                <span>Product Card Graphic / Logo</span>
              </label>

              {uploadError && (
                <div className="p-3 bg-amber-950/70 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-start justify-between gap-2 animate-fade-in">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold mt-0.5">ℹ️</span>
                    <span className="leading-relaxed">{uploadError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadError(null)}
                    className="text-amber-400 hover:text-white shrink-0 p-1 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Live Card Preview */}
                <div className="w-full sm:w-48 h-28 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shrink-0 flex items-center justify-center p-2 relative shadow-inner">
                  <ProductBanner
                    type={formData.bannerType}
                    badge={formData.badge}
                    image={formData.image || formData.image_url || formData.logo_url}
                    productName={formData.name}
                  />
                  {formData.image && formData.image.includes('/storage/v1/object/public/') && (
                    <span className="absolute top-1 left-1 bg-emerald-950/90 text-emerald-300 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/40">
                      Supabase Storage
                    </span>
                  )}
                </div>

                <div className="flex-1 space-y-2.5 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                      isUploadingImage
                        ? 'bg-purple-950 text-purple-400 border border-purple-800 cursor-not-allowed'
                        : 'bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-500/40'
                    }`}>
                      {isUploadingImage ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
                          <span>Uploading to Storage...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Image File (PNG, JPG, WEBP, SVG)</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </label>

                    {(formData.image || formData.image_url || formData.logo_url) && (
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="px-3 py-2 bg-red-950/80 hover:bg-red-900 border border-red-500/40 text-red-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear Image</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => {
                      const url = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        image: url,
                        image_url: url,
                        logo_url: url,
                        banner_image_url: url
                      }));
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    placeholder="Or enter direct image URL (https://...)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Plans & Pricing Builder */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Subscription Plans & Pricing (NPR)</span>
              </label>
              <button
                type="button"
                onClick={addPlan}
                className="px-3 py-1.5 bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-purple-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Plan</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.plans.map((plan, idx) => (
                <div key={plan.id} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[10px] bg-purple-950 text-purple-300 font-black px-2 py-1 rounded-lg border border-purple-800/50">
                        Plan #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={plan.name}
                        onChange={(e) => updatePlan(idx, 'name', e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-bold flex-1 focus:outline-none focus:border-purple-500"
                        placeholder="Plan Name (e.g. 1 Month / 1 Year / 4K UHD)"
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400 font-semibold">Rs.</span>
                      <input
                        type="number"
                        value={plan.price}
                        onChange={(e) => updatePlan(idx, 'price', Number(e.target.value))}
                        className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-black focus:outline-none focus:border-emerald-500"
                        placeholder="Price"
                      />
                      {formData.plans.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePlan(idx)}
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Remove Plan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Plan Features Manager */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-extrabold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Features & Perks ({plan.features?.length || 0})</span>
                    </div>

                    <div className="space-y-1.5">
                      {(plan.features || []).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-purple-950/80 text-purple-300 flex items-center justify-center text-[10px] font-bold border border-purple-800/50 shrink-0">
                            {fIdx + 1}
                          </span>
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => {
                              const updatedPlans = [...formData.plans];
                              const newFeats = [...(updatedPlans[idx].features || [])];
                              newFeats[fIdx] = e.target.value;
                              updatedPlans[idx].features = newFeats;
                              setFormData({ ...formData, plans: updatedPlans, options: updatedPlans });
                            }}
                            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeatureFromPlan(idx, fIdx)}
                            className="p-1 text-slate-500 hover:text-red-400 rounded transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Quick Add Custom Feature */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        id={`new-feature-input-${idx}`}
                        placeholder="Add feature (e.g. Private Profile with PIN) and press Enter..."
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const target = e.currentTarget;
                            if (target.value.trim()) {
                              addFeatureToPlan(idx, target.value.trim());
                              target.value = '';
                            }
                          }
                        }}
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const inputEl = document.getElementById(`new-feature-input-${idx}`) as HTMLInputElement;
                          if (inputEl && inputEl.value.trim()) {
                            addFeatureToPlan(idx, inputEl.value.trim());
                            inputEl.value = '';
                          }
                        }}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>

                    {/* Feature Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-slate-500 font-bold mr-1">Quick Presets:</span>
                      {[
                        '⚡ Instant Email Activation',
                        '🔒 Private Profile & PIN',
                        '🖥️ 4K Ultra HD Quality',
                        '🛡️ 100% Replacement Guarantee',
                        '📱 Works on All Devices',
                        '💬 24/7 Dedicated Support'
                      ].map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => addFeatureToPlan(idx, preset)}
                          className="text-[10px] bg-slate-900 hover:bg-purple-950 text-slate-400 hover:text-purple-300 border border-slate-800 hover:border-purple-500/50 px-2 py-0.5 rounded-full transition-all cursor-pointer"
                        >
                          + {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsCreatingProduct(false);
                setEditingProduct(null);
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-950/50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Supabase...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Product</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Product Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            All Products ({filteredProducts.length})
          </h4>
          <span className="text-[11px] text-slate-500">
            Tip: Click on the stock badge to instantly toggle stock status!
          </span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
            No products found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((prod) => {
              const plans = prod.plans || prod.options || [];
              const minPrice = plans.length > 0 ? Math.min(...plans.map((p) => p.price)) : prod.price || 0;

              return (
                <div
                  key={prod.id}
                  className={`p-4 bg-slate-900/70 border rounded-2xl flex flex-col justify-between gap-3 transition-all ${
                    prod.stock === 'Out of Stock'
                      ? 'border-red-900/40 hover:border-red-500/40'
                      : 'border-slate-800 hover:border-purple-500/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Thumbnail Image */}
                    <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1 relative">
                      <ProductBanner
                        type={prod.bannerType}
                        image={prod.image || prod.image_url || prod.logo_url}
                        productName={prod.name}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-white truncate">{prod.name}</span>
                        <span className="text-[10px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800/50 font-bold">
                          {prod.category}
                        </span>
                        {prod.badge && (
                          <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/40 font-bold">
                            {prod.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{prod.description}</p>

                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        {/* 1-CLICK STOCK TOGGLE BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleStockToggle(prod)}
                          className={`text-[10px] px-2.5 py-1 rounded-full font-black border transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                            prod.stock === 'Out of Stock'
                              ? 'bg-red-950 text-red-300 border-red-500/50 hover:bg-red-900'
                              : prod.stock === 'Limited Stock'
                              ? 'bg-amber-950 text-amber-300 border-amber-500/50 hover:bg-amber-900'
                              : 'bg-emerald-950 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900'
                          }`}
                          title="Click to toggle Stock Status (In Stock -> Limited -> Out of Stock)"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              prod.stock === 'Out of Stock'
                                ? 'bg-red-400'
                                : prod.stock === 'Limited Stock'
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                          />
                          <span>{prod.stock || 'In Stock'} (Click to toggle)</span>
                        </button>

                        <span className="text-xs font-extrabold text-emerald-400">
                          From Rs.{minPrice}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Plans & Actions Bottom Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="text-[11px] text-slate-400 truncate">
                      {plans.map((p) => `${p.name} (Rs.${p.price})`).join(' • ')}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEdit(prod)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                        title="Edit product"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(prod.id, prod.name)}
                        className="p-1.5 bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-300 rounded-lg transition-all cursor-pointer"
                        title="Delete product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
