import { motion, AnimatePresence } from "motion/react";
import { Trash2, ChevronRight, X, Sparkles, BookOpen } from "lucide-react";
import { DictionaryResult } from "../types";

interface Props {
  items: DictionaryResult[];
  onRemove: (id: string) => void;
  onSelect: (item: DictionaryResult) => void;
  onClose: () => void;
  onOpenStory: () => void;
}

export default function Notebook({ items, onRemove, onSelect, onClose, onOpenStory }: Props) {
  return (
    <div className="fixed inset-0 bg-gray-50 z-40 flex flex-col pt-12">
      <div className="px-6 flex items-center justify-between mb-8">
        <h2 className="text-4xl font-black text-indigo-900 tracking-tighter">My Library</h2>
        <button onClick={onClose} className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm border border-indigo-100">
          <X className="w-6 h-6 stroke-[3]" />
        </button>
      </div>

      <div className="px-6 mb-8">
        <button 
          onClick={onOpenStory}
          disabled={items.length < 2}
          className="w-full bg-indigo-600 p-5 rounded-3xl flex items-center justify-center gap-3 text-white font-black shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95 uppercase tracking-widest text-xs"
        >
          <Sparkles className="w-5 h-5 text-yellow-300" />
          Generate Concept Story
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-20 no-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <BookOpen className="w-20 h-20 mb-4 text-indigo-300" />
            <p className="font-black text-indigo-900 uppercase tracking-widest text-xs">Library Empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative bg-white border border-indigo-50 rounded-[1.5rem] p-3 flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98]"
                >
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt="" 
                      className="w-14 h-14 rounded-xl object-cover border border-indigo-50"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-300">
                      <BookOpen className="w-6 h-6" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0" onClick={() => onSelect(item)}>
                    <h4 className="font-black text-indigo-900 text-base truncate tracking-tight">{item.term}</h4>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest truncate">{item.nativeExplanation}</p>
                  </div>
                  <button 
                    onClick={() => onRemove(item.id)}
                    className="p-2.5 text-indigo-200 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
