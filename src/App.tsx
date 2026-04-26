import { useState, useEffect } from "react";
import { DictionaryResult, Language } from "./types";
import { getDictionaryResult, generateConceptImage } from "./services/ai";
import { storage } from "./services/storage";
import LanguageSelector from "./components/LanguageSelector";
import SearchHero from "./components/SearchHero";
import ResultCard from "./components/ResultCard";
import Notebook from "./components/Notebook";
import FlashcardMode from "./components/FlashcardMode";
import StoryMode from "./components/StoryMode";
import ChatOverlay from "./components/ChatOverlay";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft } from "lucide-react";

import BottomNav from "./components/BottomNav";

type AppState = 'onboarding' | 'main';
type Tab = 'search' | 'notebook' | 'flashcards';

export default function App() {
  const [state, setState] = useState<AppState>('onboarding');
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [nativeLang, setNativeLang] = useState<Language | null>(null);
  const [targetLang, setTargetLang] = useState<Language | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<DictionaryResult | null>(null);
  const [notebook, setNotebook] = useState<DictionaryResult[]>(storage.getNotebook());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);

  // Persistence for languages
  useEffect(() => {
    try {
      const sNative = localStorage.getItem('lingovibe_native');
      const sTarget = localStorage.getItem('lingovibe_target');
      if (sNative && sTarget) {
        const parsedNative = JSON.parse(sNative);
        const parsedTarget = JSON.parse(sTarget);
        if (parsedNative && parsedTarget) {
          setNativeLang(parsedNative);
          setTargetLang(parsedTarget);
          setState('main');
        }
      }
    } catch (e) {
      console.error("Failed to load saved languages:", e);
      localStorage.removeItem('lingovibe_native');
      localStorage.removeItem('lingovibe_target');
    }
  }, []);

  const handleConfirmOnboarding = () => {
    if (nativeLang && targetLang) {
      localStorage.setItem('lingovibe_native', JSON.stringify(nativeLang));
      localStorage.setItem('lingovibe_target', JSON.stringify(targetLang));
      setState('main');
    }
  };

  const handleSearch = async (query: string) => {
    if (!nativeLang || !targetLang) return;
    setIsLoading(true);
    try {
      const result = await getDictionaryResult(query, nativeLang, targetLang);
      setCurrentResult(result);
      setIsResultOpen(true);
      
      const imageUrl = await generateConceptImage(query);
      setCurrentResult(prev => prev ? { ...prev, imageUrl } : null);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('429') || e.message?.includes('quota')) {
        alert("API配额已用尽。请1分钟后重试，或检查您的 Gemini API 限制。");
      } else {
        alert("AI 查询出错，请尝试其他词汇！");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (result: DictionaryResult) => {
    storage.saveResult(result);
    setNotebook(storage.getNotebook());
  };

  const handleSwapLanguages = () => {
    if (nativeLang && targetLang) {
      const newNative = targetLang;
      const newTarget = nativeLang;
      setNativeLang(newNative);
      setTargetLang(newTarget);
      localStorage.setItem('lingovibe_native', JSON.stringify(newNative));
      localStorage.setItem('lingovibe_target', JSON.stringify(newTarget));
    }
  };

  const handleRemove = (id: string) => {
    storage.removeResult(id);
    setNotebook(storage.getNotebook());
  };

  const handleResetLanguages = () => {
    localStorage.removeItem('lingovibe_native');
    localStorage.removeItem('lingovibe_target');
    setState('onboarding');
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-indigo-50 relative overflow-x-hidden font-sans pb-24">
      <AnimatePresence mode="wait">
        {state === 'onboarding' && (
          <LanguageSelector
            native={nativeLang}
            target={targetLang}
            onSelectNative={setNativeLang}
            onSelectTarget={setTargetLang}
            onConfirm={handleConfirmOnboarding}
          />
        )}

        {state === 'main' && (
          <div className="min-h-screen flex flex-col">
            <main className="flex-1 overflow-y-auto">
              {activeTab === 'search' && (
                <motion.div
                  key="search-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <SearchHero
                    onSearch={handleSearch}
                    isLoading={isLoading}
                    onSwapLanguages={handleSwapLanguages}
                    onResetLanguages={handleResetLanguages}
                    onOpenNotebook={() => setActiveTab('notebook')}
                    onOpenStudy={() => setActiveTab('flashcards')}
                    nativeFlag={nativeLang?.flag || ''}
                    targetFlag={targetLang?.flag || ''}
                  />
                </motion.div>
              )}

              {activeTab === 'notebook' && (
                <Notebook
                  items={notebook}
                  onRemove={handleRemove}
                  onSelect={(item) => {
                    setCurrentResult(item);
                    setIsResultOpen(true);
                  }}
                  onClose={() => setActiveTab('search')}
                  onOpenStory={() => setIsStoryOpen(true)}
                />
              )}

              {activeTab === 'flashcards' && (
                <FlashcardMode
                  items={notebook}
                  targetLang={targetLang!}
                  onClose={() => setActiveTab('search')}
                />
              )}
            </main>

            <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        )}
      </AnimatePresence>

      {/* Overlays */}
      <AnimatePresence>
        {isResultOpen && currentResult && (
          <motion.div
            key="result-overlay"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[60] bg-indigo-50 overflow-y-auto pb-10"
          >
            <div className="px-6 pt-10 pb-4 flex items-center justify-between">
              <button 
                onClick={() => setIsResultOpen(false)}
                className="p-3 bg-white rounded-2xl shadow-sm border border-indigo-100 text-indigo-600 hover:bg-indigo-50"
              >
                <ArrowLeft className="w-5 h-5 stroke-[3]" />
              </button>
              <h2 className="font-black text-indigo-900 uppercase tracking-widest text-xs">Vibe Analysis</h2>
              <div className="w-10"></div>
            </div>
            <ResultCard
              result={currentResult}
              targetLang={targetLang!}
              onSave={handleSave}
              onOpenChat={() => setIsChatOpen(true)}
              isSaved={notebook.some(i => i.term.toLowerCase() === currentResult.term.toLowerCase())}
            />
          </motion.div>
        )}

        {isStoryOpen && notebook.length >= 2 && (
          <StoryMode
            items={notebook.slice(0, 5)}
            nativeLang={nativeLang!}
            targetLang={targetLang!}
            onClose={() => setIsStoryOpen(false)}
          />
        )}

        {isChatOpen && currentResult && (
          <ChatOverlay
            term={currentResult.term}
            nativeLang={nativeLang!}
            targetLang={targetLang!}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
