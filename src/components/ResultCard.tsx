import { motion } from "motion/react";
import { Volume2, Bookmark, MessageCircle, ChevronDown, CheckCircle2, Download } from "lucide-react";
import { DictionaryResult, Language } from "../types";
import { speakText } from "../services/ai";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import { toPng } from "html-to-image";

interface Props {
  result: DictionaryResult;
  targetLang: Language;
  onSave: (r: DictionaryResult) => void;
  onOpenChat: () => void;
  isSaved?: boolean;
}

export default function ResultCard({ result, targetLang, onSave, onOpenChat, isSaved }: Props) {
  const [justSaved, setJustSaved] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#f8fafc',
      });
      const link = document.createElement('a');
      link.download = `lingovibe-${result.term.toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to capture screenshot:', err);
      alert("截图生成失败，可能是由于浏览器兼容性问题。");
    }
  };

  const handleSave = () => {
    onSave(result);
    setJustSaved(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#fbbf24', '#ffffff']
    });
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pb-24 overflow-hidden"
    >
      <div ref={cardRef} className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-indigo-50 mx-4 mt-2">
        {/* Header Section */}
        <div className="bg-indigo-600 px-6 pt-12 pb-8 text-white relative">
           <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-60 mb-2">Word of Vibe</p>
                <h2 className="text-5xl font-black tracking-tighter leading-none mb-2">{result.term}</h2>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-full border border-white/10">
                   <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse" />
                   <p className="text-[9px] font-black tracking-widest uppercase">{targetLang.name}</p>
                </div>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={handleDownload}
                  className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors text-white"
                  title="Download Image"
                 >
                   <Download className="w-6 h-6" />
                 </button>
                 <button 
                   onClick={() => speakText(result.term, targetLang.code)}
                   className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"
                 >
                   <Volume2 className="w-6 h-6" />
                 </button>
                 <button 
                  onClick={handleSave}
                  disabled={isSaved || justSaved}
                  className={`p-3 rounded-xl transition-all ${
                    isSaved || justSaved 
                      ? 'bg-yellow-400 text-indigo-900' 
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {isSaved || justSaved ? <CheckCircle2 className="w-6 h-6" /> : <Bookmark className="w-6 h-6" />}
                </button>
              </div>
           </div>
        </div>

        <div className="p-4 space-y-4 bg-gray-50">
          {/* Concept Image Block */}
          {result.imageUrl && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border-2 border-white shadow-md bg-indigo-100 w-48 h-48 mx-auto"
            >
              <img 
                src={result.imageUrl} 
                alt={result.term} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </motion.div>
          )}

          {/* Main Definition - High Density Style */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100 flex gap-4">
            <div className="flex-1">
              <div className="mb-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 block mb-2">Definition ({targetLang.name})</label>
                <p className="text-xl font-black text-indigo-900 leading-tight tracking-tight">
                  {result.targetExplanation}
                </p>
              </div>
              <div className="pt-3 border-t border-indigo-100 bg-indigo-50/30 -mx-4 px-4 py-2 mt-4 rounded-b-xl">
                <label className="text-[9px] font-black uppercase tracking-widest text-indigo-300 block mb-1">Native Meaning</label>
                <p className="text-[13px] font-bold text-indigo-600 leading-tight">
                  {result.nativeExplanation}
                </p>
              </div>
            </div>
          </div>

          {/* Examples Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {result.examples.map((ex, idx) => (
              <div key={idx} className={`${idx === 0 ? 'bg-blue-50 border-blue-100' : 'bg-emerald-50 border-emerald-100'} p-4 rounded-xl border relative group`}>
                <p className="text-[9px] font-black uppercase mb-2 opacity-50">Example {idx + 1}</p>
                <p className="text-sm font-black text-gray-800 leading-snug mb-1 italic">"{ex.text}"</p>
                <p className="text-[11px] text-gray-500 font-medium leading-tight">“{ex.translation}”</p>
                <button 
                  onClick={() => speakText(ex.text, targetLang.code)}
                  className="absolute right-2 top-2 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Usage Notes - Friend Tips */}
          <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">💡</span>
              <h3 className="text-[10px] font-black text-orange-800 uppercase tracking-[0.2em]">Context & Usage</h3>
            </div>
            <div className="text-xs text-gray-700 leading-relaxed font-medium">
              {result.usageNotes}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onOpenChat}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-5 rounded-full shadow-2xl shadow-indigo-400 flex items-center gap-2 font-black z-10 uppercase tracking-tighter text-sm"
      >
        <MessageCircle className="w-6 h-6" />
        <span>Ask AI</span>
      </motion.button>
    </motion.div>
  );
}
