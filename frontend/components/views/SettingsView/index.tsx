import { useMemo } from "react";

import SelectableList, { SelectableListOption } from "@/components/SelectableList";
import { SplitScreenPreview } from "@/components/previews";
import { useAudioPlayer, useSelectableList, useSettings } from "@/hooks";

const THEMES = ["silver", "black", "u2"] as const;
const formatCurrentLabel = (label: string, isCurrent: boolean) => `${label}${isCurrent ? "（当前）" : ""}`;
const getThemeLabel = (theme: (typeof THEMES)[number]) => ({
  silver: "银色",
  black: "黑色",
  u2: "U2 特别版",
})[theme];

const SettingsView = () => {
  const { deviceTheme, setDeviceTheme, shuffleMode, repeatMode, hapticsEnabled, setHapticsEnabled } = useSettings();
  const { setShuffleMode, setRepeatMode } = useAudioPlayer();
  const themeOptions: SelectableListOption[] = useMemo(() => THEMES.map((theme) => ({
    type: "action", isSelected: deviceTheme === theme,
    label: formatCurrentLabel(getThemeLabel(theme), deviceTheme === theme),
    onSelect: () => setDeviceTheme(theme),
  })), [deviceTheme, setDeviceTheme]);

  const options: SelectableListOption[] = useMemo(() => [
    {
      type: "actionSheet", id: "shuffle-mode-action-sheet", label: "随机播放", preview: SplitScreenPreview.Settings,
      listOptions: [
        { type: "action", isSelected: shuffleMode === "off", label: formatCurrentLabel("关闭", shuffleMode === "off"), onSelect: () => { void setShuffleMode("off"); } },
        { type: "action", isSelected: shuffleMode === "songs", label: formatCurrentLabel("歌曲", shuffleMode === "songs"), onSelect: () => { void setShuffleMode("songs"); } },
        { type: "action", isSelected: shuffleMode === "albums", label: formatCurrentLabel("专辑", shuffleMode === "albums"), onSelect: () => { void setShuffleMode("albums"); } },
      ],
    },
    {
      type: "actionSheet", id: "repeat-mode-action-sheet", label: "循环播放", preview: SplitScreenPreview.Settings,
      listOptions: [
        { type: "action", isSelected: repeatMode === "off", label: formatCurrentLabel("关闭", repeatMode === "off"), onSelect: () => { void setRepeatMode("off"); } },
        { type: "action", isSelected: repeatMode === "one", label: formatCurrentLabel("单曲循环", repeatMode === "one"), onSelect: () => { void setRepeatMode("one"); } },
        { type: "action", isSelected: repeatMode === "all", label: formatCurrentLabel("全部循环", repeatMode === "all"), onSelect: () => { void setRepeatMode("all"); } },
      ],
    },
    { type: "actionSheet", id: "device-theme-action-sheet", label: "设备主题", listOptions: themeOptions, preview: SplitScreenPreview.Theme },
    {
      type: "actionSheet", id: "haptics-action-sheet", label: "触感反馈", preview: SplitScreenPreview.Settings,
      listOptions: [
        { type: "action", isSelected: hapticsEnabled, label: formatCurrentLabel("开启", hapticsEnabled), onSelect: () => setHapticsEnabled(true) },
        { type: "action", isSelected: !hapticsEnabled, label: formatCurrentLabel("关闭", !hapticsEnabled), onSelect: () => setHapticsEnabled(false) },
      ],
    },
  ], [hapticsEnabled, repeatMode, setHapticsEnabled, setRepeatMode, setShuffleMode, shuffleMode, themeOptions]);
  const { activeIndex: scrollIndex } = useSelectableList({ viewId: "settings", options });
  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default SettingsView;
