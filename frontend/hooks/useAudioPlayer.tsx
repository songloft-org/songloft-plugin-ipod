import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getHostPlayerInfo,
  hostSongToMediaItem,
  isHostPlayerAvailable,
  mediaSongToHostId,
  subscribeToHostPlayer,
  type HostPlayerState,
} from "@/songloftApi";
import { useSettings, type RepeatMode, type ShuffleMode } from "@/hooks/utils/useSettings";
import useEventListener from "@/hooks/utils/useEventListener";
import type { IpodEvent } from "@/utils/events";

const defaultPlaybackInfoState = {
  isPlaying: false,
  isPaused: false,
  isLoading: false,
  currentTime: 0,
  timeRemaining: 0,
  percent: 0,
  duration: 0,
};

type PlaybackInfo = typeof defaultPlaybackInfoState;

interface AudioPlayerState {
  playbackInfo: PlaybackInfo;
  nowPlayingItem?: MediaApi.MediaItem;
  volume: number;
  shuffleMode: ShuffleMode;
  repeatMode: RepeatMode;
  isHostPlayerAvailable: boolean;
  playerError?: string;
  play: (queueOptions: MediaApi.QueueOptions) => Promise<void>;
  pause: () => Promise<void>;
  seekToTime: (time: number) => Promise<void>;
  setVolume: (volume: number) => void;
  setShuffleMode: (mode: ShuffleMode) => Promise<void>;
  setRepeatMode: (mode: RepeatMode) => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
  updateNowPlayingItem: () => Promise<void>;
  updatePlaybackInfo: () => Promise<void>;
  reset: () => void;
}

export const AudioPlayerContext = createContext<AudioPlayerState>({} as AudioPlayerState);
export const useAudioPlayer = (): AudioPlayerState => useContext(AudioPlayerContext);

const hostPlayModeToSettings = (mode: string): Pick<AudioPlayerState, "shuffleMode" | "repeatMode"> => {
  switch (mode) {
    case "random":
      return { shuffleMode: "songs", repeatMode: "off" };
    case "single":
    case "singlePlay":
      return { shuffleMode: "off", repeatMode: "one" };
    case "loop":
      return { shuffleMode: "off", repeatMode: "all" };
    default:
      return { shuffleMode: "off", repeatMode: "off" };
  }
};

const settingsToHostPlayMode = (shuffleMode: ShuffleMode, repeatMode: RepeatMode) => {
  if (shuffleMode !== "off") return "random" as const;
  if (repeatMode === "one") return "single" as const;
  if (repeatMode === "all") return "loop" as const;
  return "order" as const;
};

export const AudioPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    shuffleMode,
    repeatMode,
    setShuffleMode: saveShuffleMode,
    setRepeatMode: saveRepeatMode,
  } = useSettings();
  const [nowPlayingItem, setNowPlayingItem] = useState<MediaApi.MediaItem>();
  const [playbackInfo, setPlaybackInfo] = useState<PlaybackInfo>(defaultPlaybackInfoState);
  const [volume, setVolumeState] = useState(0.5);
  const [hostAvailable, setHostAvailable] = useState(false);
  const [playerError, setPlayerError] = useState<string>();

  const markHostUnavailable = useCallback((error?: unknown) => {
    setHostAvailable(false);
    setPlayerError(error instanceof Error ? error.message : "Songloft player is unavailable");
  }, []);

  const updateFromHostState = useCallback((state: HostPlayerState) => {
    const duration = state.duration || state.current_song?.duration || 0;
    const currentTime = state.current_time || 0;
    const mode = hostPlayModeToSettings(state.play_mode);
    setNowPlayingItem(hostSongToMediaItem(state.current_song));
    setPlaybackInfo({
      isPlaying: state.is_playing,
      isPaused: !state.is_playing && Boolean(state.current_song),
      isLoading: false,
      currentTime,
      timeRemaining: Math.max(0, duration - currentTime),
      percent: duration > 0 ? (currentTime / duration) * 100 : 0,
      duration,
    });
    setVolumeState(Math.min(1, Math.max(0, state.volume / 100)));
    saveShuffleMode(mode.shuffleMode);
    saveRepeatMode(mode.repeatMode);
  }, [saveRepeatMode, saveShuffleMode]);

  useEffect(() => {
    const available = isHostPlayerAvailable();
    setHostAvailable(available);
    setPlayerError(available ? undefined : "Open this plugin in Songloft to control playback");
    if (!available) return;

    let active = true;
    void getHostPlayerInfo().then((state) => {
      if (active && state) updateFromHostState(state);
    }).catch(markHostUnavailable);
    const unsubscribe = subscribeToHostPlayer((state) => {
      if (active) updateFromHostState(state);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [markHostUnavailable, updateFromHostState]);

  const play = useCallback(async (queueOptions: MediaApi.QueueOptions): Promise<void> => {
    const songs = queueOptions.songs
      ?? queueOptions.album?.songs
      ?? queueOptions.playlist?.songs
      ?? (queueOptions.song ? [queueOptions.song] : []);
    const ids = songs.map(mediaSongToHostId).filter((id): id is number => id !== undefined);
    const player = window.SongloftPlugin?.player;
    if (!hostAvailable || !player || !ids.length) {
      throw new Error("Songloft player is unavailable");
    }
    const startIndex = Math.max(0, Math.min(queueOptions.startPosition ?? 0, ids.length - 1));
    try {
      await player.setQueue(ids, {
        startIndex,
        sourcePlaylistId: queueOptions.playlist ? Number(queueOptions.playlist.id) : undefined,
      });
    } catch (error) {
      markHostUnavailable(error);
      throw error;
    }
  }, [hostAvailable, markHostUnavailable]);

  const pause = useCallback(async () => {
    if (hostAvailable) await window.SongloftPlugin?.player?.pause();
  }, [hostAvailable]);
  const togglePlayPause = useCallback(async () => {
    if (hostAvailable) await window.SongloftPlugin?.player?.togglePlay();
  }, [hostAvailable]);
  const skipNext = useCallback(async () => {
    if (hostAvailable) await window.SongloftPlugin?.player?.next();
  }, [hostAvailable]);
  const skipPrevious = useCallback(async () => {
    if (hostAvailable) await window.SongloftPlugin?.player?.prev();
  }, [hostAvailable]);
  const seekToTime = useCallback(async (time: number) => {
    if (hostAvailable) await window.SongloftPlugin?.player?.seek(Math.max(0, time));
  }, [hostAvailable]);

  const setVolume = useCallback((nextVolume: number) => {
    const normalizedVolume = Math.min(1, Math.max(0, nextVolume));
    setVolumeState(normalizedVolume);
    if (hostAvailable) void window.SongloftPlugin?.player?.setVolume(normalizedVolume * 100).catch(markHostUnavailable);
  }, [hostAvailable, markHostUnavailable]);

  const setShuffleMode = useCallback(async (mode: ShuffleMode) => {
    saveShuffleMode(mode);
    if (hostAvailable) await window.SongloftPlugin?.player?.setPlayMode(settingsToHostPlayMode(mode, repeatMode));
  }, [hostAvailable, repeatMode, saveShuffleMode]);

  const setRepeatMode = useCallback(async (mode: RepeatMode) => {
    saveRepeatMode(mode);
    if (hostAvailable) await window.SongloftPlugin?.player?.setPlayMode(settingsToHostPlayMode(shuffleMode, mode));
  }, [hostAvailable, saveRepeatMode, shuffleMode]);

  const updateNowPlayingItem = useCallback(async () => {
    const state = await getHostPlayerInfo();
    if (state) updateFromHostState(state);
  }, [updateFromHostState]);
  const updatePlaybackInfo = updateNowPlayingItem;
  const reset = useCallback(() => {
    setNowPlayingItem(undefined);
    setPlaybackInfo(defaultPlaybackInfoState);
  }, []);

  const contextValue = useMemo(() => ({
    playbackInfo, nowPlayingItem, volume, shuffleMode, repeatMode,
    isHostPlayerAvailable: hostAvailable, playerError,
    play, pause, seekToTime, setVolume, setShuffleMode, setRepeatMode,
    skipNext, skipPrevious, togglePlayPause, updateNowPlayingItem, updatePlaybackInfo, reset,
  }), [hostAvailable, nowPlayingItem, pause, playbackInfo, play, playerError, repeatMode, reset, seekToTime, setRepeatMode, setShuffleMode, setVolume, shuffleMode, skipNext, skipPrevious, togglePlayPause, updateNowPlayingItem, updatePlaybackInfo, volume]);

  useEventListener<IpodEvent>("playpauseclick", () => { void togglePlayPause(); });
  useEventListener<IpodEvent>("forwardclick", () => { void skipNext(); });
  useEventListener<IpodEvent>("backwardclick", () => { void skipPrevious(); });

  return <AudioPlayerContext.Provider value={contextValue}>{children}</AudioPlayerContext.Provider>;
};

export default useAudioPlayer;
