import { SelectableListOption } from "@/components/SelectableList";
import { DEFAULT_ARTWORK_URL } from "@/utils/constants/api";

/** Accepts an upstream artwork URL and applies its requested dimensions when supported. */
export const getArtwork = (size: number | string, url?: string) =>
  (url || DEFAULT_ARTWORK_URL).replace("{w}", `${size}`).replace("{h}", `${size}`);

/** Songloft's bridge does not expose queue insertion, so media long-press has no extra actions. */
export const getMediaOptions = (
  _type: "album" | "song" | "playlist",
  _id: string,
): SelectableListOption[] | undefined => undefined;

export const formatPlaybackTime = (seconds: number) => {
  const minutes = Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, "0");
  const remainingSeconds = Math.floor(Math.max(0, seconds) % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
};

export const getSongIdFromQueueOptions = (
  queueOptions: MediaApi.QueueOptions,
  startPosition = 0,
): string | undefined =>
  queueOptions.song?.id
  ?? queueOptions.songs?.[startPosition]?.id
  ?? queueOptions.album?.songs[startPosition]?.id
  ?? queueOptions.playlist?.songs[startPosition]?.id;
