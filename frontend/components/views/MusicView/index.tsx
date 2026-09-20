import { useMemo } from "react";

import SelectableList, { SelectableListOption } from "@/components/SelectableList";
import { SplitScreenPreview } from "@/components/previews";
import { useAudioPlayer, useSelectableList } from "@/hooks";

const MusicView = () => {
  const { nowPlayingItem } = useAudioPlayer();
  const options: SelectableListOption[] = useMemo(() => [
    { type: "view", label: "Cover Flow", viewId: "coverFlow", preview: SplitScreenPreview.Music },
    { type: "view", label: "Playlists", viewId: "playlists", preview: SplitScreenPreview.Music },
    { type: "view", label: "Artists", viewId: "artists", preview: SplitScreenPreview.Music },
    { type: "view", label: "Albums", viewId: "albums", preview: SplitScreenPreview.Music },
    { type: "view", label: "Search", viewId: "search", preview: SplitScreenPreview.Music },
    ...(nowPlayingItem ? [{ type: "view" as const, label: "Now Playing", viewId: "nowPlaying" as const, preview: SplitScreenPreview.NowPlaying }] : []),
  ], [nowPlayingItem]);
  const { activeIndex } = useSelectableList({ viewId: "music", options });
  return <SelectableList options={options} activeIndex={activeIndex} />;
};
export default MusicView;
