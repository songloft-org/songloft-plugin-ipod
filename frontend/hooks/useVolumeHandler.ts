import { useCallback, useRef, useState } from "react";

import { useAudioPlayer } from "./useAudioPlayer";
import useEffectOnce from "./utils/useEffectOnce";

interface VolumeHandlerHook {
  volume: number;
  active: boolean;
  setEnabled: (value: boolean) => void;
  increaseVolume: () => void;
  decreaseVolume: () => void;
}

const useVolumeHandler = (): VolumeHandlerHook => {
  const { volume, setVolume } = useAudioPlayer();
  const [active, setActive] = useState(false);
  const [enabled, setIsEnabled] = useState(true);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffectOnce(() => () => {
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
  });

  const clearActiveTimeout = useCallback(() => {
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    timeoutIdRef.current = null;
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    setActive(false);
    setIsEnabled(value);
    clearActiveTimeout();
  }, [clearActiveTimeout]);

  const setActiveState = useCallback(() => {
    if (!enabled) return;

    setActive(true);
    clearActiveTimeout();
    timeoutIdRef.current = setTimeout(() => setActive(false), 3000);
  }, [clearActiveTimeout, enabled]);

  const increaseVolume = useCallback(() => {
    setActiveState();
    if (volume === 1 || !enabled) return;
    setVolume(Math.min(volume + 0.04, 1));
  }, [enabled, setActiveState, setVolume, volume]);

  const decreaseVolume = useCallback(() => {
    setActiveState();
    if (!enabled) return;
    setVolume(Math.max(volume - 0.04, 0.01));
  }, [enabled, setActiveState, setVolume, volume]);

  return { setEnabled, increaseVolume, decreaseVolume, volume, active };
};

export default useVolumeHandler;
