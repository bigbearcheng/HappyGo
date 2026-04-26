import { useState } from "react";
import { Search, Loader2, Sparkles, BookMarked, BrainCircuit } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  onSearch: (q: string) => void;
  isLoading: boolean;
  onOpenNotebook: () => void;
  onOpenStudy: () => void;
  onSwapLanguages: () => void;
  onResetLanguages: () => void;
  nativeFlag: string;
  targetFlag: string;
}

export default function SearchHero({ onSearch, isLoading, onOpenNotebook, onOpenStudy, onSwapLanguages, onResetLanguages, nativeFlag, targetFlag }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="p-6 pt-12 text-indigo-900">
      <div className="flex items-center justify-between mb-10">
        <button 
          onClick={onResetLanguages}
          className="p-3 bg-white rounded-2xl shadow-sm border border-indigo-100 text-indigo-400 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-6 h-6 stroke-[2.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
        </button>
        <button 
          onClick={onSwapLanguages}
          className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-indigo-100 shadow-sm hover:bg-indigo-50 active:scale-95 transition-all cursor-pointer"
        >
           <span className="text-lg">{nativeFlag}</span>
           <svg className="w-3 h-3 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" />
           </svg>
           <span className="text-lg">{targetFlag}</span>
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-5xl font-black leading-[0.9] tracking-tighter mb-3">
          Explore <br />
          <span className="text-indigo-600">The Vibe.</span>
        </h1>
        <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">What's your word for today?</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Serendipity"
          className="w-full pt-6 pb-6 pl-6 pr-20 bg-white rounded-3xl shadow-xl shadow-indigo-200/20 border-2 border-transparent focus:border-indigo-600 outline-none text-xl placeholder:text-indigo-200 transition-all font-black tracking-tight"
        />
        <button
          disabled={isLoading || !query.trim()}
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-4 bg-indigo-600 text-white rounded-2xl shadow-lg active:scale-90 transition-transform disabled:opacity-50 disabled:active:scale-100 shadow-indigo-600/30"
        >
          {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6 stroke-[3]" />}
        </button>
      </form>

      {isLoading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 flex flex-col items-center justify-center gap-2"
        >
          <div className="flex gap-1">
             {[0, 1, 2].map(i => (
               <motion.div 
                 key={i}
                 animate={{ scale: [1, 1.5, 1] }} 
                 transition={{ repeat: Infinity, delay: i * 0.2 }}
                 className="w-1.5 h-1.5 bg-indigo-400 rounded-full" 
               />
             ))}
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.3em] text-indigo-300">AI Synthesizing</span>
        </motion.div>
      )}
    </div>
  );
}
