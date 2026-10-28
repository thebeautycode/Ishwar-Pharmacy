import React, { useState } from 'react';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Phone, 
  MapPin, 
  HeartPulse, 
  Activity, 
  Bandage, 
  Baby, 
  FileCheck,
  MessageCircle
} from 'lucide-react';
import { Appointment } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';
import { NotificationService } from '../utils/notifications';

export const ClinicAppointments: React.FC = () => {
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>(35);
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState('');
  const [village, setVillage] = useState('Pachrukhiya');
  const [serviceType, setServiceType] = useState('Doctor Consultation & Prescription Review');
  const [appointmentDate, setAppointmentDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 10:30 AM');
  const [symptoms, setSymptoms] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clinicServices = [
    {
      id: 'doc_consult',
      name: 'Doctor Consultation & Prescription Review',
      fee: '₹100',
      duration: '15-20 mins',
      icon: Stethoscope,
      description: 'Consultation for general fever, seasonal infections, abdominal discomfort & therapy review.'
    },
    {
      id: 'bp_sugar',
      name: 'Blood Pressure & Random Blood Glucose',
      fee: '₹40',
      duration: '5-10 mins',
      icon: Activity,
      description: 'Accurate Omron digital BP reading + Accu-Chek instant capillary blood sugar test with log record.'
    },
    {
      id: 'wound_dressing',
      name: 'First Aid & Wound Dressing Renewal',
      fee: '₹60',
      duration: '10-15 mins',
      icon: Bandage,
      description: 'Sterile Betadine antiseptic cleaning, gauze bandaging, minor farm cut & burn management.'
    },
    {
      id: 'child_care',
      name: 'Child Wellness & Immunization Guidance',
      fee: 'Free Advice',
      duration: '10-15 mins',
      icon: Baby,
      description: 'Weight tracking, pediatric syrup dosage calculations, and routine vaccine schedule counseling.'
    }
  ];

  const timeSlots = [
    '08:30 AM - 09:00 AM',
    '09:30 AM - 10:00 AM',
    '10:30 AM - 11:00 AM',
    '11:30 AM - 12:00 PM',
    '04:00 PM - 04:30 PM',
    '05:00 PM - 05:30 PM',
    '06:00 PM - 06:30 PM',
    '07:00 PM - 07:30 PM'
  ];

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!patientName.trim()) {
      setErrorMessage('Please enter patient name.');
      return;
    }

    const cleanPhone = patientPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName.trim(),
          patientAge: Number(patientAge || 30),
          patientGender,
          patientPhone: cleanPhone,
          village,
          serviceType,
          appointmentDate,
          timeSlot,
          symptoms: symptoms.trim() || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }

      const data: Appointment = await response.json();
      setConfirmedAppointment(data);
      NotificationService.notifyAppointmentBooking(data.appointmentNumber, data.appointmentDate, data.timeSlot);
    } catch (err: any) {
      console.error('Appointment booking error:', err);
      setErrorMessage(err.message || 'Could not schedule appointment. Please call 9118137582.');
    } finally {
      setSubmitting(false);
    }
  };

  const getWhatsAppAppointmentMessage = (apt: Appointment) => {
    const text = `*Namaste Ishwar Pharma Clinic!*\nI have booked a clinic appointment:\n\n*Token Number:* ${apt.appointmentNumber}\n*Patient:* ${apt.patientName} (${apt.patientAge}y, ${apt.patientGender})\n*Phone:* ${apt.patientPhone}\n*Village:* ${apt.village}\n*Service:* ${apt.serviceType}\n*Date & Slot:* ${apt.appointmentDate} at ${apt.timeSlot}\n*Symptoms:* ${apt.symptoms || 'General Checkup'}\n\nPlease confirm doctor availability!`;
    return encodeURIComponent(text);
  };

  return (
    <section id="clinic-section" className="py-14 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
            <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
            Healthcare At Your Doorstep
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ishwar Pharma Clinic & Consultations
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Convenient healthcare checkups, vital monitoring, and routine medical consultations right inside our clinic on Goraya Ghat Road, Pachrukhiya.
          </p>
        </div>

        {/* Services Showcase Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {clinicServices.map((svc) => {
            const IconComponent = svc.icon;
            const isSelected = serviceType === svc.name;

            return (
              <div
                key={svc.id}
                onClick={() => setServiceType(svc.name)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-emerald-900 text-white border-emerald-800 shadow-lg ring-2 ring-emerald-500 scale-[1.02]'
                    : 'bg-white text-slate-900 border-slate-200 hover:border-emerald-300 shadow-sm'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                  isSelected ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm line-clamp-1">{svc.name}</h3>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-emerald-700'}`}>
                    {svc.fee}
                  </span>
                  <span className={`text-[10px] ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                    • {svc.duration}
                  </span>
                </div>
                <p className={`text-xs mt-2 leading-relaxed ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {svc.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Appointment Booking Panel */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 max-w-4xl mx-auto">
          {confirmedAppointment ? (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Appointment Confirmed
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Token: {confirmedAppointment.appointmentNumber}
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
                  We look forward to seeing you, <strong className="text-slate-800">{confirmedAppointment.patientName}</strong>! Please arrive 5 minutes before your slot at Goraya Ghat Road.
                </p>
              </div>

              {/* Token Details */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 max-w-md mx-auto text-left text-xs sm:text-sm space-y-2.5">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-slate-800 text-right">{confirmedAppointment.serviceType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Scheduled Date & Time:</span>
                  <span className="font-bold text-emerald-700">{confirmedAppointment.appointmentDate} · {confirmedAppointment.timeSlot}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Patient:</span>
                  <span className="font-medium text-slate-800">{confirmedAppointment.patientName} ({confirmedAppointment.patientAge}y, {confirmedAppointment.patientGender})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Clinic Location:</span>
                  <span className="font-bold text-slate-800 text-right">Pachrukhiya, Goraya Ghat Road</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                <a
                  href={`https://wa.me/919118137582?text=${getWhatsAppAppointmentMessage(confirmedAppointment)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Token to WhatsApp (+91 9118137582)</span>
                </a>

                <button
                  onClick={() => setConfirmedAppointment(null)}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm"
                >
                  Book Another Appointment
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBookAppointment} className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-xl font-black text-slate-900">
                  Schedule Your Visit / Consultation
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Selected Service: <strong className="text-emerald-700">{serviceType}</strong>
                </p>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Patient Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    required
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value ? parseInt(e.target.value) : '')}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Gender *
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile Phone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Village / Area *
                  </label>
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                  >
                    {STORE_CONFIG.villagesServed.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Preferred Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Preferred Time Slot *
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                    >
                      {timeSlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Symptoms or Reason for Consultation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="e.g. Fever since 2 days, routine blood pressure monitoring, or dressing change"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-sm sm:text-base shadow-md transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FileCheck className="w-5 h-5" />
                  <span>{submitting ? 'Confirming Appointment...' : 'Book Clinic Appointment Now'}</span>
                </button>
                <p className="text-center text-xs text-slate-400 mt-2">
                  Instant confirmation · Walk-ins also welcome at Goraya Ghat Road during working hours (7:30 AM – 8:00 PM).
                </p>
              </div>
            </form>
          )}
        </div>

      </div>
    </section>
  );
};
