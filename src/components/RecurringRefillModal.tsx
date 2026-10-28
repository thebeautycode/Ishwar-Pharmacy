import React, { useState } from 'react';
import { 
  BellRing, 
  Calendar, 
  Check, 
  Clock, 
  Phone, 
  Pill, 
  User, 
  X, 
  Plus, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Medicine, RefillReminder, CustomerUser } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';

// WhatsApp icon SVG component
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface RecurringRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  currentUser?: CustomerUser | null;
}

export const RecurringRefillModal: React.FC<RecurringRefillModalProps> = ({
  isOpen,
  onClose,
  medicines,
  currentUser,
}) => {
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [selectedMedicineName, setSelectedMedicineName] = useState('Telma 40 Tablet');
  const [customMedicine, setCustomMedicine] = useState('');
  const [dosageSchedule, setDosageSchedule] = useState('1 tablet daily after breakfast (Blood Pressure)');
  const [intervalDays, setIntervalDays] = useState(30);
  const [notifyVia, setNotifyVia] = useState<'whatsapp' | 'sms' | 'both'>('whatsapp');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Calculate next refill date
  const nextDate = new Date(Date.now() + intervalDays * 24 * 3600 * 1000).toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      alert('Please enter your name and phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const medName = selectedMedicineName === 'Other' ? customMedicine.trim() : selectedMedicineName;
      const res = await fetch('/api/refill-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          medicineName: medName,
          dosageSchedule,
          intervalDays,
          nextRefillDate: nextDate,
          notifyVia
        })
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2500);
      }
    } catch (err) {
      console.error('Failed to create refill alert:', err);
      alert('Could not schedule refill. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#071524] via-[#0f2942] to-[#064e3b] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-amber-300 border border-emerald-400/40 flex items-center justify-center shadow-inner">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">
                Automated Medicine Refill Alert
              </h3>
              <p className="text-[11px] text-slate-300">
                Never run out of regular BP, Diabetes or daily medicines
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

        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto animate-bounce" />
            <h4 className="text-lg font-black text-slate-900">Refill Alert Scheduled!</h4>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Ishwar Pharmacy will send you a reminder alert via {notifyVia.toUpperCase()} 3 days before your next refill date (<strong className="text-slate-900">{nextDate}</strong>).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Your Name *</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Satish Mishra"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#047857] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="10-digit phone"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-[#047857] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Regular Medicine</label>
              <select
                value={selectedMedicineName}
                onChange={(e) => setSelectedMedicineName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:ring-2 focus:ring-[#047857] focus:outline-none"
              >
                {medicines.map((m) => (
                  <option key={m.id} value={m.name}>{m.name} ({m.category})</option>
                ))}
                <option value="Other">Other / Custom Medicine Name</option>
              </select>
            </div>

            {selectedMedicineName === 'Other' && (
              <div>
                <label className="font-bold text-slate-700 block mb-1">Type Medicine Name</label>
                <input
                  type="text"
                  required
                  value={customMedicine}
                  onChange={(e) => setCustomMedicine(e.target.value)}
                  placeholder="e.g. Glycomet GP 1 Tablet"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>
            )}

            <div>
              <label className="font-bold text-slate-700 block mb-1">Dosage or Routine Schedule</label>
              <input
                type="text"
                value={dosageSchedule}
                onChange={(e) => setDosageSchedule(e.target.value)}
                placeholder="e.g. 1 tablet daily in the morning"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Refill Cycle Frequency</label>
                <select
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value={15}>Every 15 Days (पाक्षिक)</option>
                  <option value={30}>Every 30 Days (मासिक)</option>
                  <option value={45}>Every 45 Days</option>
                  <option value={60}>Every 60 Days (2 माह)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notification Channel</label>
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setNotifyVia('whatsapp')}
                    className={`py-1.5 px-2 rounded-lg border text-center font-bold flex items-center justify-center gap-1 ${
                      notifyVia === 'whatsapp' ? 'bg-emerald-700 text-white border-emerald-700' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotifyVia('both')}
                    className={`py-1.5 px-2 rounded-lg border text-center font-bold ${
                      notifyVia === 'both' ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Both SMS+WA
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
              <span className="font-bold block">Next Anticipated Refill Date: {nextDate}</span>
              <p>Our pharmacist will verify stock and prepare your packet in advance for instant doorstep delivery to your village.</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#064e3b] hover:bg-[#047857] text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <BellRing className="w-4 h-4 text-amber-300" />
              <span>{submitting ? 'Setting Alert...' : 'Activate Automated Refill Alert'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
