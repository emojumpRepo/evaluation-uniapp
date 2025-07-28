import type { IBabyInfo } from '@/api/types/baby'
import { defineStore, storeToRefs } from 'pinia'
import { getBabyList } from '@/api/baby'
import { useUserStore } from '@/store/user'

export const useBabyStore = defineStore('baby', () => {
  const userStore = useUserStore()
  const { userInfo } = storeToRefs(userStore)

  const babyList = ref<IBabyInfo[]>([])
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  // 获取宝宝列表
  async function getBabyListData() {
    isLoading.value = true
    error.value = null

    try {
      const res = await getBabyList(userInfo.value.userId)
      console.log('获取宝宝列表', res)

      if (res.code === 0) {
        babyList.value = res.data || []
      }
      else {
        error.value = '获取宝宝列表失败'
        babyList.value = []
      }
    }
    catch (err) {
      console.error('获取宝宝列表错误:', err)
      error.value = '网络错误，请稍后重试'
      babyList.value = []
    }
    finally {
      isLoading.value = false
    }
  }

  return {
    babyList,
    isLoading,
    error,
    getBabyListData,
  }
})
