import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'Hello. I am the Danuthia & Associates AI Concierge. How can I assist you with your architectural or planning needs today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "You are the AI Concierge for Danuthia & Associates, a high-end architectural and urban planning firm in Nairobi, Kenya. You are professional, concise, and elegant in your responses. You help users understand the firm's services (Architectural Drafting, Urban & Regional Planning, Spatial Analysis, Construction Management) and encourage them to book a consultation. Keep answers brief and luxurious."
        }
      });

      setMessages(prev => [...prev, { role: 'ai', text: response.text || 'I am currently unable to process that request. Please try again or contact our office directly.' }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: 'I apologize, but I am experiencing a temporary connection issue. Please contact our office directly at 0715 795 589.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-charcoal text-concrete rounded-full flex items-center justify-center shadow-2xl z-[9000] border border-bronze/30 hover:bg-bronze transition-colors duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare size={24} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 bg-concrete border border-steel/30 shadow-2xl z-[9001] flex flex-col overflow-hidden"
            style={{ height: '500px', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="bg-charcoal text-concrete p-4 flex justify-between items-center border-b border-bronze/30">
              <div>
                <h3 className="font-display font-bold uppercase tracking-widest text-sm">AI Concierge</h3>
                <p className="text-xs text-steel font-mono">Danuthia & Associates</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-steel hover:text-bronze transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-concrete/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-charcoal text-concrete rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                      : 'bg-steel/10 text-charcoal border border-steel/20 rounded-tr-lg rounded-br-lg rounded-bl-lg'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-steel/10 text-charcoal border border-steel/20 rounded-tr-lg rounded-br-lg rounded-bl-lg p-3">
                    <Loader2 size={16} className="animate-spin text-bronze" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-concrete border-t border-steel/30 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about our services..."
                className="flex-1 bg-transparent border border-steel/30 px-3 py-2 text-sm focus:outline-none focus:border-bronze transition-colors"
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-charcoal text-concrete p-2 hover:bg-bronze transition-colors disabled:opacity-50 disabled:hover:bg-charcoal"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
