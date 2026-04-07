import { supportedLanguages as catalog } from "@/utils/languageCatalog";

export const languages = catalog.map((item) => ({
  id: item.runtimeId,
  name: item.label,
}));
