<route lang="json">
{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "宝宝管理"
  }
}
</route>

<script setup lang="ts">
import type { IBabyInfo } from '@/api/types/baby'
import { storeToRefs } from 'pinia'
import { ref } from 'vue'
import { getBabyList } from '@/api/baby'
import { useUserStore } from '@/store/user'

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

const babyList = ref<IBabyInfo[]>([]) // 宝宝列表
const selectedBaby = ref<IBabyInfo | null>(null)

function handleEditBaby(baby: IBabyInfo) {
  selectedBaby.value = baby
  uni.navigateTo({
    url: `/pages-sub/baby/add?id=${selectedBaby.value?.id}`,
  })
}

function navigateToAdd() {
  if (babyList.value.length >= 2) {
    uni.showToast({
      title: '最多可添加两个宝宝哦~',
      icon: 'none',
    })
    return
  }

  uni.navigateTo({
    url: '/pages-sub/baby/add',
  })
}

async function getBabyListData() {
  const res = await getBabyList(userInfo.value.userId)
  console.log('获取宝宝列表', res)
  if (res.code === 0) {
    babyList.value = res.data
  }
}

onShow(async () => {
  await getBabyListData()
})
</script>

<template>
  <view class="min-h-screen bg-gray-100 px-4 py-4">
    <!-- 宝宝列表 -->
    <div v-if="babyList.length > 0" class="mb-4 flex flex-col gap-4">
      <div v-for="baby in babyList" :key="baby.name" class="overflow-hidden rounded-xl bg-white p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <image
              class="mr-3 h-10 w-10 rounded-full"
              :src="baby.avatar || 'http://test.yudao.iocoder.cn/user/avatar/20250715/G0bTIS90DRSvc90f423c08a6cb7bb3ab969a5301474c_1752564908905.png'"
              mode="aspectFill"
            />
            <div class="flex-1">
              <div class="mb-1 text-base text-gray-800 font-bold">
                {{ baby.name }}
              </div>
              <div class="whitespace-nowrap text-sm text-gray-500">
                宝宝生日：{{ baby.birthday }}
              </div>
            </div>
          </div>

          <wd-icon name="edit-outline" custom-class="mr-2" color="#999" @click="handleEditBaby(baby)" />
        </div>
      </div>
    </div>

    <!-- 添加宝宝按钮 -->
    <div class="box-shadow-md mb-4 box-border overflow-hidden border border-gray-200 rounded-lg border-dashed bg-white" @click="navigateToAdd">
      <view class="flex items-center justify-center py-5">
        <wd-icon name="add-circle1" custom-class="mr-2" color="#999" size="22px" />
        <text class="text-gray-500">
          添加宝宝
        </text>
      </view>
    </div>

    <!-- 提示文本 -->
    <view class="text-center text-sm text-gray-500">
      最多可添加两个宝宝哦~
    </view>
  </view>
</template>
