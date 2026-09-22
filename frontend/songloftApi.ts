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
  coverArt?: string;
  url?: string;
  track_number?: number;
  trackNumber?: number;
};

type HostFacet = {
  value: string;
  count: number;
  cover_url?: string;
};

type HostSongsResponse = {
  songs?: HostSong[];
  total?: number;
};

type HostFacetsResponse = {
  facets?: HostFacet[];
  total?: number;
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

const officialApiGet = async <T>(
  path: string,
  query: Record<string, string | number | undefined> = {},
): Promise<T> => {
  const queryString = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== "")
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
  const token = await window.SongloftPlugin?.getAuthToken?.();
  const response = await fetch(
    `${hostPathPrefix()}${path}${queryString ? `?${queryString}` : ""}`,
    {
      headers: {
        Accept: "application/json",
        ...(typeof token === "string" && token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  );
  if (!response.ok) throw new Error(`Host API request failed: ${response.status}`);
  return response.json() as Promise<T>;
};

const fetchAllOfficialSongs = async (
  filters: Record<string, string | number | undefined>,
): Promise<HostSong[]> => {
  const limit = 500;
  const songs: HostSong[] = [];
  let offset = 0;
  let total = 0;
  do {
    const response = await officialApiGet<HostSongsResponse>("/api/v1/songs", {
      ...filters,
      limit,
      offset,
    });
    const page = response.songs ?? [];
    songs.push(...page);
    total = response.total ?? page.length;
    offset += page.length;
    if (page.length === 0) break;
  } while (offset < total);
  return songs;
};

const fetchAllOfficialFacets = async (field: "album" | "artist"): Promise<HostFacet[]> => {
  const limit = 500;
  const facets: HostFacet[] = [];
  let offset = 0;
  let total = 0;
  do {
    const response = await officialApiGet<HostFacetsResponse>("/api/v1/songs/facets", {
      field,
      limit,
      offset,
    });
    const page = response.facets ?? [];
    facets.push(...page);
    total = response.total ?? page.length;
    offset += page.length;
    if (page.length === 0) break;
  } while (offset < total);
  return facets;
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
  name: song.title?.trim() || "未知歌曲",
  artistName: song.artist?.trim() || "未知歌手",
  albumName: song.album?.trim() || "未知专辑",
  artwork: song.cover_url || song.coverUrl || song.coverArt
    ? { url: coverImageUrl(song.cover_url ?? song.coverUrl ?? song.coverArt) ?? "" }
    : undefined,
  duration: song.duration ?? 0,
  trackNumber: song.track_number ?? song.trackNumber ?? 0,
  url: song.url ?? String(song.id),
});

const toMediaAlbum = (
  id: string,
  name: string,
  artworkUrl?: string,
  artistName?: string,
  songs: MediaApi.Song[] = [],
): MediaApi.Album => ({
  id,
  name,
  artistName,
  artwork: artworkUrl ? { url: coverImageUrl(artworkUrl) ?? "" } : undefined,
  songs,
  url: id,
});

const toMediaAlbumFromFacet = (facet: HostFacet): MediaApi.Album =>
  toMediaAlbum(facet.value, facet.value || "未知专辑", facet.cover_url);

const toMediaArtistFromFacet = (facet: HostFacet): MediaApi.Artist => ({
  id: facet.value,
  name: facet.value || "未知歌手",
  url: facet.value,
  artwork: facet.cover_url ? { url: coverImageUrl(facet.cover_url) ?? "" } : undefined,
  albums: [],
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
  return (await fetchAllOfficialFacets("album")).map(toMediaAlbumFromFacet);
}

export async function fetchMediaAlbum(id: string): Promise<MediaApi.Album | undefined> {
  try {
    const hostSongs = await fetchAllOfficialSongs({ album: id });
    if (hostSongs.length === 0) return undefined;
    const songs = hostSongs.map(toMediaSong);
    const artists = [...new Set(songs.map((song) => song.artistName).filter(Boolean))];
    const coverSong = hostSongs.find((song) => song.cover_url || song.coverUrl || song.coverArt);
    const coverUrl = coverSong?.cover_url ?? coverSong?.coverUrl ?? coverSong?.coverArt;
    return toMediaAlbum(
      id,
      id || "未知专辑",
      coverUrl,
      artists.length === 1 ? artists[0] : artists.length > 1 ? "群星" : "未知歌手",
      songs.sort((left, right) => left.trackNumber - right.trackNumber || left.name.localeCompare(right.name)),
    );
  } catch {
    return undefined;
  }
}

export async function fetchMediaArtists(): Promise<MediaApi.Artist[]> {
  return (await fetchAllOfficialFacets("artist"))
    .map(toMediaArtistFromFacet)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export async function fetchMediaArtistAlbums(id: string): Promise<MediaApi.Album[]> {
  const albums = new Map<string, HostSong[]>();
  for (const song of await fetchAllOfficialSongs({ artist: id })) {
    const name = song.album?.trim() || "未知专辑";
    const current = albums.get(name.toLocaleLowerCase()) ?? [];
    current.push(song);
    albums.set(name.toLocaleLowerCase(), current);
  }
  return [...albums.values()]
    .map((albumSongs) => {
      const coverSong = albumSongs.find((song) => song.cover_url || song.coverUrl || song.coverArt);
      const name = albumSongs[0].album?.trim() || "未知专辑";
      return toMediaAlbum(name, name, coverSong?.cover_url ?? coverSong?.coverUrl ?? coverSong?.coverArt, id);
    })
    .sort((left, right) => left.name.localeCompare(right.name));
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
    officialApiGet<HostSongsResponse>("/api/v1/songs", { keyword: query, limit: 200 }),
    fetchMediaAlbums(),
    fetchMediaArtists(),
    fetchMediaPlaylists(),
  ]);
  const includesQuery = (value?: string) => value?.toLocaleLowerCase().includes(normalizedQuery) ?? false;
  return {
    songs: (songsResponse.songs ?? []).map(toMediaSong),
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
