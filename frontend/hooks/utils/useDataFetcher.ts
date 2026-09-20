import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  fetchMediaAlbum,
  fetchMediaAlbums,
  fetchMediaArtistAlbums,
  fetchMediaArtists,
  fetchMediaPlaylist,
  fetchMediaPlaylists,
  fetchMediaSearchResults,
} from "@/songloftApi";

interface UserLibraryProps {
  inLibrary?: boolean;
}

interface CommonFetcherProps {
  /** Data will not be fetched until the query is explicitly refetched. */
  lazy?: boolean;
}

interface PlaylistFetcherProps extends UserLibraryProps {
  id: string;
}

interface AlbumFetcherProps extends UserLibraryProps {
  id: string;
}

interface AlbumsFetcherProps {
  artworkSize?: number;
  lazy?: boolean;
}

interface ArtistFetcherProps extends UserLibraryProps {
  id: string;
  artworkSize?: number;
}

interface SearchFetcherProps extends UserLibraryProps {
  query: string;
}

const singlePage = <T,>(data: T): MediaApi.PaginatedResponse<T> => ({ data });

export const useFetchAlbum = (options: CommonFetcherProps & AlbumFetcherProps) =>
  useQuery({
    queryKey: ["songloft", "album", options.id],
    queryFn: () => fetchMediaAlbum(options.id),
    enabled: !options.lazy && Boolean(options.id),
  });

export const useFetchAlbums = (options: AlbumsFetcherProps = {}) =>
  useInfiniteQuery({
    queryKey: ["songloft", "albums"],
    queryFn: async () => singlePage(await fetchMediaAlbums()),
    enabled: !options.lazy,
    getNextPageParam: () => undefined,
    initialPageParam: 0,
  });

export const useFetchArtists = (options: CommonFetcherProps = {}) =>
  useInfiniteQuery({
    queryKey: ["songloft", "artists"],
    queryFn: async () => singlePage(await fetchMediaArtists()),
    enabled: !options.lazy,
    getNextPageParam: () => undefined,
    initialPageParam: 0,
  });

export const useFetchArtistAlbums = (options: CommonFetcherProps & ArtistFetcherProps) =>
  useQuery({
    queryKey: ["songloft", "artistAlbums", options.id],
    queryFn: () => fetchMediaArtistAlbums(options.id),
    enabled: !options.lazy && Boolean(options.id),
  });

export const useFetchPlaylists = (options: CommonFetcherProps = {}) =>
  useInfiniteQuery({
    queryKey: ["songloft", "playlists"],
    queryFn: async () => singlePage(await fetchMediaPlaylists()),
    enabled: !options.lazy,
    getNextPageParam: () => undefined,
    initialPageParam: 0,
  });

export const useFetchPlaylist = (options: CommonFetcherProps & PlaylistFetcherProps) =>
  useQuery({
    queryKey: ["songloft", "playlist", options.id],
    queryFn: () => fetchMediaPlaylist(options.id),
    enabled: !options.lazy && Boolean(options.id),
  });

export const useFetchSearchResults = (options: CommonFetcherProps & SearchFetcherProps) =>
  useQuery({
    queryKey: ["songloft", "search", options.query],
    queryFn: () => fetchMediaSearchResults(options.query),
    enabled: !options.lazy && Boolean(options.query.trim()),
  });
