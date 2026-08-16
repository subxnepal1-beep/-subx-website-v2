import React, { useState } from 'react';
import { Order } from '../../types';
import {
  Search,
  MessageCircle,
  Trash2,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  User,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

interface AdminOrdersTabProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<void> | void;
  onDeleteOrder: (orderId: string) => Promise<void> | void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const statuses = ['All', 'Pending', 'Contacted', 'Activated', 'Cancelled'];

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = statusFilter === 'All' || ord.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      ord.id.toLowerCase().includes(q) ||
      (ord.customerName && ord.customerName.toLowerCase().includes(q)) ||
      (ord.customerPhone && ord.customerPhone.includes(q)) ||
      ord.items.some(
        (i) =>
          i.productName.toLowerCase().includes(q) ||
          (i.activationEmail && i.activationEmail.toLowerCase().includes(q))
      );
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await onUpdateOrderStatus(orderId, newStatus);
      setActionSuccessMsg(`Order #${orderId} status set to ${newStatus}`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (e: any) {
      console.error('Failed to update status', e);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm(`Are you sure you want to delete order #${orderId}?`)) {
      await onDeleteOrder(orderId);
      setActionSuccessMsg(`Order #${orderId} deleted.`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Activated':
        return 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50';
      case 'Pending':
        return 'bg-amber-950/90 text-amber-300 border-amber-500/50';
      case 'Contacted':
        return 'bg-blue-950/90 text-blue-300 border-blue-500/50';
      case 'Cancelled':
        return 'bg-red-950/90 text-red-300 border-red-500/50';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const activatedCount = orders.filter((o) => o.status === 'Activated').length;
  const contactedCount = orders.filter((o) => o.status === 'Contacted').length;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      
      {/* Toast Feedback */}
      {actionSuccessMsg && (
        <div className="p-3.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Total Orders</div>
            <div className="text-xl font-black text-white">{orders.length}</div>
          </div>
          <ShoppingBag className="w-5 h-5 text-purple-400" />
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-amber-900/40 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-amber-400 font-semibold uppercase">Pending</div>
            <div className="text-xl font-black text-amber-300">{pendingCount}</div>
          </div>
          <Clock className="w-5 h-5 text-amber-400" />
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-blue-900/40 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-blue-400 font-semibold uppercase">Contacted</div>
            <div className="text-xl font-black text-blue-300">{contactedCount}</div>
          </div>
          <MessageCircle className="w-5 h-5 text-blue-400" />
        </div>

        <div className="p-3.5 bg-slate-900/80 border border-emerald-900/40 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[11px] text-emerald-400 font-semibold uppercase">Activated</div>
            <div className="text-xl font-black text-emerald-300">{activatedCount}</div>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Toolbar: Search and Filter Pills */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 p-3 rounded-2xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order ID, customer, email, product..."
            className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
          {statuses.map((status) => {
            const count = status === 'All' ? orders.length : orders.filter((o) => o.status === status).length;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  statusFilter === status
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>{status}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
          No customer orders found matching the filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            // Clean phone for whatsapp link
            const rawPhone = (ord.customerPhone || '').replace(/[^0-9]/g, '');
            const targetPhone = rawPhone.startsWith('977') ? rawPhone : rawPhone ? `977${rawPhone}` : '';
            const itemsListText = ord.items.map((i) => `${i.productName} (${i.planName})`).join(', ');

            const whatsappMessage = encodeURIComponent(
              `Hello ${ord.customerName || 'Customer'}, thank you for ordering from SubX Nepal!\n\n` +
              `*Order ID:* ${ord.id}\n` +
              `*Items:* ${itemsListText}\n` +
              `*Total:* Rs. ${ord.total}\n\n` +
              `We are processing your subscription. Please reply here if you have any questions.`
            );

            const whatsappLink = targetPhone
              ? `https://wa.me/${targetPhone}?text=${whatsappMessage}`
              : `https://wa.me/?text=${whatsappMessage}`;

            return (
              <div
                key={ord.id}
                className="p-5 bg-[#0D111A] border border-slate-800/90 rounded-2xl space-y-4 hover:border-slate-700 transition-all shadow-md"
              >
                {/* Header: Order ID, Date, Customer info & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-black text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                      #{ord.id}
                    </span>
                    
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ord.customerName || 'Anonymous Customer'}</span>
                    </div>

                    {ord.customerPhone && (
                      <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{ord.customerPhone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      {new Date(ord.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>

                    {/* Status Dropdown */}
                    <select
                      value={ord.status}
                      onChange={(e) => handleStatusChange(ord.id, e.target.value as Order['status'])}
                      className={`text-xs font-black px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-all ${getStatusColor(
                        ord.status
                      )}`}
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="Contacted">💬 Contacted</option>
                      <option value="Activated">✅ Activated</option>
                      <option value="Cancelled">❌ Cancelled</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDelete(ord.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Delete order record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  {ord.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 bg-slate-950/60 rounded-xl text-xs border border-slate-900"
                    >
                      <div>
                        <span className="font-black text-white">{item.productName}</span>
                        <span className="text-slate-400 ml-1 font-medium">({item.planName})</span>
                        <span className="text-purple-300 font-bold ml-1.5">x{item.quantity}</span>
                        
                        {item.activationEmail && (
                          <div className="mt-1 text-[11px] text-cyan-300 flex items-center gap-1 font-mono">
                            <Mail className="w-3 h-3 text-cyan-400" />
                            <span>Activation Email: <span className="font-bold underline">{item.activationEmail}</span></span>
                          </div>
                        )}
                      </div>

                      <div className="font-black text-emerald-400 sm:text-right">
                        Rs. {item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer: Order Total, Promo Code used, WhatsApp Reply */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-black text-white">
                      Order Total: <span className="text-emerald-400">Rs. {ord.total}</span>
                    </div>

                    {ord.promoCode && (
                      <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md font-mono font-bold">
                        Promo: {ord.promoCode} (-Rs.{ord.discountAmount || 0})
                      </span>
                    )}
                  </div>

                  {/* WhatsApp Direct Reply Button */}
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Message Customer on WhatsApp</span>
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
