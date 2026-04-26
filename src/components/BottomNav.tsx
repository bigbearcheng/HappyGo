import { Search, BookMarked, BrainCircuit } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  activeTab: 'search' | 'notebook' | 'flashcards';
  onTabChange: (tab: 'search' | 'notebook' | 'flashcards') => void;
}

export default function BottomNav({ activeTab, onTabChange }: Props) {
  const tabs = [
    { id: 'search', label: '查词', icon: Search },
    { id: 'notebook', label: '笔记本', icon: BookMarked },
    { id: 'flashcards', label: '卡片', icon: BrainCircuit },
  ] as const;

  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-indigo-100 px-6 py-3 flex items-center justify-around z-50 rounded-t-[2rem] shadow-[0_-10px_30px_-10px_rgba(79,70,229,0.1)]">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`flex flex-col items-center gap-1 relative py-1 transition-all ${
            activeTab === id ? 'text-indigo-600' : 'text-gray-400'
          }`}
        >
          {activeTab === id && (
            <motion.div
              layoutId="activeTab"
              className="absolute -top-3 w-12 h-1 bg-indigo-600 rounded-full"
            />
          )}
          <Icon className={`w-6 h-6 ${activeTab === id ? 'stroke-[3]' : 'stroke-2'}`} />
          <span className={`text-[10px] font-black uppercase tracking-tighter transition-all ${
            activeTab === id ? 'opacity-100 scale-110' : 'opacity-70'
          }`}>
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
}
