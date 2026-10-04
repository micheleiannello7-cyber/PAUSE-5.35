// Font loader for PAUSE — un'unica famiglia bundled: Plus Jakarta Sans (OFL),
// nei cinque pesi usati dalla scala tipografica in `theme.ts`.
import { useEffect, useState } from "react";
import * as Font from "expo-font";

export const FONT_SOURCES = {
  PlusJakartaSans_400Regular: require("../../assets/fonts/PlusJakartaSans-Regular.ttf"),
  PlusJakartaSans_500Medium: require("../../assets/fonts/PlusJakartaSans-Medium.ttf"),
  PlusJakartaSans_600SemiBold: require("../../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
  PlusJakartaSans_700Bold: require("../../assets/fonts/PlusJakartaSans-Bold.ttf"),
  PlusJakartaSans_800ExtraBold: require("../../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
};

// Resolves to `true` once fonts are loaded. Fail-open after 3s so a hanging
// font request (restricted webviews) can never block the UI.
export function useLoadFonts() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const done = () => {
      if (!cancelled) setReady(true);
    };
    const timer = setTimeout(done, 3000);
    Font.loadAsync(FONT_SOURCES)
      .catch(() => {})
      .finally(() => {
        clearTimeout(timer);
        done();
      });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);
  return ready;
}
