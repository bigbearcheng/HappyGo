import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, X, Loader2, Volume2, BookOpen } from "lucide-react";
import { DictionaryResult, Language } from "../types";
import { generateStory, speakText } from "../services/ai";
import ReactMarkdown from "react-markdown";

interface Props {
  items: DictionaryResult[];
  nativeLang: Language;
  targetLang: Language;
  onClose: () => void;
}

export default function StoryMode({ items, nativeLang, targetLang, onClose }: Props) {
  const [story, setStory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const terms = items.map(i => i.term);
        const result = await generateStory(terms, nativeLang, targetLang);
        setStory(result);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, []);

  return (
    <div className="fixed inset-0 bg-indigo-900 z-[60] flex flex-col p-6 overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
           <Sparkles className="w-8 h-8 text-yellow-300" />
           <h2 className="text-2xl font-black text-white tracking-tighter">AI Story Teller</h2>
        </div>
        <button onClick={onClose} className="p-2 bg-white/10 rounded-xl text-white">
          <X className="w-6 h-6 border-[2.5]" />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-indigo-200">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <p className="font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Drafting Your Vibe Story</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl relative border-t-8 border-indigo-500">
            <div className="absolute top-4 right-6">
                <BookOpen className="w-10 h-10 text-indigo-50" />
            </div>
            <div className="prose prose-indigo text-indigo-900 font-bold leading-relaxed text-sm">
              <ReactMarkdown>{story || ''}</ReactMarkdown>
            </div>
            
            <button 
              onClick={() => speakText(story || '', targetLang.code)}
              className="mt-8 w-full py-5 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center gap-2 font-black shadow-xl active:scale-95 transition-transform uppercase tracking-widest text-xs"
            >
              <Volume2 className="w-6 h-6" />
              Listen to AI Narration
            </button>
          </div>

          <div className="text-center pb-12">
            <p className="text-indigo-300 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Vocabulary Used</p>
            <div className="flex flex-wrap justify-center gap-2">
              {items.map(i => (
                <span key={i.id} className="bg-indigo-800 text-indigo-100 px-3 py-1.5 rounded-xl text-[10px] font-black border border-indigo-700 uppercase">
                  {i.term}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
