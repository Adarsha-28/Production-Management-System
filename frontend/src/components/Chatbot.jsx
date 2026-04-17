import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatbotAPI } from '../api';

const QUICK_REPLIES = ['Production status', 'Inventory levels', 'Machine status', 'Alerts', 'Efficiency report'];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: 'bot', text: "👋 Hi! I'm Prodexa Assistant. Ask me about production, inventory, machines, or alerts!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(m => [...m, { id: Date.now(), from: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await chatbotAPI.sendMessage(msg);
      setMessages(m => [...m, { id: Date.now() + 1, from: 'bot', text: res.data.response }]);
    } catch {
      setMessages(m => [...m, { id: Date.now() + 1, from: 'bot', text: "Sorry, I'm having trouble connecting. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <>
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 gradient-bg rounded-full shadow-2xl flex items-center justify-center text-2xl text-white">
        {open ? '✕' : '🤖'}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-50 w-80 shadow-2xl rounded-2xl overflow-hidden flex flex-col"
            style={{ height: 480, background: '#fff', border: '1px solid #e5e7eb' }}>
            {/* Header */}
            <div className="gradient-bg p-4 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-xl">🤖</div>
              <div>
                <div className="text-white font-semibold text-sm">Prodexa Assistant</div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white/70 text-xs">Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#f9fafb' }}>
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                    msg.from === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-3 pb-2 flex gap-1.5 overflow-x-auto flex-shrink-0" style={{ background: '#fff' }}>
              {QUICK_REPLIES.map(q => (
                <button key={q} onClick={() => send(q)}
                  className="flex-shrink-0 text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors whitespace-nowrap">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 flex gap-2 flex-shrink-0" style={{ borderTop: '1px solid #f3f4f6', background: '#fff' }}>
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask anything..." className="input text-sm py-2" />
              <button onClick={() => send()} disabled={!input.trim() || loading}
                className="btn-primary px-3 py-2 text-sm disabled:opacity-50">➤</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
