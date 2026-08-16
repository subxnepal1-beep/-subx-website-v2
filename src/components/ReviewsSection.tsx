import React, { useState } from 'react';
import { CustomerReview, Product } from '../types';
import { Star, MessageSquarePlus, ShieldCheck, CheckCircle2, User, X, Sparkles, ThumbsUp } from 'lucide-react';

interface ReviewsSectionProps {
  reviews: CustomerReview[];
  products: Product[];
  onAddReview: (review: Omit<CustomerReview, 'id' | 'created_at'>) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  products,
  onAddReview
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [productName, setProductName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [successMsg, setSuccessMsg] = useState(false);

  // Calculate average rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    onAddReview({
      customerName: customerName.trim(),
      productName: productName.trim() || (products[0]?.name || 'SubX Nepal Subscription'),
      rating,
      comment: comment.trim(),
      verifiedBuyer: true
    });

    setSuccessMsg(true);
    setTimeout(() => {
      setSuccessMsg(false);
      setIsModalOpen(false);
      setCustomerName('');
      setComment('');
      setRating(5);
    }, 1500);
  };

  return (
    <section id="reviews" className="py-12 sm:py-16 border-b border-slate-800/60 bg-[#080B12]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/80 px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-widest">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Verified Customer Feedback</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2.5 tracking-tight">
              What Our Customers Say
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Read real feedback from thousands of satisfied subscribers across Nepal.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Rating Summary Box */}
            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl">
              <div className="text-2xl font-black text-amber-400 flex items-baseline gap-1">
                <span>{avgRating}</span>
                <span className="text-xs text-slate-500 font-normal">/5</span>
              </div>
              <div className="text-left">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {reviews.length}+ Verified Reviews
                </div>
              </div>
            </div>

            {/* Write a Review Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-2xl transition-all shadow-lg flex items-center gap-2 active:scale-95"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span className="hidden sm:inline">Write a Review</span>
              <span className="sm:hidden">Add Review</span>
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3.5 sm:p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/90 transition-all flex flex-col justify-between gap-3 relative group"
            >
              <div className="space-y-2">
                
                {/* Header: User & Rating */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-xs shrink-0">
                      {rev.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1 truncate">
                        <span className="truncate">{rev.customerName}</span>
                        {rev.verifiedBuyer !== false && (
                          <span title="Verified Buyer" className="shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
                        {rev.productName}
                      </p>
                    </div>
                  </div>

                  {/* Star Badge */}
                  <div className="flex items-center gap-1 bg-amber-950/40 border border-amber-500/20 px-2 py-0.5 rounded-lg shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black text-amber-400">
                      {Number(rev.rating).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-300 leading-snug italic">
                  "{rev.comment}"
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1 text-emerald-400/90 font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified Buyer
                </span>
                <span>{new Date(rev.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Write Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl relative space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-950/80 border border-purple-500/40 rounded-xl">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Leave Customer Feedback</h3>
                  <p className="text-xs text-slate-400">Share your experience with SubX Nepal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {successMsg ? (
              <div className="py-8 text-center space-y-3 animate-scale-up">
                <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                  <ThumbsUp className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Thank You for Your Review!</h4>
                <p className="text-xs text-slate-400">Your feedback has been published successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Rating Stars:</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setRating(st)}
                        className={`p-2 rounded-xl border transition-all ${
                          st <= rating
                            ? 'bg-amber-950/60 border-amber-500/50 text-amber-400'
                            : 'bg-slate-950 border-slate-800 text-slate-600'
                        }`}
                      >
                        <Star className={`w-5 h-5 ${st <= rating ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    ))}
                    <span className="text-xs font-extrabold text-amber-400 ml-2">
                      {rating} / 5 Stars
                    </span>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Your Name:</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Aayush Sharma"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Product Purchased:</label>
                  <select
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="">Select a product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Review Feedback:</label>
                  <textarea
                    required
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your account activation speed, service quality, or experience..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-xl text-xs shadow-lg"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </section>
  );
};
