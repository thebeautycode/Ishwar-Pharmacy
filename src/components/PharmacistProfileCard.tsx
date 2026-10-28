import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Stethoscope, 
  FileCheck2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

interface PharmacistProfileCardProps {
  onOpenClinic?: () => void;
  onOpenMedicines?: () => void;
  onOpenChat?: () => void;
}

export const PharmacistProfileCard: React.FC<PharmacistProfileCardProps> = ({
  onOpenClinic,
  onOpenMedicines,
  onOpenChat,
}) => {
  return (
    <section className="py-14 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-gradient-to-br from-[#071524] via-[#0f2942] to-[#064e3b] rounded-3xl p-6 sm:p-10 lg:p-12 text-white shadow-2xl border-2 border-[#c59b27]/40 relative overflow-hidden">
          {/* Ambient background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#c59b27]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            
            {/* Left Column: Authentic Store & Pharmacist Photo with Premium Shadow */}
            {/* Left Column: Authentic Store & Pharmacist Photo with Name Below */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-3 border-[#c59b27]/60 group">
                <img
                  src={STORE_CONFIG.storePhotoUrl}
                  alt="Drx. Babalu Singh seated at store counter in Pachrukhiya"
                  className="w-full h-[380px] sm:h-[460px] object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Gradient overlay for bottom badge */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071524] via-transparent to-black/30 pointer-events-none"></div>

                {/* Top Badge */}
                <div className="absolute top-3 left-3 bg-[#064e3b]/90 border border-emerald-400/50 backdrop-blur-md text-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Licensed Medical Store</span>
                </div>
              </div>

              {/* Prominent Pharmacist Name & Title right below the photo */}
              <div className="mt-3.5 w-full max-w-sm bg-gradient-to-r from-[#032b1f] via-[#064e3b] to-[#022c22] rounded-2xl p-3.5 border-2 border-[#c59b27]/60 text-center shadow-xl">
                <h4 className="text-base sm:text-lg font-black text-white font-brand tracking-wide">
                  Drx. Babalu Singh
                </h4>
                <p className="text-xs text-amber-300 font-bold mt-0.5">
                  Registered Pharmacist on Duty · B.Sc, D Pharma
                </p>
                <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                  Goraya Ghat Road, Pachrukhiya, Kanchanpur
                </p>
              </div>
            </div>

            {/* Right Column: Physical Facility & Assurance Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-[#c59b27]/50 text-amber-300 text-xs font-bold shadow-2xs">
                  <Award className="w-4 h-4 text-[#c59b27]" />
                  <span>Serving Pachrukhiya & Surrounding 8 Villages Daily</span>
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-sans">
                  Meet Your Local Pharmacist & <br />
                  <span className="text-[#c59b27] font-sans font-bold">Healthcare Companion</span>
                </h3>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-[#c59b27]/50 text-amber-200 text-xs sm:text-sm font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <strong className="text-white">Drx. Babalu Singh</strong> (B.Sc, D Pharma) · Registered Pharmacist on Duty · Goraya Ghat Road, Pachrukhiya
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-xl">
                  At Ishwar Pharmacy and Pharma Clinic, you are served directly by licensed professionals who carefully verify every tablet, syrup, and prescription with genuine batch integrity and ethical pricing.
                </p>
              </div>

              {/* Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm flex items-start gap-3">
                  <FileCheck2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-white">Organized Rack Inventory</h5>
                    <p className="text-[11px] text-slate-300">1000+ medicines categorized by therapy & expiry</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm flex items-start gap-3">
                  <Stethoscope className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-white">In-Store Diagnostic Desk</h5>
                    <p className="text-[11px] text-slate-300">BP check, blood sugar screening & first aid dressing</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm flex items-start gap-3">
                  <Clock className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-white">Daily 7:30 AM – 8:00 PM</h5>
                    <p className="text-[11px] text-slate-300">Consistent hours plus emergency 24/7 on-call</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs sm:text-sm font-bold text-white">Authentic Bilateral Trust</h5>
                    <p className="text-[11px] text-slate-300">Rated 5.0 Google Reviews across local communities</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Centered Alignment, No Clipping on any viewport */}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-center">
                <button
                  type="button"
                  onClick={onOpenClinic}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#c59b27] hover:bg-[#d4af37] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  <Stethoscope className="w-4 h-4 text-slate-950 shrink-0" />
                  <span>Book Clinic Consultation</span>
                </button>

                {onOpenChat && (
                  <button
                    type="button"
                    onClick={onOpenChat}
                    className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-transform hover:-translate-y-0.5 border border-blue-400/40"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Ask AI Pharmacist (हिंदी)</span>
                  </button>
                )}

                {onOpenMedicines && (
                  <button
                    type="button"
                    onClick={onOpenMedicines}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/25 flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>Check Medicines</span>
                  </button>
                )}

                <a
                  href={`tel:${STORE_CONFIG.phone}`}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm border border-emerald-500/40 flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Call {STORE_CONFIG.phone}</span>
                </a>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
