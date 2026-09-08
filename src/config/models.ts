export interface ModelOption {
  id: string;
  label: string;
}

export const MODELS: ModelOption[] = [
  { id: "gemini-3.6-flash", label: "Gemini 3.6 Flash" },
];

export const DEFAULT_MODEL = "gemini-3.6-flash";
