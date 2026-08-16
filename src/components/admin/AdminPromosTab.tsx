import React, { useState } from 'react';
import { PromoCode } from '../../types';
import { Tag, Plus, Edit, Trash2, Check, X, CheckCircle2, Percent, DollarSign } from 'lucide-react';

interface AdminPromosTabProps {
  promoCodes: PromoCode[];
  onAddPromoCode?: (promo: Omit<PromoCode, 'id'>) => Promise<void> | void;
  onUpdatePromoCode?: (id: string, promo: Partial<PromoCode>) => Promise<void> | void;
  onDeletePromoCode?: (id: string) => Promise<void> | void;
  onTogglePromoCodeActive?: (id: string) => Promise<void> | void;
}

export const AdminPromosTab: React.FC<AdminPromosTabProps> = ({
  promoCodes,
  onAddPromoCode,
  onUpdatePromoCode,
  onDeletePromoCode,
  onTogglePromoCodeActive,
}) => {
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [isCreatingPromo, setIsCreatingPromo] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<PromoCode, 'id'>>({
    code: '',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 0,
    active: true,
  });

  const startAdd = () => {
    setEditingPromo(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 0,
      active: true,
    });
    setIsCreatingPromo(true);
  };

  const startEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code || '',
      discountType: promo.discountType || 'percentage',
      discountValue: promo.discountValue || 0,
      minOrderAmount: promo.minOrderAmount || 0,
      active: promo.active !== false,
    });
    setIsCreatingPromo(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    if (editingPromo && onUpdatePromoCode) {
      await onUpdatePromoCode(editingPromo.id, formData);
      setStatusMsg(`Updated promo code "${formData.code}"`);
    } else if (onAddPromoCode) {
      await onAddPromoCode(formData);
      setStatusMsg(`Created promo code "${formData.code}"`);
    }

    setEditingPromo(null);
    setIsCreatingPromo(false);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleDelete = async (id: string, code: string) => {
    if (window.confirm(`Are you sure you want to delete promo code "${code}"?`)) {
      if (onDeletePromoCode) await onDeletePromoCode(id);
      setStatusMsg(`Deleted promo code "${code}"`);
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

      {/* Header & Add Button */}
      <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Tag className="w-5 h-5 text-amber-400" />
            <span>Discount & Coupon Promo Codes</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Create percentage or flat NPR discount promo codes for customers to apply at checkout
          </p>
        </div>

        {!isCreatingPromo && !editingPromo && (
          <button
            type="button"
            onClick={startAdd}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl transition-all shadow-lg flex items-center gap-1.5 active:scale-95 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-slate-950" />
            <span>+ Create Promo Code</span>
          </button>
        )}
      </div>

      {/* Create / Edit Promo Form */}
      {(isCreatingPromo || editingPromo) && (
        <form
          onSubmit={handleSave}
          className="p-5 bg-[#0D111A] border border-amber-500/40 rounded-2xl space-y-4 shadow-xl animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>{editingPromo ? `Edit Promo Code (${editingPromo.code})` : 'Create New Promo Code'}</span>
            </h4>
            <button
              type="button"
              onClick={() => {
                setEditingPromo(null);
                setIsCreatingPromo(false);
              }}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Promo Code (Uppercase) *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SUBX10, NEPAL50"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white uppercase font-mono tracking-wider focus:outline-none font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Discount Type</label>
              <select
                value={formData.discountType}
                onChange={(e) =>
                  setFormData({ ...formData, discountType: e.target.value as 'percentage' | 'fixed' })
                }
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Flat NPR (Rs.)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Discount Value ({formData.discountType === 'percentage' ? '%' : 'NPR Rs.'})
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                placeholder="10"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Min. Order Amount (NPR)</label>
              <input
                type="number"
                min="0"
                value={formData.minOrderAmount || 0}
                onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                placeholder="0 for no minimum"
                className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
              />
              <span>Active & Redeemable at Checkout</span>
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingPromo(null);
                  setIsCreatingPromo(false);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md cursor-pointer"
              >
                Save Promo Code
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Promo Codes Grid */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
          Active & Past Promo Codes ({promoCodes.length})
        </h4>

        {promoCodes.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl text-slate-500 text-xs">
            No promo codes created yet. Click "+ Create Promo Code" above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promoCodes.map((promo) => (
              <div
                key={promo.id}
                className={`p-4 bg-slate-900/70 border rounded-2xl flex flex-col justify-between gap-3 transition-all ${
                  promo.active ? 'border-amber-500/30 hover:border-amber-500/60' : 'border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="font-mono text-sm font-black text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-lg inline-block tracking-wider">
                      {promo.code}
                    </span>
                    <div className="text-xs font-bold text-white mt-1">
                      {promo.discountType === 'percentage'
                        ? `${promo.discountValue}% OFF Total`
                        : `NPR ${promo.discountValue} Flat Discount`}
                    </div>
                    {promo.minOrderAmount && promo.minOrderAmount > 0 ? (
                      <div className="text-[11px] text-slate-400">
                        Min Order: NPR {promo.minOrderAmount}
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-500">No minimum order</div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onTogglePromoCodeActive && onTogglePromoCodeActive(promo.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition-all shrink-0 cursor-pointer ${
                      promo.active
                        ? 'bg-[#06201B] text-[#10B981] border-[#059669]/50'
                        : 'bg-slate-950 text-slate-500 border-slate-800'
                    }`}
                  >
                    {promo.active ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => startEdit(promo)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(promo.id, promo.code)}
                    className="p-1.5 bg-slate-800 hover:bg-red-950/80 text-slate-400 hover:text-red-300 rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
