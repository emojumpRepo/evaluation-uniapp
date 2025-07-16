import type { IBabyInfo } from './types/baby'
import { http } from '@/http/http'

export function createBaby(data: IBabyInfo) {
  return http.post('/member/baby/create', data)
}

export function getBabyList(userId: number) {
  return http.get<IBabyInfo[]>('/member/baby/list-by-user-id', { userId })
}

export function getBabyInfo(babyId: number) {
  return http.get<IBabyInfo>('/member/baby/get', { id: babyId })
}

export function updateBabyInfo(data: IBabyInfo) {
  return http.put('/member/baby/update', data)
}
