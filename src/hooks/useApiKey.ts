import { useState, useCallback } from "react";
import { loadApiKey, saveApiKey, clearApiKey } from "../lib/storage";

export interface UseApiKey {
  apiKey: string;
  isConfigured: boolean;
  save: (key: string) => void;
  clear: () => void;
}

export function useApiKey(): UseApiKey {
  const [apiKey, setApiKey] = useState<string>(() => loadApiKey());

  const save = useCallback((key: string) => {
    const trimmed = key.trim();
    saveApiKey(trimmed);
    setApiKey(trimmed);
  }, []);

  const clear = useCallback(() => {
    clearApiKey();
    setApiKey("");
  }, []);

  return {
    apiKey,
    isConfigured: apiKey.length > 0,
    save,
    clear,
  };
}
