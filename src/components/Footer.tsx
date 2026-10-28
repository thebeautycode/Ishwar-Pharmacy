import React from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Heart, 
  MessageCircle, 
  Navigation, 
  Lock,
  FileText,
  RotateCcw,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';
import { PolicyType } from './PolicyModals';

// WhatsApp icon SVG component
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface FooterProps {
  onNavigate: (tabId: string) => void;
  onOpenAdmin: () => void;
  onOpenPolicyModal?: (type: PolicyType) => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onNavigate, 
  onOpenAdmin,
  onOpenPolicyModal 
}) => {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Brand & Mission (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={STORE_CONFIG.logoUrl}
                alt="Ishwar Pharmacy Logo"
                className="w-14 h-14 rounded-xl object-contain bg-white p-1 border border-slate-700 shadow"
              />
              <div>
                <span className="text-xl font-black text-white tracking-tight font-brand">
                  Ishwar <span className="text-emerald-400">Pharmacy & Pharma Clinic</span>
                </span>
                <p className="text-xs text-amber-300 font-semibold mt-0.5">
                  Drx. Babalu Singh (B.Sc, D Pharma) · Reg. Pharmacist on Duty
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Ishwar Pharmacy and Pharma Clinic is a licensed medical store & clinic in Pachrukhiya, Kanchanpur on Goraya Ghat Road. We provide genuine medicines, clinic checkups and daily doorstep delivery across nearby Sidhawe, Kaulamundera, Bhagona Tola, Paraskhan, Sirwania & Tarkulwa.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs">
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-medium">
                100% Genuine Pharma Stock
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-medium">
                Govt Regd Retail & Clinic
              </span>
            </div>

            {/* Social Icons & WhatsApp */}
            <div className="pt-3 flex items-center gap-3">
              <a
                href={STORE_CONFIG.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-sm"
                title="Connect on WhatsApp"
              >
                <WhatsAppIcon className="w-5 h-5 text-white" />
              </a>
              <a
                href={`tel:${STORE_CONFIG.phone}`}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center justify-center transition-colors border border-slate-700 shadow-sm"
                title="Call Direct Helpline"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a
                href={STORE_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 flex items-center justify-center transition-colors border border-slate-700 shadow-sm"
                title="Google Maps Location"
              >
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-emerald-400 transition-colors">
                  Home (होम)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('medicines')} className="hover:text-emerald-400 transition-colors">
                  Check Medicine Stock
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('track-order')} className="hover:text-emerald-400 transition-colors font-bold text-amber-300">
                  Track Order (ऑर्डर ट्रैक)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('delivery')} className="hover:text-emerald-400 transition-colors">
                  Rapid Doorstep Coverage
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('clinic')} className="hover:text-emerald-400 transition-colors">
                  Pharma Clinic Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('scanner')} className="hover:text-emerald-400 transition-colors">
                  Prescription Scanner
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-emerald-400 transition-colors">
                  Contact & Enquiries
                </button>
              </li>
            </ul>
          </div>

          {/* Legal, Policies & Trust (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Policies & Info
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => onOpenPolicyModal && onOpenPolicyModal('about')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  About Us (हमारे बारे में)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicyModal && onOpenPolicyModal('refund')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Refund & Return Policy (दवा वापसी)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicyModal && onOpenPolicyModal('privacy')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Privacy Policy (डेटा गोपनीयता)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicyModal && onOpenPolicyModal('disclaimer')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Medical Safety Disclaimer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicyModal && onOpenPolicyModal('terms')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Store & Clinic Location Info (3 cols) */}
          <div className="lg:col-span-3 space-y-3 text-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Store & Clinic Location
            </h4>
            
            <div className="space-y-2.5 text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{STORE_CONFIG.address}</span>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <a href={`tel:${STORE_CONFIG.phone}`} className="text-white hover:underline font-bold">
                  {STORE_CONFIG.displayPhone}
                </a>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Open Daily: 7:30 AM – 8:00 PM</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenAdmin}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors text-xs font-medium"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Pharmacist & Admin Portal</span>
              </button>
            </div>
          </div>

        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 text-[11px] text-slate-500 space-y-3">
          <p className="leading-relaxed">
            <strong className="text-slate-400 font-semibold">Medical Disclaimer:</strong> Information provided on this platform is for educational and inventory tracking purposes. All prescription medicines require a valid doctor prescription upon delivery or pickup.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 pt-2">
            <div>
              © 2026 Ishwar Pharmacy and Pharma Clinic | Goraya Ghat Road, Pachrukhiya, Kanchanpur, UP 274408.
            </div>
            <div className="flex items-center gap-1">
              <span>Drx. Babalu Singh (B.Sc, D Pharma)</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 ml-1" />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
