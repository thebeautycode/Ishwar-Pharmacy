import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Package, 
  FileText, 
  Info, 
  CheckCircle2, 
  X, 
  MessageCircle, 
  Sparkles, 
  ShoppingBag, 
  RotateCw, 
  Eye, 
  Check, 
  AlertTriangle,
  Mic,
  MicOff,
  ArrowRight
} from 'lucide-react';
import { Medicine } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';

interface MedicineCatalogProps {
  medicines: Medicine[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onAddToCart: (medicine: Medicine, quantity: number) => void;
  onOpenPrescriptionScanner: () => void;
  isHomePagePreview?: boolean;
  onViewAllMedicines?: () => void;
}

export const MedicineCatalog: React.FC<MedicineCatalogProps> = ({
  medicines,
  searchQuery,
  setSearchQuery,
  onAddToCart,
  onOpenPrescriptionScanner,
  isHomePagePreview = false,
  onViewAllMedicines,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [onlyPrescriptionRequired, setOnlyPrescriptionRequired] = useState<boolean | null>(null);
  const [activeMedicineModal, setActiveMedicineModal] = useState<Medicine | null>(null);
  const [modalViewSide, setModalViewSide] = useState<'front' | 'back'>('front');
  
  // Track front/back toggle per card (key: medicine id)
  const [cardImageSide, setCardImageSide] = useState<Record<string, 'front' | 'back'>>({});
  
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    medicines.forEach(m => cats.add(m.category));
    return ['All', ...Array.from(cats)];
  }, [medicines]);

  // Voice Search Handler using SpeechRecognition API
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please type your search query.");
      return;
    }

    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Recognizes Hindi / Indian English terms like 'Dolo', 'Paracetamol'
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsVoiceListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsVoiceListening(false);
      };

      recognition.onerror = (event: any) => {
        console.warn('Voice recognition error:', event.error);
        setIsVoiceListening(false);
      };

      recognition.onend = () => {
        setIsVoiceListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to start:', err);
      setIsVoiceListening(false);
    }
  };

  const filteredMedicines = useMemo(() => {
    let list = medicines.filter((m) => {
      const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || (
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.composition.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q)
      );
      const matchesRx = onlyPrescriptionRequired === null || m.requiresPrescription === onlyPrescriptionRequired;

      return matchesCategory && matchesQuery && matchesRx;
    });

    // In home preview mode, show exactly 4 items as requested
    if (isHomePagePreview) {
      return list.slice(0, 4);
    }

    return list;
  }, [medicines, selectedCategory, searchQuery, onlyPrescriptionRequired, isHomePagePreview]);

  const handleQuantityChange = (medicineId: string, delta: number, maxStock: number) => {
    const current = quantities[medicineId] || 1;
    const next = Math.max(1, Math.min(maxStock, current + delta));
    setQuantities(prev => ({ ...prev, [medicineId]: next }));
  };

  const handleAddToCart = (medicine: Medicine) => {
    const qty = quantities[medicine.id] || 1;
    onAddToCart(medicine, qty);
    setAddedAnimationId(medicine.id);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1200);
  };

  const toggleCardSide = (e: React.MouseEvent, medicineId: string) => {
    e.stopPropagation();
    setCardImageSide(prev => ({
      ...prev,
      [medicineId]: prev[medicineId] === 'back' ? 'front' : 'back'
    }));
  };

  return (
    <section id="medicines-section" className={`py-14 ${isHomePagePreview ? 'bg-white' : 'bg-slate-50 min-h-screen'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/10 border border-emerald-800/20 text-[#064e3b] text-xs font-bold mb-3 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#047857] animate-pulse"></span>
              <span>100% Verified Pharmacy Counter Stock · Goraya Ghat Road</span>
              <span className="text-[#c59b27] font-black">★ D.L. Regd</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f2942] tracking-tight">
              {isHomePagePreview ? 'Featured Everyday Medicines' : 'Medicines & Healthcare Stock'}
            </h2>
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-2xl leading-relaxed">
              {isHomePagePreview
                ? 'Quick selection of most frequently requested medicines in Pachrukhiya with front and back view.'
                : 'Everyday medicines with high-resolution packaging photos. Inspect front and back labels before buying, or check live shelf availability in Pachrukhiya.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenPrescriptionScanner}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0f2942] text-xs sm:text-sm font-bold border-2 border-[#c59b27]/60 hover:border-[#c59b27] flex items-center gap-2 transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#c59b27]" />
              <span>Match Prescription Photo</span>
            </button>
            <a
              href={STORE_CONFIG.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#047857] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-emerald-300" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Search & Filter Bar (Enabled both on Home preview and Full page) */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Search Input with Text AND Voice Search */}
            <div className="relative w-full sm:flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isVoiceListening ? "Listening... Speak medicine name now..." : "Search by brand (Dolo 650, Azithral), active salt, or use Voice..."}
                className={`w-full pl-11 pr-24 py-3 bg-white border rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#047857] shadow-sm font-medium ${
                  isVoiceListening ? 'border-blue-500 ring-2 ring-blue-400 animate-pulse' : 'border-slate-300'
                }`}
              />

              {/* Voice Search Button & Clear Button */}
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold ${
                    isVoiceListening
                      ? 'bg-rose-500 text-white animate-pulse'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                  title="Voice Search: Speak medicine name in Hindi or English"
                >
                  {isVoiceListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-600" />}
                  <span className="hidden md:inline text-[11px]">{isVoiceListening ? 'Listening' : 'Voice'}</span>
                </button>
              </div>
            </div>

            {/* Filter Toggle: All vs OTC vs Rx */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-300 shadow-sm w-full sm:w-auto">
              <button
                onClick={() => setOnlyPrescriptionRequired(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex-1 sm:flex-none ${
                  onlyPrescriptionRequired === null ? 'bg-[#0f2942] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Medicines
              </button>
              <button
                onClick={() => setOnlyPrescriptionRequired(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex-1 sm:flex-none ${
                  onlyPrescriptionRequired === false ? 'bg-[#064e3b] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                OTC / Everyday
              </button>
              <button
                onClick={() => setOnlyPrescriptionRequired(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex-1 sm:flex-none ${
                  onlyPrescriptionRequired === true ? 'bg-[#c59b27] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rx Required
              </button>
            </div>
          </div>

          {/* Category Tabs (Full page mode only or scrollable) */}
          {!isHomePagePreview && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#064e3b] text-white shadow-sm ring-2 ring-[#c59b27]/40'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-[#0f2942]">{filteredMedicines.length}</strong> items
            {isHomePagePreview && ` (Preview out of ${medicines.length} in stock)`}
          </span>
          <span className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600"></span> In Stock
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 ml-2"></span> Low Stock
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 ml-2"></span> Out of Stock
          </span>
        </div>

        {/* Medicine Grid - 4 items per row on desktop */}
        {filteredMedicines.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredMedicines.map((med) => {
              const qty = quantities[med.id] || 1;
              const isLowStock = med.stock > 0 && med.stock <= med.minThreshold;
              const isOutOfStock = med.stock === 0;
              const currentSide = cardImageSide[med.id] || 'front';
              const displayImage = currentSide === 'back' && med.backImage ? med.backImage : (med.frontImage || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80');

              return (
                <div
                  key={med.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden group hover:border-[#c59b27]/60"
                >
                  <div>
                    {/* Real Product Image Area with full uncropped view */}
                    <div className="relative w-full h-36 sm:h-40 bg-white p-3 overflow-hidden border-b border-slate-100 flex items-center justify-center">
                      <img
                        src={displayImage}
                        alt={`${med.name} (${currentSide} view)`}
                        className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                        <span className="text-[10px] font-bold text-white bg-[#0f2942]/90 backdrop-blur-xs px-2 py-0.5 rounded-md shadow-xs">
                          {med.category}
                        </span>
                      </div>

                      <div className="absolute top-2.5 right-2.5 z-10">
                        {med.requiresPrescription ? (
                          <span className="text-[10px] font-bold text-amber-900 bg-amber-100/95 border border-amber-300 px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                            <FileText className="w-3 h-3 text-amber-700" />
                            <span>Rx</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100/95 border border-emerald-300 px-2 py-0.5 rounded-md shadow-xs">
                            OTC
                          </span>
                        )}
                      </div>

                      {/* Front/Back Interactive Toggle Button */}
                      {med.backImage && (
                        <button
                          type="button"
                          onClick={(e) => toggleCardSide(e, med.id)}
                          className="absolute bottom-2.5 right-2.5 px-2.5 py-1 bg-white/95 hover:bg-white text-slate-800 rounded-lg text-[11px] font-bold shadow-md flex items-center gap-1.5 border border-slate-200 backdrop-blur-xs transition-colors z-10"
                          title="Switch between Front and Back packaging image"
                        >
                          <RotateCw className="w-3 h-3 text-[#064e3b]" />
                          <span>{currentSide === 'front' ? 'View Back Foil' : 'View Front'}</span>
                        </button>
                      )}

                      <span className="absolute bottom-2.5 left-2.5 text-[10px] font-semibold text-slate-600 bg-white/90 px-1.5 py-0.5 rounded shadow-2xs backdrop-blur-xs">
                        {currentSide === 'front' ? 'Front Pack' : 'Back Label'}
                      </span>
                    </div>

                    {/* Card Content Details */}
                    <div className="p-4 space-y-2.5">
                      <div>
                        <h3 className="text-base font-extrabold text-[#0f2942] group-hover:text-[#064e3b] transition-colors line-clamp-1">
                          {med.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1 font-semibold mt-0.5">
                          {med.genericName}
                        </p>
                      </div>

                      {/* Packaging info & Rack */}
                      <div className="text-xs text-slate-600 flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5 truncate">
                          <Package className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold truncate">{med.dosageForm}</span>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-[#064e3b] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                          {med.rackLocation}
                        </span>
                      </div>

                      {/* Stock availability indicator */}
                      <div className="flex items-center justify-between text-xs pt-0.5">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md text-[11px]">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span>Low Stock ({med.stock} left)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>In Stock ({med.stock} units)</span>
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400 font-medium">
                          Exp: {med.expiryDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Price & Add to Cart */}
                  <div className="p-4 pt-0 border-t border-slate-100 mt-1">
                    <div className="flex items-baseline justify-between py-2.5">
                      <div>
                        <span className="text-lg font-black text-[#0f2942]">
                          ₹{med.price}
                        </span>
                        {med.mrp > med.price && (
                          <span className="text-xs text-slate-400 line-through ml-1.5">
                            ₹{med.mrp}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveMedicineModal(med);
                          setModalViewSide('front');
                        }}
                        className="text-xs text-[#064e3b] hover:text-[#047857] font-bold flex items-center gap-1 underline underline-offset-2"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#c59b27]" />
                        <span>Inspect</span>
                      </button>
                    </div>

                    {/* Add to Cart Actions */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-2 py-1">
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(med.id, -1, med.stock)}
                          disabled={qty <= 1 || isOutOfStock}
                          className="text-slate-600 hover:text-slate-900 font-bold px-1.5 disabled:opacity-30"
                        >
                          -
                        </button>
                        <span className="px-1.5 text-xs font-bold text-slate-800 min-w-[18px] text-center">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(med.id, 1, med.stock)}
                          disabled={qty >= med.stock || isOutOfStock}
                          className="text-slate-600 hover:text-slate-900 font-bold px-1.5 disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(med)}
                        disabled={isOutOfStock}
                        className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                          isOutOfStock
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : addedAnimationId === med.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[#064e3b] hover:bg-[#047857] text-white shadow-sm'
                        }`}
                      >
                        {addedAnimationId === med.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4 text-emerald-200" />
                            <span>Add to Order</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-12 bg-white rounded-3xl p-10 text-center border border-dashed border-slate-300 max-w-xl mx-auto space-y-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-[#064e3b]">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#0f2942]">
              No medicines found matching "{searchQuery}"
            </h3>
            <p className="text-xs text-slate-500">
              We stock hundreds of additional medicines in our physical store in Pachrukhiya. Call or message us directly on WhatsApp and we will dispatch it to your village.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <a
                href={STORE_CONFIG.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#064e3b] text-white font-bold text-xs shadow hover:bg-[#047857] transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ask on WhatsApp ({STORE_CONFIG.phone})</span>
              </a>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setOnlyPrescriptionRequired(null);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Clean "View More Medicines & Full Inventory" CTA on Home Page Preview */}
        {isHomePagePreview && (
          <div className="mt-12 text-center pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onViewAllMedicines}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#071524] via-[#0f2942] to-[#064e3b] text-white font-black text-sm sm:text-base shadow-xl hover:shadow-2xl border-2 border-[#c59b27]/50 inline-flex items-center gap-3 transition-transform hover:-translate-y-1 group"
            >
              <span>View All 22+ Medicines & Full Pharmacy Inventory</span>
              <ArrowRight className="w-5 h-5 text-amber-300 transition-transform group-hover:translate-x-1" />
            </button>
            <p className="text-xs text-slate-500 mt-2">
              Browse full stock by category with both text and voice search features.
            </p>
          </div>
        )}

      </div>

      {/* Inspect Medicine Modal (Dual-Side View) */}
      {activeMedicineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a192f]/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl relative max-h-[92vh] overflow-y-auto border border-slate-200">
            
            <button
              onClick={() => setActiveMedicineModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {activeMedicineModal.category}
                    </span>
                    {activeMedicineModal.requiresPrescription && (
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        Prescription Required
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setModalViewSide('front')}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        modalViewSide === 'front' ? 'bg-[#0f2942] text-white' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Front Packaging
                    </button>
                    {activeMedicineModal.backImage && (
                      <button
                        type="button"
                        onClick={() => setModalViewSide('back')}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                          modalViewSide === 'back' ? 'bg-[#0f2942] text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Back Label / Foil
                      </button>
                    )}
                  </div>
                </div>

                <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative flex items-center justify-center">
                  <img
                    src={modalViewSide === 'back' && activeMedicineModal.backImage ? activeMedicineModal.backImage : (activeMedicineModal.frontImage || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80')}
                    alt={`${activeMedicineModal.name} (${modalViewSide} view)`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-3 left-3 bg-[#0f2942]/80 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                    {modalViewSide === 'front' ? 'Front: Commercial Pack' : 'Back: Composition & Expiry Details'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#0f2942]">
                  {activeMedicineModal.name}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-[#064e3b] mt-0.5">
                  Generic: {activeMedicineModal.genericName}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Manufacturer: {activeMedicineModal.manufacturer}
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Packaging Form:</span>
                  <span className="font-bold text-slate-800">{activeMedicineModal.dosageForm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Active Salt Composition:</span>
                  <span className="font-semibold text-slate-800 text-right">{activeMedicineModal.composition}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Batch Number:</span>
                  <span className="font-mono text-slate-700 font-bold">{activeMedicineModal.batchNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expiry Date:</span>
                  <span className="font-bold text-slate-800">{activeMedicineModal.expiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Store Shelf / Rack:</span>
                  <span className="font-bold text-[#064e3b]">{activeMedicineModal.rackLocation}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  How to Take / Dosage Guidelines
                </h4>
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs text-emerald-950 font-medium leading-relaxed">
                  {activeMedicineModal.usageInstructions}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Retail Price (Inclusive of all taxes)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#0f2942]">
                      ₹{activeMedicineModal.price}
                    </span>
                    {activeMedicineModal.mrp > activeMedicineModal.price && (
                      <span className="text-xs text-slate-400 line-through">
                        MRP ₹{activeMedicineModal.mrp}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleAddToCart(activeMedicineModal);
                      setActiveMedicineModal(null);
                    }}
                    disabled={activeMedicineModal.stock === 0}
                    className="px-6 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#047857] text-white font-bold text-xs sm:text-sm shadow disabled:opacity-40"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </section>
  );
};
