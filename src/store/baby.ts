import type { IBabyInfo } from '@/api/types/baby'
import { defineStore, storeToRefs } from 'pinia'
import { getBabyList } from '@/api/baby'
import { useUserStore } from '@/store/user'

export const useBabyStore = defineStore('baby', () => {
  const userStore = useUserStore()
  const { userInfo } = storeToRefs(userStore)

  const babyList = ref<IBabyInfo[]>([])

  // 获取宝宝列表
  async function getBabyListData() {
    const res = await getBabyList(userInfo.value.userId)
    console.log('获取宝宝列表', res)
    if (res.code === 0) {
      babyList.value = res.data
    }
  }

  return {
    babyList,
    getBabyListData,
  }
})
