import type { IUserInfoVo } from '@/api/types/login'
import type { CustomRequestOptions } from '@/http/interceptor'
import { useUserStore } from '@/store'

export function http<T>(options: CustomRequestOptions) {
  // 1. 返回 Promise 对象
  return new Promise<IResData<T>>((resolve, reject) => {
    const userStore = useUserStore()
    uni.request({
      ...options,
      dataType: 'json',
      // #ifndef MP-WEIXIN
      responseType: 'json',
      // #endif
      // 响应成功
      async success(res) {
        // 业务code 401，主动刷新token
        if (res.data && typeof res.data === 'object' && (res.data as any).code === 401) {
          // 兼容userInfo为ref或对象
          const ok = await userStore.refreshToken()
          const userInfo = ((userStore.userInfo && 'value' in userStore.userInfo) ? userStore.userInfo.value : userStore.userInfo) as IUserInfoVo
          if (ok && userInfo.accessToken) {
            // 重试原请求
            const retryOptions = { ...options }
            retryOptions.header = retryOptions.header || {}
            retryOptions.header.Authorization = `Bearer ${userInfo.accessToken}`
            return uni.request({ ...retryOptions, async success(retryRes) {
              // 递归处理401
              if (retryRes.data && typeof retryRes.data === 'object' && (retryRes.data as any).code === 401) {
                userStore.logout()
                uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
                reject(retryRes)
                return
              }
              if (retryRes.statusCode >= 200 && retryRes.statusCode < 300) {
                resolve(retryRes.data as IResData<T>)
              }
              else {
                !options.hideErrorToast && uni.showToast({ icon: 'none', title: (retryRes.data as IResData<T>).msg || '请求错误' })
                reject(retryRes)
              }
            }, fail: reject })
          }
          else {
            userStore.logout()
            uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
            reject(res)
            return
          }
        }
        // 状态码 2xx，参考 axios 的设计
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data as IResData<T>)
        }
        else if (res.statusCode === 401) {
          reject(res)
        }
        else {
          !options.hideErrorToast
          && uni.showToast({
            icon: 'none',
            title: (res.data as IResData<T>).msg || '请求错误',
          })
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试',
        })
        reject(err)
      },
    })
  })
}

/**
 * GET 请求
 * @param url 后台地址
 * @param query 请求query参数
 * @param header 请求头，默认为json格式
 * @returns
 */
export function httpGet<T>(url: string, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return http<T>({
    url,
    query,
    method: 'GET',
    header,
    ...options,
  })
}

/**
 * POST 请求
 * @param url 后台地址
 * @param data 请求body参数
 * @param query 请求query参数，post请求也支持query，很多微信接口都需要
 * @param header 请求头，默认为json格式
 * @returns
 */
export function httpPost<T>(url: string, data?: Record<string, any>, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return http<T>({
    url,
    query,
    data,
    method: 'POST',
    header,
    ...options,
  })
}
/**
 * PUT 请求
 */
export function httpPut<T>(url: string, data?: Record<string, any>, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return http<T>({
    url,
    data,
    query,
    method: 'PUT',
    header,
    ...options,
  })
}

/**
 * DELETE 请求（无请求体，仅 query）
 */
export function httpDelete<T>(url: string, query?: Record<string, any>, header?: Record<string, any>, options?: Partial<CustomRequestOptions>) {
  return http<T>({
    url,
    query,
    method: 'DELETE',
    header,
    ...options,
  })
}

http.get = httpGet
http.post = httpPost
http.put = httpPut
http.delete = httpDelete

// 支持与 alovaJS 类似的API调用
http.Get = httpGet
http.Post = httpPost
http.Put = httpPut
http.Delete = httpDelete
