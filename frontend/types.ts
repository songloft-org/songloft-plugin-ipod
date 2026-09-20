export interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverArt?: string;
}

export interface Album {
  id: string;
  name: string;
  artistName: string;
  artworkUrl?: string;
  songCount?: number;
  songs: Song[];
}

export interface Artist {
  id: string;
  name: string;
  artworkUrl?: string;
  albums?: Album[];
}

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  songs: Song[];
}

export type ShuffleMode = 'off' | 'songs';
export type RepeatMode = 'off' | 'one' | 'all';
export type DeviceThemeName = 'silver' | 'black' | 'u2';
export type ColorScheme = 'default' | 'dark';

export interface NowPlayingItem {
  id: number;
  name: string;
  artistName: string;
  albumName: string;
  artworkUrl?: string;
  duration: number;
}

export interface QueueOptions {
  songs?: Song[];
  album?: Album;
  playlist?: Playlist;
  startPosition?: number;
}
