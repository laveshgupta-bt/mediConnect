import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  MessageCircle,
  Sparkles,
  X,
  Send,
  Bot,
  RotateCcw,
  ChevronDown,
  Activity,
  Pill,
  HeartPulse,
  ShieldCheck
} from 'lucide-react';

const QUICK_PROMPTS = [
  { label: '🩺 Normal BP reading?', prompt: 'What is a normal blood pressure reading, and when should I be concerned?' },
  { label: '💊 Explain medication dosage', prompt: 'How does digital prescription and dosage timing work for common medicines?' },
  { label: '📋 How does MediConnect work?', prompt: 'How does MediConnect securely share patient EHR records across different hospitals?' },
  { label: '🧪 Understanding lab reports', prompt: 'How should a patient read and interpret common blood tests like CBC and HbA1c?' }
];

export default function GeminiChatBubble() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('mediconnect_ai_chat');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      sessionStorage.setItem('mediconnect_ai_chat', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to save chat to session:', e);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages, loading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = { role: 'user', text: query, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Map history for API
      const apiPayload = updatedMessages.map(m => ({
        role: m.role === 'model' ? 'model' : 'user',
        text: m.text
      }));

      const res = await api.sendAIChat(apiPayload, user?.role || 'patient');
      const aiMsg = {
        role: 'model',
        text: res.reply,
        model: res.model,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        role: 'model',
        text: `⚠️ **Unable to connect to Google Gemini**: ${err.message || 'Please check your connection and try again.'}`,
        isError: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear your MediConnect AI chat history?')) {
      setMessages([]);
      sessionStorage.removeItem('mediconnect_ai_chat');
    }
  };

  // Helper to render AI response with markdown-style formatting
  const renderFormattedText = (text) => {
    if (!text) return null;

    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-navy-900 mt-2 mb-1 text-xs">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-extrabold text-teal-900 mt-3 mb-1 text-sm">
            {line.replace('## ', '')}
          </h3>
        );
      }

      // Bullets
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const cleanLine = line.trim().replace(/^[\*\-]\s+/, '');
        return (
          <div key={idx} className="flex items-start space-x-1.5 my-1 text-xs text-navy-800">
            <span className="text-teal-600 font-bold shrink-0 mt-0.5">•</span>
            <span>{parseInlineBold(cleanLine)}</span>
          </div>
        );
      }

      // Numbered lists
      const numberedMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numberedMatch) {
        return (
          <div key={idx} className="flex items-start space-x-1.5 my-1 text-xs text-navy-800">
            <span className="text-teal-700 font-bold shrink-0">{numberedMatch[1]}.</span>
            <span>{parseInlineBold(numberedMatch[2])}</span>
          </div>
        );
      }

      if (line.trim().length === 0) {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="my-1 text-xs text-navy-800 leading-relaxed">
          {parseInlineBold(line)}
        </p>
      );
    });
  };

  // Parse **bold** tags inline
  const parseInlineBold = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-navy-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end select-none">
      {/* ========================================================
          CHAT POPUP WINDOW
         ======================================================== */}
      {isOpen && (
        <div className="mb-3 w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-navy-100 flex flex-col overflow-hidden animate-slide-up backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-teal-950 text-white p-4 flex items-center justify-between border-b border-teal-500/30 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl teal-gradient-bg flex items-center justify-center text-white shadow-glow-teal ring-2 ring-teal-400/40">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-black text-sm text-white tracking-tight">
                    MediConnect AI Assistant
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-[10px] text-teal-300 font-medium flex items-center space-x-1">
                  <span>Google Gemini 3.1 Flash</span>
                  <span>•</span>
                  <span>Clinical Intelligence</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              {messages.length > 0 && (
                <button
                  onClick={handleClear}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-navy-300 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize assistant"
                className="p-1.5 rounded-lg hover:bg-white/10 text-navy-300 hover:text-white transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-surface/40">
            {messages.length === 0 ? (
              <div className="space-y-4 pt-2">
                {/* Welcome Card */}
                <div className="p-4 rounded-2xl bg-white border border-teal-100 shadow-xs space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
                      <Bot className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-navy-900">
                      Welcome to MediConnect AI
                    </span>
                  </div>
                  <p className="text-xs text-navy-600 leading-relaxed">
                    Hello{user ? `, ${user.full_name}` : ''}! I am your clinical AI assistant powered by Google Gemini. Ask me about test results, symptoms, medications, or how MediConnect securely shares health records.
                  </p>
                </div>

                {/* Suggested Prompts */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-navy-400 uppercase tracking-wider block px-1">
                    Suggested Health Inquiries
                  </span>
                  <div className="grid grid-cols-1 gap-1.5">
                    {QUICK_PROMPTS.map((qp, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(qp.prompt)}
                        className="text-left p-2.5 rounded-xl bg-white hover:bg-teal-50/70 border border-navy-100 hover:border-teal-300 text-xs text-navy-800 transition-all font-medium flex items-center justify-between group"
                      >
                        <span>{qp.label}</span>
                        <Sparkles className="w-3 h-3 text-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    className={`flex items-start space-x-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-lg teal-gradient-bg flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 shadow-xs text-xs ${
                        isUser
                          ? 'bg-navy-900 text-white rounded-tr-none'
                          : msg.isError
                            ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-none'
                            : 'bg-white text-navy-900 border border-navy-100 rounded-tl-none'
                      }`}
                    >
                      {isUser ? (
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      ) : (
                        <div className="space-y-1">{renderFormattedText(msg.text)}</div>
                      )}

                      <div
                        className={`text-[9px] mt-1.5 flex items-center justify-end space-x-1 ${
                          isUser ? 'text-navy-300' : 'text-navy-400'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {!isUser && msg.model && (
                          <>
                            <span>•</span>
                            <span className="text-teal-600 font-semibold">{msg.model.replace('models/', '')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Thinking / Typing Animation */}
            {loading && (
              <div className="flex items-start space-x-2">
                <div className="w-7 h-7 rounded-lg teal-gradient-bg flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white border border-teal-200 rounded-2xl rounded-tl-none p-3 shadow-xs flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span className="text-[11px] text-teal-800 font-medium">
                    Consulting Gemini AI...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-navy-100 shrink-0 space-y-1.5">
            <div className="flex items-center space-x-2 bg-surface rounded-2xl px-3 py-1.5 border border-navy-200 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about symptoms, lab values, prescriptions..."
                className="flex-1 bg-transparent text-xs text-navy-900 outline-none placeholder:text-navy-400 py-1"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="w-7 h-7 rounded-xl teal-gradient-bg text-white flex items-center justify-center disabled:opacity-40 hover:opacity-95 transition-opacity shadow-xs shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[9px] text-navy-400 px-1">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                <span>AI Clinical Guide</span>
              </span>
              <span>Consult licensed physician for emergencies</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          FLOATING BUBBLE BUTTON (RIGHT HAND BOTTOM SIDE)
         ======================================================== */}
      <div className="flex items-center space-x-2.5">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-white text-navy-900 border-2 border-teal-500 shadow-xl hover:shadow-2xl text-xs font-black transition-all hover:scale-105 cursor-pointer animate-fade-in"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>Ask MediConnect AI</span>
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full teal-gradient-bg text-white shadow-glow-teal hover:scale-105 active:scale-95 transition-all focus:outline-none shadow-2xl border-2 border-white cursor-pointer"
          aria-label="Toggle MediConnect AI Assistant"
        >
          {/* Glowing Pulse Ring */}
          <span className="absolute -inset-1 rounded-full bg-teal-400/40 animate-ping opacity-60"></span>

          {/* Floating Bubble Icon */}
          <div className="relative flex items-center justify-center">
            {isOpen ? (
              <X className="w-6 h-6 transition-transform rotate-0" />
            ) : (
              <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            )}
          </div>

          {/* Online Status Dot */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-xs"></span>
        </button>
      </div>
    </div>
  );
}
