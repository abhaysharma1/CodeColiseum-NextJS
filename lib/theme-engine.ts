export function applyThemeObject(
  themeJson: any,
  mode: "light" | "dark"
) {
  const root = document.documentElement;

  const { cssVars, css } = themeJson;

  // 1️⃣ Apply shared theme variables
  if (cssVars?.theme) {
    Object.entries(cssVars.theme).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, String(value));
    });
  }

  // 2️⃣ Apply light/dark specific variables
  if (cssVars?.[mode]) {
    Object.entries(cssVars[mode]).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, String(value));
    });
  }

  // 3️⃣ Apply optional base css (like letter-spacing)
  if (css?.["@layer base"]?.body) {
    Object.entries(css["@layer base"].body).forEach(([key, value]) => {
      root.style.setProperty(key, String(value));
    });
  }
}
