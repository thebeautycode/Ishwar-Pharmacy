import React from 'react';
import { 
  ShieldCheck, 
  RotateCcw, 
  AlertTriangle, 
  FileText, 
  X, 
  Building2, 
  MapPin, 
  Phone, 
  Award, 
  CheckCircle2
} from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

export type PolicyType = 'privacy' | 'refund' | 'disclaimer' | 'terms' | 'about';

interface PolicyModalsProps {
  type: PolicyType | null;
  onClose: () => void;
  onOpenClinic?: () => void;
  onOpenMedicines?: () => void;
}

export const PolicyModals: React.FC<PolicyModalsProps> = ({
  type,
  onClose,
  onOpenClinic,
  onOpenMedicines,
}) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] my-auto animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#071524] via-[#0f2942] to-[#064e3b] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {type === 'privacy' && <ShieldCheck className="w-5 h-5 text-emerald-400" />}
            {type === 'refund' && <RotateCcw className="w-5 h-5 text-amber-300" />}
            {type === 'disclaimer' && <AlertTriangle className="w-5 h-5 text-amber-300" />}
            {type === 'terms' && <FileText className="w-5 h-5 text-cyan-300" />}
            {type === 'about' && <Building2 className="w-5 h-5 text-amber-300" />}

            <div>
              <h3 className="text-base sm:text-lg font-black font-brand">
                {type === 'privacy' && 'Privacy Policy (डेटा गोपनीयता नीति)'}
                {type === 'refund' && 'Medicine Return & Refund Policy (दवा वापसी नीति)'}
                {type === 'disclaimer' && 'Medical Safety & Clinical Disclaimer (चिकित्सीय अस्वीकरण)'}
                {type === 'terms' && 'Terms & Conditions of Service (नियम एवं शर्तें)'}
                {type === 'about' && 'About Ishwar Pharmacy & Pharma Clinic (हमारे बारे में)'}
              </h3>
              <p className="text-[11px] text-slate-300">
                Ishwar Pharmacy · Goraya Ghat Road, Pachrukhiya, Kanchanpur
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
          
          {type === 'privacy' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#0f2942]">1. Information We Collect</h4>
              <p>
                Ishwar Pharmacy & Pharma Clinic collects minimal customer contact details (Name, Village, Landmark, Phone Number) strictly to deliver medicines to your doorstep and provide automated prescription refill and clinic reminders.
              </p>

              <h4 className="text-sm font-bold text-[#0f2942]">2. Prescription Security</h4>
              <p>
                When you upload a doctor's slip or prescription for scanning, the image is securely processed to verify medicine names and dosages in real-time. We never sell, share, or monetize patient medical records.
              </p>

              <h4 className="text-sm font-bold text-[#0f2942]">3. Communication via WhatsApp & SMS</h4>
              <p>
                Order status updates, dispatch notifications, digital cash memos, and refill alerts are sent solely to the phone number authorized by the customer. You can opt out at any time by calling 9118137582.
              </p>
            </div>
          )}

          {type === 'refund' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-semibold text-xs">
                ✓ Full strips and undamaged sealed medicines can be returned within 7 days of purchase with cash memo.
              </div>

              <h4 className="text-sm font-bold text-[#0f2942]">1. Eligible Returns</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Unopened, unexpired medicine strips or sealed syrup bottles.</li>
                <li>Medicines returned due to doctor's dosage modification or hospital discharge.</li>
                <li>Counter billing allows both full strip returns and unused loose tablets with valid batch match.</li>
              </ul>

              <h4 className="text-sm font-bold text-[#0f2942]">2. Non-Returnable Products</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Cold-chain items (refrigerated insulins or vaccines once carried outside temperature range).</li>
                <li>Opened ointments, cut blister packets with exposed tablets, or hygiene items.</li>
              </ul>

              <h4 className="text-sm font-bold text-[#0f2942]">3. Instant Refund / Credit Memo</h4>
              <p>
                Refunds are processed immediately at our counter via Cash or UPI, or credited toward future prescription orders. Call 9118137582 for pickup assistance.
              </p>
            </div>
          )}

          {type === 'disclaimer' && (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 font-semibold text-xs">
                ⚠️ Medical Disclaimer: All medicine information is educational and verified under registered pharmacist supervision.
              </div>

              <h4 className="text-sm font-bold text-[#0f2942]">1. Prescription Compliance</h4>
              <p>
                Prescription-only drugs (Schedule H and H1 antibiotics, hypertension, psychiatric medications) will only be dispensed upon physical or digital verification of a valid prescription issued by a registered medical practitioner (MBBS, BAMS, MD).
              </p>

              <h4 className="text-sm font-bold text-[#0f2942]">2. Emergency Symptoms</h4>
              <p>
                In cases of severe chest pain, breathlessness, profuse bleeding, or acute trauma, please rush to the nearest emergency district hospital immediately rather than relying on delayed OTC advice.
              </p>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[#0f2942]">1. Store Jurisdiction & Licensing</h4>
              <p>
                Ishwar Pharmacy & Pharma Clinic operates legally under valid Retail Drug License No. UP-DEO-2024-00984 issued by the Drug Licensing Authority, Uttar Pradesh, and complies with Pharmacy Act 1948 regulations.
              </p>

              <h4 className="text-sm font-bold text-[#0f2942]">2. Delivery Commitments</h4>
              <p>
                Home delivery is provided as a community healthcare service across Pachrukhiya, Sidhawe, Kaulamundera, Bhagona Tola, Paraskhan, Sirwania & Tarkulwa. While we aim for 15-35 minute delivery, adverse weather or railway crossings may cause slight delays.
              </p>
            </div>
          )}

          {type === 'about' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-[#c59b27]/40 shadow-md">
                <img
                  src={STORE_CONFIG.storePhotoUrl}
                  alt="Ishwar Pharmacy Store Counter"
                  className="w-full h-48 object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 text-white">
                  <div>
                    <h4 className="font-brand font-black text-base text-amber-300">
                      Ishwar Pharmacy & Pharma Clinic
                    </h4>
                    <p className="text-xs text-slate-200">
                      Goraya Ghat Road, Pachrukhiya, Kanchanpur · Est. with genuine healthcare care
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-base font-extrabold text-[#0f2942]">
                  Dedicated Healthcare for Pachrukhiya & Surrounding Villages
                </h4>
                <p>
                  Founded by <strong className="text-slate-900">Drx. Babalu Singh (B.Sc, D Pharma)</strong>, Ishwar Pharmacy & Pharma Clinic was established to solve a critical rural challenge: ensuring families in Pachrukhiya and neighboring villages have immediate access to 100% genuine, ethically-priced medicines without having to travel long distances to big towns.
                </p>
                <p>
                  Located prominently on <strong className="text-slate-900">Goraya Ghat Road</strong>, our premises host an organized inventory of over 1,000 verified branded and generic medicines, a computerized billing counter, cold-chain refrigeration for sensitive injections, and a dedicated clinic station for Blood Pressure, Blood Sugar, and wound dressing.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-semibold">
                <div className="p-2.5 rounded-xl bg-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Licensed Chemist & Druggist</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Daily Doorstep Delivery</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Routine Clinic Services</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct Pharmacist Support</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-emerald-700" />
            <span>Support: +91 9118137582</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#064e3b] hover:bg-[#047857] text-white font-bold text-xs rounded-xl transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
