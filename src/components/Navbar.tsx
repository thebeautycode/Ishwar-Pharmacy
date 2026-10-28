import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Clock, 
  MapPin, 
  ShoppingBag, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Stethoscope, 
  Truck, 
  Lock,
  Bell,
  BellRing,
  User,
  RotateCcw
} from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';
import { NotificationService } from '../utils/notifications';
import { CustomerUser } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenChat: () => void;
  customerUser?: CustomerUser | null;
  onOpenCustomerAuth?: () => void;
  onOpenCustomerOrders?: () => void;
  onOpenRefillModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  onOpenAdmin,
  onOpenChat,
  customerUser,
  onOpenCustomerAuth,
  onOpenCustomerOrders,
  onOpenRefillModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  useEffect(() => {
    if (NotificationService.isSupported()) {
      setHasNotificationPermission(Notification.permission === 'granted');
    }
  }, []);

  const handleToggleNotifications = async () => {
    const granted = await NotificationService.requestPermission();
    setHasNotificationPermission(granted);
    if (granted) {
      new Notification("Ishwar Pharmacy Alerts Enabled", {
        body: "You will receive real-time updates when your medicine order is packed or out for delivery, and for clinic reminders.",
        icon: STORE_CONFIG.logoUrl
      });
    }
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'medicines', label: 'Medicines' },
    { id: 'track-order', label: 'Track Order' },
    { id: 'delivery', label: 'Doorstep Delivery' },
    { id: 'clinic', label: 'Clinic' },
    { id: 'scanner', label: 'Rx Scanner' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200">
      
      {/* Top announcement bar in deep Navy & Dark Green with Gold accents - Hidden on mobile, shown on md+ desktop */}
      <div className="hidden md:block bg-gradient-to-r from-[#071524] via-[#0f2942] to-[#064e3b] text-white text-xs py-2 px-3 sm:px-6 border-b border-[#c59b27]/30">
        <div className="w-full max-w-[1440px] mx-auto flex items-center justify-between gap-3">
          
          {/* Left: Operating hours & Free Delivery Villages */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs min-w-0">
            <span className="inline-flex items-center gap-1.5 font-bold text-amber-300 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {STORE_CONFIG.hours}
            </span>
            <span className="hidden lg:inline text-slate-500">|</span>
            <span className="hidden lg:inline-flex items-center gap-1 text-slate-200 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Goraya Ghat Road, Pachrukhiya
            </span>
            <span className="hidden xl:inline text-slate-500">|</span>
            <span className="text-emerald-200 font-semibold text-[11px] sm:text-xs truncate">
              Free Delivery: Sidhawe, Kaulamundera, Tarkulwa, Paraskhan & nearby
            </span>
          </div>

          {/* Right: Phone, User Profile & Admin - clearly separated without collision */}
          <div className="flex items-center gap-2 text-xs font-medium shrink-0">
            <a
              href={`tel:${STORE_CONFIG.phone}`}
              className="flex items-center gap-1.5 bg-[#064e3b] hover:bg-[#047857] border border-[#c59b27]/50 px-2.5 sm:px-3 py-1 rounded-full text-white font-bold transition-colors shadow-2xs whitespace-nowrap"
            >
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>Call: {STORE_CONFIG.phone}</span>
            </a>

            {customerUser ? (
              <button
                onClick={onOpenCustomerOrders}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-emerald-300 rounded-full flex items-center gap-1 transition-colors font-bold text-xs border border-emerald-400/30 whitespace-nowrap"
                title="My Orders & Bills"
              >
                <User className="w-3 h-3 text-amber-300" />
                <span>{customerUser.name.split(' ')[0]} (Orders)</span>
              </button>
            ) : (
              <button
                onClick={onOpenCustomerAuth}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-slate-200 rounded-full flex items-center gap-1 transition-colors text-xs whitespace-nowrap"
              >
                <User className="w-3 h-3 text-amber-300" />
                <span>Login</span>
              </button>
            )}

            <button
              onClick={onOpenAdmin}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 transition-colors border border-slate-700 text-xs whitespace-nowrap"
              title="Admin Security Portal"
            >
              <Lock className="w-3 h-3 text-[#c59b27]" />
              <span>Admin</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main navigation - Slim white header on mobile */}
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & Store Identity */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2 sm:gap-3 text-left group focus:outline-none shrink-0"
          >
            <div className="relative shrink-0">
              <img
                src={STORE_CONFIG.logoUrl}
                alt="Ishwar Pharmacy Logo"
                className="w-10 h-10 sm:w-13 sm:h-13 rounded-xl object-contain shadow-xs border border-[#c59b27]/30 p-0.5 bg-white transition-transform group-hover:scale-105"
              />
            </div>
            <div className="shrink-0">
              <div className="flex items-center">
                <span className="text-sm sm:text-xl xl:text-2xl font-black tracking-tight text-[#0f2942] font-brand whitespace-nowrap">
                  Ishwar <span className="text-[#064e3b]">Pharmacy</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wide whitespace-nowrap leading-tight">
                Pachrukhiya, Kanchanpur
              </p>
            </div>
          </button>

          {/* Desktop & Laptop Navigation Links - Perfectly spaced, NO overlap */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 justify-center mx-2 xl:mx-4">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === link.id
                    ? 'bg-[#064e3b] text-white shadow-sm ring-1 ring-[#c59b27]/40'
                    : 'text-[#0f2942] hover:text-[#064e3b] hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Browser Push Notification Bell Trigger */}
            <button
              onClick={handleToggleNotifications}
              className={`p-2 rounded-xl border transition-all shrink-0 ${
                hasNotificationPermission
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
              title={
                hasNotificationPermission
                  ? 'Push notifications active: You will receive order status alerts'
                  : 'Enable order & appointment push notification alerts'
              }
            >
              {hasNotificationPermission ? (
                <BellRing className="w-4 h-4 text-emerald-600 animate-bounce" />
              ) : (
                <Bell className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2 sm:px-3.5 sm:py-1.5 rounded-xl bg-[#0f2942] text-white hover:bg-[#071524] transition-colors flex items-center gap-1.5 shadow-sm border border-[#c59b27]/40 shrink-0"
              title="View Cart & Checkout"
            >
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline text-xs sm:text-sm font-bold">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 sm:static sm:top-auto sm:right-auto bg-[#047857] text-white text-xs font-black rounded-full px-1.5 py-0.2 min-w-[18px] text-center shadow">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle: ONLY on screens below lg (mobile and small tablets) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 shrink-0"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu - Hidden on lg+ screens */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
          
          {/* 1. User Profile or Login Button inside Menu */}
          {customerUser ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#064e3b] text-white flex items-center justify-center font-black text-xs">
                  {customerUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900">{customerUser.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium">📱 {customerUser.phone} · 📍 {customerUser.village}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (onOpenCustomerOrders) onOpenCustomerOrders();
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-1.5 bg-[#064e3b] text-white text-xs font-bold rounded-xl shadow-xs"
              >
                My Orders
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                if (onOpenCustomerAuth) onOpenCustomerAuth();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-50 text-emerald-950 font-black border border-emerald-300 text-sm shadow-xs"
            >
              <User className="w-4 h-4 text-emerald-700" />
              <span>Login / Create Account (खाता बनाएं / लॉगिन)</span>
            </button>
          )}

          {/* 2. Direct Call Action inside Menu */}
          <a
            href={`tel:${STORE_CONFIG.phone}`}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#064e3b] hover:bg-[#047857] text-white font-black text-sm shadow-md transition-colors border border-[#c59b27]/40"
          >
            <Phone className="w-4 h-4 text-amber-300" />
            <span>Call: {STORE_CONFIG.phone}</span>
          </a>

          {/* 3. Operating Hours & Free Delivery Villages info card inside Menu */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-[#0f2942] to-[#071524] text-white rounded-2xl border border-[#c59b27]/40 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>Open Daily · Closes 8:00 PM (7:30 AM – 8:00 PM)</span>
            </div>
            <div className="flex items-start gap-1.5 text-emerald-200 text-[11px] leading-relaxed">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Free Delivery:</strong> Sidhawe, Kaulamundera, Tarkulwa, Paraskhan & nearby</span>
            </div>
            <div className="text-[10px] text-slate-300 pl-5">
              Goraya Ghat Road, Pachrukhiya, Kanchanpur
            </div>
          </div>

          {/* 4. Navigation Links */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">Navigation</span>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  activeTab === link.id
                    ? 'bg-[#064e3b] text-white shadow-xs'
                    : 'text-[#0f2942] hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* 5. Additional Tools & Refills */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <button
              onClick={() => {
                if (onOpenRefillModal) onOpenRefillModal();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-50 text-amber-950 font-bold border border-amber-300 text-xs"
            >
              <Bell className="w-4 h-4 text-amber-700" />
              <span>Automated Medicine Refill Alert</span>
            </button>

            <button
              onClick={() => {
                onOpenChat();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask AI Pharmacist (हिंदी / Eng)</span>
            </button>

            <button
              onClick={handleToggleNotifications}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs"
            >
              <Bell className="w-4 h-4 text-blue-600" />
              <span>{hasNotificationPermission ? 'Push Alerts: Active' : 'Enable Order Notification Alerts'}</span>
            </button>

            {/* 6. Admin Portal Link inside Menu */}
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-[#c59b27]" />
              <span>Admin Security & Inventory Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
