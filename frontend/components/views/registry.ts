import { ComponentType } from "react";
import { SplitScreenPreview } from "@/components/previews";

// Import all view components directly from their folders to avoid circular dependencies
import AboutView from "./AboutView";
import AlbumView from "./AlbumView";
import AlbumsView from "./AlbumsView";
import ArtistView from "./ArtistView";
import ArtistsView from "./ArtistsView";
import BrickGameView from "./BrickGameView";
import CoverFlowView from "./CoverFlowView";
import SolitaireGameView from "./SolitaireGameView";
import GamesView from "./GamesView";
import HomeView from "./HomeView";
import MusicView from "./MusicView";
import NowPlayingView from "./NowPlayingView";
import PlaylistView from "./PlaylistView";
import PlaylistsView from "./PlaylistsView";
import SearchView from "./SearchView";
import SettingsView from "./SettingsView";
import SongsView from "./SongsView";

/**
 * Defines the props required by each view.
 * Views without props should have `undefined` as their type.
 */
export type ViewProps = {
  home: undefined;
  music: undefined;
  games: undefined;
  settings: undefined;
  about: undefined;
  artists: {
    artists?: MediaApi.Artist[];
    inLibrary?: boolean;
    showImages?: boolean;
  };
  artist: { id: string; inLibrary?: boolean };
  albums: { albums?: MediaApi.Album[]; inLibrary?: boolean };
  album: { id: string; inLibrary?: boolean };
  songs: { songs: MediaApi.Song[] };
  nowPlaying: undefined;
  playlists: { playlists?: MediaApi.Playlist[]; inLibrary?: boolean };
  playlist: { id: string; inLibrary?: boolean };
  search: { initialQuery?: string };
  brickGame: undefined;
  solitaireGame: undefined;
  coverFlow: undefined;
};

export type ViewId = keyof ViewProps;

export type ViewType = "split" | "full" | "coverFlow";

/**
 * Configuration for a view component in the registry.
 */
export type ViewConfig<TViewId extends ViewId = ViewId> = {
  component: ComponentType<ViewProps[TViewId]>;
  type: ViewType;
  title: string;
  isSplitScreen?: boolean;
  preview?: SplitScreenPreview;
  disableLongPress?: boolean;
};

/**
 * Central registry mapping view IDs to their components and metadata.
 * This replaces the old viewConfigMap and enables type-safe navigation.
 */
export const VIEW_REGISTRY = {
  // Split Screen Views
  home: {
    component: HomeView,
    type: "split",
    title: "iPod.js",
    isSplitScreen: true,
  } as ViewConfig<"home">,

  music: {
    component: MusicView,
    type: "split",
    title: "音乐",
    isSplitScreen: true,
    preview: SplitScreenPreview.Music,
  } as ViewConfig<"music">,

  games: {
    component: GamesView,
    type: "split",
    title: "游戏",
    isSplitScreen: true,
    preview: SplitScreenPreview.Games,
  } as ViewConfig<"games">,

  settings: {
    component: SettingsView,
    type: "split",
    title: "设置",
    isSplitScreen: true,
    preview: SplitScreenPreview.Settings,
  } as ViewConfig<"settings">,

  // Fullscreen Views
  about: {
    component: AboutView,
    type: "full",
    title: "关于",
    preview: SplitScreenPreview.Settings,
  } as ViewConfig<"about">,

  artists: {
    component: ArtistsView,
    type: "full",
    title: "歌手",
    preview: SplitScreenPreview.Music,
  } as ViewConfig<"artists">,

  artist: {
    component: ArtistView,
    type: "full",
    title: "歌手",
    preview: SplitScreenPreview.Music,
  } as ViewConfig<"artist">,

  albums: {
    component: AlbumsView,
    type: "full",
    title: "专辑",
    preview: SplitScreenPreview.Music,
  } as ViewConfig<"albums">,

  album: {
    component: AlbumView,
    type: "full",
    title: "专辑",
    preview: SplitScreenPreview.Music,
  } as ViewConfig<"album">,

  songs: {
    component: SongsView,
    type: "full",
    title: "歌曲",
    preview: SplitScreenPreview.Music,
  } as ViewConfig<"songs">,

  nowPlaying: {
    component: NowPlayingView,
    type: "full",
    title: "正在播放",
    preview: SplitScreenPreview.Music,
  } as ViewConfig<"nowPlaying">,

  playlists: {
    component: PlaylistsView,
    type: "full",
    title: "播放列表",
    preview: SplitScreenPreview.Music,
  } as ViewConfig<"playlists">,

  playlist: {
    component: PlaylistView,
    type: "full",
    title: "播放列表",
    preview: SplitScreenPreview.Music,
  } as ViewConfig<"playlist">,

  search: {
    component: SearchView,
    type: "full",
    title: "搜索",
    preview: SplitScreenPreview.Music,
  } as ViewConfig<"search">,

  brickGame: {
    component: BrickGameView,
    type: "full",
    title: "打砖块",
    preview: SplitScreenPreview.Games,
    disableLongPress: true,
  } as ViewConfig<"brickGame">,

  solitaireGame: {
    component: SolitaireGameView,
    type: "full",
    title: "纸牌接龙",
    preview: SplitScreenPreview.Games,
    disableLongPress: true,
  } as ViewConfig<"solitaireGame">,

  // CoverFlow View
  coverFlow: {
    component: CoverFlowView,
    type: "coverFlow",
    title: "Cover Flow",
    preview: SplitScreenPreview.Music,
  } as ViewConfig<"coverFlow">,
} as const;
