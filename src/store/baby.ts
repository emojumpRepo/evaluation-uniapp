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

  // 计算月龄的工具函数
  function calculateMonthAge(birthday: string | number): number {
    const birthDate = new Date(birthday)
    const currentDate = new Date()

    // 计算年份差和月份差
    let monthAge = (currentDate.getFullYear() - birthDate.getFullYear()) * 12
    monthAge += currentDate.getMonth() - birthDate.getMonth()

    // 如果当前日期的天数小于出生日期的天数，则月龄减1
    if (currentDate.getDate() < birthDate.getDate()) {
      monthAge--
    }

    // 确保月龄不小于0
    return Math.max(0, monthAge)
  }

  // 为宝宝列表添加月龄信息
  function addMonthAgeToList(babies: IBabyInfo[]): IBabyInfo[] {
    return babies.map(baby => ({
      ...baby,
      monthAge: calculateMonthAge(baby.birthday),
    }))
  }

  // 获取宝宝列表
  async function getBabyListData() {
    isLoading.value = true
    error.value = null

    try {
      const res = await getBabyList(userInfo.value.userId)
      console.log('获取宝宝列表', res)

      if (res.code === 0) {
        // 获取数据后计算每个宝宝的月龄
        const babiesWithAge = res.data ? addMonthAgeToList(res.data) : []
        babyList.value = babiesWithAge
        console.log('添加月龄后的宝宝列表', babiesWithAge)
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
    // 导出工具函数，方便其他地方使用
    calculateMonthAge,
    addMonthAgeToList,
  }
})
