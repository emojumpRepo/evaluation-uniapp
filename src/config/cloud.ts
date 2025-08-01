// 云开发配置文件
export const CLOUD_CONFIG = {
  // 云开发环境ID，请根据你的实际情况修改
  envId: 'cloud1-2gfs8qx88df51b5f', // 替换为你的云开发环境ID

  // 是否启用用户追踪
  traceUser: true,

  // 云存储配置
  storage: {
    // 音频文件存储路径前缀
    audioPrefix: 'audio/',

    // 图片文件存储路径前缀
    imagePrefix: 'images/',

    // 视频文件存储路径前缀
    videoPrefix: 'videos/',
  },
}

// 获取云开发环境ID
export function getCloudEnvId(): string {
  return CLOUD_CONFIG.envId
}

// 获取云开发初始化配置
export function getCloudInitConfig() {
  return {
    env: CLOUD_CONFIG.envId,
    traceUser: CLOUD_CONFIG.traceUser,
  }
}
