# ipod-classic-js 分析与无 Spotify 原样移植方案

## 1. 目标与约束

本插件以 [ipod-classic-js](https://github.com/tvillarete/ipod-classic-js) 为唯一的 iPod 界面与交互实现基线。

目标不是重做一个“风格相似”的播放器，而是在 Songloft WebView 内运行上游项目的 iPod 界面。除 Songloft 宿主接口差异外，必须保持上游源文件、组件结构、导航栈、样式和交互逻辑不变。

约束如下：

1. 上游 UI、点击盘、导航、Cover Flow、播放界面和样式以逐文件复制为原则；不以功能等价的重写替代。
2. Songloft 相关代码仅存在于数据、播放和宿主主题桥接的适配边界；UI 组件不能直接调用 `window.SongloftPlugin`。
3. 不迁移、不保留、不模拟 Spotify 功能：不加载 Spotify SDK、不保留 Spotify 登录、OAuth 路由、播放器逻辑、设置项或数据获取器。
4. 不使用 Apple Music/MusicKit。Songloft 是唯一音乐来源和播放控制端。
5. 当前项目中已有的简化 UI（包含翻译版 `ViewManager`、`CoverFlowView` 和纯 CSS 视图）不作为迁移基线，应由上游对应实现替换。

## 2. 当前状态与上游差异

### 2.1 上游项目

上游项目为 [tvillarete/ipod-classic-js](https://github.com/tvillarete/ipod-classic-js)，分析所依据的基线提交为 `92d264c`（`origin/master`）。其实现采用 Next.js、React、styled-components、motion 与 React Query。

核心结构：

- `app/components/Ipod/`：机身、屏幕和点击盘的外壳。
- `app/components/ClickWheel/`：MENU、上一首、下一首、播放暂停、中央按钮、滚轮手势及键盘映射。
- `app/components/ViewManager/`：拆分屏幕、全屏、Cover Flow、弹窗、操作表和键盘的独立管理器。
- `app/providers/ViewContextProvider.tsx`：完整导航栈与标题、预览状态。
- `app/hooks/navigation/`：列表滚动、选择、MENU 返回、长按和虚拟键盘交互。
- `app/components/views/`：Home、Music、Cover Flow、列表、播放、设置、搜索和游戏视图。
- `app/components/previews/`：分屏菜单右侧预览。

### 2.2 当前插件

当前插件使用 Vite 和 Songloft WebView。`frontend/songloftApi.ts` 已经承担宿主 API、封面 URL 处理、播放器状态订阅与主题桥接。

当前 `frontend/components/ViewManager/`、`frontend/components/views/`、`frontend/components/SelectableList/` 及 `frontend/styles/index.css` 是对上游界面的简化重写，和上游文件不是同一实现。因此它们不能满足“完全照抄”的要求。

先前为修复 Cover Flow 进行过一次逻辑翻译，该修改同样不属于最终实现，迁移时必须被上游的原版 `CoverFlowView` 与 `CoverFlowViewManager` 替换。

## 3. 原样迁入范围

以下目录或文件应按上游原始相对路径和内容复制到 `frontend/`，并保留 `@/` 导入方式：

| 上游路径 | 迁入目的 |
| --- | --- |
| `app/animation/index.tsx` | 原版切换动画。 |
| `app/components/ClickWheel/` | 原版点击盘图标、按键区域、长按和手势计算。 |
| `app/components/Controls/` | 原版音量、进度与拖动控制 UI。 |
| `app/components/Ipod/` | 原版机身、屏幕边框、点击盘布局和全局样式；仅移除 Next/服务 Provider 包裹。 |
| `app/components/ViewManager/` | 原版分屏/全屏/Cover Flow/弹窗/键盘视图管理器。 |
| `app/components/SelectableList/` | 原版菜单列表、选中态、箭头和播放状态样式。 |
| `app/components/NowPlaying/` | 原版播放页布局。 |
| `app/components/{Header,LoadingIndicator,LoadingScreen,ErrorScreen,KenBurns,BatteryIndicator}/` | 原版屏幕基础 UI。 |
| `app/components/previews/` | 原版分屏右侧预览。 |
| `app/components/views/` | 原版视图代码与视图注册表；Spotify/Apple Music 登录分支在适配层不可达，不在 UI 内重写。 |
| `app/providers/ViewContextProvider.tsx` | 原版完整视图栈模型。 |
| `app/hooks/navigation/` | 原版 MENU 返回、列表滚动、选择、键盘和长按逻辑。 |
| `app/hooks/utils/{useEventListener,useEffectOnce,useTimeout,useInterval,useScrollIntoView}.ts` | 上游无平台依赖的通用 hook。 |
| `app/hooks/battery/` | 原版电池指示状态。 |
| `app/utils/{events,themes,strings,colorScheme}.ts` 与 `app/utils/constants/` | 原版事件、配色和尺寸常量。 |
| `app/types/Media.API.d.ts` | 上游视图使用的 `MediaApi` 类型契约。 |

`frontend/main.tsx`、`frontend/index.html`、`vite.config.ts`、Songloft 后端入口和 `plugin.json` 属于插件运行外壳，不从 Next.js 上游复制。

## 4. 允许改动的唯一适配边界

为了让原 UI 使用 Songloft 数据源，以下层是允许实现适配的边界。它们必须对上游 UI 暴露上游期待的接口和数据形状，UI 内部不应感知 Songloft。

### 4.1 `frontend/songloftApi.ts`

保留为唯一宿主桥接层，负责：

- `window.SongloftPlugin.apiGet` 数据请求；
- `window.SongloftPlugin.player` 队列、播放、暂停、跳曲、进度、音量和播放模式；
- 宿主主题监听；
- 封面地址的鉴权和尺寸处理；
- 将 Songloft 的 `Song`、`Album`、`Playlist` 映射为 `MediaApi` 数据对象。

### 4.2 数据适配器

上游 `useFetchAlbum`、`useFetchAlbums`、`useFetchArtists`、`useFetchPlaylists`、`useFetchPlaylist` 与 `useFetchSearchResults` 的导出名称和返回结构必须保留。

实现改为调用 `songloftApi.ts`，并将结果转换为：

- `MediaApi.Song`：`id` 为字符串、`name`、`artistName`、`albumName`、`artwork.url`、`duration`、`trackNumber`、`url`；
- `MediaApi.Album`：`id`、`name`、`artistName`、`artwork.url`、`songs`；
- `MediaApi.Playlist`：`id`、`name`、`description`、`curatorName`、`artwork.url`、`songs`；
- `MediaApi.PaginatedResponse`：使用一次性数据页，`nextPageParam` 未定义，直至 Songloft 支持分页。

### 4.3 音频适配器

保留上游 `AudioPlayerContext` 所需字段和方法名，但实现仅调用 Songloft 的播放器：

- `play` 调用 `player.setQueue`；
- `pause`、`togglePlayPause`、`skipNext`、`skipPrevious`、`seekToTime`、`setVolume` 调用对应 Songloft 接口；
- `onStateChange` 更新 `nowPlayingItem` 和 `playbackInfo`；
- shuffle/repeat 映射为 Songloft `play_mode`；
- 不导入 Spotify SDK、Spotify API 或 MusicKit。

### 4.4 设置适配器

`useSettings` 保留与上游视图需要的字段，但服务状态固定为 Songloft 已授权：

- `isAuthorized: true`；
- `isAppleAuthorized: true`，仅为使上游的音乐库视图和 Now Playing 条件保持可达；
- `isSpotifyAuthorized: false`；
- `service: 'songloft'` 或在 UI 所需处使用固定授权状态；
- `isOffline`、机身主题、触觉反馈、shuffle 与 repeat 仍由插件维护。

“Apple”字段只是上游 UI 的兼容字段，不代表加载或使用 Apple Music/MusicKit。

## 5. 明确移除 Spotify 的范围

下列代码不会被复制或会在迁入时删除：

- `app/api/spotify/` 全部 OAuth/刷新 token 路由；
- `app/providers/SpotifySdkProvider.tsx`；
- `app/hooks/spotify/` 全目录；
- `app/utils/spotifyApi.ts` 与 `app/utils/spotify.ts`；
- `app/types` 中仅供 Spotify SDK 使用的声明；
- `app/components/views/HomeView`、`SettingsView` 中的 Spotify 登录、选择服务、登出入口；
- Spotify 预览和 Spotify 专属错误弹窗；
- 任何 Spotify CDN 脚本、token、设备 ID、OAuth callback、依赖包和设置文案。

上游 Home 与 Settings 中保留的通用菜单项目（Cover Flow、Music、Now Playing、Shuffle、Repeat、Device theme、Haptic feedback）使用 Songloft 播放/数据适配器。

## 6. 迁移步骤

1. 在 `package.json` 添加上游 UI 必需的通用依赖：`styled-components`、`@tanstack/react-query`、`use-debounce`、`he`、`ios-haptics`；不添加 Spotify、Next 或 MusicKit 依赖。
2. 配置 Vite 与 TypeScript，使 `@/*` 指向 `frontend/*`，并支持上游类型和静态资源路径。
3. 原样复制类型、常量、事件、动画、导航 hook、视图栈 Provider、基础 UI、点击盘、列表、预览、视图管理器与视图组件。
4. 用 Songloft 数据/播放/设置适配器替换上游 Apple Music 和 Spotify Provider、fetcher 与播放器实现；适配仅发生在第 4 节边界。
5. 从上游 `Ipod` 外壳移除 Next `Script`、路由和 Apple/Spotify Provider，其余 JSX 结构、样式和布局维持原版。
6. 删除或替换当前简化重写的组件和 CSS，避免新旧两套 UI 同时存在。
7. 验证：MENU 单击逐层返回、MENU 长按回到 Home、Cover Flow 三层返回、列表滚动/选择、播放页、宿主播放控制、无 Spotify 关键词或依赖。
8. 运行 TypeScript 检查、前端构建、插件构建和插件校验。

## 7. 验收标准

- 对照上游时，UI/交互目录中的迁入文件是原始复制，而不是等价重写。
- `CoverFlowView` 使用上游原版卡片、背面曲目列表与 MENU 状态机；不保留当前翻译版实现。
- `MENU` 单击在当前顶层视图执行上游 `useMenuHideView` 逻辑，Cover Flow 按上游层级退回；长按调用 `resetViews`。
- 菜单、标题和设置文案为上游英文文案。
- 代码、依赖、构建产物和运行时网络行为均不包含 Spotify。
- 播放和音乐库数据只通过 Songloft 宿主桥接工作。
