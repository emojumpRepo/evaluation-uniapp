export interface IArticle {
  id?: number
  title: string
  content: string
  coverImage: string
  categoryId: number
  viewCount: number
  likeCount: number
  publishTime: string
  remark?: string // 文章摘要/简介
}

export interface IArticleCategory {
  id: number
  name: string
}

export interface Banner {
  id: number
  title: string
  subtitle: string
  imageUrl: string
  linkUrl: string
  sort: number
  status: number
  type?: number
  popupContent?: string
}
