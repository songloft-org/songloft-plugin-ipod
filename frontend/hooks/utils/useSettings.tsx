import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { getHostTheme, onHostThemeChange } from "@/songloftApi";
import { ColorScheme } from "@/utils/colorScheme";
import { DeviceThemeName } from "@/utils/themes";

export type ShuffleMode = "off" | "songs" | "albums";
export type RepeatMode = "off" | "one" | "all";
export type StreamingService = "songloft";

export const VOLUME_KEY = "ipodVolume";
export const COLOR_SCHEME_KEY = "ipodColorScheme";
export const DEVICE_COLOR_KEY = "ipodSelectedDeviceTheme";
export const SHUFFLE_MODE_KEY = "ipodShuffleMode";
export const REPEAT_MODE_KEY = "ipodRepeatMode";
export const HAPTICS_ENABLED_KEY = "ipodHapticsEnabled";

export interface SettingsState {
  service: StreamingService;
  /** Compatibility flag used by upstream library views; it does not enable Apple Music. */
  isAppleAuthorized: boolean;
  isOffline: boolean;
  colorScheme: ColorScheme;
  deviceTheme: DeviceThemeName;
  shuffleMode: ShuffleMode;
  repeatMode: RepeatMode;
  hapticsEnabled: boolean;
}

type SettingsContextType = [
  SettingsState,
  React.Dispatch<React.SetStateAction<SettingsState>>,
];

const defaultSettings: SettingsState = {
  service: "songloft",
  isAppleAuthorized: true,
  isOffline: false,
  colorScheme: "default",
  deviceTheme: "silver",
  shuffleMode: "off",
  repeatMode: "off",
  hapticsEnabled: true,
};

export const SettingsContext = createContext<SettingsContextType>([
  defaultSettings,
  () => {},
]);

export type SettingsHook = SettingsState & {
  isAuthorized: boolean;
  setColorScheme: (colorScheme?: ColorScheme) => void;
  setDeviceTheme: (deviceTheme: DeviceThemeName) => void;
  setShuffleMode: (mode: ShuffleMode) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  setHapticsEnabled: (enabled: boolean) => void;
};

export const useSettings = (): SettingsHook => {
  const [state, setState] = useContext(SettingsContext);

  const setColorScheme = useCallback((colorScheme?: ColorScheme) => {
    setState((previous) => {
      const next = colorScheme ?? (previous.colorScheme === "dark" ? "default" : "dark");
      localStorage.setItem(COLOR_SCHEME_KEY, next);
      return { ...previous, colorScheme: next };
    });
  }, []);

  const setDeviceTheme = useCallback((deviceTheme: DeviceThemeName) => {
    setState((previous) => ({ ...previous, deviceTheme }));
    localStorage.setItem(DEVICE_COLOR_KEY, deviceTheme);
  }, []);

  const setShuffleMode = useCallback((shuffleMode: ShuffleMode) => {
    setState((previous) => ({ ...previous, shuffleMode }));
    localStorage.setItem(SHUFFLE_MODE_KEY, shuffleMode);
  }, []);

  const setRepeatMode = useCallback((repeatMode: RepeatMode) => {
    setState((previous) => ({ ...previous, repeatMode }));
    localStorage.setItem(REPEAT_MODE_KEY, repeatMode);
  }, []);

  const setHapticsEnabled = useCallback((hapticsEnabled: boolean) => {
    setState((previous) => ({ ...previous, hapticsEnabled }));
    localStorage.setItem(HAPTICS_ENABLED_KEY, String(hapticsEnabled));
  }, []);

  return {
    ...state,
    isAuthorized: true,
    setColorScheme,
    setDeviceTheme,
    setShuffleMode,
    setRepeatMode,
    setHapticsEnabled,
  };
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [settingsState, setSettingsState] = useState<SettingsState>(defaultSettings);

  useEffect(() => {
    const initialHostTheme = getHostTheme();
    setSettingsState((previous) => ({
      ...previous,
      isOffline: !navigator.onLine,
      colorScheme: initialHostTheme.colorScheme,
      deviceTheme: (localStorage.getItem(DEVICE_COLOR_KEY) as DeviceThemeName) ?? "silver",
      shuffleMode: (localStorage.getItem(SHUFFLE_MODE_KEY) as ShuffleMode) ?? "off",
      repeatMode: (localStorage.getItem(REPEAT_MODE_KEY) as RepeatMode) ?? "off",
      hapticsEnabled: localStorage.getItem(HAPTICS_ENABLED_KEY) !== "false",
    }));

    return onHostThemeChange(({ colorScheme }) => {
      setSettingsState((previous) => ({ ...previous, colorScheme }));
    });
  }, []);

  useEffect(() => {
    const syncOnlineStatus = () =>
      setSettingsState((previous) => ({ ...previous, isOffline: !navigator.onLine }));
    window.addEventListener("offline", syncOnlineStatus);
    window.addEventListener("online", syncOnlineStatus);
    return () => {
      window.removeEventListener("offline", syncOnlineStatus);
      window.removeEventListener("online", syncOnlineStatus);
    };
  }, []);

  return (
    <SettingsContext.Provider value={[settingsState, setSettingsState]}>
      {children}
    </SettingsContext.Provider>
  );
};

export default useSettings;
