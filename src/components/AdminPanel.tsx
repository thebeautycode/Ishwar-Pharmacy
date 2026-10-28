import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  Package, 
  ShoppingBag, 
  Calendar, 
  BarChart3, 
  Mail, 
  Plus, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  DollarSign, 
  X,
  Search,
  MessageCircle,
  TrendingUp,
  FileText,
  Upload,
  Camera,
  Image as ImageIcon,
  RotateCw,
  Receipt,
  LogOut,
  ShieldAlert,
  Layers,
  ExternalLink
} from 'lucide-react';
import { Medicine, Order, Appointment, CustomerInquiry, SalesReport, RetailInvoice, CoverageLocation } from '../types';
import { NotificationService } from '../utils/notifications';
import { PharmacyPOSBilling } from './PharmacyPOSBilling';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStockUpdated: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  onStockUpdated,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState(false);

  const [activeTab, setActiveTab] = useState<'inventory' | 'expiry' | 'billing' | 'orders' | 'coverage' | 'appointments' | 'reports' | 'inquiries'>('inventory');

  // Data states
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [invoices, setInvoices] = useState<RetailInvoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [reports, setReports] = useState<SalesReport | null>(null);
  const [expiryReport, setExpiryReport] = useState<{
    expired: any[];
    critical: any[];
    warning: any[];
    good: any[];
    totalMonitored: number;
  } | null>(null);
  const [expiryFilter, setExpiryFilter] = useState<'all' | 'expired' | 'critical' | 'warning' | 'good'>('all');
  const [coverageLocations, setCoverageLocations] = useState<CoverageLocation[]>([]);
  const [newLocName, setNewLocName] = useState('');
  const [newLocDistance, setNewLocDistance] = useState('');
  const [newLocTime, setNewLocTime] = useState('');
  const [newLocFree, setNewLocFree] = useState(true);
  const [newLocDesc, setNewLocDesc] = useState('');
  const [loading, setLoading] = useState(false);

  // Inventory search & filter
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');

  // Modals
  const [addMedicineModal, setAddMedicineModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  // Form state for add/edit medicine
  const [medFormData, setMedFormData] = useState({
    name: '',
    genericName: '',
    category: 'Fever & Pain Relief',
    price: 30,
    mrp: 35,
    stock: 50,
    minThreshold: 15,
    dosageForm: 'Tablet (Strip of 10)',
    manufacturer: '',
    batchNumber: 'BATCH-2026',
    expiryDate: '2027-12',
    requiresPrescription: false,
    rackLocation: 'Rack A-01',
    description: '',
    usageInstructions: 'Take 1 tablet after meals as advised by physician.',
    composition: '',
    frontImage: '',
    backImage: ''
  });

  const frontFileInputRef = useRef<HTMLInputElement>(null);
  const backFileInputRef = useRef<HTMLInputElement>(null);

  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');

  // Fetch all admin data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [medRes, ordRes, aptRes, inqRes, repRes, invRes, expRes, covRes] = await Promise.all([
        fetch('/api/medicines'),
        fetch('/api/orders'),
        fetch('/api/appointments'),
        fetch('/api/inquiries'),
        fetch('/api/reports'),
        fetch('/api/invoices'),
        fetch('/api/inventory/expiry'),
        fetch('/api/coverage-locations')
      ]);

      if (medRes.ok) setMedicines(await medRes.json());
      if (ordRes.ok) setOrders(await ordRes.json());
      if (aptRes.ok) setAppointments(await aptRes.json());
      if (inqRes.ok) setInquiries(await inqRes.json());
      if (repRes.ok) setReports(await repRes.json());
      if (invRes && invRes.ok) setInvoices(await invRes.json());
      if (expRes && expRes.ok) setExpiryReport(await expRes.json());
      if (covRes && covRes.ok) setCoverageLocations(await covRes.json());
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchData();
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === '10072000') {
      setIsAuthenticated(true);
      setAuthError(false);
      fetchData();
    } else {
      setAuthError(true);
    }
  };

  const handleQuickStockUpdate = async (medicine: Medicine, delta: number) => {
    const newStock = Math.max(0, medicine.stock + delta);
    try {
      const res = await fetch(`/api/medicines/${medicine.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        setMedicines(prev => prev.map(m => m.id === medicine.id ? { ...m, stock: newStock } : m));
        onStockUpdated();
      }
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  // Image upload handler for front and back images
  const handleImageUpload = (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (side === 'front') {
        setMedFormData(prev => ({ ...prev, frontImage: base64 }));
      } else {
        setMedFormData(prev => ({ ...prev, backImage: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMedicine) {
        const res = await fetch(`/api/medicines/${editingMedicine.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(medFormData)
        });
        if (res.ok) {
          const updated = await res.json();
          setMedicines(prev => prev.map(m => m.id === updated.id ? updated : m));
        }
      } else {
        const res = await fetch('/api/medicines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(medFormData)
        });
        if (res.ok) {
          const created = await res.json();
          setMedicines(prev => [created, ...prev]);
        }
      }
      setAddMedicineModal(false);
      setEditingMedicine(null);
      onStockUpdated();
      fetchData();
    } catch (err) {
      console.error('Error saving medicine:', err);
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    try {
      const res = await fetch(`/api/medicines/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMedicines(prev => prev.filter(m => m.id !== id));
        onStockUpdated();
      }
    } catch (err) {
      console.error('Error deleting medicine:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        // Trigger browser push notification alert for order status change
        NotificationService.notifyOrderStatus(updated.orderNumber, status, updated.village);
        fetchData();
      }
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  const handleUpdateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a));
        if (status === 'confirmed') {
          NotificationService.notifyAppointmentReminder(updated.patientName, updated.timeSlot, updated.serviceType);
        }
      }
    } catch (err) {
      console.error('Failed to update appointment:', err);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocName.trim()) return;
    try {
      const res = await fetch('/api/coverage-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newLocName.trim(),
          distance: newLocDistance.trim() || '3-5 km',
          time: newLocTime.trim() || '20-30 mins',
          freeDelivery: newLocFree,
          description: newLocDesc.trim() || 'Direct doorstep delivery via Goraya Ghat Road'
        })
      });
      if (res.ok) {
        const added = await res.json();
        setCoverageLocations(prev => [...prev, added]);
        setNewLocName('');
        setNewLocDistance('');
        setNewLocTime('');
        setNewLocDesc('');
      }
    } catch (err) {
      console.error('Failed to add coverage location:', err);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this delivery route?')) return;
    try {
      const res = await fetch(`/api/coverage-locations/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCoverageLocations(prev => prev.filter(l => l.id !== id && l.name !== id));
      }
    } catch (err) {
      console.error('Failed to delete coverage location:', err);
    }
  };

  const filteredMedicines = medicines.filter(m => {
    const q = inventorySearch.toLowerCase();
    const matchesSearch = !q || m.name.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q) || m.rackLocation.toLowerCase().includes(q);
    if (inventoryFilter === 'low_stock') return matchesSearch && m.stock > 0 && m.stock <= m.minThreshold;
    if (inventoryFilter === 'out_of_stock') return matchesSearch && m.stock === 0;
    return matchesSearch;
  });

  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'all') return true;
    return o.status === orderStatusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-white flex flex-col overflow-hidden m-0 p-0 rounded-none">
      <div className="w-full h-full flex flex-col overflow-hidden bg-white">
        
        {/* Top Bar with Dark Navy & Gold Theme */}
        <div className="p-3 sm:p-4 bg-gradient-to-r from-[#071524] via-[#0f2942] to-[#064e3b] text-white flex items-center justify-between shrink-0 border-b border-[#c59b27]/30 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#064e3b] border border-[#c59b27]/50 flex items-center justify-center font-bold text-amber-300 shadow">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white font-brand">
                  Ishwar Pharmacy Admin Portal
                </h3>
                <span className="text-[10px] bg-[#c59b27]/20 text-amber-300 px-2 py-0.5 rounded-full border border-[#c59b27]/40 font-bold">
                  Full Display Control
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Goraya Ghat Road, Pachrukhiya, Kanchanpur · Store & Pharma Clinic
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Refresh Live Data"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-300' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAuthenticated(false);
                    setPasscode('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Admin Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>लॉगआउट (Logout)</span>
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Barrier Screen */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl max-w-sm w-full text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#064e3b] border border-[#c59b27]/40 flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0f2942]">Admin Verification</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter master security passcode to access stock management, upload medicine photos, and process orders.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-center text-sm font-mono focus:ring-2 focus:ring-[#047857] focus:outline-none"
                />

                {authError && (
                  <p className="text-xs text-rose-600 font-semibold">
                    Incorrect passcode. Please enter the authorized admin passcode.
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#064e3b] hover:bg-[#047857] text-white font-bold rounded-xl text-sm shadow transition-colors flex items-center justify-center gap-2"
                >
                  <Unlock className="w-4 h-4 text-amber-300" />
                  <span>Unlock Admin Portal</span>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Admin Navigation Tabs */}
            <div className="px-6 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`py-3.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'inventory'
                    ? 'border-[#064e3b] text-[#064e3b] bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Medicine Inventory & Photos ({medicines.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('expiry')}
                className={`py-3.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'expiry'
                    ? 'border-amber-600 text-amber-900 bg-white rounded-t-xl shadow-2xs font-extrabold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Expiry Dashboard (एक्सपायरी अलर्ट)</span>
              </button>

              <button
                onClick={() => setActiveTab('billing')}
                className={`py-3.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'billing'
                    ? 'border-[#064e3b] text-[#064e3b] bg-white rounded-t-xl shadow-2xs font-extrabold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>Counter Billing & POS (दवा बिलिंग)</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'orders'
                    ? 'border-[#064e3b] text-[#064e3b] bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Orders & Fulfillment ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('coverage')}
                className={`py-3.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'coverage'
                    ? 'border-[#064e3b] text-[#064e3b] bg-white rounded-t-xl shadow-2xs font-extrabold'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-700" />
                <span>Doorstep Coverage Routes ({coverageLocations.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-3.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'appointments'
                    ? 'border-[#064e3b] text-[#064e3b] bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Clinic Appointments ({appointments.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`py-3.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'reports'
                    ? 'border-[#064e3b] text-[#064e3b] bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Sales Reports & Village Stats</span>
              </button>

              <button
                onClick={() => setActiveTab('inquiries')}
                className={`py-3.5 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'inquiries'
                    ? 'border-[#064e3b] text-[#064e3b] bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Enquiries Inbox ({inquiries.length})</span>
              </button>
            </div>

            {/* Tab 1: Inventory Management with Dual Image Upload */}
            {activeTab === 'inventory' && (
              <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
                
                {/* Search & Actions Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={inventorySearch}
                      onChange={(e) => setInventorySearch(e.target.value)}
                      placeholder="Search stock, brand, rack location..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#047857] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setInventoryFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        inventoryFilter === 'all' ? 'bg-[#0f2942] text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      All ({medicines.length})
                    </button>
                    <button
                      onClick={() => setInventoryFilter('low_stock')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        inventoryFilter === 'low_stock' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      Low Stock
                    </button>
                    <button
                      onClick={() => setInventoryFilter('out_of_stock')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        inventoryFilter === 'out_of_stock' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      Out of Stock
                    </button>

                    <button
                      onClick={() => {
                        setEditingMedicine(null);
                        setMedFormData({
                          name: '',
                          genericName: '',
                          category: 'Fever & Pain Relief',
                          price: 30,
                          mrp: 35,
                          stock: 50,
                          minThreshold: 15,
                          dosageForm: 'Tablet (Strip of 10)',
                          manufacturer: '',
                          batchNumber: 'BATCH-2026',
                          expiryDate: '2027-12',
                          requiresPrescription: false,
                          rackLocation: 'Rack A-01',
                          description: '',
                          usageInstructions: 'Take 1 tablet after meals as advised by physician.',
                          composition: '',
                          frontImage: '',
                          backImage: ''
                        });
                        setAddMedicineModal(true);
                      }}
                      className="ml-auto px-4 py-2 bg-[#064e3b] hover:bg-[#047857] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4 text-amber-300" />
                      <span>Add Medicine with Photos</span>
                    </button>
                  </div>
                </div>

                {/* Table View */}
                <div className="flex-1 overflow-auto border border-slate-200 rounded-2xl bg-white shadow-2xs">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-200 z-10">
                      <tr>
                        <th className="py-3 px-3">Photo (Front / Back)</th>
                        <th className="py-3 px-4">Medicine Details</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Price / MRP</th>
                        <th className="py-3 px-3">Rack & Batch</th>
                        <th className="py-3 px-3">Stock Units</th>
                        <th className="py-3 px-3">Quick Stock Adjust</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMedicines.map((m) => {
                        const isLow = m.stock <= m.minThreshold && m.stock > 0;
                        const isOut = m.stock === 0;

                        return (
                          <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                            {/* Medicine Images Thumbnail preview */}
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-1.5">
                                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 relative" title="Front image">
                                  <img
                                    src={m.frontImage || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&auto=format&fit=crop&q=80'}
                                    alt="Front"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                {m.backImage ? (
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0" title="Back image">
                                    <img
                                      src={m.backImage}
                                      alt="Back"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <span className="text-[9px] text-slate-400 bg-slate-100 px-1 py-2 rounded text-center leading-none">
                                    No Back
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-extrabold text-[#0f2942] text-sm">{m.name}</div>
                              <div className="text-[11px] text-slate-500 font-medium">{m.genericName} · {m.dosageForm}</div>
                              {m.requiresPrescription && (
                                <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded border border-amber-200">
                                  Rx Required
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-slate-600 font-medium">
                              {m.category}
                            </td>

                            <td className="py-3 px-3">
                              <span className="font-black text-[#0f2942] text-sm">₹{m.price}</span>
                              <span className="text-[11px] text-slate-400 ml-1">MRP ₹{m.mrp}</span>
                            </td>

                            <td className="py-3 px-3">
                              <div className="font-mono text-[#064e3b] font-bold">{m.rackLocation}</div>
                              <div className="text-[10px] text-slate-400">Exp: {m.expiryDate}</div>
                            </td>

                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                                isOut ? 'bg-rose-100 text-rose-800' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {m.stock} units
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleQuickStockUpdate(m, -5)}
                                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 font-bold"
                                  title="Reduce 5"
                                >
                                  -5
                                </button>
                                <button
                                  onClick={() => handleQuickStockUpdate(m, 10)}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] rounded font-bold"
                                  title="Add 10"
                                >
                                  +10
                                </button>
                                <button
                                  onClick={() => handleQuickStockUpdate(m, 50)}
                                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] rounded font-bold"
                                  title="Add 50"
                                >
                                  +50
                                </button>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingMedicine(m);
                                    setMedFormData({
                                      name: m.name,
                                      genericName: m.genericName,
                                      category: m.category,
                                      price: m.price,
                                      mrp: m.mrp,
                                      stock: m.stock,
                                      minThreshold: m.minThreshold,
                                      dosageForm: m.dosageForm,
                                      manufacturer: m.manufacturer,
                                      batchNumber: m.batchNumber,
                                      expiryDate: m.expiryDate,
                                      requiresPrescription: m.requiresPrescription,
                                      rackLocation: m.rackLocation,
                                      description: m.description,
                                      usageInstructions: m.usageInstructions,
                                      composition: m.composition,
                                      frontImage: m.frontImage || '',
                                      backImage: m.backImage || ''
                                    });
                                    setAddMedicineModal(true);
                                  }}
                                  className="p-1.5 text-slate-600 hover:text-[#064e3b] hover:bg-slate-100 rounded-lg"
                                  title="Edit details & photos"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMedicine(m.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                  title="Delete item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* Tab: Expiry Dashboard */}
            {activeTab === 'expiry' && (
              <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-6 space-y-4">
                
                {/* Header with Title and Metrics */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div>
                    <h4 className="text-base font-black text-[#0f2942] flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span>Medicine Expiry Risk & Tracking Dashboard</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Real-time inventory expiry surveillance for Goraya Ghat Road, Pachrukhiya counter.
                    </p>
                  </div>

                  <button
                    onClick={fetchData}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
                    <span>Re-evaluate Expiry</span>
                  </button>
                </div>

                {/* 4 Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
                  <div 
                    onClick={() => setExpiryFilter(expiryFilter === 'expired' ? 'all' : 'expired')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      expiryFilter === 'expired' 
                        ? 'bg-rose-100 border-rose-400 ring-2 ring-rose-500' 
                        : 'bg-rose-50 border-rose-200 hover:bg-rose-100/70'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                      Expired (कालावधि समाप्त)
                    </span>
                    <h3 className="text-2xl font-black text-rose-950 mt-1">
                      {expiryReport?.expired.length || 0}
                    </h3>
                    <p className="text-[10px] text-rose-700 mt-0.5">Remove immediately from racks</p>
                  </div>

                  <div 
                    onClick={() => setExpiryFilter(expiryFilter === 'critical' ? 'all' : 'critical')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      expiryFilter === 'critical' 
                        ? 'bg-orange-100 border-orange-400 ring-2 ring-orange-500' 
                        : 'bg-orange-50 border-orange-200 hover:bg-orange-100/70'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider block">
                      Critical (&lt; 60 Days / 2 माह)
                    </span>
                    <h3 className="text-2xl font-black text-orange-950 mt-1">
                      {expiryReport?.critical.length || 0}
                    </h3>
                    <p className="text-[10px] text-orange-700 mt-0.5">Prioritize sales or vendor return</p>
                  </div>

                  <div 
                    onClick={() => setExpiryFilter(expiryFilter === 'warning' ? 'all' : 'warning')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      expiryFilter === 'warning' 
                        ? 'bg-amber-100 border-amber-400 ring-2 ring-amber-500' 
                        : 'bg-amber-50 border-amber-200 hover:bg-amber-100/70'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      Warning (60-180 Days / 6 माह)
                    </span>
                    <h3 className="text-2xl font-black text-amber-950 mt-1">
                      {expiryReport?.warning.length || 0}
                    </h3>
                    <p className="text-[10px] text-amber-700 mt-0.5">Watch stock burn rate</p>
                  </div>

                  <div 
                    onClick={() => setExpiryFilter(expiryFilter === 'good' ? 'all' : 'good')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      expiryFilter === 'good' 
                        ? 'bg-emerald-100 border-emerald-400 ring-2 ring-emerald-500' 
                        : 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                      Safe Stock (&gt; 6 Months)
                    </span>
                    <h3 className="text-2xl font-black text-emerald-950 mt-1">
                      {expiryReport?.good.length || 0}
                    </h3>
                    <p className="text-[10px] text-emerald-700 mt-0.5">Healthy shelf life</p>
                  </div>
                </div>

                {/* Expiry Items Table */}
                <div className="flex-1 overflow-auto bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-200 z-10">
                      <tr>
                        <th className="p-3">Medicine & Category</th>
                        <th className="p-3">Batch & Rack</th>
                        <th className="p-3">Expiry Date</th>
                        <th className="p-3">Shelf Life Status</th>
                        <th className="p-3 text-right">Current Stock</th>
                        <th className="p-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(() => {
                        let itemsToDisplay = medicines.map(m => {
                          const now = new Date();
                          const curYear = now.getFullYear();
                          const curMonth = now.getMonth() + 1;
                          const [expY, expM] = (m.expiryDate || '2027-12').split('-').map(Number);
                          const diffMonths = (expY - curYear) * 12 + (expM - curMonth);
                          const daysLeft = Math.round(diffMonths * 30.5);
                          let status: 'expired' | 'critical' | 'warning' | 'good' = 'good';
                          if (diffMonths <= 0) status = 'expired';
                          else if (diffMonths <= 2) status = 'critical';
                          else if (diffMonths <= 6) status = 'warning';
                          return { ...m, diffMonths, daysLeft, status };
                        });

                        if (expiryFilter !== 'all') {
                          itemsToDisplay = itemsToDisplay.filter(it => it.status === expiryFilter);
                        }

                        // Sort nearest expiry first
                        itemsToDisplay.sort((a, b) => a.diffMonths - b.diffMonths);

                        if (itemsToDisplay.length === 0) {
                          return (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-400">
                                No medicines match the selected expiry filter.
                              </td>
                            </tr>
                          );
                        }

                        return itemsToDisplay.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-slate-900">{m.name}</div>
                              <div className="text-[11px] text-slate-500">{m.genericName} · {m.category}</div>
                            </td>
                            <td className="p-3">
                              <span className="font-mono text-[11px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                B:{m.batchNumber}
                              </span>
                              <span className="text-[11px] text-slate-500 block mt-0.5 font-mono">
                                Loc: {m.rackLocation}
                              </span>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-800">
                              {m.expiryDate}
                            </td>
                            <td className="p-3">
                              {m.status === 'expired' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-2xs">
                                  Expired ({Math.abs(m.daysLeft)} days ago)
                                </span>
                              )}
                              {m.status === 'critical' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-500 text-white shadow-2xs">
                                  Critical: ~{m.daysLeft} days left
                                </span>
                              )}
                              {m.status === 'warning' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-200 text-amber-950">
                                  Expiring in ~{m.diffMonths} months
                                </span>
                              )}
                              {m.status === 'good' && (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                  Safe shelf life ({m.diffMonths}m+)
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right font-mono font-extrabold text-slate-900">
                              {m.stock} {m.dosageForm.toLowerCase().includes('syrup') ? 'bottles' : 'strips'}
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => {
                                  setEditingMedicine(m);
                                  setMedFormData({
                                    name: m.name,
                                    genericName: m.genericName,
                                    category: m.category,
                                    price: m.price,
                                    mrp: m.mrp,
                                    stock: m.stock,
                                    minThreshold: m.minThreshold,
                                    dosageForm: m.dosageForm,
                                    manufacturer: m.manufacturer,
                                    batchNumber: m.batchNumber,
                                    expiryDate: m.expiryDate,
                                    requiresPrescription: m.requiresPrescription,
                                    rackLocation: m.rackLocation,
                                    description: m.description,
                                    usageInstructions: m.usageInstructions,
                                    composition: m.composition,
                                    frontImage: m.frontImage || '',
                                    backImage: m.backImage || ''
                                  });
                                  setAddMedicineModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#064e3b] hover:text-white text-slate-700 text-xs font-bold transition-colors"
                              >
                                Edit / Clearance
                              </button>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* Tab: Medicine Counter Billing & POS */}
            {activeTab === 'billing' && (
              <PharmacyPOSBilling
                medicines={medicines}
                invoices={invoices}
                onInvoiceCreated={(newInv) => {
                  setInvoices(prev => [newInv, ...prev]);
                  fetchData();
                  onStockUpdated();
                }}
                onRefreshMedicines={() => {
                  fetchData();
                  onStockUpdated();
                }}
              />
            )}

            {/* Tab 2: Orders & Fulfillment */}
            {activeTab === 'orders' && (
              <div className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                    {['all', 'pending', 'packed', 'out_for_delivery', 'delivered', 'cancelled'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors ${
                          orderStatusFilter === st
                            ? 'bg-[#0f2942] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {st.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    Total: {filteredOrders.length} orders
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-[#0f2942]">
                              #{order.orderNumber}
                            </span>
                            <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                              order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'packed' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {order.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 mt-1">
                            {order.customerName} · <a href={`tel:${order.customerPhone}`} className="text-[#064e3b] font-bold hover:underline">{order.customerPhone}</a>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`https://wa.me/91${order.customerPhone}?text=Namaste%20${encodeURIComponent(order.customerName)},%20update%20regarding%20your%20Ishwar%20Pharmacy%20order%20${order.orderNumber}:%20Current%20status%20is%20${order.status}.`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#064e3b] hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 border border-emerald-200"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp Customer</span>
                          </a>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="font-bold text-slate-500 uppercase text-[10px] block">Items Ordered:</span>
                          {order.items.map((it, idx) => (
                            <div key={idx} className="flex justify-between text-slate-700 font-medium">
                              <span>• {it.name} (x{it.quantity})</span>
                              <span>₹{it.price * it.quantity}</span>
                            </div>
                          ))}
                          <div className="pt-1.5 border-t border-slate-100 flex justify-between font-black text-[#0f2942]">
                            <span>Total Bill:</span>
                            <span className="text-[#064e3b]">₹{order.total} ({order.paymentMethod})</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="font-bold text-slate-500 uppercase text-[10px] block">Delivery Details:</span>
                          <p className="text-slate-800 font-semibold">
                            Village: <span className="text-[#064e3b]">{order.village}</span> ({order.deliveryType})
                          </p>
                          <p className="text-slate-600">{order.address}</p>
                          {order.landmark && <p className="text-slate-500">Landmark: {order.landmark}</p>}
                          {order.notes && <p className="text-amber-800 italic">Notes: "{order.notes}"</p>}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-500">Update Status:</span>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'packed')}
                            className={`px-2.5 py-1 rounded text-xs font-bold ${
                              order.status === 'packed' ? 'bg-purple-700 text-white' : 'bg-slate-100 hover:bg-purple-50 text-slate-700'
                            }`}
                          >
                            Mark Packed
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')}
                            className={`px-2.5 py-1 rounded text-xs font-bold ${
                              order.status === 'out_for_delivery' ? 'bg-blue-700 text-white' : 'bg-slate-100 hover:bg-blue-50 text-slate-700'
                            }`}
                          >
                            Out for Delivery
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                            className={`px-2.5 py-1 rounded text-xs font-bold ${
                              order.status === 'delivered' ? 'bg-[#064e3b] text-white' : 'bg-slate-100 hover:bg-emerald-50 text-slate-700'
                            }`}
                          >
                            Delivered
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')}
                            className="px-2.5 py-1 rounded text-xs font-bold bg-slate-100 hover:bg-rose-50 text-rose-700"
                          >
                            Cancel & Restock
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Doorstep Coverage Routes */}
            {activeTab === 'coverage' && (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-black text-[#0f2942] flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#064e3b]" />
                      <span>Rapid Doorstep Coverage Routes ({coverageLocations.length})</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Manage villages and delivery locations served from Goraya Ghat Road counter.
                    </p>
                  </div>
                </div>

                {/* Add New Location Form */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-[#064e3b]" />
                    <span>Add New Village or Tola Route (नया गांव जोड़ें)</span>
                  </h5>

                  <form onSubmit={handleAddLocation} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Village Name *</label>
                      <input
                        type="text"
                        required
                        value={newLocName}
                        onChange={(e) => setNewLocName(e.target.value)}
                        placeholder="e.g. Baidauli Tola"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Distance from Store</label>
                      <input
                        type="text"
                        value={newLocDistance}
                        onChange={(e) => setNewLocDistance(e.target.value)}
                        placeholder="e.g. 3.5 km"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Est. Delivery Time</label>
                      <input
                        type="text"
                        value={newLocTime}
                        onChange={(e) => setNewLocTime(e.target.value)}
                        placeholder="e.g. 20-30 mins"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Route Info / Landmark</label>
                      <input
                        type="text"
                        value={newLocDesc}
                        onChange={(e) => setNewLocDesc(e.target.value)}
                        placeholder="e.g. Via Canal Road"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-[#064e3b] hover:bg-[#047857] text-white font-bold rounded-xl transition-all shadow-sm"
                      >
                        + Add Route
                      </button>
                    </div>
                  </form>
                </div>

                {/* Existing Coverage Villages Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {coverageLocations.map((loc) => (
                    <div
                      key={loc.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-2 relative group hover:border-[#064e3b] transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">{loc.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteLocation(loc.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove Location"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-slate-500 space-y-1">
                        <div>Distance: <strong className="text-slate-800">{loc.distance}</strong></div>
                        <div>ETA: <strong className="text-[#064e3b]">{loc.time}</strong></div>
                        <p className="text-[11px] text-slate-400">{loc.description}</p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Free Doorstep Delivery
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* Tab 3: Appointments */}
            {activeTab === 'appointments' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-[#0f2942]">Clinic Consultation Schedule</h4>
                  <span className="text-xs text-slate-500 font-medium">Goraya Ghat Road Clinic Counter</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-[#064e3b]">
                          {apt.appointmentNumber}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          apt.status === 'completed' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <div>
                        <h5 className="font-extrabold text-[#0f2942] text-sm">{apt.patientName}</h5>
                        <p className="text-xs text-slate-500 font-medium">
                          {apt.patientAge} yrs, {apt.patientGender} · Village: {apt.village}
                        </p>
                        <p className="text-xs text-[#064e3b] font-semibold">{apt.patientPhone}</p>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-xl text-xs space-y-1">
                        <div className="font-bold text-slate-800">{apt.serviceType}</div>
                        <div className="text-slate-500">{apt.appointmentDate} at {apt.timeSlot}</div>
                        {apt.symptoms && (
                          <div className="text-slate-600 italic">"{apt.symptoms}"</div>
                        )}
                      </div>

                      <div className="pt-2 flex gap-2">
                        <button
                          onClick={() => handleUpdateAppointmentStatus(apt.id, 'completed')}
                          className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#064e3b] rounded-lg text-xs font-bold"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleUpdateAppointmentStatus(apt.id, 'cancelled')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-bold"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Sales Reports & Analytics */}
            {activeTab === 'reports' && reports && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                      Total Revenue
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                      ₹{reports.totalRevenue}
                    </h3>
                    <p className="text-[11px] text-emerald-700 mt-1">Fulfilled customer orders</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                      Total Orders
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-blue-950 mt-1">
                      {reports.totalOrders}
                    </h3>
                    <p className="text-[11px] text-blue-700 mt-1">{reports.deliveredOrders} delivered, {reports.pendingOrders} pending</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200">
                    <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                      Total SKU Stock
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
                      {reports.totalMedicines}
                    </h3>
                    <p className="text-[11px] text-amber-700 mt-1">Active pharmaceutical items</p>
                  </div>

                  <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider block">
                      Low Stock Alerts
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-rose-950 mt-1">
                      {reports.lowStockCount}
                    </h3>
                    <p className="text-[11px] text-rose-700 mt-1">Items below threshold</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <h4 className="font-black text-[#0f2942] text-sm flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#064e3b]" />
                      <span>Top Selling Medicines</span>
                    </h4>

                    <div className="space-y-2.5">
                      {reports.topSellingMedicines.map((med, i) => (
                        <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                          <div>
                            <span className="font-bold text-slate-800">{med.name}</span>
                            <span className="text-[11px] text-slate-400 block">{med.quantity} packs sold</span>
                          </div>
                          <span className="font-extrabold text-[#064e3b]">₹{med.revenue}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                    <h4 className="font-black text-[#0f2942] text-sm flex items-center gap-2">
                      <Truck className="w-4 h-4 text-teal-700" />
                      <span>Village Order Distribution</span>
                    </h4>

                    <div className="space-y-2">
                      {Object.entries(reports.villageOrders).map(([vil, count]) => (
                        <div key={vil} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                          <span className="font-bold text-slate-800">{vil}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#064e3b] font-extrabold text-[11px]">
                            {count} orders
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Enquiries Inbox */}
            {activeTab === 'inquiries' && (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <h4 className="text-base font-extrabold text-[#0f2942]">Customer Enquiries & Feedback</h4>
                
                <div className="space-y-3">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-extrabold text-[#0f2942] text-sm">{inq.subject}</h5>
                          <p className="text-xs text-slate-500">
                            From: <strong className="text-slate-800">{inq.name}</strong> ({inq.phone}) · Village: {inq.village || 'N/A'}
                          </p>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                          {inq.type}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl leading-relaxed">
                        "{inq.message}"
                      </p>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <span>{new Date(inq.createdAt).toLocaleString()}</span>
                        <a
                          href={`tel:${inq.phone}`}
                          className="px-3 py-1 bg-emerald-50 text-[#064e3b] rounded-lg font-bold hover:bg-emerald-100"
                        >
                          Call Customer
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Add / Edit Medicine Modal with Dual Front & Back Image Upload */}
      {addMedicineModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-[#071524]/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-lg font-black text-[#0f2942]">
                  {editingMedicine ? 'Edit Medicine & Photos' : 'Add New Medicine to Store Inventory'}
                </h4>
                <p className="text-xs text-slate-500">
                  Upload both Front (packaging) and Back (composition/expiry) images for complete customer verification.
                </p>
              </div>
              <button
                onClick={() => setAddMedicineModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMedicine} className="space-y-4 text-xs">
              
              {/* Dual Image Upload Section (Front & Back) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-xs block uppercase tracking-wide flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#064e3b]" />
                  <span>Medicine Images (Front Pack & Back Foil/Label)</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Front Image Upload Box */}
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-700 block">
                      1. Front Packaging Image *
                    </label>
                    <div className="h-36 rounded-xl border-2 border-dashed border-slate-300 bg-white relative flex flex-col items-center justify-center p-2 overflow-hidden group">
                      {medFormData.frontImage ? (
                        <>
                          <img
                            src={medFormData.frontImage}
                            alt="Front preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setMedFormData(prev => ({ ...prev, frontImage: '' }))}
                            className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700"
                            title="Remove front image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center space-y-1.5">
                          <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                          <span className="text-[11px] text-slate-500 font-medium block">
                            Upload Front Pack Photo
                          </span>
                          <button
                            type="button"
                            onClick={() => frontFileInputRef.current?.click()}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px]"
                          >
                            Choose File
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={frontFileInputRef}
                        onChange={(e) => handleImageUpload('front', e)}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <input
                      type="text"
                      value={medFormData.frontImage}
                      onChange={(e) => setMedFormData({ ...medFormData, frontImage: e.target.value })}
                      placeholder="Or paste front image URL..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px]"
                    />
                  </div>

                  {/* Back Image Upload Box */}
                  <div className="space-y-2">
                    <label className="font-semibold text-slate-700 block">
                      2. Back Foil / Composition Image (Optional)
                    </label>
                    <div className="h-36 rounded-xl border-2 border-dashed border-slate-300 bg-white relative flex flex-col items-center justify-center p-2 overflow-hidden group">
                      {medFormData.backImage ? (
                        <>
                          <img
                            src={medFormData.backImage}
                            alt="Back preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => setMedFormData(prev => ({ ...prev, backImage: '' }))}
                            className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700"
                            title="Remove back image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <div className="text-center space-y-1.5">
                          <RotateCw className="w-6 h-6 text-slate-400 mx-auto" />
                          <span className="text-[11px] text-slate-500 font-medium block">
                            Upload Back Foil / Salt Photo
                          </span>
                          <button
                            type="button"
                            onClick={() => backFileInputRef.current?.click()}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px]"
                          >
                            Choose File
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={backFileInputRef}
                        onChange={(e) => handleImageUpload('back', e)}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                    <input
                      type="text"
                      value={medFormData.backImage}
                      onChange={(e) => setMedFormData({ ...medFormData, backImage: e.target.value })}
                      placeholder="Or paste back image URL..."
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Medicine Brand & Salt info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={medFormData.name}
                    onChange={(e) => setMedFormData({ ...medFormData, name: e.target.value })}
                    placeholder="e.g. Dolo 650 Tablet"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Generic Molecule Name *</label>
                  <input
                    type="text"
                    required
                    value={medFormData.genericName}
                    onChange={(e) => setMedFormData({ ...medFormData, genericName: e.target.value })}
                    placeholder="e.g. Paracetamol 650mg"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={medFormData.category}
                    onChange={(e) => setMedFormData({ ...medFormData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="Fever & Pain Relief">Fever & Pain Relief</option>
                    <option value="Antibiotics & Infections">Antibiotics & Infections</option>
                    <option value="Gastro & Acidity">Gastro & Acidity</option>
                    <option value="Allergy, Cold & Cough">Allergy, Cold & Cough</option>
                    <option value="Cardiac & Blood Pressure">Cardiac & Blood Pressure</option>
                    <option value="Diabetes Care">Diabetes Care</option>
                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                    <option value="First Aid & Wound Care">First Aid & Wound Care</option>
                    <option value="Medical Devices & Testing">Medical Devices & Testing</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Packaging / Form</label>
                  <input
                    type="text"
                    value={medFormData.dosageForm}
                    onChange={(e) => setMedFormData({ ...medFormData, dosageForm: e.target.value })}
                    placeholder="e.g. Strip of 15 tabs"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={medFormData.manufacturer}
                    onChange={(e) => setMedFormData({ ...medFormData, manufacturer: e.target.value })}
                    placeholder="e.g. Micro Labs Ltd"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              {/* Pricing & Stock counts */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Our Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={medFormData.price}
                    onChange={(e) => setMedFormData({ ...medFormData, price: Number(e.target.value) })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={medFormData.mrp}
                    onChange={(e) => setMedFormData({ ...medFormData, mrp: Number(e.target.value) })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={medFormData.stock}
                    onChange={(e) => setMedFormData({ ...medFormData, stock: Number(e.target.value) })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={medFormData.minThreshold}
                    onChange={(e) => setMedFormData({ ...medFormData, minThreshold: Number(e.target.value) })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Rack Location</label>
                  <input
                    type="text"
                    value={medFormData.rackLocation}
                    onChange={(e) => setMedFormData({ ...medFormData, rackLocation: e.target.value })}
                    placeholder="Rack A-01"
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={medFormData.batchNumber}
                    onChange={(e) => setMedFormData({ ...medFormData, batchNumber: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={medFormData.expiryDate}
                    onChange={(e) => setMedFormData({ ...medFormData, expiryDate: e.target.value })}
                    placeholder="2027-12"
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={medFormData.requiresPrescription}
                    onChange={(e) => setMedFormData({ ...medFormData, requiresPrescription: e.target.checked })}
                    className="rounded text-[#064e3b]"
                  />
                  <span>Requires Doctor Prescription (Schedule H / Rx)</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddMedicineModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#047857] text-white font-bold shadow"
                >
                  Save Medicine & Images
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
