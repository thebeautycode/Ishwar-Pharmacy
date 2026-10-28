import React from 'react';
import { 
  MapPin, 
  Truck, 
  Clock, 
  ShieldCheck, 
  Navigation, 
  ExternalLink, 
  CheckCircle2, 
  PhoneCall,
  Send
} from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

interface DeliveryAreasMapProps {
  onSelectVillageForDelivery: (village: string) => void;
}

export const DeliveryAreasMap: React.FC<DeliveryAreasMapProps> = ({
  onSelectVillageForDelivery,
}) => {
  return (
    <section id="delivery-areas-section" className="py-14 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
              <Truck className="w-3.5 h-3.5 text-emerald-600" />
              Local Village Delivery Network
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Rapid Doorstep Coverage
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-2xl">
              We dispatch medicines on two-wheelers directly from our store on Goraya Ghat Road, reaching your doorstep across all 8 local villages in 15 to 35 minutes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={STORE_CONFIG.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Navigation className="w-4 h-4 text-emerald-700" />
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Coverage Cards Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {STORE_CONFIG.villagesServed.map((village, idx) => (
            <div
              key={village.name}
              className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Free Delivery
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {village.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {village.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-600 border-t border-slate-200">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {village.distance} from store
                  </span>
                  <span className="flex items-center gap-1 text-emerald-800 font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    ~{village.time}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => onSelectVillageForDelivery(village.name)}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-emerald-700 hover:text-white border border-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <Truck className="w-3.5 h-3.5 text-emerald-600 group-hover:text-white" />
                  <span>Order to {village.name}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Store Location Info Box */}
        <div className="mt-10 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              Physical Store & Clinic Hub
            </span>
            <h3 className="text-xl sm:text-2xl font-black">
              Ishwar Pharmacy & Pharma Clinic
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              {STORE_CONFIG.address} · Working hours: 7:30 AM to 8:00 PM daily. Emergency medicines available on call 24/7.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={`tel:${STORE_CONFIG.phone}`}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call: {STORE_CONFIG.phone}</span>
            </a>
            <a
              href={STORE_CONFIG.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 flex items-center gap-2 transition-colors"
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
