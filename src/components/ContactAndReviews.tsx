import React, { useState } from 'react';
import { 
  Star, 
  MapPin, 
  Phone, 
  Clock, 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Navigation, 
  Share2, 
  Bookmark, 
  PenLine, 
  Camera, 
  ThumbsUp, 
  ExternalLink
} from 'lucide-react';
import { STORE_CONFIG } from '../data/storeConfig';

export const ContactAndReviews: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [village, setVillage] = useState('Pachrukhiya');
  const [enquiryType, setEnquiryType] = useState<'enquiry' | 'feedback' | 'medicine_request'>('enquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewVillage, setReviewVillage] = useState('Pachrukhiya');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [userReviews, setUserReviews] = useState(STORE_CONFIG.testimonials);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !phone.trim() || !message.trim()) {
      setErrorMessage('Please fill in your name, phone number, and message.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          village,
          subject: subject.trim() || 'Website Enquiry',
          message: message.trim(),
          type: enquiryType
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitted(true);
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      console.error('Enquiry submission error:', err);
      setErrorMessage(err.message || 'Failed to submit enquiry. Please call 9118137582 directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      author: reviewAuthor.trim(),
      location: reviewVillage,
      rating: reviewRating,
      date: 'Just now',
      comment: reviewComment.trim(),
      badge: 'Verified Customer'
    };

    setUserReviews(prev => [newRev, ...prev]);
    setReviewSuccess(true);
    setTimeout(() => {
      setReviewModalOpen(false);
      setReviewSuccess(false);
      setReviewAuthor('');
      setReviewComment('');
    }, 1500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Ishwar Pharmacy & Pharma Clinic',
        text: 'Medical store and clinic in Pachrukhiya, Kanchanpur UP. Call 9118137582.',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Store link copied to clipboard!');
    }
  };

  return (
    <section id="contact-section" className="py-14 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Google Reviews Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Google Maps Verified Business
                </span>
                <span className="text-xs text-slate-400">Goraya Ghat Road</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Ishwar Pharmacy and Pharma Clinic
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Medical supply store & Clinic in Pachrukhiya, Kanchanpur, Uttar Pradesh 274408
              </p>

              {/* Rating summary */}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-3xl font-black text-slate-900">5.0</span>
                <div>
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {userReviews.length} Google reviews · 100% Recommended
                  </span>
                </div>
              </div>
            </div>

            {/* Google Quick Actions Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={STORE_CONFIG.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-colors"
              >
                <Navigation className="w-4 h-4" />
                <span>Directions</span>
              </a>

              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors"
              >
                <PenLine className="w-4 h-4 text-emerald-700" />
                <span>Write a review</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* Testimonials List */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {userReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
                      {rev.author[0]}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">{rev.author}</h4>
                      <p className="text-[11px] text-slate-400">{rev.location} · {rev.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{rev.badge}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form & Location Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Store Info Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Visit or Reach Out
              </span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                Store Location & Enquiries
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Reach us anytime for medicine stock confirmation, home delivery booking, or clinic doctor consultations.
              </p>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-sm text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Address</h4>
                  <p className="text-slate-600 mt-0.5">{STORE_CONFIG.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                <Phone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Phone & WhatsApp</h4>
                  <a href={`tel:${STORE_CONFIG.phone}`} className="text-emerald-700 font-bold block hover:underline">
                    {STORE_CONFIG.displayPhone}
                  </a>
                  <span className="text-[11px] text-slate-400">Emergency support available on call 24/7</span>
                </div>
              </div>

              <div className="flex items-start gap-3 border-t border-slate-100 pt-3">
                <Clock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Operating Hours</h4>
                  <p className="text-slate-700 font-medium">Daily: 7:30 AM – 8:00 PM</p>
                  <span className="text-[11px] text-emerald-600 font-semibold block">Open 7 days a week</span>
                </div>
              </div>
            </div>

            {/* Direct Call & WhatsApp Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${STORE_CONFIG.phone}`}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-[#022c22] to-[#064e3b] hover:from-[#064e3b] hover:to-[#047857] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors border border-[#c59b27]/30"
              >
                <Phone className="w-4 h-4 text-amber-300" />
                <span>Call Store</span>
              </a>
              <a
                href={STORE_CONFIG.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors border border-slate-700"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Contact Enquiry Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h3 className="text-xl font-black text-slate-900 mb-1">
              Customer Enquiry & Feedback Form
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              Have a question about a specific medicine, urgent delivery, or clinic consultation? Send us a message and our pharmacist will respond promptly.
            </p>

            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-emerald-950">
                  Thank You for Your Message!
                </h4>
                <p className="text-xs sm:text-sm text-emerald-800 max-w-sm mx-auto">
                  We have received your submission. The pharmacist at Ishwar Pharmacy will get in touch with you at your phone number shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 px-5 py-2 bg-[#064e3b] text-white text-xs font-bold rounded-xl shadow hover:bg-[#047857]"
                >
                  Send Another Enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnquiry} className="space-y-4">
                
                {/* Enquiry Type Radio */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-2">
                    Enquiry Type
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setEnquiryType('enquiry')}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                        enquiryType === 'enquiry' ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      General Query
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnquiryType('medicine_request')}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                        enquiryType === 'medicine_request' ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Medicine Request
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnquiryType('feedback')}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition-all ${
                        enquiryType === 'feedback' ? 'bg-[#064e3b] text-white border-[#064e3b]' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Feedback / Review
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#047857] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile phone"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#047857] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Village / Location
                    </label>
                    <select
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#047857] focus:outline-none font-medium"
                    >
                      {STORE_CONFIG.villagesServed.map(v => (
                        <option key={v.name} value={v.name}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Medicine availability, Home delivery timing"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#047857] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Message / Query *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the medicine you need, or share your feedback..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-[#047857] focus:outline-none"
                  />
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#0f2942] hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-transform hover:-translate-y-0.5 disabled:opacity-50 border border-[#c59b27]/30"
                >
                  <Send className="w-4 h-4 text-amber-300" />
                  <span>{submitting ? 'Submitting Enquiry...' : 'Submit Enquiry & Feedback'}</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

      {/* Write a Google Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-900 mb-1">
              Write a Review
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Share your experience with Ishwar Pharmacy and Pharma Clinic, Pachrukhiya.
            </p>

            {reviewSuccess ? (
              <div className="p-6 text-center text-emerald-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold">Review Posted!</h4>
                <p className="text-xs text-slate-500">Thank you for supporting your local healthcare pharmacy.</p>
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Rating
                  </label>
                  <div className="flex gap-2 text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-amber-400' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="e.g. Rameshwar Tiwari"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Your Village
                  </label>
                  <select
                    value={reviewVillage}
                    onChange={(e) => setReviewVillage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {STORE_CONFIG.villagesServed.map(v => (
                      <option key={v.name} value={v.name}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Review Comment *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe the service, medicine availability, clinic checkup or delivery..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow"
                  >
                    Post Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </section>
  );
};
