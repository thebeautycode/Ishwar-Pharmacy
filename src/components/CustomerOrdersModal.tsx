import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Receipt, 
  Truck, 
  X, 
  Clock, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  Share2, 
  Printer, 
  RotateCw, 
  ExternalLink,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { Order, RetailInvoice, CustomerUser } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';

// WhatsApp icon SVG component
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: CustomerUser;
  onLogout: () => void;
  onTrackOrder: (orderNumber: string) => void;
}

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onTrackOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'bills'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<RetailInvoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<RetailInvoice | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch customer orders
      const ordRes = await fetch(`/api/orders/track?q=${encodeURIComponent(user.phone)}`);
      if (ordRes.ok) {
        const ordData = await ordRes.json();
        setOrders(ordData);
      }

      // Fetch invoices
      const invRes = await fetch('/api/invoices');
      if (invRes.ok) {
        const allInvoices: RetailInvoice[] = await invRes.json();
        // Match by phone number
        const userInvoices = allInvoices.filter(i => 
          i.customerPhone && i.customerPhone.replace(/\D/g, '').includes(user.phone)
        );
        setInvoices(userInvoices);
      }
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, user.phone]);

  if (!isOpen) return null;

  const getWhatsAppBill = (ord: Order) => {
    const itemsList = ord.items.map((i, idx) => 
      `${idx + 1}. *${i.name}* (${i.dosageForm}) - ${i.quantity} x ₹${i.price} = ₹${i.price * i.quantity}`
    ).join('\n');
    const msg = `🧾 *ईश्वर फार्मेसी & फार्मा क्लिनिक - बिल कॉपी*\n📍 पचरुखिया, कंचनपुर (गोरया घाट रोड) | 📞 9118137285\n\n📋 *ऑर्डर नंबर*: *${ord.orderNumber}*\n📅 *तारीख*: ${new Date(ord.createdAt).toLocaleString('en-IN')}\n👤 *ग्राहक*: ${ord.customerName} (${ord.customerPhone})\n🏠 *पता*: ${ord.village}, ${ord.address}\n\n💊 *दवाइयां*:\n${itemsList}\n\n💵 *कुल बिल*: *₹${ord.total}*\n🛵 *स्थिति*: ${ord.status}\n\n🔗 *लाइव ट्रैक करें*: ${window.location.origin}/?order=${ord.orderNumber}`;
    return encodeURIComponent(msg);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
      case 'out_for_delivery':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">Out for Delivery</span>;
      case 'packed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Packed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">Order Placed</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] my-auto">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#071524] via-[#0f2942] to-[#064e3b] text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black font-brand">
                {user.name}'s Account
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                Verified Customer
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Phone: {user.phone} · {user.village}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-600/80 text-white transition-colors text-xs flex items-center gap-1 font-semibold"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'orders'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Doorstep Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bills')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'bills'
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Counter Bills & Memo ({invoices.length})</span>
            </button>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 text-slate-500 hover:text-slate-800"
            title="Refresh"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {activeTab === 'orders' ? (
            orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Truck className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No active or previous orders found</p>
                <p className="text-xs">When you place a medicine delivery to {user.village}, it will appear here with live tracking.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-[#064e3b]">
                            {ord.orderNumber}
                          </span>
                          {getStatusBadge(ord.status)}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(ord.createdAt).toLocaleString('en-IN')} · {ord.village}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-base font-black font-mono text-slate-900">
                          ₹{ord.total}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {ord.paymentMethod.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Medicines preview */}
                    <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-100 divide-y divide-slate-100">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="py-1 flex justify-between">
                          <span className="font-medium text-slate-800">{it.name} (x{it.quantity})</span>
                          <span className="font-mono text-slate-600">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Rider Info if Out for Delivery */}
                    {ord.status === 'out_for_delivery' && (
                      <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs flex items-center justify-between text-amber-900">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-amber-600 animate-bounce" />
                          <span>Rider: <strong>{ord.riderName || 'Rameshwar Yadav'}</strong> ({ord.estimatedDelivery || '20 mins'})</span>
                        </div>
                        <a href={`tel:${ord.riderPhone || '9118137285'}`} className="underline font-bold">
                          Call
                        </a>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-200">
                      <a
                        href={`https://wa.me/91${ord.customerPhone}?text=${getWhatsAppBill(ord)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                        title="Share Bill on WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span>व्हाट्सएप बिल</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
                        title="Print Bill"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>प्रिंट</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onTrackOrder(ord.orderNumber);
                          onClose();
                        }}
                        className="px-3.5 py-1.5 bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Truck className="w-3.5 h-3.5 text-amber-300" />
                        <span>लाइव ट्रैक करें</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            invoices.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Receipt className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No counter bills linked yet</p>
                <p className="text-xs">When you purchase medicines at the Ishwar Pharmacy counter with phone {user.phone}, cash memos appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#064e3b]">
                          {inv.invoiceNumber}
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                          {inv.paymentMode}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {new Date(inv.createdAt).toLocaleString('en-IN')} · {inv.items.length} items
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-base font-black font-mono text-slate-900">
                          ₹{inv.grandTotal}
                        </div>
                      </div>

                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`*Ishwar Pharmacy Bill ${inv.invoiceNumber}*\nAmount: ₹${inv.grandTotal}\nDate: ${new Date(inv.createdAt).toLocaleDateString()}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        title="Share on WhatsApp"
                      >
                        <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

      </div>
    </div>
  );
};
