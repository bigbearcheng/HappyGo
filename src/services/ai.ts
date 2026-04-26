import { GoogleGenAI, Type } from "@google/genai";
import { DictionaryResult, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isQuotaError = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');
    if (isQuotaError && retries > 0) {
      console.warn(`Quota exceeded, retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export async function getDictionaryResult(
  query: string,
  nativeLang: Language,
  targetLang: Language
): Promise<DictionaryResult> {
  const prompt = `
    Analyze the following word, phrase, or sentence: "${query}"

    CONTEXT:
    - User's native language: ${nativeLang.name} (${nativeLang.code})
    - User's learning (target) language: ${targetLang.name} (${targetLang.code})

    TASKS:
    1. Determine if the input "${query}" is in the native language or the target language.
    2. If it is in the NATIVE language, provide the equivalent word/phrase in the TARGET language as the primary term to explain.
    3. If it is in the TARGET language, explain it directly.

    REQUIRED OUTPUT (All in JSON format):
    - term: The actual word/phrase in the TARGET language that we are learning.
    - targetExplanation: A concise, simple definition of the term in the TARGET language (${targetLang.name}). This must be the main explanation.
    - nativeExplanation: A natural, clear translation/explanation in ${nativeLang.name}.
    - examples: Exactly two example sentences in ${targetLang.name}, each with a translation in ${nativeLang.name}.
    - usageNotes: Friendly, conversational notes in ${nativeLang.name} about culture, context, tone, and common mistakes. Keep it concise and informal.
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING },
            targetExplanation: { type: Type.STRING },
            nativeExplanation: { type: Type.STRING },
            examples: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  translation: { type: Type.STRING },
                },
                required: ["text", "translation"],
              },
            },
            usageNotes: { type: Type.STRING },
          },
          required: ["term", "targetExplanation", "nativeExplanation", "examples", "usageNotes"],
        },
      },
    });

    const result = JSON.parse(response.text);
    return {
      id: Math.random().toString(36).substring(7),
      ...result,
      timestamp: Date.now(),
    };
  });
}

export async function generateConceptImage(term: string): Promise<string> {
  const prompt = `A clean, vibrant, and minimalist visual representation of the concept: "${term}". 3D render style with soft lighting and solid background. The image should be easy to understand at a glance.`;
  
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return '';
  });
}

export async function chatAboutTerm(
  term: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  latestMsg: string,
  nativeLang: Language,
  targetLang: Language
): Promise<string> {
  return withRetry(async () => {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are a helpful language mentor. The user is learning "${term}" in ${targetLang.name}. Their native language is ${nativeLang.name}. Keep your answers concise, friendly, and informal. Focus on practical usage and cultural nuances.`,
      }
    });

    const response = await chat.sendMessage({
      message: latestMsg
    });
    
    return response.text;
  });
}

export async function generateStory(terms: string[], nativeLang: Language, targetLang: Language): Promise<string> {
  const prompt = `Create a very short, fun, and engaging story in ${targetLang.name} using these terms: ${terms.join(', ')}. Then provide a translation in ${nativeLang.name}. The story should be aimed at a language learner.`;
  
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    
    return response.text;
  });
}

export async function speakText(text: string, langCode: string): Promise<void> {
  const codeMapping: Record<string, string> = {
    'en': 'en-US',
    'zh': 'zh-CN',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'pt': 'pt-BR',
    'it': 'it-IT',
    'ru': 'ru-RU'
  };

  const fullLang = codeMapping[langCode] || langCode;

  return new Promise((resolve) => {
    const triggerSpeech = () => {
      // Cancel existing to stop current talk
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = fullLang;
      
      const voices = window.speechSynthesis.getVoices();
      const femaleKeywords = ['female', 'woman', 'samantha', 'victoria', 'google us english', 'zira', 'mei-jia', 'ting-ting', 'kyoko', 'yuzuru', 'nana'];
      
      const targetVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const matchesLang = v.lang.toLowerCase().replace('_', '-').startsWith(fullLang.split('-')[0]);
        const isFemale = femaleKeywords.some(key => name.includes(key));
        return matchesLang && isFemale;
      }) || voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(fullLang.split('-')[0]));

      if (targetVoice) {
        utterance.voice = targetVoice;
      }
      
      utterance.rate = 1.0; 
      utterance.volume = 1.0;
      utterance.pitch = 1.1;

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        console.error('SpeechSynthesis Error:', e);
        resolve();
      };

      // Small delay on some mobile browsers helps
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      triggerSpeech();
    } else {
      const checkVoices = setInterval(() => {
        if (window.speechSynthesis.getVoices().length > 0) {
          clearInterval(checkVoices);
          triggerSpeech();
        }
      }, 100);
      
      // Safety timeout after 2s
      setTimeout(() => {
        clearInterval(checkVoices);
        if (!window.speechSynthesis.speaking) triggerSpeech();
      }, 2000);
    }
  });
}
