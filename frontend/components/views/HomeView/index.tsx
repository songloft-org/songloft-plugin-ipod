import { useCallback, useMemo } from "react";

import SelectableList, { SelectableListOption } from "@/components/SelectableList";
import { SplitScreenPreview } from "@/components/previews";
import { useAudioPlayer, useEventListener, useSelectableList, useViewContext } from "@/hooks";
import { IpodEvent } from "@/utils/events";

const HomeView = () => {
  const { nowPlayingItem } = useAudioPlayer();
  const { showView, viewStack } = useViewContext();
  const options: SelectableListOption[] = useMemo(() => [
    { type: "view", label: "Cover Flow", viewId: "coverFlow", preview: SplitScreenPreview.Music },
    { type: "view", label: "Music", viewId: "music", preview: SplitScreenPreview.Music },
    { type: "view", label: "Games", viewId: "games", preview: SplitScreenPreview.Games },
    { type: "view", label: "Settings", viewId: "settings", preview: SplitScreenPreview.Settings },
    ...(nowPlayingItem ? [{ type: "view" as const, label: "Now Playing", viewId: "nowPlaying" as const, preview: SplitScreenPreview.NowPlaying }] : []),
  ], [nowPlayingItem]);
  const { activeIndex: scrollIndex } = useSelectableList({ viewId: "home", options });

  const handleIdleState = useCallback(() => {
    const activeView = viewStack[viewStack.length - 1];
    if (nowPlayingItem && activeView.id !== "nowPlaying" && activeView.id !== "coverFlow" && activeView.id !== "keyboard") {
      showView("nowPlaying");
    }
  }, [nowPlayingItem, showView, viewStack]);
  useEventListener<IpodEvent>("idle", handleIdleState);

  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default HomeView;
