export interface ModelOption {
  id: string;
  label: string;
}

export const MODELS: ModelOption[] = [
  { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash (default)" },
  { id: "gemini-2.5-flash-lite-preview-06-17", label: "Gemini 2.5 Flash Lite" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
];

export const DEFAULT_MODEL = "gemini-3.6-flash";
