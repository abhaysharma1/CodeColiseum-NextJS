import { getRuntimeLanguageId } from "@/utils/languageCatalog";

export const getLanguageId = (language: string) => {
  return getRuntimeLanguageId(language);
};
