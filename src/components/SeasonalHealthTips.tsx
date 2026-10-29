import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  ShieldAlert, 
  Droplets, 
  HeartHandshake, 
  Users, 
  MapPin, 
  ArrowRight,
  Stethoscope,
  Info
} from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

interface HealthRecommendation {
  id: string;
  category: 'prevention' | 'hydration' | 'ayush' | 'children_elderly';
  title: string;
  advice: string;
  recommendedMedicine?: string;
}

interface SeasonalHealthAdvisory {
  seasonName: string;
  weatherSummary: string;
  advisoryTitle: string;
  localLocation: string;
  recommendations: HealthRecommendation[];
  emergencyDisclaimer: string;
}

interface SeasonalHealthTipsProps {
  onSearchMedicine?: (medName: string) => void;
}

const DEFAULT_ADVISORY: SeasonalHealthAdvisory = {
  seasonName: "Eastern UP Spring-Summer Transition",
  weatherSummary: "Warm afternoons, dry breeze and shifting temperatures across Pachrukhiya & Kanchanpur rural belt.",
  advisoryTitle: "Seasonal Climate & Wellness Advisory for Pachrukhiya & Deoria Belt",
  localLocation: "Pachrukhiya, Kanchanpur & Nearby Villages",
  recommendations: [
    {
      id: "rec-1",
      category: "hydration",
      title: "Daily Electrolyte & Hydration Balance",
      advice: "With rising day temperatures in Eastern UP, keep ORS solutions and glucose water handy. Drink boiled and cooled water.",
      recommendedMedicine: "Electral Powder ORS"
    },
    {
      id: "rec-2",
      category: "prevention",
      title: "Seasonal Flu & Dust Allergy Care",
      advice: "Evening breeze often brings pollen and crop dust. Wash face after returning from farms. Keep antihistamines ready.",
      recommendedMedicine: "Montair-LC Tablet"
    },
    {
      id: "rec-3",
      category: "children_elderly",
      title: "Elderly BP & Digestion Monitoring",
      advice: "Temperature changes can fluctuate blood pressure. Ensure morning BP checks and light, easily digestible meals.",
      recommendedMedicine: "Digene Antacid Liquid (Mint)"
    },
    {
      id: "rec-4",
      category: "ayush",
      title: "Immunity & First Aid Preparedness",
      advice: "Keep basic antiseptics and zinc supplements at home for sudden seasonal cuts and fatigue.",
      recommendedMedicine: "Betadine 5% Antiseptic Ointment"
    }
  ],
  emergencyDisclaimer: "This wellness advice is for informational guidance only. For acute conditions, visit Drx. Babalu Singh at Ishwar Pharma Clinic, Goraya Ghat Road."
};

export const SeasonalHealthTips: React.FC<SeasonalHealthTipsProps> = ({
  onSearchMedicine,
}) => {
  const [advisory, setAdvisory] = useState<SeasonalHealthAdvisory>(DEFAULT_ADVISORY);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Live');

  const fetchSeasonalTips = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/seasonal-health-tips');
      if (res.ok) {
        const data: SeasonalHealthAdvisory = await res.json();
        setAdvisory(data);
        setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      }
    } catch (err) {
      // In static deployment like GitHub Pages, seamlessly keeps DEFAULT_ADVISORY
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasonalTips();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'prevention':
        return <ShieldAlert className="w-5 h-5 text-amber-400" />;
      case 'hydration':
        return <Droplets className="w-5 h-5 text-cyan-400" />;
      case 'children_elderly':
        return <Users className="w-5 h-5 text-emerald-400" />;
      case 'ayush':
      default:
        return <HeartHandshake className="w-5 h-5 text-rose-400" />;
    }
  };

  if (!advisory) {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-b from-slate-900 via-[#071524] to-[#022c22] text-white relative overflow-hidden border-t-2 border-[#c59b27]/40">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#c59b27]/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
              <span>AI Climate & Local Health Guidance</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-brand">
              Seasonal Health Advisory: <br className="hidden sm:inline" />
              <span className="text-[#c59b27]">{advisory.seasonName}</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Customized for the local climate of <strong className="text-white">Pachrukhiya, Kanchanpur, Deoria & surrounding villages</strong>.</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Updated {lastUpdated}
              </span>
            )}
            <button
              onClick={fetchSeasonalTips}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/10"
              title="Refresh Seasonal AI Advisory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-300' : ''}`} />
              <span>Refresh Tips</span>
            </button>
          </div>
        </div>

        {/* Local Climate Condition Summary Banner */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-start gap-3 text-xs sm:text-sm text-slate-200">
          <Info className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-200 uppercase tracking-wider text-[11px] block">
              Current Weather Context in Pachrukhiya:
            </span>
            <p className="text-slate-300 leading-relaxed font-normal">
              {advisory.weatherSummary}
            </p>
          </div>
        </div>

        {/* 4 Health Recommendations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {advisory.recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex flex-col justify-between space-y-3 hover:bg-white/15 transition-all shadow-lg group"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center shadow-inner">
                  {getCategoryIcon(rec.category)}
                </div>

                <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug group-hover:text-amber-200 transition-colors">
                  {rec.title}
                </h4>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {rec.advice}
                </p>
              </div>

              {rec.recommendedMedicine && (
                <div className="pt-2 border-t border-white/10 text-xs">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                    Suggested In-Store Medicine:
                  </span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-bold text-amber-300 truncate mr-2">
                      {rec.recommendedMedicine}
                    </span>
                    {onSearchMedicine && (
                      <button
                        onClick={() => onSearchMedicine(rec.recommendedMedicine || '')}
                        className="text-[10px] text-emerald-300 hover:text-white flex items-center gap-0.5 shrink-0 underline"
                      >
                        Check Stock <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pharmacist Disclaimer */}
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{advisory.emergencyDisclaimer}</span>
          </div>
          <a
            href={`tel:${STORE_CONFIG.phone}`}
            className="px-3.5 py-1.5 rounded-lg bg-[#c59b27] text-slate-950 font-black text-xs hover:bg-[#d4af37] transition-colors shrink-0 shadow-sm"
          >
            Clinic Helpline: {STORE_CONFIG.phone}
          </a>
        </div>

      </div>
    </section>
  );
};
