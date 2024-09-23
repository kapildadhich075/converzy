import { create } from "zustand";

interface ConfigState {
  isGemini: boolean;
  setIsGemini: (isGemini: boolean) => void;
  openAIKey: string | null;
  setOpenAIKey: (openAIKey: string) => void;
}

export const useConfig = create<ConfigState>((set) => ({
  isGemini: false,
  setIsGemini: (isGemini) => set({ isGemini }),
  openAIKey: null,
  setOpenAIKey: (openApiKey: string) => {
    if (openApiKey) {
      set({ openAIKey: openApiKey });
    } else {
      set({ openAIKey: null });
    }
  },
}));
