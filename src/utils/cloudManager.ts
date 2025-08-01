import { getCloudInitConfig } from '@/config/cloud'

/**
 * 云开发管理类
 * 统一管理微信云开发相关的功能
 */
class CloudManager {
  private static instance: CloudManager
  private isInitialized = false
  private isInitializing = false

  // 临时文件链接缓存
  private tempFileURLCache = new Map<string, { url: string, expireTime: number }>()
  private readonly CACHE_DURATION = 2 * 60 * 60 * 1000 // 2小时缓存时间

  /**
   * 获取单例实例
   */
  public static getInstance(): CloudManager {
    if (!CloudManager.instance) {
      CloudManager.instance = new CloudManager()
    }
    return CloudManager.instance
  }

  /**
   * 初始化云开发环境
   */
  public async init(): Promise<boolean> {
    // #ifdef MP-WEIXIN
    try {
      // 检查是否已经初始化
      if (this.isInitialized) {
        console.log('云开发环境已初始化')
        return true
      }

      // 防止重复初始化
      if (this.isInitializing) {
        console.log('云开发环境正在初始化中...')
        return false
      }

      this.isInitializing = true

      // 检查微信云开发是否可用
      if (typeof wx === 'undefined' || !wx.cloud) {
        console.error('微信云开发不可用')
        return false
      }

      // 检查是否已经初始化过
      if (wx.cloud.inited) {
        this.isInitialized = true
        this.isInitializing = false
        console.log('云开发环境已初始化')
        return true
      }

      // 获取配置并初始化
      const config = getCloudInitConfig()
      wx.cloud.init(config)

      this.isInitialized = true
      this.isInitializing = false
      console.log('云开发环境初始化成功', config)
      return true
    }
    catch (error) {
      this.isInitializing = false
      console.error('云开发环境初始化失败:', error)
      return false
    }
    // #endif

    // #ifndef MP-WEIXIN
    console.log('非微信小程序环境，跳过云开发初始化')
    return false
    // #endif
  }

  /**
   * 检查云开发环境是否可用
   */
  public isAvailable(): boolean {
    // #ifdef MP-WEIXIN
    return typeof wx !== 'undefined' && wx.cloud && wx.cloud.inited
    // #endif

    // #ifndef MP-WEIXIN
    return false
    // #endif
  }

  /**
   * 获取云存储临时文件链接（带缓存）
   */
  public async getTempFileURL(fileID: string): Promise<string | null> {
    // #ifdef MP-WEIXIN
    try {
      // 检查缓存
      const cached = this.tempFileURLCache.get(fileID)
      if (cached && Date.now() < cached.expireTime) {
        console.log('使用缓存的临时文件链接:', fileID)
        // 检查链接是否仍然有效（通过URL中的时间戳）
        if (this.isTempURLValid(cached.url)) {
          return cached.url
        }
        else {
          console.log('缓存的临时链接已过期，重新获取')
          this.tempFileURLCache.delete(fileID)
        }
      }

      // 确保云开发环境已初始化
      if (!this.isAvailable()) {
        const initialized = await this.init()
        if (!initialized) {
          console.error('云开发环境初始化失败')
          return null
        }
      }

      return new Promise((resolve, reject) => {
        wx.cloud.getTempFileURL({
          fileList: [fileID],
          success: (res) => {
            console.log('获取临时文件链接成功:', res.fileList)

            if (res.fileList && res.fileList.length > 0) {
              const fileInfo = res.fileList[0]
              if (fileInfo.tempFileURL) {
                // 缓存临时链接
                const expireTime = Date.now() + this.CACHE_DURATION
                this.tempFileURLCache.set(fileID, {
                  url: fileInfo.tempFileURL,
                  expireTime,
                })
                console.log('临时文件链接已缓存:', fileID, '过期时间:', new Date(expireTime))
                resolve(fileInfo.tempFileURL)
              }
              else {
                console.error('获取临时文件链接失败:', fileInfo.errMsg)
                reject(new Error(fileInfo.errMsg || '获取临时文件链接失败'))
              }
            }
            else {
              console.error('文件列表为空')
              reject(new Error('文件列表为空'))
            }
          },
          fail: (err) => {
            console.error('获取临时文件链接失败:', err)
            reject(err)
          },
        })
      })
    }
    catch (error) {
      console.error('获取临时文件链接异常:', error)
      return null
    }
    // #endif

    // #ifndef MP-WEIXIN
    console.log('非微信小程序环境，无法获取临时文件链接')
    return null
    // #endif
  }

  /**
   * 检查临时链接是否有效
   */
  private isTempURLValid(url: string): boolean {
    try {
      // 使用正则表达式解析URL参数，避免依赖URL构造函数
      const timestampMatch = url.match(/[?&]t=(\d+)/)
      if (!timestampMatch) {
        console.log('未找到时间戳参数，跳过链接有效性检查')
        return true // 如果没有时间戳，假设链接有效
      }

      const timestamp = timestampMatch[1]
      const urlTime = Number.parseInt(timestamp) * 1000 // 转换为毫秒
      const currentTime = Date.now()
      const timeDiff = urlTime - currentTime

      // 如果链接还有超过5分钟的有效期，认为有效
      const isValid = timeDiff > 5 * 60 * 1000
      console.log('临时链接有效性检查:', {
        urlTime: new Date(urlTime),
        currentTime: new Date(currentTime),
        timeDiff: `${Math.floor(timeDiff / 1000)}秒`,
        isValid,
      })

      return isValid
    }
    catch (error) {
      console.error('检查临时链接有效性失败:', error)
      // 如果检查失败，假设链接有效，避免频繁重新获取
      return true
    }
  }

  /**
   * 上传文件到云存储
   */
  public async uploadFile(filePath: string, cloudPath: string): Promise<string | null> {
    // #ifdef MP-WEIXIN
    try {
      // 确保云开发环境已初始化
      if (!this.isAvailable()) {
        const initialized = await this.init()
        if (!initialized) {
          console.error('云开发环境初始化失败')
          return null
        }
      }

      return new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: (res) => {
            console.log('文件上传成功:', res.fileID)
            resolve(res.fileID)
          },
          fail: (err) => {
            console.error('文件上传失败:', err)
            reject(err)
          },
        })
      })
    }
    catch (error) {
      console.error('文件上传异常:', error)
      return null
    }
    // #endif

    // #ifndef MP-WEIXIN
    console.log('非微信小程序环境，无法上传文件')
    return null
    // #endif
  }

  /**
   * 删除云存储文件
   */
  public async deleteFile(fileID: string): Promise<boolean> {
    // #ifdef MP-WEIXIN
    try {
      // 确保云开发环境已初始化
      if (!this.isAvailable()) {
        const initialized = await this.init()
        if (!initialized) {
          console.error('云开发环境初始化失败')
          return false
        }
      }

      return new Promise((resolve, reject) => {
        wx.cloud.deleteFile({
          fileList: [fileID],
          success: (res) => {
            console.log('文件删除成功:', res.fileList)
            resolve(true)
          },
          fail: (err) => {
            console.error('文件删除失败:', err)
            reject(err)
          },
        })
      })
    }
    catch (error) {
      console.error('文件删除异常:', error)
      return false
    }
    // #endif

    // #ifndef MP-WEIXIN
    console.log('非微信小程序环境，无法删除文件')
    return false
    // #endif
  }

  /**
   * 调用云函数
   */
  public async callFunction(name: string, data?: any): Promise<any> {
    // #ifdef MP-WEIXIN
    try {
      // 确保云开发环境已初始化
      if (!this.isAvailable()) {
        const initialized = await this.init()
        if (!initialized) {
          console.error('云开发环境初始化失败')
          return null
        }
      }

      return new Promise((resolve, reject) => {
        wx.cloud.callFunction({
          name,
          data,
          success: (res) => {
            console.log('云函数调用成功:', res)
            resolve(res.result)
          },
          fail: (err) => {
            console.error('云函数调用失败:', err)
            reject(err)
          },
        })
      })
    }
    catch (error) {
      console.error('云函数调用异常:', error)
      return null
    }
    // #endif

    // #ifndef MP-WEIXIN
    console.log('非微信小程序环境，无法调用云函数')
    return null
    // #endif
  }

  /**
   * 获取云开发数据库实例
   */
  public getDatabase() {
    // #ifdef MP-WEIXIN
    if (this.isAvailable()) {
      return wx.cloud.database()
    }
    // #endif
    return null
  }

  /**
   * 清除缓存
   */
  public clearCache(): void {
    this.tempFileURLCache.clear()
    console.log('临时文件链接缓存已清除')
  }

  /**
   * 清除过期的缓存
   */
  public clearExpiredCache(): void {
    const now = Date.now()
    let clearedCount = 0

    const entries = Array.from(this.tempFileURLCache.entries())
    for (const [fileID, cached] of entries) {
      if (now >= cached.expireTime) {
        this.tempFileURLCache.delete(fileID)
        clearedCount++
      }
    }

    if (clearedCount > 0) {
      console.log(`已清除 ${clearedCount} 个过期的缓存项`)
    }
  }

  /**
   * 获取缓存统计信息
   */
  public getCacheStats(): { total: number, expired: number, valid: number } {
    const now = Date.now()
    let expired = 0
    let valid = 0

    const values = Array.from(this.tempFileURLCache.values())
    for (const cached of values) {
      if (now >= cached.expireTime) {
        expired++
      }
      else {
        valid++
      }
    }

    return {
      total: this.tempFileURLCache.size,
      expired,
      valid,
    }
  }

  /**
   * 重置初始化状态（用于测试或重新初始化）
   */
  public reset(): void {
    this.isInitialized = false
    this.isInitializing = false
    this.clearCache()
  }
}

// 导出单例实例
export const cloudManager = CloudManager.getInstance()

// 导出类（用于测试）
export { CloudManager }
