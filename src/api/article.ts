import type { Banner, IArticle } from './types/article'
import { http } from '@/http/http'

export function getArticleList(params: { page: number, pageSize: number, category?: string }) {
  return http.get<{ list: IArticle[], total: number }>('/emojump/article/page', {
    pageNo: params.page,
    pageSize: params.pageSize,
    ...(params.category && { category: params.category }),
  })
}

export function getArticleDetail(id: number) {
  return http.get<IArticle>('/emojump/article/get', { id })
}

export function likeArticle(id: number) {
  return http.post('/emojump/article/like', null, { id })
}

/**
 * 获取轮播图
 */
export function getBannerList() {
  return http.get<Banner[]>('/system/carousel/list')
}
