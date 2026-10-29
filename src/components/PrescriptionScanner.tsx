import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShoppingBag, 
  RefreshCw, 
  X, 
  Clock, 
  ShieldAlert, 
  MessageCircle,
  HelpCircle,
  Pill
} from 'lucide-react';
import { PrescriptionAnalysisResult, Medicine } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';

interface PrescriptionScannerProps {
  onAddPrescriptionItemsToCart: (items: { medicine: Medicine; quantity: number }[]) => void;
  availableMedicines: Medicine[];
}

export const PrescriptionScanner: React.FC<PrescriptionScannerProps> = ({
  onAddPrescriptionItemsToCart,
  availableMedicines,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PrescriptionAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample prescription images if user wants a 1-click test
  const handleSampleSelect = (type: 'fever' | 'hypertension') => {
    // Generate a simple SVG canvas data URL representation of a doctor prescription slip
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 600, 700);

      // Header
      ctx.fillStyle = '#065f46';
      ctx.fillRect(0, 0, 600, 80);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('DR. S. K. VERMA, MBBS, MD', 30, 45);
      ctx.font = '14px sans-serif';
      ctx.fillText('Reg. No. UP-894102 | Community Health Care', 30, 68);

      // Body
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Patient: Smt. Sunita Devi (Age: 48, Female)', 30, 120);
      ctx.fillText('Date: 26-Oct-2026', 450, 120);
      ctx.fillText('Address: Sidhawe / Pachrukhiya', 30, 145);

      // Divider
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(30, 160);
      ctx.lineTo(570, 160);
      ctx.stroke();

      // Rx Symbol
      ctx.font = 'italic bold 28px serif';
      ctx.fillStyle = '#0f766e';
      ctx.fillText('Rx', 30, 205);

      ctx.fillStyle = '#0f172a';
      ctx.font = '16px monospace';

      if (type === 'fever') {
        ctx.fillText('1. Tab. Dolo 650mg ............ 1 tab TDS after meals (3 days)', 50, 240);
        ctx.fillText('2. Tab. Azithral 500mg ........ 1 tab OD after lunch (3 days)', 50, 280);
        ctx.fillText('3. Tab. Pantocid 40mg ......... 1 tab empty stomach early morning', 50, 320);
        ctx.fillText('4. Sachet Electral ORS ........ 1 sachet in 1L water sip daily', 50, 360);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText('Advise: Warm fluid intake, rest for 3 days, review if fever continues.', 50, 420);
      } else {
        ctx.fillText('1. Tab. Telma 40mg ............ 1 tab OD morning after breakfast', 50, 240);
        ctx.fillText('2. Tab. Glycomet GP1 .......... 1 tab OD with morning meal', 50, 280);
        ctx.fillText('3. Tab. Neurobion Forte ....... 1 tab OD at night after dinner', 50, 320);
        ctx.fillText('4. Tab. Shelcal 500 ........... 1 tab daily with milk', 50, 360);
        ctx.font = '14px sans-serif';
        ctx.fillStyle = '#475569';
        ctx.fillText('Advise: Low salt diet, monitor fasting blood glucose weekly.', 50, 420);
      }

      // Stamp & signature
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'italic 16px cursive';
      ctx.fillText('Dr. S. K. Verma', 420, 580);
      ctx.strokeStyle = '#1e3a8a';
      ctx.strokeRect(400, 600, 160, 40);
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('GOVT. REGD CLINIC', 415, 625);

      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelectedImage(dataUrl);
      setMimeType('image/jpeg');
      setResult(null);
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    setMimeType(file.type);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setAnalyzing(true);
    setError(null);

    try {
      // Strip base64 prefix
      const base64Data = selectedImage.includes(',')
        ? selectedImage.split(',')[1]
        : selectedImage;

      const response = await fetch('/api/ai/analyze-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType || 'image/jpeg',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze prescription');
      }

      const data: PrescriptionAnalysisResult = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error('Prescription scanning error:', err);
      setError(err?.message || 'Failed to analyze prescription. Please ensure the image is clear or WhatsApp it directly to 9118137285.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAddAllToCart = () => {
    if (!result) return;
    const itemsToAdd: { medicine: Medicine; quantity: number }[] = [];

    result.detectedMedicines.forEach((dm) => {
      if (dm.matchedStoreMedicine && dm.matchedStoreMedicine.inStock) {
        const fullMed = availableMedicines.find(m => m.id === dm.matchedStoreMedicine?.id);
        if (fullMed) {
          itemsToAdd.push({ medicine: fullMed, quantity: 1 });
        }
      }
    });

    if (itemsToAdd.length > 0) {
      onAddPrescriptionItemsToCart(itemsToAdd);
    }
  };

  return (
    <section id="scanner-section" className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Doctor Parcha & Medicine Verification
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Scan Prescription or Medicine Photo
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Upload your doctor’s prescription slip or medicine box photo. We will read the prescribed medicines, explain dosages in simple Hindi, verify stock at Ishwar Pharmacy, and prepare your package immediately.
          </p>
        </div>

        {/* Upload & Inspection Grid */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Upload Area / Image Viewer (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl p-6 text-center space-y-5">
            {selectedImage ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow bg-white max-h-96 flex items-center justify-center p-2">
                  <img
                    src={selectedImage}
                    alt="Prescription uploaded"
                    className="max-h-80 w-auto object-contain rounded-lg"
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setResult(null);
                    }}
                    className="absolute top-3 right-3 p-1.5 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Analyzing with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-300" />
                        <span>Read Prescription Now</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-sm"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <Camera className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Upload Prescription Image
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Take a clear photo of doctor's prescription slip, hospital discharge summary, or medicine strip.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm shadow flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose Photo</span>
                  </button>
                </div>

                {/* Sample Prescriptions For Quick Testing */}
                <div className="pt-4 border-t border-slate-200">
                  <span className="text-xs text-slate-400 font-medium block mb-2">
                    Or try a sample demo prescription:
                  </span>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSampleSelect('fever')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                    >
                      Sample 1: Fever & Infection Slip
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSampleSelect('hypertension')}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                    >
                      Sample 2: BP & Diabetes Slip
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp direct send fallback */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between text-left">
              <div>
                <span className="font-bold block">Prefer sending on WhatsApp?</span>
                <span className="text-emerald-700">Send photo to {STORE_CONFIG.displayPhone}</span>
              </div>
              <a
                href={STORE_CONFIG.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0"
              >
                Send
              </a>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Results Area (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {analyzing ? (
              <div className="bg-slate-50 rounded-3xl p-10 border border-slate-200 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 animate-spin">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Transcribing & Matching Prescription...
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Gemini is reading doctor handwriting, identifying pharmaceutical molecules, extracting dosage frequency, and verifying store inventory at Ishwar Pharmacy.
                </p>
              </div>
            ) : result ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in">
                
                {/* Result Top Banner */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Prescription Analysis
                    </span>
                    <h3 className="text-xl font-black text-slate-900">
                      Prescribed Medicines & Stock Match
                    </h3>
                  </div>

                  <button
                    onClick={handleAddAllToCart}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add All Available to Cart</span>
                  </button>
                </div>

                {/* Detected Medicines List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Detected Items ({result.detectedMedicines.length})
                  </h4>

                  {result.detectedMedicines.map((med, idx) => {
                    const match = med.matchedStoreMedicine;
                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-colors space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <h5 className="text-sm sm:text-base font-extrabold text-slate-900">
                                {med.name}
                              </h5>
                              {med.dosage && (
                                <span className="text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                                  {med.dosage}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 pl-7 font-medium">
                              {med.frequency} {med.duration ? `· Duration: ${med.duration}` : ''}
                            </p>
                          </div>

                          {/* Inventory Match Status */}
                          <div className="text-right shrink-0">
                            {match ? (
                              match.inStock ? (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>In Store (₹{match.price})</span>
                                  </span>
                                  <p className="text-[10px] text-slate-400">
                                    Stock: {match.stock} units
                                  </p>
                                </div>
                              ) : (
                                <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                                  Out of Stock
                                </span>
                              )
                            ) : (
                              <span className="text-[11px] font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                                Request on Call
                              </span>
                            )}
                          </div>
                        </div>

                        {med.instructions && (
                          <div className="text-xs text-slate-600 pl-7 flex items-center gap-1.5 pt-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{med.instructions}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Precautions & Clinical Advice */}
                {result.precautions && result.precautions.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                    <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>Pharmacist Safety Precautions</span>
                    </h5>
                    <ul className="list-disc list-inside text-xs text-amber-950 space-y-1">
                      {result.precautions.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* General Advice */}
                {result.generalAdvice && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs sm:text-sm text-emerald-950">
                    <strong className="block text-emerald-900 mb-1 font-bold">Pharmacist Guidance:</strong>
                    <p className="leading-relaxed">{result.generalAdvice}</p>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 space-y-6">
                <h3 className="text-lg font-bold text-slate-900">
                  How our prescription scanner helps you:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Deciphers Handwriting</h4>
                    <p className="text-xs text-slate-500">Reads doctor abbreviations like OD, BD, TDS, SOS and clarifies generic molecules.</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Real-Time Stock Check</h4>
                    <p className="text-xs text-slate-500">Directly maps medicines against Ishwar Pharmacy’s shelf stock on Goraya Ghat road.</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                      3
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Dosage & Safety Alerts</h4>
                    <p className="text-xs text-slate-500">Provides precautions on whether to take before/after meals and drug interaction notes.</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      4
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Instant Doorstep Order</h4>
                    <p className="text-xs text-slate-500">Click to add all verified items to cart for rapid village home delivery.</p>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Need personal pharmacist help?</h5>
                    <p className="text-xs text-slate-500">Call us at {STORE_CONFIG.displayPhone} anytime between 7:30 AM to 8:00 PM.</p>
                  </div>
                  <a
                    href={`tel:${STORE_CONFIG.phone}`}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Call Store
                  </a>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
