import { createContext, useState } from "react";

import { SelectableListOption } from "@/components/SelectableList";
import { SplitScreenPreview } from "@/components/previews";
import { ViewId, ViewProps, VIEW_REGISTRY } from "@/components/views/registry";

export type PopupId = "musicProviderError";
export type ActionSheetId = "media-action-sheet" | "device-theme-action-sheet" | "shuffle-mode-action-sheet" | "repeat-mode-action-sheet" | "haptics-action-sheet";
export type ScreenViewInstance<TViewId extends ViewId = ViewId> = { type: "screen"; id: TViewId; props?: ViewProps[TViewId]; headerTitle?: string; onClose?: (...args: unknown[]) => void; styles?: Record<string, unknown>; };
export type ActionSheetInstance = { type: "actionSheet"; id: ActionSheetId; listOptions: SelectableListOption[]; headerTitle?: string; onClose?: (...args: unknown[]) => void; };
export type PopupInstance = { type: "popup"; id: PopupId; title: string; description?: string; listOptions: SelectableListOption[]; onClose?: (...args: unknown[]) => void; };
export type KeyboardInstance = { type: "keyboard"; id: "keyboard"; initialValue?: string; onClose?: (...args: unknown[]) => void; };
export type CoverFlowInstance = { type: "coverFlow"; id: string; onClose?: (...args: unknown[]) => void; };
export type ViewInstance = ScreenViewInstance | ActionSheetInstance | PopupInstance | KeyboardInstance | CoverFlowInstance;

interface ViewContextState { viewStack: ViewInstance[]; headerTitle?: string; preview: SplitScreenPreview; }
type ViewContextStateType = [ViewContextState, React.Dispatch<React.SetStateAction<ViewContextState>>];
export const ViewContext = createContext<ViewContextStateType>([{ viewStack: [], headerTitle: "iPod.js", preview: SplitScreenPreview.Music }, () => {}]);

const ViewContextProvider = ({ children }: { children: React.ReactNode }) => {
  const baseView: ScreenViewInstance<"home"> = { type: "screen", id: "home" };
  const [viewContextState, setViewContextState] = useState<ViewContextState>({ viewStack: [baseView], headerTitle: VIEW_REGISTRY.home.title, preview: SplitScreenPreview.Music });
  return <ViewContext.Provider value={[viewContextState, setViewContextState]}>{children}</ViewContext.Provider>;
};
export default ViewContextProvider;
