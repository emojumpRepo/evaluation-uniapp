export interface IArticle {
  id?: number
  title: string
  content: string
  coverImage: string
  category: string
  viewCount: number
  likeCount: number
  publishTime: string
  remark?: string // 文章摘要/简介
}

export interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl: string
  sort: number
  status: number
}
