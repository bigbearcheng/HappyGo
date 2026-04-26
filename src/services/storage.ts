import { DictionaryResult } from "../types";

const STORAGE_KEY = 'lingovibe_notebook';

export const storage = {
  saveResult: (result: DictionaryResult) => {
    const notebook = storage.getNotebook();
    const exists = notebook.find(item => item.term === result.term && item.id !== result.id);
    if (exists) return; // Don't duplicate terms necessarily if they are the same
    
    // We can also check by ID if we want to update
    const updated = [result, ...notebook.filter(item => item.id !== result.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
  
  removeResult: (id: string) => {
    const notebook = storage.getNotebook();
    const updated = notebook.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },
  
  getNotebook: (): DictionaryResult[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  clearNotebook: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};
