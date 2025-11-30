export interface VideoData {
    /** 视频标题 */
    title: string;
    /** 视频封面图 URL */
    thumbnail: string;
    /** 视频下载链接 */
    downloadUrl: string;
    /** 视频作者 (可选) */
    author?: string;
    /** 来源平台 (可选) */
    platform?: 'twitter' | 'instagram' | 'threads';
}

export interface ApiResponse {
    /** 是否成功 */
    success: boolean;
    /** 返回的数据 (如果成功) */
    data?: VideoData;
    /** 错误信息 (如果失败) */
    error?: string;
}
