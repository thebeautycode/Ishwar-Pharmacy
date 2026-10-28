/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PharmacistProfileCard } from './components/PharmacistProfileCard';
import { MedicineCatalog } from './components/MedicineCatalog';
import { PrescriptionScanner } from './components/PrescriptionScanner';
import { DeliveryAreasMap } from './components/DeliveryAreasMap';
import { ClinicAppointments } from './components/ClinicAppointments';
import { ContactAndReviews } from './components/ContactAndReviews';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { AskPharmacistChat } from './components/AskPharmacistChat';
import { TrackOrder } from './components/TrackOrder';
import { SeasonalHealthTips } from './components/SeasonalHealthTips';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerOrdersModal } from './components/CustomerOrdersModal';
import { RecurringRefillModal } from './components/RecurringRefillModal';
import { PolicyModals, PolicyType } from './components/PolicyModals';
import { Footer } from './components/Footer';
import { Medicine, CartItem, Order, CustomerUser } from './types';
import { STORE_CONFIG } from './data/storeConfig';
import { Phone, MessageCircle, Sparkles, ShoppingBag } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string | undefined>(undefined);
  
  // Customer Authentication state
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('ishwar_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('ishwar_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Modals state
  const [cartOpen, setCartOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [customerOrdersModalOpen, setCustomerOrdersModalOpen] = useState(false);
  const [refillModalOpen, setRefillModalOpen] = useState(false);
  const [policyModalType, setPolicyModalType] = useState<PolicyType | null>(null);

  // Fetch medicines inventory from server
  const fetchMedicines = async () => {
    try {
      const res = await fetch('/api/medicines');
      if (res.ok) {
        const data = await res.json();
        setMedicines(data);
      }
    } catch (err) {
      console.error('Failed to load medicines:', err);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  // Save cart changes
  useEffect(() => {
    try {
      localStorage.setItem('ishwar_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Could not save cart:', e);
    }
  }, [cartItems]);

  const handleAddToCart = (medicine: Medicine, quantity: number) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.medicine.id === medicine.id);
      if (existing) {
        return prev.map((item) =>
          item.medicine.id === medicine.id
            ? { ...item, quantity: Math.min(medicine.stock, item.quantity + quantity) }
            : item
        );
      }
      return [...prev, { medicine, quantity }];
    });
  };

  const handleUpdateCartQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(medicineId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.medicine.id === medicineId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveCartItem = (medicineId: string) => {
    setCartItems((prev) => prev.filter((item) => item.medicine.id !== medicineId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleAddPrescriptionItemsToCart = (items: { medicine: Medicine; quantity: number }[]) => {
    items.forEach(({ medicine, quantity }) => {
      handleAddToCart(medicine, quantity);
    });
    setCartOpen(true);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-600 selection:text-white relative">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenChat={() => setChatOpen(true)}
        customerUser={customerUser}
        onOpenCustomerAuth={() => setAuthModalOpen(true)}
        onOpenCustomerOrders={() => {
          if (customerUser) {
            setCustomerOrdersModalOpen(true);
          } else {
            setAuthModalOpen(true);
          }
        }}
        onOpenRefillModal={() => setRefillModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            <Hero
              onSearchMedicines={(q) => {
                setSearchQuery(q);
                setActiveTab('medicines');
              }}
              onNavigate={setActiveTab}
              onOpenPrescriptionScanner={() => setActiveTab('scanner')}
              onOpenClinic={() => setActiveTab('clinic')}
              onOpenChat={() => setChatOpen(true)}
            />
            {/* Real Pharmacist & Store Front Card with user photo & drop shadow */}
            <PharmacistProfileCard
              onOpenChat={() => setChatOpen(true)}
              onOpenClinic={() => {
                setActiveTab('clinic');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenMedicines={() => {
                setActiveTab('medicines');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            {/* Cleaned Home Page Medicine Preview (4 products as requested) with 'View All' redirect button */}
            <MedicineCatalog
              medicines={medicines}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onAddToCart={handleAddToCart}
              onOpenPrescriptionScanner={() => setActiveTab('scanner')}
              isHomePagePreview={true}
              onViewAllMedicines={() => {
                setActiveTab('medicines');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            {/* Local Climate Seasonal Health Tips & Wellness Advice */}
            <SeasonalHealthTips
              onSearchMedicine={(medName) => {
                setSearchQuery(medName);
                setActiveTab('medicines');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <ClinicAppointments />
            <PrescriptionScanner
              onAddPrescriptionItemsToCart={handleAddPrescriptionItemsToCart}
              availableMedicines={medicines}
            />
            <ContactAndReviews />
          </>
        )}

        {activeTab === 'medicines' && (
          <MedicineCatalog
            medicines={medicines}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAddToCart={handleAddToCart}
            onOpenPrescriptionScanner={() => setActiveTab('scanner')}
            isHomePagePreview={false}
          />
        )}

        {/* Dedicated Track Order Status Component */}
        {activeTab === 'track-order' && (
          <TrackOrder
            initialOrderNumber={trackingOrderNumber}
            onNavigateHome={() => setActiveTab('home')}
            onNavigateMedicines={() => {
              setActiveTab('medicines');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Rapid Doorstep Coverage - Dedicated Multi-Page View */}
        {activeTab === 'delivery' && (
          <div className="animate-in fade-in duration-300">
            <div className="bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#0f2942] text-white py-12 px-4 text-center border-b border-[#c59b27]/30 shadow-md">
              <span className="inline-block text-xs font-bold text-amber-300 bg-[#c59b27]/20 border border-[#c59b27]/40 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                Direct Two-Wheeler Dispatch
              </span>
              <h1 className="text-3xl sm:text-5xl font-black font-serif tracking-tight">
                Rapid Doorstep Coverage
              </h1>
              <p className="text-slate-200 text-sm sm:text-base mt-2 max-w-2xl mx-auto font-medium">
                Fast two-wheeler medicine delivery across Pachrukhiya, Sidhawe, Kaulamundera, Bhagona Tola, Paraskhan, Sirwania & Tarkulwa in 15 to 35 minutes.
              </p>
            </div>
            <DeliveryAreasMap
              onSelectVillageForDelivery={() => setCartOpen(true)}
            />
            <div className="max-w-4xl mx-auto px-4 py-10 text-center">
              <button
                onClick={() => setCartOpen(true)}
                className="px-8 py-4 bg-gradient-to-r from-[#064e3b] to-[#047857] hover:from-[#047857] hover:to-[#059669] text-white font-extrabold text-base rounded-2xl shadow-xl transition-transform hover:scale-105 border border-[#c59b27]/40 inline-flex items-center gap-2"
              >
                <ShoppingBag className="w-5 h-5 text-amber-300" />
                <span>Open Delivery Cart & Checkout ({totalCartCount} items)</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'clinic' && (
          <ClinicAppointments />
        )}

        {activeTab === 'scanner' && (
          <PrescriptionScanner
            onAddPrescriptionItemsToCart={handleAddPrescriptionItemsToCart}
            availableMedicines={medicines}
          />
        )}

        {activeTab === 'contact' && (
          <ContactAndReviews />
        )}
      </main>

      {/* Footer with Legal Policies & Social Links */}
      <Footer
        onNavigate={setActiveTab}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenPolicyModal={(type) => setPolicyModalType(type)}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5 items-end">
        {/* Floating Cart Button (if items) */}
        {totalCartCount > 0 && (
          <button
            onClick={() => setCartOpen(true)}
            className="p-3.5 rounded-full bg-[#064e3b] hover:bg-[#047857] text-white shadow-xl flex items-center gap-2 group transition-all border border-[#c59b27]/40"
            title="View Cart"
          >
            <ShoppingBag className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-xs pr-1">
              {totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}
            </span>
          </button>
        )}

        {/* Floating Ask Pharmacist Chat - Vibrant Blue */}
        <button
          onClick={() => setChatOpen(true)}
          className="p-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-2xl flex items-center gap-2 transition-all hover:scale-105 ring-2 ring-blue-400/50"
          title="Ask Swasthya Saathi AI Pharmacist"
        >
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <span className="text-xs font-bold hidden sm:inline">Ask Pharmacist</span>
        </button>

        {/* WhatsApp Direct Call */}
        <a
          href={STORE_CONFIG.whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="p-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl flex items-center gap-2 transition-transform hover:scale-105"
          title="WhatsApp Ishwar Pharmacy"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-bold hidden sm:inline">9118137582</span>
        </a>
      </div>

      {/* Modals & Drawers */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        customerUser={customerUser}
        onSetCustomerUser={(user) => {
          setCustomerUser(user);
          if (user) {
            localStorage.setItem('ishwar_customer_user', JSON.stringify(user));
          } else {
            localStorage.removeItem('ishwar_customer_user');
          }
        }}
        onNavigateTrack={(orderNum) => {
          setTrackingOrderNumber(orderNum);
          setActiveTab('track-order');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenCustomerOrders={() => {
          if (customerUser) {
            setCustomerOrdersModalOpen(true);
          } else {
            setAuthModalOpen(true);
          }
        }}
        onOrderPlaced={(order) => {
          fetchMedicines(); // Refresh stock counts immediately
          if (order.customerName && order.customerPhone) {
            const user: CustomerUser = {
              name: order.customerName,
              phone: order.customerPhone,
              village: order.village,
            };
            setCustomerUser(user);
            localStorage.setItem('ishwar_customer_user', JSON.stringify(user));
          }
          setTrackingOrderNumber(order.orderNumber);
        }}
      />

      <AdminPanel
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onStockUpdated={fetchMedicines}
      />

      <AskPharmacistChat
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />

      {/* Customer Quick Login Modal */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        existingUser={customerUser}
        onLoginSuccess={(user) => {
          setCustomerUser(user);
          localStorage.setItem('ishwar_customer_user', JSON.stringify(user));
          setAuthModalOpen(false);
          setCustomerOrdersModalOpen(true);
        }}
      />

      {/* Customer Orders & Invoices History Modal */}
      {customerUser && (
        <CustomerOrdersModal
          isOpen={customerOrdersModalOpen}
          onClose={() => setCustomerOrdersModalOpen(false)}
          user={customerUser}
          onLogout={() => {
            setCustomerUser(null);
            localStorage.removeItem('ishwar_customer_user');
            setCustomerOrdersModalOpen(false);
          }}
          onTrackOrder={(orderNum) => {
            setTrackingOrderNumber(orderNum);
            setCustomerOrdersModalOpen(false);
            setActiveTab('track-order');
          }}
        />
      )}

      {/* Recurring Medicine Refill Modal */}
      <RecurringRefillModal
        isOpen={refillModalOpen}
        onClose={() => setRefillModalOpen(false)}
        medicines={medicines}
        currentUser={customerUser}
      />

      {/* Transparent Legal & Policy Modals */}
      <PolicyModals
        type={policyModalType}
        onClose={() => setPolicyModalType(null)}
        onOpenClinic={() => {
          setPolicyModalType(null);
          setActiveTab('clinic');
        }}
        onOpenMedicines={() => {
          setPolicyModalType(null);
          setActiveTab('medicines');
        }}
      />
    </div>
  );
}
