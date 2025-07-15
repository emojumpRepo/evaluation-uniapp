import type { IBabyInfo } from './types/baby'
import { http } from '@/http/http'

export function createBaby(data: IBabyInfo) {
  return http.post('/member/baby/create', data, undefined, { 'tenant-id': import.meta.env.VITE_TENANT_ID })
}

export function getBabyList(userId: number) {
  return http.get<IBabyInfo[]>('/member/baby/list-by-user-id', { userId }, { 'tenant-id': import.meta.env.VITE_TENANT_ID })
}

export function getBabyInfo(babyId: number) {
  return http.get<IBabyInfo>('/member/baby/get', { id: babyId }, { 'tenant-id': import.meta.env.VITE_TENANT_ID })
}

export function updateBabyInfo(data: IBabyInfo) {
  return http.put('/member/baby/update', data, undefined, { 'tenant-id': import.meta.env.VITE_TENANT_ID })
}
