# 📱 万能社交媒体视频下载器 (MVP)

> 一个基于 Next.js 14 + TypeScript 构建的现代化视频下载工具，支持 Twitter (X), Instagram, 和 Threads。

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8) ![Docker](https://img.shields.io/badge/Docker-Ready-2496ed)

## 📖 项目简介

本项目是一个全栈 Web 应用，旨在提供简洁、快速的社交媒体视频下载体验。它采用了 **Next.js App Router** 架构，前端负责极致的用户交互体验，后端 API 路由负责处理复杂的视频解析逻辑。

核心功能包括：
- **多平台支持**：自动识别并解析 Twitter (X), Instagram, Threads 链接。
- **智能解析**：自动提取最高画质视频，处理 Twitter 的多分辨率流。
- **代理下载**：内置后端流式代理，解决浏览器强制播放而非下载的问题，并规避跨域限制。
- **极简 UI**：基于 Tailwind CSS 打造的响应式设计，适配移动端与桌面端。

## 🛠 技术栈架构

### 前端 (Frontend)
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router) - 利用服务端组件 (RSC) 和客户端组件的混合优势。
- **Language**: [TypeScript](https://www.typescriptlang.org/) - 全局严格类型检查，确保代码健壮性。
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - 原子化 CSS，配合 `clsx` 和 `tailwind-merge` 实现动态样式管理。
- **Icons**: [Lucide React](https://lucide.dev/) - 轻量级、风格统一的图标库。

### 后端 (Backend / API)
- **Runtime**: Next.js API Routes (Edge/Node.js Runtime)。
- **Core Logic**: 集成 `btch-downloader` 开源库进行多平台媒体抓取。
- **Proxy Stream**: 使用 Web Streams API 实现视频流的中转下载。

### 部署与运维 (DevOps)
- **Container**: Docker & Docker Compose。
- **Optimization**: Next.js Standalone Output (极简镜像体积)。
- **Gateway**: Nginx Proxy Manager (反向代理 + SSL 管理)。
- **DNS/CDN**: Cloudflare (DNS 解析 + 安全防护)。

## 📂 项目结构说明

```bash
x_video_downloader/
├── app/
│   ├── api/
│   │   ├── analyze/       # [POST] 核心解析接口，负责调用爬虫库
│   │   │   └── route.ts
│   │   └── download/      # [GET]  代理下载接口，负责流式传输视频
│   │       └── route.ts
│   ├── globals.css        # 全局样式与 Tailwind 指令
│   ├── layout.tsx         # 应用根布局
│   └── page.tsx           # 主页 UI 逻辑 (状态管理、交互反馈)
├── components/
│   └── ui/                # 可复用的基础 UI 组件 (Button, Input)
├── types/
│   └── index.ts           # 全局 TypeScript 类型定义 (VideoData, ApiResponse)
├── public/                # 静态资源
├── Dockerfile             # 多阶段构建 Docker 镜像配置
├── docker-compose.yml     # 容器编排配置
├── next.config.ts         # Next.js 配置 (开启 standalone 模式)
├── tailwind.config.ts     # Tailwind 配置
└── package.json
```

## 🚀 快速开始 (本地开发)

1.  **克隆项目**
    ```bash
    git clone <repository-url>
    cd x_video_downloader
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **启动开发服务器**
    ```bash
    npm run dev
    ```
    访问 `http://localhost:3000` 即可看到应用。

## 🐳 Docker 部署指南

本项目已完全容器化，适合部署在任何 VPS (Ubuntu/Debian) 上。

### 1. 构建并启动
确保服务器已安装 Docker 和 Docker Compose。

```bash
# 后台构建并启动
docker-compose up -d --build
```

### 2. 查看日志
如果遇到解析失败或其他问题，通过日志排查：

```bash
docker-compose logs -f
```

### 3. 生产环境架构建议
推荐使用 **Nginx Proxy Manager** 配合 **Cloudflare** 进行部署：

1.  **Cloudflare**: 配置 DNS 解析到 VPS IP，开启 Proxy (小黄云) 模式。
2.  **Nginx Proxy Manager**:
    - 监听 80/443 端口。
    - 配置 Proxy Host: 转发域名 -> `http://<VPS_IP>:3000`。
    - 申请 Let's Encrypt SSL 证书 (开启 Force SSL)。

## 🔌 扩展指南：如何增加新平台？

如果你想增加对新平台（例如 TikTok）的支持，请遵循以下步骤：

1.  **更新类型定义** (`types/index.ts`):
    ```typescript
    export interface VideoData {
      // ...
      platform?: 'twitter' | 'instagram' | 'threads' | 'tiktok'; // 添加新平台
    }
    ```

2.  **实现解析逻辑** (`app/api/analyze/route.ts`):
    引入新的解析库或编写爬虫逻辑。
    ```typescript
    // 引入库
    import { ttdl } from 'btch-downloader';

    // 在 POST 方法中添加分支
    if (url.includes('tiktok.com')) {
      const data = await ttdl(url);
      // 转换数据结构为 VideoData
      videoData = {
         title: data.title,
         downloadUrl: data.video[0],
         platform: 'tiktok',
         // ...
      };
    }
    ```

3.  **前端适配** (`app/page.tsx`):
    前端通常不需要大改，因为它是数据驱动的。但你可以根据 `platform` 字段展示不同的图标或颜色标签。

## 🛡️ 维护与故障排除

社交媒体平台的反爬虫策略更新频繁，解析功能可能会随时失效。以下是维护建议：

### 1. 解析失败 (404 / Error)
*   **原因**: 目标网站更新了 DOM 结构或 API 签名，导致 `btch-downloader` 失效。
*   **解决**:
    *   检查 `btch-downloader` 是否有新版本：`npm update btch-downloader`。
    *   如果库未更新，尝试寻找其他 npm 包（如 `tiktok-scraper`, `instagram-url-direct` 等）替换失效部分的逻辑。
    *   查看 `docker logs` 获取详细报错堆栈。

### 2. 视频无法下载 (403 Forbidden)
*   **原因**: 视频链接具有时效性，或者防盗链机制禁止直接访问。
*   **解决**: 本项目已通过 `/api/download` 接口实现了服务端代理。确保前端使用的是代理链接而非原始链接。

### 3. 域名访问 502 Bad Gateway
*   **原因**: Nginx Proxy Manager 无法连接到 Next.js 容器。
*   **解决**: 检查 NPM 配置中的 `Forward Hostname / IP` 是否填写正确（推荐填写 VPS 公网 IP 或 Docker 内部网络 IP），并确保协议选择的是 `HTTP` 而非 HTTPS。

---

**License**: MIT
**Author**: GitHub Copilot & User
