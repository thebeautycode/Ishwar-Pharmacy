import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Truck, 
  MapPin, 
  Phone, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Clock, 
  Sparkles, 
  MessageCircle, 
  ShieldCheck, 
  Printer, 
  ShoppingBag,
  Lock,
  Share2,
  FileText,
  Building2,
  Receipt
} from 'lucide-react';
import { CartItem, Medicine, Order, CustomerUser } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';
import { NotificationService } from '../utils/notifications';

// WhatsApp icon SVG component
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (medicineId: string, quantity: number) => void;
  onRemoveItem: (medicineId: string) => void;
  onClearCart: () => void;
  onOrderPlaced: (order: Order) => void;
  customerUser?: CustomerUser | null;
  onSetCustomerUser?: (user: CustomerUser | null) => void;
  onNavigateTrack?: (orderNum: string) => void;
  onOpenCustomerOrders?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
  customerUser,
  onSetCustomerUser,
  onNavigateTrack,
  onOpenCustomerOrders,
}) => {
  const [deliveryType, setDeliveryType] = useState<'home_delivery' | 'store_pickup'>('home_delivery');
  const [selectedVillage, setSelectedVillage] = useState(customerUser?.village || 'Pachrukhiya');
  const [address, setAddress] = useState(customerUser?.address || '');
  const [landmark, setLandmark] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'upi_on_delivery' | 'pay_at_clinic'>('cash_on_delivery');
  
  // Quick Account registration state if not logged in
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regVillage, setRegVillage] = useState('Pachrukhiya');
  const [regAddress, setRegAddress] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Sync state when customerUser changes
  useEffect(() => {
    if (customerUser) {
      if (customerUser.village) setSelectedVillage(customerUser.village);
      if (customerUser.address) setAddress(customerUser.address);
    }
  }, [customerUser]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0);
  const deliveryFee = 0; // Free community doorstep delivery
  const total = subtotal + deliveryFee;

  const hasRxMedicines = cartItems.some(i => i.medicine.requiresPrescription);

  // Handle Quick Account Creation & Login
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!regName.trim()) {
      setAuthError('कृपया अपना पूरा नाम दर्ज करें (Please enter your name)');
      return;
    }

    const clean = regPhone.replace(/\D/g, '');
    if (clean.length < 10) {
      setAuthError('कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें (10-digit mobile required)');
      return;
    }

    const newUser: CustomerUser = {
      id: `USR-${clean}`,
      name: regName.trim(),
      phone: clean,
      village: regVillage,
      address: regAddress.trim(),
    };

    if (onSetCustomerUser) {
      onSetCustomerUser(newUser);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerUser) {
      setErrorMessage('कृपया आर्डर करने के लिए पहले अपना नाम और मोबाइल नंबर से लॉगिन करें।');
      return;
    }

    if (deliveryType === 'home_delivery' && !address.trim()) {
      setErrorMessage('कृपया अपने मकान का पता या लैंडमार्क दर्ज करें ताकि डिलीवरी बॉय आसानी से पहुँच सके।');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customerName: customerUser.name.trim(),
        customerPhone: customerUser.phone.trim(),
        deliveryType,
        village: selectedVillage,
        address: deliveryType === 'home_delivery' ? address.trim() : 'Store Pickup at Ishwar Pharmacy Counter, Goraya Ghat Road',
        landmark: landmark.trim() || undefined,
        notes: deliveryNotes.trim() || undefined,
        items: cartItems.map(item => ({
          medicineId: item.medicine.id,
          quantity: item.quantity
        })),
        paymentMethod,
        prescriptionAttached: hasRxMedicines
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to place order');
      }

      const order: Order = await response.json();
      setPlacedOrder(order);
      onOrderPlaced(order);
      onClearCart();

      // Trigger browser notification
      NotificationService.notifyOrderStatus(order.orderNumber, 'placed', order.village);

    } catch (err: any) {
      console.error('Order submission failed:', err);
      setErrorMessage(err.message || 'Failed to submit order. Please check stock or call 9118137582.');
    } finally {
      setSubmitting(false);
    }
  };

  // Structured WhatsApp Bill Message
  const getWhatsAppBillMessage = (order: Order) => {
    const itemsList = order.items.map((i, idx) => 
      `${idx + 1}. *${i.name}* (${i.dosageForm})\n   मात्रा: ${i.quantity} | दर: ₹${i.price} = ₹${i.price * i.quantity}`
    ).join('\n');

    const trackUrl = `${window.location.origin}/?order=${order.orderNumber}`;

    const text = 
`🧾 *ईश्वर फार्मेसी & फार्मा क्लिनिक - मेडिकल बिल*
📍 पचरुखिया, कंचनपुर (गोरया घाट रोड)
👨‍⚕️ *Drx. Babalu Singh (B.Sc, D Pharma)*
📞 हेल्पलाइन: 9118137582 | DL: UP-894102
------------------------------------------
📋 *ऑर्डर नंबर*: *${order.orderNumber}*
📅 *दिनांक*: ${new Date(order.createdAt).toLocaleString('en-IN')}
👤 *ग्राहक*: ${order.customerName} (${order.customerPhone})
🏠 *डिलीवरी पता*: ${order.village}, ${order.address}
------------------------------------------
💊 *दवाइयों का विवरण*:
${itemsList}
------------------------------------------
💵 *कुल योग*: *₹${order.total}*
🚚 *डिलीवरी शुल्क*: ₹0 (फ्री होम डिलीवरी)
💳 *भुगतान*: ${order.paymentMethod === 'cash_on_delivery' ? 'कैश ऑन डिलीवरी (COD)' : 'UPI on Delivery'}
🛵 *स्थिति*: ऑर्डर प्राप्त हुआ (पैकिंग जारी)
------------------------------------------
🔗 *लाइव आर्डर ट्रैक करें*:
${trackUrl}

धन्यवाद! ईश्वर फार्मेसी आपके उत्तम स्वास्थ्य की कामना करता है।`;

    return encodeURIComponent(text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Top Header in deep Navy and Gold */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-[#071524] to-[#0f2942] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#064e3b] text-amber-300 border border-[#c59b27]/40 flex items-center justify-center font-bold shadow-xs">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white font-brand">
                {placedOrder ? 'Order Confirmation & Medical Bill' : 'Ishwar Pharmacy Delivery Cart'}
              </h3>
              <p className="text-xs text-amber-200/90 font-medium">
                {placedOrder ? `Receipt No: ${placedOrder.orderNumber}` : `${cartItems.length} items in cart · Doorstep Delivery`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* Order Success & Printable Bill View */}
          {placedOrder ? (
            <div className="space-y-6">
              
              {/* Success Badge */}
              <div className="text-center space-y-2 py-2">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <span className="inline-block text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  ऑर्डर सफलतापूर्वक बुक हुआ (Order Confirmed)
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Order ID: <span className="text-[#064e3b] font-mono">{placedOrder.orderNumber}</span>
                </h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  धन्यवाद, <strong className="text-slate-800">{placedOrder.customerName}</strong>! आपका बिल तैयार है। नीचे से बिल प्रिंट करें या व्हाट्सएप पर प्राप्त करें।
                </p>
              </div>

              {/* Printable Medical Invoice Card */}
              <div id="printable-bill-invoice" className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-md text-left space-y-4 text-xs sm:text-sm">
                
                {/* Store Header */}
                <div className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-[#0f2942] uppercase tracking-wide">
                    ISHWAR PHARMACY & PHARMA CLINIC
                  </h3>
                  <p className="text-[11px] text-slate-600 font-semibold">
                    Drx. Babalu Singh (B.Sc, D Pharma) · Reg. No: UP-894102 | GSTIN: 09AABCI8912P1Z0
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Goraya Ghat Road, Pachrukhiya, Kanchanpur, Deoria, UP · Helpline: +91 9118137582
                  </p>
                  <div className="inline-block text-[10px] font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-full uppercase mt-1">
                    TAX INVOICE / RETAIL CASH MEMO
                  </div>
                </div>

                {/* Bill Meta */}
                <div className="grid grid-cols-2 gap-2 text-xs border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-slate-500 block">Order Number:</span>
                    <strong className="text-slate-900 font-mono text-sm">{placedOrder.orderNumber}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Date & Time:</span>
                    <strong className="text-slate-900">{new Date(placedOrder.createdAt).toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Customer Name:</span>
                    <strong className="text-slate-900">{placedOrder.customerName}</strong>
                    <span className="block text-slate-500">{placedOrder.customerPhone}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Delivery Address:</span>
                    <strong className="text-slate-900">{placedOrder.village}</strong>
                    <span className="block text-slate-600 text-[11px] truncate max-w-xs">{placedOrder.address}</span>
                  </div>
                </div>

                {/* Items Table */}
                <div className="space-y-2">
                  <div className="grid grid-cols-12 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200 pb-1">
                    <span className="col-span-6">Medicine / Item</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Rate</span>
                    <span className="col-span-2 text-right">Amount</span>
                  </div>

                  {placedOrder.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-12 text-xs py-1.5 border-b border-slate-100 items-center">
                      <div className="col-span-6 pr-1">
                        <span className="font-bold text-slate-900 block truncate">{it.name}</span>
                        <span className="text-[10px] text-slate-500 block">{it.dosageForm}</span>
                      </div>
                      <span className="col-span-2 text-center font-semibold text-slate-700">{it.quantity}</span>
                      <span className="col-span-2 text-right font-mono text-slate-600">₹{it.price}</span>
                      <span className="col-span-2 text-right font-mono font-bold text-slate-900">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Calculation breakdown */}
                <div className="pt-2 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Medicines Subtotal:</span>
                    <span className="font-mono font-semibold">₹{placedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Doorstep Express Delivery ({placedOrder.village}):</span>
                    <span className="font-bold text-emerald-700">₹0 (FREE)</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t-2 border-slate-900">
                    <span>Total Amount Payable:</span>
                    <span className="font-mono text-base text-emerald-800 font-black">₹{placedOrder.total}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Payment Mode:</span>
                    <span className="font-bold text-slate-700">
                      {placedOrder.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery (COD)' : 'UPI on Delivery'}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Current Fulfillment:</span>
                    <span className="font-bold text-amber-700 uppercase bg-amber-50 px-2 py-0.5 rounded">
                      {placedOrder.status}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 text-center text-[10px] text-slate-400">
                  This is a computer-generated invoice from Ishwar Pharmacy. For return or questions call 9118137582.
                </div>
              </div>

              {/* Action Buttons: WhatsApp Share, Print PDF, Live Track */}
              <div className="space-y-3 pt-2">
                
                {/* 1. WhatsApp Share (wortshot par pdf/bill) */}
                <a
                  href={`https://wa.me/91${placedOrder.customerPhone}?text=${getWhatsAppBillMessage(placedOrder)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.01]"
                  title="Share Bill on WhatsApp"
                >
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                  <span>व्हाट्सएप पर बिल भेजें (Send Bill on WhatsApp)</span>
                </a>

                {/* 2. Print / Save PDF Bill */}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="w-full py-3 px-4 rounded-xl bg-[#0f2942] hover:bg-[#1a3a5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  <span>बिल प्रिंट करें / PDF डाउनलोड करें (Print Bill / Save PDF)</span>
                </button>

                {/* 3. Live Track Order & View History */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onNavigateTrack) onNavigateTrack(placedOrder.orderNumber);
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#064e3b] hover:bg-[#047857] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Truck className="w-4 h-4 text-amber-300" />
                    <span>लाइव ट्रैक करें</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenCustomerOrders) onOpenCustomerOrders();
                      onClose();
                    }}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
                  >
                    <Clock className="w-4 h-4 text-slate-600" />
                    <span>मेरी आर्डर हिस्ट्री</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-slate-500 hover:text-slate-800 font-semibold text-xs transition-colors text-center"
                >
                  दुकान पर वापस जाएं (Back to Store)
                </button>
              </div>

            </div>
          ) : cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800 font-brand">Your cart is currently empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Browse our real-time medicine stock on the catalog to add medicines for immediate delivery.
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-5 py-2.5 bg-[#064e3b] text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-600 transition-colors"
              >
                दवाइयां देखें (Browse Medicines)
              </button>
            </div>
          ) : (
            <>
              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Selected Medicines ({cartItems.length})
                  </h4>
                  <button
                    type="button"
                    onClick={onClearCart}
                    className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {cartItems.map(({ medicine, quantity }) => (
                    <div
                      key={medicine.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                          {medicine.name}
                        </h5>
                        <p className="text-[11px] text-slate-500 truncate">
                          {medicine.dosageForm} · Rack {medicine.rackLocation}
                        </p>
                        <span className="text-xs font-black text-[#064e3b] mt-1 block font-mono">
                          ₹{medicine.price} x {quantity} = ₹{medicine.price * quantity}
                        </span>
                      </div>

                      {/* Quantity buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex items-center border border-slate-300 rounded-lg bg-white px-1.5 py-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(medicine.id, quantity - 1)}
                            className="px-1 text-xs font-bold text-slate-600 hover:text-slate-900"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-800 min-w-[18px] text-center">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(medicine.id, quantity + 1)}
                            disabled={quantity >= medicine.stock}
                            className="px-1 text-xs font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(medicine.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* USER ACCOUNT GATE: User must login/create account before checkout */}
              {!customerUser ? (
                <div className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300/80 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-amber-950">
                        ऑर्डर करने के लिए अपना खाता बनाएं / लॉगिन करें
                      </h4>
                      <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
                        खाता बनाने के बाद ही आप आर्डर कर सकते हैं, जिससे आपका <strong>यूनिक आर्डर नंबर</strong> जनरेट होगा और आप अपनी <strong>पूरी आर्डर हिस्ट्री</strong> देख सकेंगे।
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateAccount} className="space-y-3 pt-1">
                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        आपका पूरा नाम (Full Name) *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="उदा. रमेश कुमार"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-800 block mb-1">
                        10-अंकों का मोबाइल नंबर (Mobile Number) *
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="9118137582"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-bold text-slate-800 block mb-1">
                          गाँव / इलाका (Village) *
                        </label>
                        <select
                          value={regVillage}
                          onChange={(e) => setRegVillage(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        >
                          {STORE_CONFIG.villagesServed.map(v => (
                            <option key={v.name} value={v.name}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-800 block mb-1">
                          मकान का पता / टोला (Address)
                        </label>
                        <input
                          type="text"
                          value={regAddress}
                          onChange={(e) => setRegAddress(e.target.value)}
                          placeholder="उदा. वार्ड 4, मंदिर के पास"
                          className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {authError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-[#064e3b] hover:bg-[#047857] text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 border border-[#c59b27]/40 transition-transform hover:scale-[1.01]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      <span>खाता बनाएं और आर्डर जारी रखें (Save & Proceed)</span>
                    </button>
                  </form>
                </div>
              ) : (
                /* Active Logged-in Customer Profile */
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#064e3b] text-white flex items-center justify-center font-black text-xs shadow-xs">
                      {customerUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900">{customerUser.name}</span>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full border border-emerald-300">
                          खाता सक्रिय ✓
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                        📱 {customerUser.phone} · 📍 {customerUser.village}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSetCustomerUser && onSetCustomerUser(null)}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline shrink-0"
                  >
                    खाता बदलें
                  </button>
                </div>
              )}

              {/* Checkout Form (Enabled when logged in) */}
              {customerUser && (
                <form onSubmit={handleSubmitOrder} className="space-y-4 pt-1">
                  
                  {/* Delivery Preference */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                      Delivery / Pickup Preference
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('home_delivery')}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                          deliveryType === 'home_delivery'
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-600'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <Truck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold block">Doorstep Delivery</span>
                          <span className="text-[10px] text-slate-500">Free to {selectedVillage}</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType('store_pickup')}
                        className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                          deliveryType === 'store_pickup'
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-bold ring-1 ring-emerald-600'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold block">Store Pickup</span>
                          <span className="text-[10px] text-slate-500">Goraya Ghat Road</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {deliveryType === 'home_delivery' && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Village / Destination *
                          </label>
                          <select
                            value={selectedVillage}
                            onChange={(e) => setSelectedVillage(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-800"
                          >
                            {STORE_CONFIG.villagesServed.map(v => (
                              <option key={v.name} value={v.name}>
                                {v.name} ({v.time})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-slate-700 block mb-1">
                            Landmark (पहचान)
                          </label>
                          <input
                            type="text"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            placeholder="स्कूल, मंदिर या अस्पताल के पास"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">
                          घर का पता / टोला (House & Street Details) *
                        </label>
                        <textarea
                          rows={2}
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="मकान नंबर, टोला या डिलीवरी बॉय के लिए रास्ता"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Payment Mode (भुगतान का तरीका)
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                        paymentMethod === 'cash_on_delivery' ? 'bg-emerald-50 border-emerald-600 font-bold text-emerald-900' : 'border-slate-200'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'cash_on_delivery'}
                          onChange={() => setPaymentMethod('cash_on_delivery')}
                          className="text-emerald-600"
                        />
                        <span>Cash on Delivery (COD)</span>
                      </label>

                      <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                        paymentMethod === 'upi_on_delivery' ? 'bg-emerald-50 border-emerald-600 font-bold text-emerald-900' : 'border-slate-200'
                      }`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'upi_on_delivery'}
                          onChange={() => setPaymentMethod('upi_on_delivery')}
                          className="text-emerald-600"
                        />
                        <span>UPI QR on Delivery</span>
                      </label>
                    </div>
                  </div>

                  {hasRxMedicines && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>
                        कार्ट में कुछ पर्चे वाली दवाइयां हैं। डिलीवरी पर फार्मासिस्ट या डिलीवरी बॉय आपका डॉक्टर पर्चा सत्यापित करेंगे।
                      </span>
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Summary & Place Order */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>दवाइयों का योग (Subtotal):</span>
                      <span className="font-mono font-semibold">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>डोरस्टेप डिलीवरी ({selectedVillage}):</span>
                      <span className="text-emerald-700 font-bold">₹0 (फ्री)</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-[#0f2942] pt-1 border-t border-slate-100">
                      <span>कुल राशि (Total):</span>
                      <span className="text-[#064e3b] font-mono font-black text-lg">₹{total}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full mt-3 py-3.5 px-4 rounded-xl bg-[#064e3b] hover:bg-[#047857] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 border border-[#c59b27]/40 transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {submitting ? (
                        <span>आर्डर बुक हो रहा है और स्टॉक रिज़र्व किया जा रहा है...</span>
                      ) : (
                        <>
                          <Truck className="w-5 h-5 text-amber-300" />
                          <span>आर्डर बुक करें और बिल प्राप्त करें (Confirm & Get Bill)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
};
