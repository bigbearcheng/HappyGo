import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DictionaryResult, Language } from "../types";
import { Volume2, X, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { speakText } from "../services/ai";

interface Props {
  items: DictionaryResult[];
  targetLang: Language;
  onClose: () => void;
}

export default function FlashcardMode({ items, targetLang }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const item = items[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  if (items.length === 0) return (
    <div className="flex flex-col items-center justify-center p-12 text-center h-full">
       <h2 className="text-2xl font-black mb-4">No cards yet!</h2>
       <p className="text-indigo-400 mb-8">Save some words to your notebook to start studying.</p>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-indigo-600 p-6 pt-12 pb-32">
      <div className="flex items-center justify-between mb-8 text-white">
        <h2 className="text-2xl font-black tracking-tighter uppercase italic">Study Mode</h2>
        <div className="bg-white/20 px-4 py-1 rounded-full font-bold text-sm tracking-widest">
          {currentIndex + 1} / {items.length}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="w-full max-w-sm aspect-[3/4] relative cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.div
              className="w-full h-full relative preserve-3d"
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              {/* Front */}
              <div className="absolute inset-0 w-full h-full bg-white rounded-[3rem] p-8 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl">
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt="" 
                    className="w-48 h-48 object-cover rounded-3xl mb-8 shadow-inner border border-indigo-50"
                    referrerPolicy="no-referrer"
                  />
                )}
                <h3 className="text-4xl font-black text-indigo-900 mb-2 tracking-tighter">{item.term}</h3>
                <p className="text-indigo-300 font-black uppercase tracking-[0.2em] text-[10px]">Tap to Reveal</p>
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 w-full h-full bg-yellow-300 rounded-[3rem] p-8 flex flex-col backface-hidden shadow-2xl"
                style={{ transform: "rotateY(180deg)" }}
              >
                <div className="flex-1 overflow-y-auto space-y-6 no-scrollbar">
                  <div className="text-center pt-8">
                    <h3 className="text-3xl font-black text-indigo-900 mb-4 tracking-tighter">{item.term}</h3>
                    <div className="h-1 w-12 bg-indigo-900/20 mx-auto rounded-full" />
                  </div>
                  
                  <section>
                    <label className="text-[10px] font-black uppercase text-indigo-900/40 block mb-1 tracking-widest">Definition</label>
                    <p className="text-lg font-bold text-indigo-900 leading-tight">
                      {item.nativeExplanation}
                    </p>
                  </section>

                  <section className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-indigo-900/40 block mb-1 tracking-widest">Context</label>
                    {item.examples.map((ex, i) => (
                      <div key={i} className="bg-white/40 p-3 rounded-2xl border border-indigo-900/5">
                        <p className="text-sm font-black text-indigo-900 mb-1">{ex.text}</p>
                        <p className="text-[10px] font-bold text-indigo-900/60 leading-tight uppercase tracking-tight">{ex.translation}</p>
                      </div>
                    ))}
                  </section>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    speakText(item.term, targetLang.code);
                  }}
                  className="mt-4 w-full py-5 bg-indigo-900 text-white rounded-[2rem] flex items-center justify-center gap-2 font-black shadow-lg uppercase tracking-widest text-xs"
                >
                  <Volume2 className="w-5 h-5" />
                  Pronounce
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-4 mt-12 w-full max-w-sm">
          <button 
            onClick={handlePrev}
            className="flex-1 py-5 bg-white/10 hover:bg-white/20 text-white rounded-3xl flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            onClick={handleNext}
            className="flex-1 py-5 bg-white/10 hover:bg-white/20 text-white rounded-3xl flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
