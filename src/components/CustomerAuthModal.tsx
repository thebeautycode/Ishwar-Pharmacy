import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  MapPin, 
  X, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { CustomerUser } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';

interface CustomerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: CustomerUser) => void;
  existingUser?: CustomerUser | null;
}

export const CustomerAuthModal: React.FC<CustomerAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  existingUser,
}) => {
  const [name, setName] = useState(existingUser?.name || '');
  const [phone, setPhone] = useState(existingUser?.phone || '');
  const [village, setVillage] = useState(existingUser?.village || 'Pachrukhiya');
  const [address, setAddress] = useState(existingUser?.address || '');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    const user: CustomerUser = {
      id: `CUST-${cleanPhone}`,
      name: name.trim(),
      phone: cleanPhone,
      village,
      address: address.trim() || undefined
    };

    localStorage.setItem('ishwar_customer_user', JSON.stringify(user));
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#071524] via-[#0f2942] to-[#064e3b] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">
                {existingUser ? 'Customer Profile' : 'Quick Customer Sign-in'}
              </h3>
              <p className="text-[11px] text-slate-300">
                Ishwar Pharmacy · Pachrukhiya
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed text-xs">
            Enter your name and mobile number to automatically track your orders, view previous medical bills, and set recurring refill alerts.
          </p>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Your Full Name (नाम) *
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ramesh Singh"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#047857] focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              10-Digit Mobile Number (मोबाइल नंबर) *
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9838XXXXXX"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#047857] focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Village (गांव / क्षेत्र)
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#047857] focus:outline-none font-medium"
              >
                {STORE_CONFIG.villagesServed.map((v) => (
                  <option key={v.name} value={v.name}>{v.name}</option>
                ))}
                <option value="Other">Other Village</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              House / Landmark (मकान सं. / टोला / लैंडमार्क)
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Shiv Mandir, Main Road"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#047857] focus:outline-none font-medium"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-[#064e3b] hover:bg-[#047857] text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>{existingUser ? 'Update Profile' : 'Login & View My Orders'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
