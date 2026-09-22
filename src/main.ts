/// <reference types="@songloft/plugin-sdk" />
import {
  createRouter,
  jsonResponse,
  parseQuery,
  type HTTPRequest,
  type HTTPResponse,
} from '@songloft/plugin-sdk';

const router = createRouter();

type SourceSong = {
  id: number;
  title?: string;
  artist?: string;
  album?: string;
  duration?: number;
  cover_url?: string;
  coverUrl?: string;
};

const toSong = (song: SourceSong): SourceSong => ({
  ...song,
  title: song.title?.trim() || '未知歌曲',
  artist: song.artist?.trim() || '未知歌手',
  album: song.album?.trim() || '未知专辑',
  duration: song.duration ?? 0,
});

const parsePositiveInt = (value: string | undefined, fallback: number, max: number) =>
  Math.min(max, Math.max(1, Number.parseInt(value ?? '', 10) || fallback));

router.get('/api/songs', async (req) => {
  const query = parseQuery(req.query);
  const limit = parsePositiveInt(query['limit'], 200, 500);
  const offset = Math.max(0, Number.parseInt(query['offset'] ?? '', 10) || 0);
  const keyword = query['q']?.trim();
  const sourceSongs = keyword
    ? await songloft.songs.search(keyword)
    : await songloft.songs.list({ limit, offset });
  const songs = (sourceSongs as SourceSong[]).map(toSong);
  return jsonResponse({ songs, total: keyword ? songs.length : songs.length, offset, limit });
});

router.get('/api/songs/:id', async (_req, params) => {
  const id = Number.parseInt(params['id'] ?? '', 10);
  if (!Number.isFinite(id) || id <= 0) return jsonResponse({ error: 'invalid id' }, 400);
  const song = await songloft.songs.getById(id);
  if (!song) return jsonResponse({ error: 'not found' }, 404);
  return jsonResponse(toSong(song as SourceSong));
});

router.get('/api/playlists', async () => {
  const playlists = await songloft.playlists.list();
  return jsonResponse({ playlists });
});

router.get('/api/playlists/:id/songs', async (req, params) => {
  const id = Number.parseInt(params['id'] ?? '', 10);
  if (!Number.isFinite(id) || id <= 0) return jsonResponse({ error: 'invalid id' }, 400);
  const query = parseQuery(req.query);
  const limit = parsePositiveInt(query['limit'], 200, 500);
  const offset = Math.max(0, Number.parseInt(query['offset'] ?? '', 10) || 0);
  const sourceSongs = await songloft.playlists.getSongs(id, { limit, offset });
  return jsonResponse({ songs: (sourceSongs as SourceSong[]).map(toSong), playlistId: id });
});

router.get('/api/plugin-info', async () => {
  const token = await songloft.plugin.getToken();
  const hostUrl = await songloft.plugin.getHostUrl();
  return jsonResponse({ token, hostUrl });
});

router.get('/', () => ({
  statusCode: 301,
  headers: { Location: 'static/index.html' },
  body: '',
}));

async function onInit(): Promise<void> {
  songloft.log.info('iPod plugin initialized');
}

async function onDeinit(): Promise<void> {
  songloft.log.info('iPod plugin deinitialized');
}

async function onHTTPRequest(req: HTTPRequest): Promise<HTTPResponse> {
  return router.handle(req);
}

globalThis.onInit = onInit;
globalThis.onDeinit = onDeinit;
globalThis.onHTTPRequest = onHTTPRequest;
