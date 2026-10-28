import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Search, 
  Truck, 
  Camera, 
  CheckCircle2, 
  ArrowRight,
  MessageCircle,
  Stethoscope,
  HeartPulse,
  Award,
  Sparkles
} from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

interface HeroProps {
  onSearchMedicines: (query: string) => void;
  onNavigate: (tabId: string) => void;
  onOpenPrescriptionScanner: () => void;
  onOpenClinic: () => void;
  onOpenChat: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onSearchMedicines,
  onNavigate,
  onOpenPrescriptionScanner,
  onOpenClinic,
  onOpenChat,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearchMedicines(searchTerm.trim());
      onNavigate('medicines');
    }
  };

  const quickSearchTags = [
    'Dolo 650',
    'Azithral 500',
    'Pantocid 40',
    'Montair-LC',
    'Telma 40',
    'Volini Gel',
    'BP Monitor'
  ];

  return (
    <div className="relative bg-gradient-to-b from-[#022c22] via-[#064e3b] to-[#0f2942] text-white overflow-hidden pb-16 pt-8 sm:pt-12 border-b border-[#c59b27]/30">
      {/* Background ambient medical glows */}
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#c59b27]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#022c22]/40 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Branding, Title, Google Review Status & Actions */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Operating Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/40 border border-[#c59b27]/60 text-amber-300 text-xs sm:text-sm font-bold backdrop-blur-md shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Open Daily · 7:30 AM to 8:00 PM</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#032b1f]/90 border border-[#c59b27]/50 text-amber-200 text-xs sm:text-sm font-bold">
                <Award className="w-4 h-4 text-[#c59b27]" />
                <span>Govt D.L. Authorized Chemist & Clinic</span>
              </div>

              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-slate-200 text-xs font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Goraya Ghat Road, Pachrukhiya</span>
              </div>
            </div>

            {/* Main Title & Slogan with Roboto / clean sans-serif */}
            <div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight font-brand drop-shadow-md">
                Ishwar Pharmacy & <br className="hidden sm:inline" />
                <span className="text-[#c59b27] font-bold">Pharma Clinic</span>
              </h1>
              
              {/* Registered Pharmacist Details - Clean single line on mobile */}
              <div className="mt-3.5 flex items-center">
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl bg-[#032b1f]/95 border border-[#c59b27]/60 text-amber-200 text-xs sm:text-sm font-semibold shadow-md backdrop-blur-xs max-w-full overflow-hidden">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse"></span>
                  <span className="font-extrabold text-white whitespace-nowrap shrink-0">Drx. Babalu Singh</span>
                  <span className="text-[#c59b27] font-bold shrink-0">·</span>
                  <span className="text-amber-200 truncate">Registered Pharmacist on Duty · Goraya Ghat Road, Pachrukhiya</span>
                </div>
              </div>

              <p className="mt-3 text-slate-200 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                Your trusted medical store and health clinic on <strong className="text-white">Goraya Ghat Road, Pachrukhiya, Kanchanpur</strong>. Fast door-to-door home delivery across <span className="text-amber-300 font-bold">nearby Sidhawe, Kaulamundera, Bhagona Tola, Paraskhan, Sirwania & Tarkulwa</span>.
              </p>
            </div>

            {/* Instant Stock Search Bar */}
            <div className="bg-white/15 p-2 sm:p-2.5 rounded-2xl border border-[#c59b27]/50 backdrop-blur-md shadow-2xl">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Check real medicine stock... (e.g., Dolo 650, Azithral, Montair, BP Monitor)"
                    className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 rounded-xl text-sm sm:text-base font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#047857] shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-[#c59b27] hover:bg-[#d4af37] text-slate-950 font-black text-sm sm:text-base transition-all shadow-md flex items-center gap-1.5 shrink-0"
                >
                  <span>Check Stock</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Suggestion Pills */}
              <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs text-slate-300">
                <span className="text-amber-300 font-bold shrink-0">Popular:</span>
                {quickSearchTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchTerm(tag);
                      onSearchMedicines(tag);
                      onNavigate('medicines');
                    }}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-colors shrink-0"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Core Action Buttons - Center Aligned */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-3 text-center">
              <button
                onClick={() => onNavigate('delivery')}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-extrabold text-xs sm:text-base flex items-center justify-center gap-2 shadow-lg border border-[#c59b27]/50 transition-transform hover:-translate-y-0.5"
              >
                <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
                <span>Book Home Delivery</span>
              </button>

              <button
                onClick={onOpenPrescriptionScanner}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#0f2942]/90 hover:bg-[#0f2942] text-white font-semibold text-xs sm:text-base flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 shrink-0" />
                <span>Upload Prescription</span>
              </button>

              <button
                onClick={onOpenClinic}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#0f2942]/90 hover:bg-[#0f2942] text-white font-semibold text-xs sm:text-base flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
                <span>Clinic Appointment</span>
              </button>

              <a
                href={STORE_CONFIG.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-base flex items-center justify-center gap-2 border border-emerald-500/40 transition-colors"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 shrink-0" />
                <span>WhatsApp: {STORE_CONFIG.phone}</span>
              </a>
            </div>

            {/* Location & Quick Meta - Centered */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-xs text-slate-300 border-t border-white/10 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{STORE_CONFIG.address}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-300 shrink-0" />
                <a href={`tel:${STORE_CONFIG.phone}`} className="hover:text-white underline font-bold">
                  {STORE_CONFIG.displayPhone}
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Premium Family Health Banner with Deep Drop Shadow */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-3 border-[#c59b27]/60 group bg-slate-900">
              
              {/* Family health poster image uploaded by user */}
              <img
                src={STORE_CONFIG.familyBannerUrl}
                alt="Ishwar Pharmacy - सेहत का रखें ध्यान, छोटी आदतें बड़ा बचाव"
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-102"
              />

              {/* Bottom Quick Action bar below poster */}
              <div className="p-3 bg-gradient-to-r from-[#071524] via-[#0f2942] to-[#064e3b] border-t border-[#c59b27]/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-bold text-amber-200">Open Daily · Closes 8 PM</span>
                </div>
                <a
                  href={`tel:${STORE_CONFIG.phone}`}
                  className="px-3 py-1 bg-[#c59b27] hover:bg-[#d4af37] text-slate-950 font-black rounded-lg transition-colors shadow"
                >
                  Call Now
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
