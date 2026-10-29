import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  MapPin, 
  Phone, 
  User, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { Order } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';

// WhatsApp icon SVG component
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface TrackOrderProps {
  initialOrderNumber?: string;
  onNavigateHome?: () => void;
  onNavigateMedicines?: () => void;
}

export const TrackOrder: React.FC<TrackOrderProps> = ({
  initialOrderNumber = '',
  onNavigateHome,
  onNavigateMedicines,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialOrderNumber);
  const [searchedOrders, setSearchedOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchTrackData = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(query.trim())}`);
      if (!res.ok) throw new Error('Failed to search order status');
      const data: Order[] = await res.json();
      setSearchedOrders(data);
      if (data.length > 0) {
        setSelectedOrder(data[0]);
      } else {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error tracking order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber) {
      setSearchQuery(initialOrderNumber);
      fetchTrackData(initialOrderNumber);
    }
  }, [initialOrderNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackData(searchQuery);
  };

  // Status step configuration
  const steps = [
    { key: 'pending', label: 'Order Placed', sub: 'ऑर्डर दर्ज हुआ', icon: Clock },
    { key: 'packed', label: 'Medicines Packed', sub: 'दवा पैक हो गई', icon: Package },
    { key: 'out_for_delivery', label: 'Out for Delivery', sub: 'डिलीवरी हेतु रवाना', icon: Truck },
    { key: 'delivered', label: 'Delivered', sub: 'डिलीवर संपन्न', icon: CheckCircle2 },
  ];

  const getStepIndex = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 0;
      case 'packed': return 1;
      case 'out_for_delivery': return 2;
      case 'delivered': return 3;
      default: return 0;
    }
  };

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Header Title Banner */}
        <div className="bg-gradient-to-r from-[#071524] via-[#0f2942] to-[#064e3b] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-[#c59b27]/30 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c59b27]/15 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold border border-white/20">
              <Truck className="w-3.5 h-3.5 text-amber-300" />
              <span>Real-Time Doorstep Delivery Tracking</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight font-brand">
              Track Your Medicine Order <br />
              <span className="text-[#c59b27]">अपना ऑर्डर ट्रैक करें</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200 max-w-xl mx-auto font-normal">
              Enter your Order Number (e.g. <strong className="text-amber-300">IP-2026-XXXX</strong>) or 10-digit mobile number to view live delivery status, rider assignment, and arrival time across nearby villages.
            </p>

            {/* Search Lookup Bar */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-2 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Order ID (e.g. IP-2026-1001) or Mobile Number..."
                  className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-xl text-xs sm:text-sm font-semibold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#047857] shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="px-5 py-3 bg-[#c59b27] hover:bg-[#d4af37] text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Track Live</span>
              </button>
            </form>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Multiple Matches Selector if query was mobile number */}
        {searchedOrders.length > 1 && (
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Found {searchedOrders.length} orders for "{searchQuery}". Select one to view:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {searchedOrders.map((ord) => (
                <button
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedOrder?.id === ord.id
                      ? 'border-[#064e3b] bg-emerald-50/80 ring-1 ring-[#064e3b]'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="font-mono text-[#064e3b]">{ord.orderNumber}</span>
                    <span className="capitalize px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN')} · ₹{ord.total} ({ord.items.length} items)
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Not Found State */}
        {hasSearched && !loading && searchedOrders.length === 0 && (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
            <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No order found for "{searchQuery}"</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please double check the order number or mobile number. You can also call or WhatsApp our counter helpline at 9118137285.
            </p>
            <a
              href={`https://wa.me/919118137285?text=${encodeURIComponent(`Namaste, I want to check my order status: ${searchQuery}`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              <WhatsAppIcon className="w-4 h-4 text-emerald-300" />
              <span>Ask on WhatsApp: 9118137285</span>
            </a>
          </div>
        )}

        {/* Selected Order Tracking Card */}
        {selectedOrder && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden divide-y divide-slate-100 space-y-0">
            
            {/* Top Order Summary Bar */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Order Details
                  </span>
                  <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded font-mono text-slate-300">
                    {selectedOrder.deliveryType === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-mono text-white mt-0.5">
                  {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                <span className="text-xs text-slate-400">Total Amount</span>
                <span className="text-2xl font-black font-mono text-emerald-400">
                  ₹{selectedOrder.total}
                </span>
                <span className="text-[11px] text-slate-300">
                  {selectedOrder.paymentMethod.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Stepper Progress Timeline */}
            <div className="p-5 sm:p-8 bg-slate-50">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                Delivery Milestones (डिलीवरी प्रगति)
              </h4>

              {selectedOrder.status === 'cancelled' ? (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span>This order has been cancelled. If you have questions, please contact 9118137285.</span>
                </div>
              ) : (
                <div className="relative">
                  {/* Background line */}
                  <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-200 z-0"></div>
                  
                  {/* Active line */}
                  <div
                    className="hidden sm:block absolute top-1/2 left-6 -translate-y-1/2 h-1 bg-emerald-600 z-0 transition-all duration-500"
                    style={{
                      width: `${(getStepIndex(selectedOrder.status) / (steps.length - 1)) * 100}%`
                    }}
                  ></div>

                  {/* Steps */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-2 relative z-10">
                    {steps.map((st, idx) => {
                      const Icon = st.icon;
                      const activeIndex = getStepIndex(selectedOrder.status);
                      const isCompleted = idx <= activeIndex;
                      const isCurrent = idx === activeIndex;

                      return (
                        <div key={st.key} className="flex sm:flex-col items-center text-left sm:text-center gap-3 sm:gap-2">
                          <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all shrink-0 ${
                            isCompleted
                              ? 'bg-[#064e3b] text-white ring-4 ring-emerald-100'
                              : 'bg-white text-slate-400 border border-slate-300'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>

                          <div>
                            <div className={`text-xs font-black ${isCurrent ? 'text-[#064e3b] font-extrabold' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                              {st.label}
                            </div>
                            <div className="text-[10px] text-slate-500 font-medium">
                              {st.sub}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Rider & Delivery ETA Box */}
            <div className="p-5 sm:p-6 bg-white space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Rider Details */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 space-y-2">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Assigned Delivery Rider
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#064e3b] text-white flex items-center justify-center font-bold text-sm">
                      <Truck className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900">
                        {selectedOrder.riderName || 'Rameshwar Yadav (Ishwar Rider)'}
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-emerald-700" />
                        <a href={`tel:${selectedOrder.riderPhone || '9118137285'}`} className="hover:underline font-bold text-emerald-800">
                          {selectedOrder.riderPhone || '9118137285'}
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="text-[11px] text-emerald-900 font-semibold pt-1">
                    Estimated Time: <span className="font-bold text-slate-900">{selectedOrder.estimatedDelivery || '20-35 mins'}</span>
                  </div>
                </div>

                {/* Destination Village & Address */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Delivery Destination
                  </span>
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#064e3b] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">{selectedOrder.village}</div>
                      <div className="text-slate-600 mt-0.5">{selectedOrder.address}</div>
                      {selectedOrder.landmark && (
                        <div className="text-[11px] text-slate-500 font-medium">Landmark: {selectedOrder.landmark}</div>
                      )}
                      <div className="text-[11px] text-slate-500 mt-1">Recipient: {selectedOrder.customerName} ({selectedOrder.customerPhone})</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Medicines List in Order */}
            <div className="p-5 sm:p-6 bg-white space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-[#064e3b]" />
                <span>Prescription & Medicine Package ({selectedOrder.items.length} items)</span>
              </h4>

              <div className="divide-y divide-slate-100 text-xs">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{it.name}</div>
                      <div className="text-[11px] text-slate-500">{it.dosageForm}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-900">Qty: {it.quantity}</div>
                      <div className="text-[11px] font-mono text-emerald-700 font-bold">₹{it.price * it.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedOrder.notes && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs">
                  <strong>Customer Instructions:</strong> {selectedOrder.notes}
                </div>
              )}
            </div>

            {/* Bottom Helpline & Refresh */}
            <div className="p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                onClick={() => fetchTrackData(selectedOrder.orderNumber)}
                disabled={loading}
                className="px-3.5 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-emerald-700' : ''}`} />
                <span>Refresh Live Status</span>
              </button>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:9118137285`}
                  className="px-3.5 py-2 bg-[#064e3b] hover:bg-[#047857] text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-300" />
                  <span>Call Rider (9118137285)</span>
                </a>

                <a
                  href={`https://wa.me/919118137285?text=${encodeURIComponent(`Namaste, inquiring about Order: ${selectedOrder.orderNumber}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <WhatsAppIcon className="w-3.5 h-3.5 text-emerald-300" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
