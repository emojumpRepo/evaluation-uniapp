import type { IArticle } from './types/article'
import { http } from '@/http/http'

export function getArticleList(params: { page: number, pageSize: number }) {
  return http.get<{ list: IArticle[], total: number }>('/member/article/page', params)
}

export function getArticleDetail(id: number) {
  return http.get<IArticle>('/member/article/get', { id })
}

export function likeArticle(id: number) {
  return http.post('/member/article/like', null, { id })
}
