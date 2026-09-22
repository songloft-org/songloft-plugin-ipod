import { useMemo } from "react";

import SelectableList, { SelectableListOption } from "@/components/SelectableList";
import { SplitScreenPreview } from "@/components/previews";
import { useAudioPlayer, useSelectableList } from "@/hooks";

const MusicView = () => {
  const { nowPlayingItem } = useAudioPlayer();
  const options: SelectableListOption[] = useMemo(() => [
    { type: "view", label: "Cover Flow", viewId: "coverFlow", preview: SplitScreenPreview.Music },
    { type: "view", label: "播放列表", viewId: "playlists", preview: SplitScreenPreview.Music },
    { type: "view", label: "歌手", viewId: "artists", preview: SplitScreenPreview.Music },
    { type: "view", label: "专辑", viewId: "albums", preview: SplitScreenPreview.Music },
    { type: "view", label: "搜索", viewId: "search", preview: SplitScreenPreview.Music },
    ...(nowPlayingItem ? [{ type: "view" as const, label: "正在播放", viewId: "nowPlaying" as const, preview: SplitScreenPreview.NowPlaying }] : []),
  ], [nowPlayingItem]);
  const { activeIndex } = useSelectableList({ viewId: "music", options });
  return <SelectableList options={options} activeIndex={activeIndex} />;
};
export default MusicView;
