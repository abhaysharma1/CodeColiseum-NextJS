import defaultTheme from "./Default.json";
import darkmatter from "./Darkmatter.json";
import bubblegum from "./Bubblegum.json";
import caffeine from "./Caffeine.json";
import claymorphism from "./Claymorphism.json";
import doom64 from "./Doom 64.json";
import neoBrutalism from "./Neo Brutalism.json";
import notebook from "./Notebook.json";
import softPop from "./Soft Pop.json";
import amberminimal from "./Amber Minimal.json";

const themeArray = [
  defaultTheme,
  darkmatter,
  bubblegum,
  caffeine,
  claymorphism,
  doom64,
  neoBrutalism,
  notebook,
  softPop,
  amberminimal,
];

export const THEMES = Object.fromEntries(
  themeArray.map((theme) => [
    theme.name, // 🔥 use JSON's "name" field
    theme,
  ]),
);

export type ThemeName = keyof typeof THEMES;
