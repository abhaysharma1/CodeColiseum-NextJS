const languages = [
  {
    id: 50,
    name: "C",
    monacoLang: "c",
  },
  {
    id: 54,
    name: "C++",
    monacoLang: "cpp",
  },
  {
    id: 51,
    name: "C#",
    monacoLang: "csharp",
  },
  {
    id: 60,
    name: "Go",
    monacoLang: "go",
  },
  {
    id: 62,
    name: "Java",
    monacoLang: "java",
  },
  {
    id: 63,
    name: "JavaScript",
    monacoLang: "javascript",
  },
  {
    id: 71,
    name: "Python",
    monacoLang: "python",
  },
  {
    id: 73,
    name: "Rust",
    monacoLang: "rust",
  },
  {
    id: 74,
    name: "TypeScript",
    monacoLang: "typescript",
  },
];

export const getLanguageId = (language: string) => {
  const foundLanguage = languages.find(
    (item) => item.monacoLang.toLowerCase() == language.toLowerCase()
  );

  return foundLanguage?.id;
};
