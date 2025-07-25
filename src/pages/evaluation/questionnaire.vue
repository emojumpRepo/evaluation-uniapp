<route lang="jsonc">
{
  "style": {
    "navigationBarTitleText": "问卷列表",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black"
  }
}
</route>

<script setup lang="ts">
import type { IQuestionnaire } from '@/api/types/evaluation'
import { onMounted, ref } from 'vue'
import { getPublishedQuestionnaires } from '@/api/evaluation'

const props = defineProps<{
  id: number
  babyId: number
  isRepeatable: boolean
}>()

const questionnaires = ref<IQuestionnaire[]>([])

/**
 * 跳转到问卷页面
 * @param item 问卷信息
 */
function goToQuestionnaire(item: IQuestionnaire) {
  // if (props.isRepeatable && item.completed) {
  //   uni.showToast({ title: '该问卷已完成', icon: 'none' })
  //   return
  // }
  const link = `${item.link}&userId=${props.babyId}&assessmentId=${props.id}&questionId=${item.id}`
  uni.navigateTo({
    url: `/pages/evaluation/answer?link=${encodeURIComponent(link)}`,
  })
}

onMounted(async () => {
  try {
    console.log('问卷列表参数', props)
    const res = await getPublishedQuestionnaires({ page: 1, pageSize: 10, assessmentId: props.id })
    console.log('获取问卷列表', res)
    const { code, data } = res
    if (code === 0) {
      questionnaires.value = data.list as IQuestionnaire[]
    }
    else {
      uni.showToast({ title: '获取问卷列表失败', icon: 'none' })
    }
  }
  catch (err) {
    console.log('获取问卷列表失败', err)
  }
})
</script>

<template>
  <view class="min-h-screen bg-gray-50 p-4">
    <!-- 页面标题 -->
    <view class="mb-4 text-center">
      <text class="mt-2 block text-sm text-gray-500">
        请完成以下问卷
      </text>
    </view>

    <!-- 问卷列表 -->
    <view class="mb-10 space-y-3">
      <view
        v-for="item in questionnaires" :key="item.id"
        class="relative overflow-hidden border border-gray-100 rounded-2xl bg-white shadow-sm transition-all duration-200 active:scale-98"
        @tap="goToQuestionnaire(item)"
      >
        <!-- 热门标识 -->
        <view v-if="item.isPopular" class="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-red-100 px-2 py-1">
          <text class="text-xs text-red-600">
            🔥 热门
          </text>
        </view>

        <!-- 主要内容 -->
        <view class="p-4">
          <!-- 标题 -->
          <text class="mb-3 block text-lg text-gray-800 font-semibold leading-tight">
            {{ item.title }}
          </text>

          <!-- 描述 -->
          <text class="line-clamp-2 mb-4 block text-sm text-gray-600 leading-relaxed">
            {{ item.description }}
          </text>

          <!-- 详细信息 -->
          <view class="space-y-2">
            <!-- 预计时长 -->
            <view class="flex items-center gap-2">
              <text class="text-xs text-gray-400">
                ⏰
              </text>
              <text class="text-xs text-gray-600">
                预计时长：{{ item.estimatedDuration }}分钟
              </text>
            </view>

            <!-- 访问次数 -->
            <view class="flex items-center gap-2">
              <text class="text-xs text-gray-400">
                👁️
              </text>
              <text class="text-xs text-gray-600">
                访问次数：{{ item.accessCount }}
              </text>
            </view>
          </view>
        </view>

        <!-- 底部操作区 -->
        <view class="border-t border-gray-100 bg-gray-50 px-4 py-3">
          <view class="flex items-center justify-between">
            <text class="text-xs text-gray-500">
              ID: {{ item.id }}
            </text>
            <view class="flex items-center gap-1 text-blue-600">
              <text class="text-sm font-medium">
                <!-- {{ item.completed ? '已完成' : '开始答题' }} -->
                开始答题
              </text>
              <text class="text-sm">
                {{ item.completed ? '✔' : '→' }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="questionnaires.length === 0" class="py-20 text-center">
      <text class="mb-4 block text-4xl">
        📋
      </text>
      <text class="text-sm text-gray-500">
        暂无可用问卷
      </text>
    </view>
  </view>
</template>
