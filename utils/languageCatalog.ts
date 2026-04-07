import languages from "@/utils/languages.json";

export type LanguageKey = "c" | "cpp" | "python" | "java";

type LanguageCatalogEntry = {
  key: string;
  label: string;
  monaco: string;
  runtimeId: number;
};

const catalog = (languages as LanguageCatalogEntry[]).map((item) => ({
  ...item,
  key: item.key.toLowerCase().trim() as LanguageKey,
  monaco: item.monaco.toLowerCase().trim(),
}));

const keyToRuntimeId = new Map<LanguageKey, number>();
const runtimeIdToKey = new Map<number, LanguageKey>();
const monacoToKey = new Map<string, LanguageKey>();
const keyToLabel = new Map<LanguageKey, string>();

for (const item of catalog) {
  keyToRuntimeId.set(item.key, item.runtimeId);
  runtimeIdToKey.set(item.runtimeId, item.key);
  monacoToKey.set(item.monaco, item.key);
  keyToLabel.set(item.key, item.label);
}

export const supportedLanguages = catalog.map((item) => ({
  key: item.key,
  label: item.label,
  monaco: item.monaco,
  runtimeId: item.runtimeId,
}));

export const getRuntimeLanguageId = (language: string): number | undefined => {
  const normalized = language.toLowerCase().trim();
  const key =
    monacoToKey.get(normalized) ??
    (keyToRuntimeId.has(normalized as LanguageKey)
      ? (normalized as LanguageKey)
      : null);

  if (!key) {
    return undefined;
  }

  return keyToRuntimeId.get(key);
};

export const getLanguageKey = (language: string): LanguageKey | undefined => {
  const normalized = language.toLowerCase().trim();
  return (
    monacoToKey.get(normalized) ??
    (keyToRuntimeId.has(normalized as LanguageKey)
      ? (normalized as LanguageKey)
      : undefined)
  );
};

export const getLanguageLabel = (language: string): string | undefined => {
  const key = getLanguageKey(language);
  if (!key) {
    return undefined;
  }

  return keyToLabel.get(key);
};

export const getMonacoLanguage = (language: string): string | undefined => {
  const key = getLanguageKey(language);
  if (!key) {
    return undefined;
  }

  return supportedLanguages.find((item) => item.key === key)?.monaco;
};

export const getLanguageKeyFromRuntimeId = (
  runtimeId: number
): LanguageKey | undefined => runtimeIdToKey.get(runtimeId);
