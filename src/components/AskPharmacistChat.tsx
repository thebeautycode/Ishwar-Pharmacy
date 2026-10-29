import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  X, 
  RefreshCw, 
  Phone, 
  MessageCircle,
  HelpCircle,
  Pill,
  Clock,
  MapPin
} from 'lucide-react';
import { ChatMessage } from '../types';
import { STORE_CONFIG } from '../data/storeConfig';

interface AskPharmacistChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskPharmacistChat: React.FC<AskPharmacistChatProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'assistant',
      text: 'Namaste! I am "Swasthya Saathi" (स्वास्थ्य साथी), your digital pharmacist assistant at Ishwar Pharmacy & Pharma Clinic, Pachrukhiya.\n\nHow can I help you today? You can ask about medicine stock, dosages (before/after food), home delivery to your village, or clinic appointments. You may talk to me in English, हिन्दी, or Bhojpuri!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'Is Dolo 650 available right now?',
    'How fast is home delivery to Sidhawe?',
    'How should I take Pantocid 40?',
    'What clinic services do you provide?',
    'क्या आपकी दुकान अभी खुली है?'
  ];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputText('');
    setLoading(true);

    try {
      // Format history for server-side Gemini API
      const geminiContents = newHistory.map(m => ({
        role: m.sender === 'user' ? ('user' as const) : ('model' as const),
        parts: [{ text: m.text }]
      }));

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: geminiContents })
      });

      if (!response.ok) {
        throw new Error('Failed to reach AI Pharmacist');
      }

      const data = await response.json();
      const replyText = data.reply || "Namaste! Please feel free to call our pharmacy counter directly at 9118137285.";

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);

      // If text to speech is enabled, speak response
      if (isSpeaking && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(replyText.slice(0, 200));
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }

    } catch (err) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        text: "Namaste! Our pharmacy phone lines are open. You can call or WhatsApp our chief pharmacist at +91 9118137285 for immediate medicine availability and orders in Pachrukhiya.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Voice speech input using web speech recognition if supported
  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please type your query.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN'; // Supports Hindi / Indian English
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition start failed:', err);
      setIsListening(false);
    }
  };

  const toggleSpeechOutput = () => {
    if (isSpeaking) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Chat Header in Royal Blue Gradient */}
        <div className="p-4 sm:p-5 border-b border-blue-900/40 bg-gradient-to-r from-[#071524] via-[#0f2942] to-blue-900 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600/90 p-1 flex items-center justify-center border border-blue-400/50 shadow-inner">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400 absolute -bottom-0.5 -right-0.5 border-2 border-slate-900 animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">Swasthya Saathi</h3>
                <span className="text-[10px] bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full border border-blue-400/40 font-bold">
                  AI Pharmacist
                </span>
              </div>
              <p className="text-xs text-blue-200/90">
                Ishwar Pharmacy & Pharma Clinic · Online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleSpeechOutput}
              className={`p-2 rounded-lg text-slate-300 hover:text-white transition-colors ${
                isSpeaking ? 'bg-blue-600 text-white' : 'hover:bg-blue-950/60'
              }`}
              title={isSpeaking ? 'Voice output enabled' : 'Enable voice responses'}
            >
              {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-blue-950/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Thread Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50">
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-blue-800 text-blue-100 flex items-center justify-center shrink-0 mt-1 shadow-xs border border-blue-600/40">
                  <Bot className="w-4 h-4 text-blue-200" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                {msg.text}
                <span
                  className={`block text-[10px] mt-1.5 ${
                    msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-blue-800 text-blue-100 flex items-center justify-center shrink-0 shadow-xs">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-300" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none p-3.5 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                <span>Swasthya Saathi is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-white border-t border-slate-200 overflow-x-auto flex gap-1.5 scrollbar-none">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-800 border border-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? "Listening... Speak now" : "Ask in English or हिन्दी..."}
                className="w-full pl-4 pr-10 py-3 bg-slate-100 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Voice Input Mic */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-blue-700'
                }`}
                title="Speak question (Voice input)"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md disabled:opacity-40 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Quick contact reminder */}
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Goraya Ghat Road, Pachrukhiya</span>
            <a
              href={`tel:${STORE_CONFIG.phone}`}
              className="text-blue-700 hover:underline font-bold"
            >
              Emergency Helpline: {STORE_CONFIG.phone}
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
