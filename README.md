# iPod Classic for Songloft

在 Songloft 中使用经典 iPod 点击盘浏览并控制音乐库。插件以 WebView 形式运行，读取 Songloft 本地歌曲与歌单，并直接调用宿主播放器，因此不会重复管理媒体文件或播放队列。

## 运行截图

![iPod Classic 插件运行截图](https://user-images.githubusercontent.com/21055469/71572818-c877a780-2a95-11ea-9e4e-6b0476ff172b.gif)

## 功能

- **经典 iPod 操作方式**：支持圆形点击盘、中央确认、MENU 返回、上一首、下一首和播放/暂停。
- **音乐库浏览**：可查看歌曲、歌单、专辑及专辑内曲目。
- **Cover Flow**：按专辑封面浏览音乐；选择专辑后可挑选曲目播放。
- **搜索歌曲**：按关键词检索 Songloft 音乐库。
- **正在播放**：显示曲目信息、封面、进度与音量；支持滚轮调节音量和进度拖动。
- **播放模式同步**：播放/暂停、切歌、音量、随机播放和循环模式均与 Songloft 播放器同步。
- **个性化设置**：提供银色、黑色和 U2 Edition 三种机身主题，并可开关触觉反馈。
- **键盘辅助操作**：`↑` / `←` 向上选择，`↓` / `→` 向下选择，`Enter` 确认，`Space` 播放/暂停，`Esc` 等同 MENU。

## 安装

1. 前往 [Releases](https://github.com/songloft-org/songloft-plugin-ipod/releases/latest) 下载 `ipod.jsplugin.zip`。
2. 在 Songloft 的插件管理页面导入该压缩包；也可将其放入 Songloft 数据目录的 `jsplugins/` 中。
3. 重启 Songloft，随后在插件列表中打开 **iPod Classic**。

> 插件需要在 Songloft 内运行，以访问音乐库和宿主播放器；直接在普通浏览器中打开时仅可预览界面，无法控制播放。

## 使用说明

### 基本导航

- 在点击盘外圈顺/逆时针滑动，或使用方向键切换当前菜单项。
- 按中央按钮或 `Enter` 打开菜单、选择歌曲并开始播放。
- 按 **MENU** 或 `Esc` 返回上一层；长按 **MENU** 直接回到首页。
- 左右按键分别对应上一首和下一首；底部按键切换播放/暂停。

### 音乐浏览

首页提供以下入口：

| 入口           | 说明                                             |
| -------------- | ------------------------------------------------ |
| `Cover Flow` | 以专辑封面浏览音乐，进入专辑后选择要播放的曲目。 |
| `Music`      | 查看歌曲列表、歌单及歌曲搜索。                   |
| `Settings`   | 修改机身主题、随机、循环和触觉反馈设置。         |

在播放页面，转动点击盘可调节音量；按中央按钮进入进度拖动模式，再转动点击盘可调整播放位置。

## 权限

插件只请求以下 Songloft 权限：

- `songs.read`：读取歌曲、专辑、封面和搜索结果。
- `playlists.read`：读取歌单及歌单中的歌曲。

播放控制通过 Songloft WebView 提供的播放器桥接接口完成，不会上传音乐库数据，也不依赖 Spotify、Apple Music 或其他第三方音乐服务。

## 开发

### 环境要求

- Node.js 20+
- npm
- Songloft `1.3.0` 或更高版本

### 本地运行

```bash
npm install
npm run dev
```

`npm run dev` 会启动插件开发流程，并将插件自动上传到本地 Songloft 实例。

### 构建与校验

```bash
npm run build
npm run validate
```

构建完成后，安装包位于 `dist/ipod.jsplugin.zip`。如需只构建某一部分，可使用：

```bash
npm run build:frontend  # 只构建 WebView 前端
npm run build:backend   # 只构建插件后端
```

## 架构概览

- `frontend/`：React + Vite 的 iPod 界面与交互逻辑。
- `frontend/songloftApi.ts`：Songloft WebView、数据请求和播放器状态的桥接层。
- `src/main.ts`：插件后端 HTTP 路由，向前端提供歌曲、专辑和歌单数据。
- `plugin.json`：插件元数据、权限和运行时配置。

## 发布

仓库中的 [Release workflow](.github/workflows/release.yml) 可通过 GitHub Actions 手动触发。它会执行类型检查、构建、插件校验，并创建或更新对应版本的 GitHub Release。

## 致谢

本插件的 iPod 界面设计与交互实现参考了 [tvillarete/ipod-classic-js](https://github.com/tvillarete/ipod-classic-js)。感谢原项目作者的开源贡献。

## 许可证

[MIT](./plugin.json)
