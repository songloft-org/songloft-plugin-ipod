import { useMemo } from "react";

import SelectableList, { SelectableListOption } from "@/components/SelectableList";
import { SplitScreenPreview } from "@/components/previews";
import { useAudioPlayer, useSelectableList, useSettings } from "@/hooks";

const THEMES = ["silver", "black", "u2"] as const;
const formatCurrentLabel = (label: string, isCurrent: boolean) => `${label}${isCurrent ? " (Current)" : ""}`;
const getThemeLabel = (theme: (typeof THEMES)[number]) => theme === "u2" ? "U2 Edition" : theme.charAt(0).toUpperCase() + theme.slice(1);

const SettingsView = () => {
  const { deviceTheme, setDeviceTheme, shuffleMode, repeatMode, hapticsEnabled, setHapticsEnabled } = useSettings();
  const { setShuffleMode, setRepeatMode } = useAudioPlayer();
  const themeOptions: SelectableListOption[] = useMemo(() => THEMES.map((theme) => ({
    type: "action", isSelected: deviceTheme === theme,
    label: formatCurrentLabel(getThemeLabel(theme), deviceTheme === theme),
    onSelect: () => setDeviceTheme(theme),
  })), [deviceTheme, setDeviceTheme]);

  const options: SelectableListOption[] = useMemo(() => [
    { type: "view", label: "About", viewId: "about", preview: SplitScreenPreview.Settings },
    {
      type: "actionSheet", id: "shuffle-mode-action-sheet", label: "Shuffle", preview: SplitScreenPreview.Settings,
      listOptions: [
        { type: "action", isSelected: shuffleMode === "off", label: formatCurrentLabel("Off", shuffleMode === "off"), onSelect: () => { void setShuffleMode("off"); } },
        { type: "action", isSelected: shuffleMode === "songs", label: formatCurrentLabel("Songs", shuffleMode === "songs"), onSelect: () => { void setShuffleMode("songs"); } },
        { type: "action", isSelected: shuffleMode === "albums", label: formatCurrentLabel("Albums", shuffleMode === "albums"), onSelect: () => { void setShuffleMode("albums"); } },
      ],
    },
    {
      type: "actionSheet", id: "repeat-mode-action-sheet", label: "Repeat", preview: SplitScreenPreview.Settings,
      listOptions: [
        { type: "action", isSelected: repeatMode === "off", label: formatCurrentLabel("Off", repeatMode === "off"), onSelect: () => { void setRepeatMode("off"); } },
        { type: "action", isSelected: repeatMode === "one", label: formatCurrentLabel("One", repeatMode === "one"), onSelect: () => { void setRepeatMode("one"); } },
        { type: "action", isSelected: repeatMode === "all", label: formatCurrentLabel("All", repeatMode === "all"), onSelect: () => { void setRepeatMode("all"); } },
      ],
    },
    { type: "actionSheet", id: "device-theme-action-sheet", label: "Device theme", listOptions: themeOptions, preview: SplitScreenPreview.Theme },
    {
      type: "actionSheet", id: "haptics-action-sheet", label: "Haptic feedback", preview: SplitScreenPreview.Settings,
      listOptions: [
        { type: "action", isSelected: hapticsEnabled, label: formatCurrentLabel("On", hapticsEnabled), onSelect: () => setHapticsEnabled(true) },
        { type: "action", isSelected: !hapticsEnabled, label: formatCurrentLabel("Off", !hapticsEnabled), onSelect: () => setHapticsEnabled(false) },
      ],
    },
  ], [hapticsEnabled, repeatMode, setHapticsEnabled, setRepeatMode, setShuffleMode, shuffleMode, themeOptions]);
  const { activeIndex: scrollIndex } = useSelectableList({ viewId: "settings", options });
  return <SelectableList options={options} activeIndex={scrollIndex} />;
};

export default SettingsView;
