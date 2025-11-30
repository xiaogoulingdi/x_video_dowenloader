import { ApiResponse, VideoData } from '@/types';
import { igdl, threads, twitter } from 'btch-downloader';
import { NextResponse } from 'next/server';

// 强制动态模式，防止构建时静态生成
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // 1. 解析请求体
        const body = await request.json();
        let { url } = body;

        // 2. 简单的 URL 验证
        if (!url || typeof url !== 'string') {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '请提供有效的 URL' },
                { status: 400 }
            );
        }

        // URL 规范化处理：修正用户可能的输入错误或兼容性问题
        // 将 x.com 替换为 twitter.com (很多库对 x.com 支持不佳)
        if (url.includes('x.com')) {
            url = url.replace('x.com', 'twitter.com');
        }
        // 将 threads.com 替换为 threads.net (用户常犯的错误，threads.com 是另一个网站)
        if (url.includes('threads.com')) {
            url = url.replace('threads.com', 'threads.net');
        }

        let videoData: VideoData | null = null;

        // 3. 根据平台调用不同的下载逻辑
        // 注意：btch-downloader 的返回值可能因版本更新而变化，这里基于当前类型定义进行处理
        if (url.includes('twitter.com')) {
            console.log('Analyzing Twitter URL:', url);
            const data = await twitter(url);
            console.log('Twitter Data:', data);

            if (data && data.url) {
                let finalUrl = '';

                // 处理 data.url 是数组的情况 (通常包含 hd 和 sd 版本)
                if (Array.isArray(data.url)) {
                    // 尝试找到 HD 版本
                    const hdVideo = data.url.find((item: any) => item.hd);
                    if (hdVideo) {
                        finalUrl = hdVideo.hd;
                    } else {
                        // 如果没有 HD，尝试找 SD
                        const sdVideo = data.url.find((item: any) => item.sd);
                        if (sdVideo) {
                            finalUrl = sdVideo.sd;
                        } else if (data.url.length > 0) {
                            // 如果结构不同，尝试直接取第一个元素的 url 属性或者直接取第一个元素（如果是字符串数组）
                            const first = data.url[0];
                            finalUrl = typeof first === 'string' ? first : (first.url || first.hd || first.sd || '');
                        }
                    }
                } else if (typeof data.url === 'string') {
                    finalUrl = data.url;
                }

                if (finalUrl) {
                    videoData = {
                        title: data.title || 'Twitter Video',
                        thumbnail: 'https://abs.twimg.com/icons/apple-touch-icon-192x192.png', // 默认图标
                        downloadUrl: finalUrl,
                        platform: 'twitter',
                        author: 'Twitter User'
                    };
                }
            }
        } else if (url.includes('instagram.com')) {
            console.log('Analyzing Instagram URL:', url);
            const data = await igdl(url);
            console.log('Instagram Data:', data);

            // Instagram 返回 result 数组
            if (data && data.result && data.result.length > 0) {
                const firstItem = data.result[0];
                videoData = {
                    title: 'Instagram Video',
                    thumbnail: firstItem.thumbnail || '',
                    downloadUrl: firstItem.url,
                    platform: 'instagram',
                    author: 'Instagram User'
                };
            }
        } else if (url.includes('threads.net')) {
            console.log('Analyzing Threads URL:', url);
            const data = await threads(url);
            console.log('Threads Data:', data);

            if (data && data.result && data.result.video) {
                videoData = {
                    title: 'Threads Video',
                    thumbnail: data.result.image || '',
                    downloadUrl: data.result.video,
                    platform: 'threads',
                    author: 'Threads User'
                };
            }
        } else {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '不支持的链接类型，仅支持 Twitter, Instagram, Threads' },
                { status: 400 }
            );
        }

        if (!videoData) {
            return NextResponse.json<ApiResponse>(
                { success: false, error: '无法解析该视频，请检查链接是否有效或公开' },
                { status: 400 }
            );
        }

        // 4. 返回成功响应
        return NextResponse.json<ApiResponse>({
            success: true,
            data: videoData,
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json<ApiResponse>(
            { success: false, error: '解析失败，可能是网络问题或链接无效' },
            { status: 500 }
        );
    }
}
