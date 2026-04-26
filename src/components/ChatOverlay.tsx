import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, X, Loader2, User, Bot, Sparkles } from "lucide-react";
import { ChatMessage, Language } from "../types";
import { chatAboutTerm } from "../services/ai";

interface Props {
  term: string;
  nativeLang: Language;
  targetLang: Language;
  onClose: () => void;
}

export default function ChatOverlay({ term, nativeLang, targetLang, onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    setMessages([
      { role: 'assistant', content: `Hey! Any questions about **"${term}"**? I can explain how to use it in different contexts or tell you more about its origin!` }
    ]);
  }, [term]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const response = await chatAboutTerm(term, messages, userMsg, nativeLang, targetLang);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops, something went wrong. Try again!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-[70] bg-white flex flex-col md:inset-auto md:bottom-24 md:right-6 md:w-[400px] md:h-[650px] md:rounded-[2.5rem] md:shadow-2xl md:border md:border-indigo-100 overflow-hidden"
    >
      <div className="p-5 bg-indigo-600 text-white flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/10">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight">AI Mentor</h3>
            <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-black">Active Context: {term}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
          <X className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 no-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] p-4 rounded-2xl group relative ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20' 
                : 'bg-white text-indigo-900 shadow-sm border border-indigo-100 rounded-tl-none'
            }`}>
              <div 
                className="text-xs font-bold leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black">$1</strong>') }}
              />
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-indigo-100 flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div 
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="w-1.5 h-1.5 bg-indigo-200 rounded-full" 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-indigo-50 flex gap-3">
        <input 
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a question..."
          className="flex-1 bg-gray-100 p-4 rounded-2xl outline-none focus:bg-white transition-all text-xs font-black placeholder:text-gray-400 border-2 border-transparent focus:border-indigo-600"
        />
        <button 
          type="submit"
          disabled={loading || !input.trim()}
          className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/30 active:scale-90 transition-transform disabled:opacity-50"
        >
          <Send className="w-5 h-5 stroke-[2.5]" />
        </button>
      </form>
    </motion.div>
  );
}
