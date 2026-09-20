export type HostPlayerState = {
  queue: unknown[];
  current_index: number;
  current_song?: HostSong;
  is_playing: boolean;
  current_time: number;
  duration: number;
  volume: number;
  play_mode: string;
};

type HostSong = {
  id: number;
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  cover_url?: string;
  coverUrl?: string;
  url?: string;
  track_number?: number;
  trackNumber?: number;
};

type HostAlbum = {
  id: string;
  name: string;
  artistName?: string;
  artworkUrl?: string;
  cover_url?: string;
  songs?: HostSong[];
};

type HostPlaylist = {
  id: number;
  name: string;
  description?: string;
  curatorName?: string;
  artworkUrl?: string;
  cover_url?: string;
  coverUrl?: string;
  songs?: HostSong[];
};

type HostPlayer = {
  getState: () => Promise<HostPlayerState>;
  setQueue: (
    ids: number[],
    options?: { startIndex?: number; sourcePlaylistId?: number },
  ) => Promise<void>;
  pause: () => Promise<void>;
  togglePlay: () => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  setPlayMode: (mode: "order" | "loop" | "single" | "random") => Promise<void>;
  onStateChange: (callback: (state: HostPlayerState) => void) => () => void;
};

type HostBridge = {
  isAvailable: () => boolean;
  getInfo: () => Promise<{ capabilities?: string[] }>;
};

declare global {
  interface Window {
    SongloftPlugin?: {
      apiGet: (path: string) => Promise<unknown>;
      apiPost: (path: string, body?: unknown) => Promise<unknown>;
      getTheme?: () => { colorScheme: "default" | "dark" };
      onThemeChange?: (callback: (theme: { colorScheme: "default" | "dark" }) => void) => () => void;
      getAuthToken?: () => string | Promise<string>;
      host?: HostBridge;
      player?: HostPlayer;
    };
  }
}

async function get<T>(path: string): Promise<T> {
  const plugin = window.SongloftPlugin;
  if (!plugin) throw new Error("Songloft bridge is unavailable");
  return plugin.apiGet(path) as Promise<T>;
}

const appendQuery = (url: string, name: string, value: string): string =>
  new RegExp(`(?:\\?|&)${name}=`).test(url)
    ? url
    : `${url}${url.includes("?") ? "&" : "?"}${name}=${encodeURIComponent(value)}`;

const hostPathPrefix = (): string => {
  const match = window.location.pathname.match(/^(.*)\/api\/v1\/jsplugin\/[^/]+/);
  return match?.[1] ?? "";
};

/** Converts Songloft artwork paths into WebView-safe image URLs. */
export function coverImageUrl(sourceUrl?: string, width = 240): string | undefined {
  if (!sourceUrl) return undefined;
  let url = sourceUrl.trim();
  if (!url || /^(?:data:|blob:)/i.test(url)) return url || undefined;

  if (/^https?:\/\//i.test(url)) {
    try {
      if (new URL(url).origin !== window.location.origin) return url;
    } catch {
      return undefined;
    }
  } else {
    url = `${hostPathPrefix()}${url.startsWith("/") ? url : `/${url}`}`;
  }

  url = appendQuery(url, "w", String(Math.max(1, Math.round(width))));
  const token = window.SongloftPlugin?.getAuthToken?.();
  return typeof token === "string" && token ? appendQuery(url, "access_token", token) : url;
}

const toMediaSong = (song: HostSong): MediaApi.Song => ({
  id: String(song.id),
  name: song.title?.trim() || "Unknown Song",
  artistName: song.artist?.trim() || "Unknown Artist",
  albumName: song.album?.trim() || "Unknown Album",
  artwork: song.cover_url || song.coverUrl ? { url: coverImageUrl(song.cover_url ?? song.coverUrl) ?? "" } : undefined,
  duration: song.duration ?? 0,
  trackNumber: song.track_number ?? song.trackNumber ?? 0,
  url: song.url ?? String(song.id),
});

const toMediaAlbum = (album: HostAlbum): MediaApi.Album => ({
  id: String(album.id),
  name: album.name,
  artistName: album.artistName,
  artwork: album.artworkUrl || album.cover_url
    ? { url: coverImageUrl(album.artworkUrl ?? album.cover_url) ?? "" }
    : undefined,
  songs: (album.songs ?? []).map(toMediaSong),
  url: String(album.id),
});

const toMediaPlaylist = (playlist: HostPlaylist, songs: MediaApi.Song[]): MediaApi.Playlist => ({
  id: String(playlist.id),
  name: playlist.name,
  description: playlist.description,
  curatorName: playlist.curatorName || "Songloft",
  artwork: playlist.artworkUrl || playlist.cover_url || playlist.coverUrl
    ? { url: coverImageUrl(playlist.artworkUrl ?? playlist.cover_url ?? playlist.coverUrl) ?? "" }
    : undefined,
  songs,
  url: String(playlist.id),
});

export async function fetchMediaAlbums(): Promise<MediaApi.Album[]> {
  const response = await get<{ albums: HostAlbum[] }>("/api/albums");
  return response.albums.map(toMediaAlbum);
}

export async function fetchMediaAlbum(id: string): Promise<MediaApi.Album | undefined> {
  try {
    return toMediaAlbum(await get<HostAlbum>(`/api/album?id=${encodeURIComponent(id)}`));
  } catch {
    return undefined;
  }
}

export async function fetchMediaArtists(): Promise<MediaApi.Artist[]> {
  const albums = await fetchMediaAlbums();
  const artists = new Map<string, MediaApi.Artist>();
  for (const album of albums) {
    const name = album.artistName || "Unknown Artist";
    const current = artists.get(name) ?? {
      id: name,
      name,
      url: name,
      artwork: album.artwork,
      albums: [],
    };
    current.albums?.push(album);
    artists.set(name, current);
  }
  return [...artists.values()].sort((left, right) => left.name.localeCompare(right.name));
}

export async function fetchMediaArtistAlbums(id: string): Promise<MediaApi.Album[]> {
  const artist = (await fetchMediaArtists()).find((candidate) => candidate.id === id);
  return artist?.albums ?? [];
}

export async function fetchMediaPlaylists(): Promise<MediaApi.Playlist[]> {
  const response = await get<{ playlists: HostPlaylist[] }>("/api/playlists");
  return response.playlists.map((playlist) => toMediaPlaylist(playlist, (playlist.songs ?? []).map(toMediaSong)));
}

export async function fetchMediaPlaylist(id: string): Promise<MediaApi.Playlist | undefined> {
  const playlistId = Number(id);
  if (!Number.isFinite(playlistId)) return undefined;
  try {
    const [playlistsResponse, songsResponse] = await Promise.all([
      get<{ playlists: HostPlaylist[] }>("/api/playlists"),
      get<{ songs: HostSong[] }>(`/api/playlists/${playlistId}/songs?limit=500`),
    ]);
    const playlist = playlistsResponse.playlists.find((candidate) => candidate.id === playlistId);
    if (!playlist) return undefined;
    return toMediaPlaylist(playlist, songsResponse.songs.map(toMediaSong));
  } catch {
    return undefined;
  }
}

export async function fetchMediaSearchResults(query: string): Promise<MediaApi.SearchResults> {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const [songsResponse, albums, artists, playlists] = await Promise.all([
    get<{ songs: HostSong[] }>(`/api/songs?limit=200&q=${encodeURIComponent(query)}`),
    fetchMediaAlbums(),
    fetchMediaArtists(),
    fetchMediaPlaylists(),
  ]);
  const includesQuery = (value?: string) => value?.toLocaleLowerCase().includes(normalizedQuery) ?? false;
  return {
    songs: songsResponse.songs.map(toMediaSong),
    albums: albums.filter((album) => includesQuery(album.name) || includesQuery(album.artistName)),
    artists: artists.filter((artist) => includesQuery(artist.name)),
    playlists: playlists.filter((playlist) => includesQuery(playlist.name) || includesQuery(playlist.description)),
  };
}

export function mediaSongToHostId(song: MediaApi.Song): number | undefined {
  const id = Number(song.id);
  return Number.isFinite(id) ? id : undefined;
}

export function isHostPlayerAvailable(): boolean {
  const { host, player } = window.SongloftPlugin ?? {};
  try {
    return Boolean(host?.isAvailable() && player);
  } catch {
    return false;
  }
}

export async function getHostPlayerInfo(): Promise<HostPlayerState | null> {
  if (!isHostPlayerAvailable()) return null;
  return window.SongloftPlugin!.player!.getState();
}

export function subscribeToHostPlayer(callback: (state: HostPlayerState) => void): () => void {
  if (!isHostPlayerAvailable()) return () => {};
  return window.SongloftPlugin!.player!.onStateChange(callback);
}

export function hostSongToMediaItem(song?: HostSong): MediaApi.MediaItem | undefined {
  return song ? toMediaSong(song) : undefined;
}

export function getHostTheme() {
  return window.SongloftPlugin?.getTheme?.() ?? { colorScheme: "default" as const };
}

export function onHostThemeChange(callback: (theme: { colorScheme: "default" | "dark" }) => void) {
  return window.SongloftPlugin?.onThemeChange?.(callback) ?? (() => {});
}
