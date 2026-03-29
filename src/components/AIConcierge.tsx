import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send } from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';

const clientProfileExtractionTool: FunctionDeclaration = {
  name: "client_profile_extraction",
  description: "Extracts highly structured data from a prospective client inquiry regarding an architectural or urban planning project.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      client: {
        type: Type.OBJECT,
        properties: {
          full_name: {
            type: Type.STRING,
            description: "The prospective client's full name."
          },
          contact_preference: {
            type: Type.STRING,
            enum: ["email", "phone", "unspecified"],
            description: "How the client prefers to be contacted."
          }
        },
        required: ["full_name"]
      },
      project: {
        type: Type.OBJECT,
        properties: {
          scope: {
            type: Type.STRING,
            description: "A detailed description of the project scope, including specific requirements or design goals (e.g., 'sustainable residential design', 'large-scale commercial development', 'regional GIS mapping for urban planning')."
          },
          location: {
            type: Type.STRING,
            description: "The geographical location or site of the proposed project."
          },
          budget_tier: {
            type: Type.STRING,
            enum: ["low", "medium", "high", "enterprise", "undecided"],
            description: "The client's indicated budget range or tier."
          },
          urgency_flag: {
            type: Type.BOOLEAN,
            description: "True if the client requires immediate consultation or has an expedited, high-priority timeline."
          }
        },
        required: ["scope", "location", "urgency_flag"]
      }
    },
    required: ["client", "project"]
  }
};

export default function AIConcierge() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>(() => {
    const saved = localStorage.getItem('aiConciergeMessages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved messages', e);
      }
    }
    return [
      { role: 'ai', text: 'Hello. I am the Danuthia & Co. AI Concierge. How can I assist you with your architectural or planning needs today?' }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('aiConciergeMessages', JSON.stringify(messages));
  }, [messages]);

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
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not defined.');
      }
      const ai = new GoogleGenAI({ apiKey });
      
      // Format history for context
      const historyContext = messages.map(m => `${m.role === 'ai' ? 'Concierge' : 'Client'}: ${m.text}`).join('\n');
      const fullPrompt = `${historyContext}\nClient: ${userMsg}\nConcierge:`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: fullPrompt,
        config: {
          tools: [{ functionDeclarations: [clientProfileExtractionTool] }],
          systemInstruction: `**System Instructions: Principal Architect Persona**

**Identity:** You are the lead autonomous agent for Danuthia & Co., a premier architectural and urban planning firm. You speak with the authority, precision, and visionary foresight of a highly experienced architect and urban planner. 

**Context:** The user is currently viewing the page at path: "${location.pathname}". Use this context to tailor your assistance. For example, if they are on the portfolio page, they might be asking about past projects. If they are on the services page, they might want to know more about what we offer.

**Core Objective:** Your primary goal is to qualify incoming client leads, educate prospects on our capabilities in architecture, urban planning, and Geographic Information Systems (GIS), and seamlessly route high-value project inquiries to the principal architect.

**Tone & Style:** 
* Maintain a professional, empathetic, yet technically rigorous demeanor. 
* Use precise industry terminology where appropriate, but ensure it remains accessible to prospective clients.
* Highlight our deep expertise in sustainable urban planning, regional environmental considerations, and localized spatial analysis (e.g., drawing upon our established methodologies in environmental conservation and flood mitigation strategies when relevant to client inquiries).

**Operational Guardrails (CRITICAL):**
1. **No Binding Estimates:** You are strictly prohibited from providing final cost estimates or binding financial quotes. Always state that comprehensive pricing requires a formal site evaluation and detailed project brief.
2. **No Structural Advice:** Do not provide definitive structural engineering advice, safety clearances, or legally binding zoning guarantees. 
3. **Competitor Deflection:** If asked about competing architectural firms, politely pivot the conversation back to our firm's unique value proposition and proven methodologies.
4. **Escalation Protocol:** If a user expresses an urgent need for an immediate consultation, instantly trigger the escalation workflow to alert the principal architect.
5. **Lead Extraction:** Whenever a user provides their name and project details, use the client_profile_extraction tool to record their inquiry.`
        }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        if (call.name === 'client_profile_extraction') {
          try {
            await addDoc(collection(db, 'clientLeads'), {
              ...call.args,
              createdAt: serverTimestamp(),
              status: 'new'
            });
            setMessages(prev => [...prev, { role: 'ai', text: "Thank you for providing those details. I have successfully recorded your project inquiry and escalated it to our principal architect. They will review your requirements and reach out to you shortly to schedule a formal consultation." }]);
          } catch (dbError) {
            console.error('Failed to save lead:', dbError);
            setMessages(prev => [...prev, { role: 'ai', text: "I have noted your details, but I'm having trouble saving them to our system right now. Please feel free to also reach out directly at 0715 795 589." }]);
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: response.text || 'I am currently unable to process that request. Please try again or contact our office directly.' }]);
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      
      let userFriendlyMessage = "I apologize, but I'm having trouble connecting to our services right now. Please try again in a moment, or contact our office directly at 0715 795 589.";
      
      const errorMessage = (error?.message || error?.error?.message || '').toLowerCase();
      const errorStatus = error?.status || error?.error?.status || error?.response?.status || '';

      if (errorMessage.includes('api key') || errorMessage.includes('gemini_api_key is not defined') || errorStatus === 401 || errorStatus === 403) {
        userFriendlyMessage = "I'm currently experiencing configuration issues. Please contact our office directly at 0715 795 589.";
      } else if (errorStatus === 429 || errorMessage.includes('too many requests') || errorMessage.includes('rate limit')) {
        userFriendlyMessage = "I'm receiving too many requests right now. Please wait a moment and try again.";
      } else if (errorStatus === 503 || errorStatus === 500 || errorMessage.includes('overloaded') || errorMessage.includes('service unavailable')) {
        userFriendlyMessage = "Our AI service is temporarily overloaded. Please try again in a few moments.";
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('failed to connect')) {
        userFriendlyMessage = "It seems like there's a network issue. Please check your internet connection and try again.";
      } else if (errorStatus === 400 || errorMessage.includes('invalid argument')) {
        userFriendlyMessage = "I had trouble understanding that request. Could you please rephrase it?";
      }
      
      setMessages(prev => [...prev, { role: 'ai', text: userFriendlyMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-charcoal text-concrete dark:bg-concrete dark:text-charcoal rounded-full flex items-center justify-center shadow-2xl z-[9000] border border-bronze/30 hover:bg-bronze dark:hover:bg-bronze transition-colors duration-300"
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
            className="fixed bottom-24 right-6 w-80 sm:w-96 bg-concrete dark:bg-charcoal border border-steel/30 dark:border-concrete/30 shadow-2xl z-[9001] flex flex-col overflow-hidden transition-colors duration-500"
            style={{ height: '500px', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="bg-charcoal text-concrete dark:bg-[#111111] dark:text-concrete p-4 flex justify-between items-center border-b border-bronze/30 transition-colors duration-500">
              <div>
                <h3 className="font-display font-bold uppercase tracking-widest text-sm">AI Concierge</h3>
                <p className="text-xs text-steel font-mono">Danuthia & Co.</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setMessages([{ role: 'ai', text: 'Hello. I am the Danuthia & Co. AI Concierge. How can I assist you with your architectural or planning needs today?' }])}
                  className="text-xs text-steel hover:text-bronze transition-colors"
                  title="Clear Chat"
                >
                  Clear
                </button>
                <button onClick={() => setIsOpen(false)} className="text-steel hover:text-bronze transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-concrete/50 dark:bg-charcoal/50 transition-colors duration-500">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-charcoal text-concrete dark:bg-concrete dark:text-charcoal rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
                      : 'bg-steel/10 text-charcoal dark:bg-[#111111] dark:text-concrete border border-steel/20 dark:border-concrete/10 rounded-tr-lg rounded-br-lg rounded-bl-lg'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-steel/10 text-charcoal dark:bg-[#111111] dark:text-concrete border border-steel/20 dark:border-concrete/10 rounded-tr-lg rounded-br-lg rounded-bl-lg p-4 flex gap-1 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 bg-bronze rounded-full"
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 bg-concrete dark:bg-charcoal border-t border-steel/30 dark:border-concrete/30 flex gap-2 transition-colors duration-500">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about our services..."
                className="flex-1 bg-transparent border border-steel/30 dark:border-concrete/30 px-3 py-2 text-sm text-charcoal dark:text-concrete focus:outline-none focus:border-bronze dark:focus:border-bronze transition-colors placeholder:text-steel"
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-charcoal text-concrete dark:bg-concrete dark:text-charcoal p-2 hover:bg-bronze dark:hover:bg-bronze transition-colors disabled:opacity-50 disabled:hover:bg-charcoal dark:disabled:hover:bg-concrete"
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
