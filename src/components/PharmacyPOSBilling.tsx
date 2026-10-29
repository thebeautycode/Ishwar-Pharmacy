import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  Share2, 
  User, 
  Phone, 
  MapPin, 
  Stethoscope, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  X,
  FileText,
  Clock,
  Sparkles,
  DollarSign,
  Download,
  Copy,
  Check,
  Percent,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Medicine, RetailInvoice, InvoiceItem } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';

// WhatsApp icon SVG component
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface CartItemState {
  medicine: Medicine;
  unitType: 'strip' | 'piece'; // Full strip (पूरा पत्ता) vs loose piece (खुली गोली)
  piecesPerStrip: number;
  quantity: number;
  rate: number;
}

interface PharmacyPOSBillingProps {
  medicines: Medicine[];
  invoices: RetailInvoice[];
  onInvoiceCreated: (invoice: RetailInvoice) => void;
  onRefreshMedicines: () => void;
}

export const PharmacyPOSBilling: React.FC<PharmacyPOSBillingProps> = ({
  medicines,
  invoices,
  onInvoiceCreated,
  onRefreshMedicines,
}) => {
  // Active view: 'new_bill' | 'history'
  const [viewMode, setViewMode] = useState<'new_bill' | 'history'>('new_bill');

  // Customer / Patient Info
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [village, setVillage] = useState('Pachrukhiya');
  const [manualAddress, setManualAddress] = useState('');
  const [doctorName, setDoctorName] = useState('Self / OTC');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Udhar/Credit'>('Cash');
  const [billingNotes, setBillingNotes] = useState('');

  // Cart Items for Billing
  const [cartItems, setCartItems] = useState<CartItemState[]>([]);

  // Search & Selector
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [gstPercent, setGstPercent] = useState<number>(12); // Default standard medicine GST
  const [cashTendered, setCashTendered] = useState<string>('');

  // Submission & Feedback
  const [generating, setGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active Invoice for Modal View & Printing
  const [selectedInvoice, setSelectedInvoice] = useState<RetailInvoice | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Return / Refund Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnItem, setReturnItem] = useState<{
    invoiceId: string;
    medicineId: string;
    medicineName: string;
    maxQuantity: number;
    unitType: 'strip' | 'piece';
    quantity: number;
    reason: string;
  } | null>(null);
  const [returnProcessing, setReturnProcessing] = useState(false);

  // Helper to extract piece count from dosageForm (e.g. "Tablet (Strip of 10)" -> 10)
  const getPiecesCount = (dosageForm: string): number => {
    const match = dosageForm.match(/Strip of (\d+)/i) || dosageForm.match(/(\d+)\s*(strip|tablets?|capsules?|pieces?)/i);
    if (match && match[1]) {
      return parseInt(match[1], 10) || 10;
    }
    return 10;
  };

  // Filter medicines for quick add dropdown
  const filteredMedicines = medicines.filter(m => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase().trim();
    return (
      m.name.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.rackLocation.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.batchNumber.toLowerCase().includes(q)
    );
  }).slice(0, 10);

  const handleAddMedicine = (med: Medicine, defaultUnit: 'strip' | 'piece' = 'strip') => {
    if (med.stock <= 0) {
      alert(`${med.name} is currently OUT OF STOCK!`);
      return;
    }

    const pieces = getPiecesCount(med.dosageForm);
    const initialRate = defaultUnit === 'strip' ? med.price : Math.ceil(med.price / pieces);

    setCartItems(prev => {
      const existing = prev.find(item => item.medicine.id === med.id && item.unitType === defaultUnit);
      if (existing) {
        return prev.map(item =>
          item.medicine.id === med.id && item.unitType === defaultUnit
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, {
        medicine: med,
        unitType: defaultUnit,
        piecesPerStrip: pieces,
        quantity: 1,
        rate: initialRate
      }];
    });

    setSearchQuery('');
    setShowSearchDropdown(false);
  };

  const handleToggleUnitType = (medicineId: string, currentUnit: 'strip' | 'piece') => {
    const newUnit = currentUnit === 'strip' ? 'piece' : 'strip';
    setCartItems(prev => prev.map(item => {
      if (item.medicine.id === medicineId) {
        const rate = newUnit === 'piece' 
          ? Math.ceil(item.medicine.price / item.piecesPerStrip)
          : item.medicine.price;
        return {
          ...item,
          unitType: newUnit,
          rate,
          quantity: 1
        };
      }
      return item;
    }));
  };

  const handleUpdateQuantity = (medicineId: string, unitType: 'strip' | 'piece', qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(medicineId, unitType);
      return;
    }
    setCartItems(prev =>
      prev.map(item => 
        (item.medicine.id === medicineId && item.unitType === unitType) 
          ? { ...item, quantity: qty } 
          : item
      )
    );
  };

  const handleUpdateRate = (medicineId: string, unitType: 'strip' | 'piece', rate: number) => {
    setCartItems(prev =>
      prev.map(item => 
        (item.medicine.id === medicineId && item.unitType === unitType) 
          ? { ...item, rate: Math.max(0, rate) } 
          : item
      )
    );
  };

  const handleRemoveItem = (medicineId: string, unitType: 'strip' | 'piece') => {
    setCartItems(prev => prev.filter(item => !(item.medicine.id === medicineId && item.unitType === unitType)));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCustomerName('Walk-in Customer');
    setCustomerPhone('');
    setManualAddress('');
    setDoctorName('Self / OTC');
    setDiscountValue(0);
    setCashTendered('');
    setErrorMessage(null);
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.rate * item.quantity, 0);
  const discountAmount = discountType === 'flat' 
    ? Math.min(subtotal, Number(discountValue || 0))
    : Math.min(subtotal, (subtotal * Number(discountValue || 0)) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Number(((taxableAmount * gstPercent) / 100).toFixed(2));
  const cgstAmount = Number((taxAmount / 2).toFixed(2));
  const sgstAmount = Number((taxAmount / 2).toFixed(2));
  const grandTotal = Math.round(taxableAmount + taxAmount);

  const changeReturn = cashTendered ? Math.max(0, Number(cashTendered) - grandTotal) : 0;

  // Generate Bill handler
  const handleGenerateInvoice = async () => {
    if (cartItems.length === 0) {
      setErrorMessage('Please add at least one medicine item to generate a bill.');
      return;
    }

    setGenerating(true);
    setErrorMessage(null);

    try {
      const payload = {
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: customerPhone.trim() || 'N/A',
        doctorName: doctorName.trim() || 'Self / OTC',
        village,
        manualAddress: manualAddress.trim() || undefined,
        paymentMode,
        items: cartItems.map(item => ({
          medicineId: item.medicine.id,
          quantity: item.quantity,
          rate: item.rate,
          unitType: item.unitType,
          piecesPerStrip: item.piecesPerStrip
        })),
        discount: discountAmount,
        gstPercent,
        notes: billingNotes.trim() || undefined
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate invoice');
      }

      const newInvoice: RetailInvoice = await res.json();
      onInvoiceCreated(newInvoice);
      onRefreshMedicines();
      setSelectedInvoice(newInvoice);
      handleClearCart();
    } catch (err: any) {
      console.error('Invoice creation failed:', err);
      setErrorMessage(err.message || 'Could not generate bill. Please check medicine stock.');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Format WhatsApp Share text
  const getWhatsAppInvoiceShareText = (inv: RetailInvoice) => {
    const itemsList = inv.items.map((i, idx) => {
      const unitLabel = i.unitType === 'piece' ? 'गोली/Pieces' : 'पत्ता/Strip';
      return `${idx + 1}. *${i.name}* (${i.quantity} ${unitLabel}) @ ₹${i.rate} = ₹${i.amount}`;
    }).join('\n');

    const addressLine = inv.manualAddress ? `${inv.village}, ${inv.manualAddress}` : inv.village;

    const msg = `*ISHWAR PHARMACY & PHARMA CLINIC*\nGoraya Ghat Road, Pachrukhiya, Kanchanpur, UP\nDL No: UP-DEO-2024-00984 | GSTIN: 09AAECI1234F1Z5\nHelpline & WhatsApp: 9118137285\n--------------------------------\n*RETAIL MEDICAL MEMO / CASH BILL*\n*Bill No:* ${inv.invoiceNumber}\n*Date:* ${new Date(inv.createdAt).toLocaleString('en-IN')}\n*Customer:* ${inv.customerName} (${addressLine})\n*Doctor:* ${inv.doctorName || 'Self / OTC'}\n--------------------------------\n*MEDICINES:*\n${itemsList}\n--------------------------------\n*Subtotal:* ₹${inv.subtotal}\n*Discount:* ₹${inv.discount}\n*GST (${inv.gstPercent || 0}%):* ₹${inv.tax} (CGST: ₹${inv.cgstAmount || 0} + SGST: ₹${inv.sgstAmount || 0})\n*GRAND TOTAL:* ₹${inv.grandTotal}\n*Payment Mode:* ${inv.paymentMode}\n--------------------------------\nThank you for choosing Ishwar Pharmacy! Wishing you sound health.`;
    return encodeURIComponent(msg);
  };

  const handleNativeShare = async (inv: RetailInvoice) => {
    const text = decodeURIComponent(getWhatsAppInvoiceShareText(inv));
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Ishwar Pharmacy Bill ${inv.invoiceNumber}`,
          text: text,
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Open Return / Refund Dialog
  const handleInitiateReturn = (inv: RetailInvoice, item: InvoiceItem) => {
    setReturnItem({
      invoiceId: inv.id,
      medicineId: item.medicineId,
      medicineName: item.name,
      maxQuantity: item.quantity,
      unitType: item.unitType || 'strip',
      quantity: 1,
      reason: 'Doctor changed prescription'
    });
    setReturnModalOpen(true);
  };

  // Submit Medicine Return / Refund
  const handleConfirmReturn = async () => {
    if (!returnItem) return;
    setReturnProcessing(true);
    try {
      const res = await fetch(`/api/invoices/${returnItem.invoiceId}/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicineId: returnItem.medicineId,
          quantity: returnItem.quantity,
          unitType: returnItem.unitType,
          reason: returnItem.reason
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to process return');
      }

      const updatedInv: RetailInvoice = await res.json();
      setSelectedInvoice(updatedInv);
      onInvoiceCreated(updatedInv);
      onRefreshMedicines();
      setReturnModalOpen(false);
      setReturnItem(null);
      alert('दवा वापसी (Return) सफलतापूर्वक दर्ज हो गई है और स्टॉक अपडेट हो गया है!');
    } catch (err: any) {
      alert(err.message || 'Error processing return');
    } finally {
      setReturnProcessing(false);
    }
  };

  const filteredHistory = invoices.filter(inv => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      inv.customerPhone.toLowerCase().includes(q) ||
      inv.village.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 text-slate-800">
      
      {/* Sub Header / View Switcher */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('new_bill')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'new_bill'
                ? 'bg-[#064e3b] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4 text-amber-300" />
            <span>New Counter Bill (नया बिल)</span>
          </button>

          <button
            onClick={() => setViewMode('history')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'history'
                ? 'bg-[#064e3b] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>Bill History & Returns ({invoices.length})</span>
          </button>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pharmacist POS Counter
          </span>
          <span className="text-xs font-bold text-[#064e3b]">
            Goraya Ghat Road, Pachrukhiya · GST & Loose Pieces Enabled
          </span>
        </div>
      </div>

      {/* Main Billing Canvas */}
      {viewMode === 'new_bill' ? (
        <div className="flex-1 overflow-y-auto p-3 sm:p-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-7xl mx-auto">
            
            {/* Left Column: Customer details, Medicine Search & Cart Items (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Customer Info Card */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#064e3b]" />
                    <span>Customer & Prescription Details</span>
                  </h4>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Live Inventory Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Customer / Patient Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#047857] focus:outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Mobile Number (For WhatsApp Bill)
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="10-digit mobile"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#047857] focus:outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Village / Delivery Area
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={village}
                        onChange={(e) => setVillage(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#047857] focus:outline-none font-medium"
                      >
                        {STORE_CONFIG.villagesServed.map(v => (
                          <option key={v.name} value={v.name}>{v.name}</option>
                        ))}
                        <option value="Other / Out of Station">Other Village / Area</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Manual Address / Landmark (मकान सं., टोला, लैंडमार्क)
                    </label>
                    <input
                      type="text"
                      value={manualAddress}
                      onChange={(e) => setManualAddress(e.target.value)}
                      placeholder="e.g. Near Shiv Mandir, Ward No. 3"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#047857] focus:outline-none font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-bold text-slate-700 block mb-1">
                      Prescribed By / Doctor / Hospital
                    </label>
                    <div className="relative">
                      <Stethoscope className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        placeholder="e.g. Dr. R. K. Tiwari / Self OTC"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#047857] focus:outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Medicine Search & Quick Add with WORKING DROPDOWN */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3 relative">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-[#0f2942] flex items-center gap-1.5">
                    <Search className="w-4 h-4 text-[#064e3b]" />
                    <span>Search Inventory to Add Medicine</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {medicines.length} in stock
                  </span>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setShowSearchDropdown(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchDropdown(true);
                    }}
                    placeholder="Type brand name, generic molecule, rack location (e.g. Dolo, Azithral, Montair, A-01)..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#047857] focus:outline-none font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Instant Search Results Dropdown */}
                {showSearchDropdown && filteredMedicines.length > 0 && (
                  <div className="border-2 border-emerald-500 rounded-xl bg-white shadow-2xl divide-y divide-slate-100 max-h-64 overflow-y-auto z-20">
                    <div className="p-2 bg-emerald-50 text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                      <span>Click medicine to add (Full Strip or Loose Pieces)</span>
                      <button onClick={() => setShowSearchDropdown(false)} className="text-slate-500 hover:text-slate-800">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {filteredMedicines.map(med => {
                      const pieces = getPiecesCount(med.dosageForm);
                      const pieceRate = Math.ceil(med.price / pieces);
                      return (
                        <div
                          key={med.id}
                          className="p-3 hover:bg-emerald-50/70 transition-colors flex items-center justify-between gap-3 group"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#064e3b]">
                                {med.name}
                              </span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                                {med.rackLocation}
                              </span>
                              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded font-mono">
                                B:{med.batchNumber}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                              {med.genericName} · {med.dosageForm} · Exp: {med.expiryDate}
                            </div>
                            <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                              Patta: ₹{med.price} | प्रति गोली (Loose): ₹{pieceRate}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              med.stock > 10 ? 'bg-emerald-100 text-emerald-800' :
                              med.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {med.stock > 0 ? `${med.stock} strips` : 'Out of Stock'}
                            </span>

                            {med.stock > 0 && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleAddMedicine(med, 'strip')}
                                  className="px-2.5 py-1.5 bg-[#064e3b] hover:bg-[#047857] text-white text-[11px] font-bold rounded-lg shadow-sm"
                                  title="Add Full Strip / Pack"
                                >
                                  + पत्ता (Strip)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleAddMedicine(med, 'piece')}
                                  className="px-2 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg shadow-sm"
                                  title="Add Loose Tablets / Pieces"
                                >
                                  + गोली (Piece)
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Add Top Seller Chips */}
                {!searchQuery && (
                  <div className="pt-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Fast Counter Add:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {medicines.slice(0, 6).map(m => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => handleAddMedicine(m, 'strip')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-200"
                        >
                          <Plus className="w-3 h-3 text-[#064e3b]" />
                          <span>{m.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">₹{m.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Items in Current Bill */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 className="text-sm font-extrabold text-[#0f2942] flex items-center gap-2">
                    <span>Current Bill Items ({cartItems.length})</span>
                    <span className="text-[11px] font-normal text-slate-500">
                      (Full Strip or Loose Tablets)
                    </span>
                  </h4>
                  {cartItems.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearCart}
                      className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  )}
                </div>

                {cartItems.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 space-y-2">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs">No medicines added yet.</p>
                    <p className="text-[11px] text-slate-400">Search above or click quick-add buttons to start counter billing.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                          <th className="p-2.5">Medicine & Formula</th>
                          <th className="p-2.5">Unit Mode</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right">Unit Rate</th>
                          <th className="p-2.5 text-right">Total</th>
                          <th className="p-2.5 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {cartItems.map((item) => {
                          const isPiece = item.unitType === 'piece';
                          return (
                            <tr key={`${item.medicine.id}-${item.unitType}`} className="hover:bg-slate-50">
                              <td className="p-2.5">
                                <div className="font-bold text-slate-900">{item.medicine.name}</div>
                                <div className="text-[10px] text-slate-500">
                                  {item.medicine.genericName} · {item.medicine.rackLocation} · Exp: {item.medicine.expiryDate}
                                </div>
                              </td>

                              {/* Unit Mode Selector: Full Strip vs Loose Piece */}
                              <td className="p-2.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleUnitType(item.medicine.id, item.unitType)}
                                  className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all ${
                                    isPiece 
                                      ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  }`}
                                  title="Click to switch between Full Strip and Loose Pieces"
                                >
                                  <Layers className="w-3 h-3" />
                                  <span>{isPiece ? 'खुली गोली (Pieces)' : 'पूरा पत्ता (Strip)'}</span>
                                </button>
                                <span className="text-[9px] text-slate-400 block mt-0.5">
                                  {item.piecesPerStrip} tabs/strip
                                </span>
                              </td>

                              {/* Quantity controller */}
                              <td className="p-2.5 text-center">
                                <div className="inline-flex items-center border border-slate-300 rounded-lg bg-white shadow-2xs">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQuantity(item.medicine.id, item.unitType, item.quantity - 1)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={(e) => handleUpdateQuantity(item.medicine.id, item.unitType, parseInt(e.target.value) || 1)}
                                    className="w-12 text-center font-bold text-xs focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateQuantity(item.medicine.id, item.unitType, item.quantity + 1)}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-600"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>

                              {/* Unit Rate */}
                              <td className="p-2.5 text-right font-mono">
                                <input
                                  type="number"
                                  value={item.rate}
                                  onChange={(e) => handleUpdateRate(item.medicine.id, item.unitType, parseFloat(e.target.value) || 0)}
                                  className="w-16 text-right px-1.5 py-0.5 border border-slate-200 rounded font-bold text-xs"
                                />
                              </td>

                              {/* Total Amount */}
                              <td className="p-2.5 text-right font-mono font-extrabold text-[#064e3b]">
                                ₹{(item.rate * item.quantity).toFixed(2)}
                              </td>

                              {/* Remove */}
                              <td className="p-2.5 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.medicine.id, item.unitType)}
                                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Checkout, GST, Discounts & Generate Bill (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Payment Mode Selector */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#064e3b]" />
                  <span>Payment Mode (भुगतान का तरीका)</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                  {[
                    { id: 'Cash', label: 'Cash (नकद)' },
                    { id: 'UPI', label: 'UPI / QR Code' },
                    { id: 'Card', label: 'Debit / Card' },
                    { id: 'Udhar/Credit', label: 'Udhar (उधार)' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMode(m.id as any)}
                      className={`py-2.5 px-3 rounded-xl border text-center transition-all ${
                        paymentMode === m.id
                          ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* GST Option (0%, 5%, 12%, 18%) */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-[#064e3b]" />
                    <span>GST Tax Rate (जीएसटी विकल्प)</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-500">
                    GSTIN: 09AAECI1234F1Z5
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                  {[
                    { rate: 0, label: '0% Exempt' },
                    { rate: 5, label: '5% (Essential)' },
                    { rate: 12, label: '12% (Standard)' },
                    { rate: 18, label: '18% (Devices)' },
                  ].map(g => (
                    <button
                      key={g.rate}
                      type="button"
                      onClick={() => setGstPercent(g.rate)}
                      className={`py-2 px-2 rounded-xl border text-center text-[11px] transition-all ${
                        gstPercent === g.rate
                          ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>

                {gstPercent > 0 && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                    <div className="flex justify-between text-slate-600">
                      <span>CGST ({gstPercent / 2}%):</span>
                      <span className="font-mono font-bold">₹{cgstAmount}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SGST ({gstPercent / 2}%):</span>
                      <span className="font-mono font-bold">₹{sgstAmount}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 font-bold border-t border-slate-200 pt-1">
                      <span>Total GST ({gstPercent}%):</span>
                      <span className="font-mono">₹{taxAmount}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Discount & Calculations */}
              <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Bill Summary & Discount
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Subtotal ({cartItems.length} items):</span>
                    <span className="font-mono font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {/* Discount row */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                    <span className="text-slate-600">Discount:</span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value as any)}
                        className="p-1 bg-slate-50 border border-slate-200 rounded text-xs"
                      >
                        <option value="flat">₹ Flat</option>
                        <option value="percent">% Off</option>
                      </select>
                      <input
                        type="number"
                        min={0}
                        value={discountValue}
                        onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-right font-mono text-xs font-bold"
                      />
                    </div>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-medium">
                      <span>Discount Saved:</span>
                      <span className="font-mono font-bold">- ₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {gstPercent > 0 && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>GST Tax ({gstPercent}%):</span>
                      <span className="font-mono font-bold">+ ₹{taxAmount.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Grand total */}
                  <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-slate-900 block">Total Payable</span>
                      <span className="text-[10px] text-slate-400">Net Counter Bill (GST Incl.)</span>
                    </div>
                    <span className="text-2xl font-black text-[#064e3b] font-mono">
                      ₹{grandTotal}
                    </span>
                  </div>
                </div>

                {/* Cash Calculator */}
                {paymentMode === 'Cash' && grandTotal > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-2 bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-700">Cash Received (ग्राहक से प्राप्त):</label>
                      <input
                        type="number"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        placeholder={`₹${grandTotal}`}
                        className="w-24 px-2 py-1 bg-white border border-slate-300 rounded text-right font-mono text-xs font-bold focus:outline-none"
                      />
                    </div>
                    {Number(cashTendered) > 0 && (
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600">Change Return (वापस करें):</span>
                        <span className="font-mono text-emerald-700 text-sm">
                          ₹{changeReturn.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Billing Notes */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Remarks / Medical Instructions (Optional)
                </label>
                <textarea
                  rows={2}
                  value={billingNotes}
                  onChange={(e) => setBillingNotes(e.target.value)}
                  placeholder="e.g. Take 1 tablet after meals; Return strip if fever subsides."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#047857] focus:outline-none"
                />
              </div>

              {/* Error prompt */}
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGenerateInvoice}
                  disabled={generating || cartItems.length === 0}
                  className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                    cartItems.length > 0 && !generating
                      ? 'bg-[#064e3b] hover:bg-[#047857] text-white shadow-emerald-900/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Receipt className="w-5 h-5 text-amber-300" />
                  <span>{generating ? 'Printing & Deducting Stock...' : `Generate Cash Memo · ₹${grandTotal}`}</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Live inventory stock will be deducted instantly from Ishwar Pharmacy catalog.
                </p>
              </div>

            </div>

          </div>
        </div>
      ) : (
        /* History & Records View */
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-7xl mx-auto w-full">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search bill no, customer, phone or village..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing {filteredHistory.length} recorded counter bills
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 space-y-2">
              <Receipt className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-600">No invoices matched your search</p>
              <p className="text-xs">Counter bills generated will appear here with print, PDF and WhatsApp options.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {filteredHistory.map((inv) => (
                <div key={inv.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-[#064e3b]">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {inv.paymentMode}
                      </span>
                      {inv.status === 'returned' && (
                        <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                          Returned (वापस)
                        </span>
                      )}
                      {inv.status === 'partially_returned' && (
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                          Partially Returned
                        </span>
                      )}
                    </div>

                    <div className="text-sm font-bold text-slate-900">
                      {inv.customerName} {inv.customerPhone !== 'N/A' && `(${inv.customerPhone})`}
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{inv.village}</span>
                      <span>•</span>
                      <span>{new Date(inv.createdAt).toLocaleString('en-IN')}</span>
                      <span>•</span>
                      <span>{inv.items.length} medicines</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="text-right mr-3">
                      <div className="text-base font-black text-slate-900 font-mono">
                        ₹{inv.grandTotal}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Tax: ₹{inv.tax} | Disc: ₹{inv.discount}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#064e3b]" />
                      <span>View & Share</span>
                    </button>

                    <a
                      href={`https://wa.me/?text=${getWhatsAppInvoiceShareText(inv)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                      title="Share to WhatsApp"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-emerald-600" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Generated Bill / Receipt Modal with CUT (X) button, PDF print, and WhatsApp share */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 my-auto animate-in fade-in duration-200">
            
            {/* Top Modal Controls Bar with X (Cut) button */}
            <div className="p-3 bg-gradient-to-r from-[#071524] via-[#0f2942] to-[#064e3b] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold">Ishwar Pharmacy Bill · {selectedInvoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Print / PDF</span>
                </button>

                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 bg-rose-600/90 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                  title="Close Modal"
                >
                  <X className="w-4 h-4" />
                  <span>बंद करें (Cut)</span>
                </button>
              </div>
            </div>

            {/* Printable Receipt Canvas */}
            <div id="printable-bill" className="p-6 bg-white text-slate-900 font-sans space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Header */}
              <div className="text-center border-b border-dashed border-slate-300 pb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <img
                    src={STORE_CONFIG.logoUrl}
                    alt="Logo"
                    className="w-10 h-10 rounded-lg object-contain border border-amber-300"
                  />
                  <div>
                    <h2 className="text-lg font-black tracking-tight text-[#0f2942]">
                      Ishwar Pharmacy & Pharma Clinic
                    </h2>
                    <p className="text-[11px] text-[#064e3b] font-bold">
                      Drx. Babalu Singh (B.Sc, D Pharma) · Reg. Pharmacist on Duty
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  {STORE_CONFIG.address}
                </p>
                <div className="text-[10px] text-slate-500 flex justify-center gap-3 mt-1 font-mono">
                  <span>DL: UP-DEO-2024-00984</span>
                  <span>•</span>
                  <span>GSTIN: 09AAECI1234F1Z5</span>
                  <span>•</span>
                  <span>Helpline: 9118137285</span>
                </div>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-200 pb-3">
                <div>
                  <span className="text-slate-400 block">Bill No:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Date & Time:</span>
                  <span className="font-medium text-slate-900">{new Date(selectedInvoice.createdAt).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Customer Name:</span>
                  <span className="font-bold text-slate-900">{selectedInvoice.customerName}</span>
                  {selectedInvoice.manualAddress && (
                    <span className="text-[10px] text-slate-500 block">{selectedInvoice.manualAddress}</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Village / Contact:</span>
                  <span className="font-medium text-slate-900">{selectedInvoice.village} · {selectedInvoice.customerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Prescribed By:</span>
                  <span className="font-medium text-slate-900">{selectedInvoice.doctorName || 'Self / OTC'}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block">Payment Mode:</span>
                  <span className="font-bold text-emerald-800">{selectedInvoice.paymentMode}</span>
                </div>
              </div>

              {/* Medicines Table */}
              <div>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-600 font-bold text-[11px]">
                      <th className="py-1.5">Medicine</th>
                      <th className="py-1.5">Type</th>
                      <th className="py-1.5 text-center">Qty</th>
                      <th className="py-1.5 text-right">Rate</th>
                      <th className="py-1.5 text-right">Amount</th>
                      <th className="py-1.5 text-center print:hidden">Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {selectedInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2">
                          <div className="font-bold text-slate-900">{it.name}</div>
                          <div className="text-[9px] text-slate-400 font-mono">
                            Batch: {it.batchNumber} | Exp: {it.expiryDate}
                          </div>
                        </td>
                        <td className="py-2 text-[10px] text-slate-600">
                          {it.unitType === 'piece' ? 'गोली (Piece)' : 'पत्ता (Strip)'}
                        </td>
                        <td className="py-2 text-center font-bold">{it.quantity}</td>
                        <td className="py-2 text-right font-mono">₹{it.rate}</td>
                        <td className="py-2 text-right font-mono font-bold">₹{it.amount}</td>
                        <td className="py-2 text-center print:hidden">
                          <button
                            type="button"
                            onClick={() => handleInitiateReturn(selectedInvoice, it)}
                            className="p-1 rounded text-rose-600 hover:bg-rose-50 text-[10px] font-bold"
                            title="Return / Refund this medicine"
                          >
                            वापसी
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals & Tax Split */}
              <div className="border-t border-dashed border-slate-300 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{selectedInvoice.subtotal}</span>
                </div>
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount:</span>
                    <span className="font-mono">- ₹{selectedInvoice.discount}</span>
                  </div>
                )}
                {selectedInvoice.tax > 0 && (
                  <>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>CGST ({((selectedInvoice.gstPercent || 12) / 2)}%):</span>
                      <span className="font-mono">₹{selectedInvoice.cgstAmount || (selectedInvoice.tax / 2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px]">
                      <span>SGST ({((selectedInvoice.gstPercent || 12) / 2)}%):</span>
                      <span className="font-mono">₹{selectedInvoice.sgstAmount || (selectedInvoice.tax / 2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm font-black border-t-2 border-slate-900 pt-2 text-[#0f2942]">
                  <span>Grand Total (Net Payable):</span>
                  <span className="font-mono text-base text-[#064e3b]">₹{selectedInvoice.grandTotal}</span>
                </div>
              </div>

              {/* Returns record if any */}
              {selectedInvoice.returns && selectedInvoice.returns.length > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                    <span>Medicine Return / Credit Memo (दवा वापसी विवरण):</span>
                  </div>
                  {selectedInvoice.returns.map((ret, rIdx) => (
                    <div key={rIdx} className="text-[11px] flex justify-between">
                      <span>{ret.name} ({ret.quantityReturned} {ret.unitType}) - {ret.reason}</span>
                      <span className="font-bold text-rose-700">- ₹{ret.refundAmount}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer Note */}
              <div className="text-center text-[10px] text-slate-400 border-t border-slate-200 pt-3">
                <p>Thank you for trusting Ishwar Pharmacy & Pharma Clinic!</p>
                <p>For home delivery in nearby villages, call 9118137285.</p>
              </div>
            </div>

            {/* Bottom Sharing Action Bar */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={`https://wa.me/?text=${getWhatsAppInvoiceShareText(selectedInvoice)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 text-emerald-300" />
                  <span>WhatsApp Share</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleNativeShare(selectedInvoice)}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{copiedLink ? 'Copied!' : 'Share / Copy'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-[#064e3b] hover:bg-[#047857] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                  <span>Print Memo</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="px-3 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Return / Refund Modal */}
      {returnModalOpen && returnItem && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-rose-700 font-black text-sm">
                <RotateCcw className="w-4 h-4" />
                <span>Medicine Return / Refund (दवा वापसी)</span>
              </div>
              <button onClick={() => setReturnModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 block mb-1">Selected Medicine:</label>
                <span className="font-bold text-slate-900 text-sm">{returnItem.medicineName}</span>
                <span className="text-slate-500 block text-[11px]">
                  Sold in: {returnItem.unitType === 'piece' ? 'खुली गोली (Pieces)' : 'पूरा पत्ता (Strip)'}
                </span>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Quantity to Return (Max {returnItem.maxQuantity}):
                </label>
                <input
                  type="number"
                  min={1}
                  max={returnItem.maxQuantity}
                  value={returnItem.quantity}
                  onChange={(e) => setReturnItem({ ...returnItem, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Return Reason (वापसी का कारण):</label>
                <select
                  value={returnItem.reason}
                  onChange={(e) => setReturnItem({ ...returnItem, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="Doctor changed prescription">Doctor changed prescription (डॉक्टर ने दवा बदल दी)</option>
                  <option value="Leftover medicine after recovery">Leftover medicine after recovery (मरीज ठीक हो गया)</option>
                  <option value="Customer bought excess strips">Excess strips bought (अतिरिक्त पत्ता था)</option>
                  <option value="Wrong product selected">Wrong product selected (गलत दवा का चयन)</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px]">
                Upon confirmation, returned quantity will be automatically added back to real-time inventory stock.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                disabled={returnProcessing}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{returnProcessing ? 'Restocking...' : 'Confirm Return & Restock'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
