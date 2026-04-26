import { motion } from "motion/react";
import { Languages, ChevronRight } from "lucide-react";
import { LANGUAGES, Language } from "../types";

interface Props {
  native: Language | null;
  target: Language | null;
  onSelectNative: (l: Language) => void;
  onSelectTarget: (l: Language) => void;
  onConfirm: () => void;
}

export default function LanguageSelector({ native, target, onSelectNative, onSelectTarget, onConfirm }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-indigo-600 text-white">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center">
          <Languages className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h1 className="text-4xl font-black tracking-tight uppercase">LingoVibe</h1>
          <p className="mt-2 text-indigo-200 text-sm font-bold tracking-widest">AI DICTIONARY & MENTOR</p>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-700/30 p-4 rounded-3xl border border-white/10">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-3 ml-2">My Native Language</label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={`native-${lang.code}`}
                  onClick={() => onSelectNative(lang)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all text-xs font-bold ${
                    native?.code === lang.code 
                      ? 'bg-yellow-400 border-yellow-400 text-indigo-900 shadow-lg' 
                      : 'border-transparent bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.nativeName}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-indigo-700/30 p-4 rounded-3xl border border-white/10">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 mb-3 ml-2">Learning Language</label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={`target-${lang.code}`}
                  onClick={() => onSelectTarget(lang)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all text-xs font-bold ${
                    target?.code === lang.code 
                      ? 'bg-white border-white text-indigo-900 shadow-lg' 
                      : 'border-transparent bg-white/5 hover:bg-white/10 text-white'
                  }`}
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>

        {native && target && native.code !== target.code && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={onConfirm}
            className="w-full py-5 mt-8 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-black rounded-3xl flex items-center justify-center gap-2 text-lg shadow-2xl shadow-indigo-900/50 active:scale-95 transition-transform uppercase tracking-tighter"
          >
            Enter Experience <ChevronRight className="w-6 h-6" />
          </motion.button>
        )}

        {native?.code === target?.code && native && (
          <p className="text-center text-xs font-bold text-yellow-400 mt-4 tracking-widest uppercase">Select different languages</p>
        )}
      </motion.div>
    </div>
  );
}
