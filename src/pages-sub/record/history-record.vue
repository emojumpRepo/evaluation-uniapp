<route lang="json">
{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "问卷记录"
  }
}
</route>

<script setup lang="ts">
import type { IQuestionnaireResultList } from '@/api/types/evaluation'
import dayjs from 'dayjs'
import { onMounted, ref } from 'vue'
import { getHistoryQuestionnaireResult } from '@/api/evaluation'

const props = defineProps<{
  babyId: number
  questionnaireId: number
  assessmentId: number
}>()

const historyRecordList = ref<IQuestionnaireResultList[]>([]) // 历史记录列表
const loading = ref(false)

// 获取风险等级样式类
function getLevelClass(level: string): string {
  switch (level) {
    case '低风险':
      return 'bg-green-100 text-green-600'
    case '轻度风险':
      return 'bg-orange-100 text-orange-600'
    case '中度风险':
      return 'bg-yellow-100 text-yellow-600'
    case '高度风险':
      return 'bg-red-100 text-red-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

// 查看详情
function viewDetail(record: IQuestionnaireResultList) {
  console.log('查看详情:', record)
  uni.navigateTo({
    url: `/pages-sub/record/result?id=${record.id}`,
  })
}

onMounted(async () => {
  loading.value = true
  if (props.babyId && props.questionnaireId) {
    const res = await getHistoryQuestionnaireResult({ questionnaireId: props.questionnaireId, assessmentId: props.assessmentId, babyId: props.babyId })
    const { code, data } = res
    console.log('获取问卷历史记录', res)
    if (code === 0) {
      if (data.length === 1) {
        uni.showToast({
          title: '直接跳转结果页',
          icon: 'none',
        })
      }
      else {
        historyRecordList.value = data
      }
    }
  }
  loading.value = false
})
</script>

<template>
  <view class="mx-auto min-h-screen w-screen bg-gray-50 pt-4">
    <template v-if="loading">
      <view class="mt-50 flex items-center justify-center">
        <wd-loading />
      </view>
    </template>

    <template v-else>
      <!-- 记录列表 -->
      <view class="mx-4 pb-4 space-y-3">
        <view
          v-for="(record) in historyRecordList" :key="record.questionnaireId"
          class="border border-gray-100 rounded-2xl bg-white p-5 shadow-sm transition-colors duration-150 active:bg-gray-50"
          hover-class="bg-gray-50" @click="viewDetail(record)"
        >
          <!-- 标题和时间 -->
          <view class="mb-4">
            <text class="mb-2 block text-base text-gray-800 font-semibold leading-tight">
              {{ record.title }}
            </text>
            <text class="text-xs text-gray-500">
              {{ dayjs(record.completedTime).format('YYYY-MM-DD HH:mm') }}
            </text>
          </view>

          <!-- 分数和等级 -->
          <view class="flex items-center justify-between">
            <view class="flex items-center">
              <text class="mr-3 text-sm text-gray-600">
                得分
              </text>
              <text class="text-xl text-blue-600 font-bold">
                {{ record.score }}
              </text>
            </view>

            <view class="flex items-center">
              <text class="rounded-full px-3 py-1.5 text-sm font-medium" :class="getLevelClass(record.level)">
                {{ record.level }}
              </text>
              <text class="ml-3 text-lg text-blue-600">
                ›
              </text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-if="historyRecordList.length === 0" class="h-80 center">
        <view class="text-center">
          <view class="mb-3 text-4xl opacity-30">
            📋
          </view>
          <text class="text-sm text-gray-400">
            暂无历史记录
          </text>
          <view class="mt-2">
            <text class="text-2xs text-gray-300">
              完成问卷后记录将显示在这里
            </text>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>
