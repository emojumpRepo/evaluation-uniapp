<route lang="json">
{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "宝宝管理"
  }
}
</route>

<script setup lang="ts">
import { ref } from 'vue'

interface Baby {
  name: string
  birthday: string
  avatar?: string
}

const babyList = ref<Baby[]>([
  {
    name: '暂无',
    birthday: '2024-06-13',
  },
]) // 宝宝列表

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
</script>

<template>
  <view class="min-h-screen bg-gray-100 px-4 py-4">
    <!-- 宝宝列表 -->
    <div v-if="babyList.length > 0" class="mb-4">
      <div v-for="baby in babyList" :key="baby.name" class="overflow-hidden rounded-xl bg-white p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <image
              class="mr-3 h-10 w-10 rounded-full"
              :src="baby.avatar || '/static/images/default-avatar.png'"
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

          <wd-icon name="edit-outline" custom-class="mr-2" color="#999" />
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
