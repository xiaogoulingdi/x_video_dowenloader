'use client'; // 标记为客户端组件，因为我们需要使用 useState 和事件处理

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiResponse, VideoData } from '@/types';
import { AlertCircle, Download, Link as LinkIcon, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function Home() {
  // 状态管理
  // inputUrl: 存储用户输入的链接
  const [inputUrl, setInputUrl] = useState('');

  // isLoading: 标记是否正在请求 API，用于显示加载动画
  const [isLoading, setIsLoading] = useState(false);

  // error: 存储错误信息，如果有的话
  const [error, setError] = useState<string | null>(null);

  // videoData: 存储 API 返回的视频数据
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  // 处理表单提交
  const handleAnalyze = async () => {
    // 重置之前的状态
    setError(null);
    setVideoData(null);

    // 简单的非空检查
    if (!inputUrl.trim()) {
      setError('请输入视频链接');
      return;
    }

    setIsLoading(true);

    try {
      // 调用我们刚才创建的模拟 API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: inputUrl }),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        // 如果 API 返回错误，设置错误信息
        throw new Error(data.error || '解析失败，请检查链接是否正确');
      }

      // 请求成功，保存视频数据
      if (data.data) {
        setVideoData(data.data);
      }

    } catch (err) {
      // 捕获并显示错误
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('发生未知错误');
      }
    } finally {
      // 无论成功还是失败，都结束加载状态
      setIsLoading(false);
    }
  };

  // 处理粘贴按钮点击
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputUrl(text);
    } catch (err) {
      console.error('无法读取剪贴板', err);
      // 某些浏览器可能需要用户授权
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-4 text-zinc-900">
      {/* Hero 区域 */}
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            万能视频下载器
          </h1>
          <p className="text-zinc-500">
            支持一键下载 Twitter, Instagram, 和 Threads 视频。
          </p>
        </div>

        {/* 输入区域 */}
        <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="在此粘贴视频链接..."
                className="pl-9"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              variant="outline"
              onClick={handlePaste}
              disabled={isLoading}
              title="粘贴链接"
            >
              粘贴
            </Button>
          </div>

          <Button
            className="w-full"
            onClick={handleAnalyze}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在解析...
              </>
            ) : (
              '立即解析'
            )}
          </Button>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center justify-center text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="mr-2 h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        {/* 结果卡片 */}
        {videoData && (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg animate-in fade-in zoom-in-95 duration-300">
            {/* 视频预览 (使用 video 标签替代 img，解决无封面问题) */}
            <div className="relative aspect-video w-full bg-black">
              <video
                src={videoData.downloadUrl}
                controls
                className="h-full w-full object-contain"
                poster={videoData.thumbnail && !videoData.thumbnail.includes('abs.twimg.com') ? videoData.thumbnail : undefined}
              >
                您的浏览器不支持视频播放。
              </video>
              <div className="absolute top-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white z-10">
                {videoData.platform?.toUpperCase()}
              </div>
            </div>

            {/* 视频信息与下载按钮 */}
            <div className="p-4 text-left">
              <h3 className="mb-1 truncate font-semibold text-lg">{videoData.title}</h3>
              {videoData.author && (
                <p className="mb-4 text-sm text-zinc-500">{videoData.author}</p>
              )}

              {/* 使用后端代理下载接口 */}
              <a
                href={`/api/download?url=${encodeURIComponent(videoData.downloadUrl)}&filename=${videoData.platform}_video.mp4`}
                target="_self"
                className="block"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Download className="mr-2 h-4 w-4" />
                  保存视频
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
