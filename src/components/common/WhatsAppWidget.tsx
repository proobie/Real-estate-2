import { useState } from 'react';
import { FaWhatsapp, FaTimes } from 'react-icons/fa';

const WHATSAPP_PHONE = '919011135889';

const QUESTIONS: { label: string; message: string }[] = [
  { label: 'I want to buy a property', message: 'Hi, I am interested in buying a property. Please share available options.' },
  { label: 'Schedule a site visit', message: 'Hi, I would like to schedule a site visit. Please suggest available slots.' },
  { label: 'Price and availability', message: 'Hi, please share current prices, availability, and payment plans.' },
  { label: 'Talk to an expert', message: 'Hi, I want to speak with a real estate expert about my requirements.' },
];

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);

  const buildWhatsAppLink = (msg: string) => `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(msg)}`;

  const handleQuestionClick = (message: string) => {
    const url = buildWhatsAppLink(message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-16 right-6 sm:bottom-6 sm:right-8 z-[900] flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-64 sm:w-72 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden bg-white">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-[#075E54] text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Lotlite Support</p>
                <p className="text-[10px] text-white/90">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-white/10"
              aria-label="Close WhatsApp quick chat"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Chat area */}
          <div className="bg-[#ECE5DD]">
            <div className="p-3 space-y-2">
              {/* Incoming message bubble */}
              <div className="max-w-[85%] bg-white rounded-lg rounded-tl-none border border-gray-200 p-2 text-[13px] shadow-sm">
                <p>Hi! 👋 How can we help you today? Choose an option below to get started.</p>
                <div className="text-[10px] text-gray-400 mt-1 text-right">Now</div>
              </div>

              {/* Quick suggestion buttons styled like messages */}
              <div className="space-y-2 pt-1">
                {QUESTIONS.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => handleQuestionClick(q.message)}
                    className="max-w-[90%] text-left bg-[#DCF8C6] hover:bg-[#cdeeb9] text-gray-800 px-3 py-2 rounded-lg rounded-tr-none shadow border border-green-200"
                  >
                    <span className="text-[13px]">{q.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Faux input footer to mimic WhatsApp */}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border-t border-gray-200">
            <div className="flex-1 text-[12px] text-gray-400 bg-gray-100 rounded-full px-3 py-2 select-none">
              Type your message
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#25D366] text-xs font-medium hover:underline"
            >
              Open in WhatsApp
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((v) => !v)}
        className="bg-green-500 hover:bg-green-600 text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-xl transition duration-300 flex items-center justify-center"
        aria-label={isOpen ? 'Close WhatsApp quick chat' : 'Open WhatsApp quick chat'}
      >
        <FaWhatsapp className="w-6 h-6 sm:w-7 sm:h-7" />
      </button>
    </div>
  );
}


