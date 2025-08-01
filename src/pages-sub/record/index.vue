<route lang="json">
{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "测评记录"
  }
}
</route>

<script setup lang="ts">
import type { IBabyInfo } from '@/api/types/baby'
import type { IAssessmentResult } from '@/api/types/evaluation'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { getBabyQuestionnaireResult } from '@/api/evaluation'
import { useBabyStore } from '@/store/index'
import Collapse from './components/collapse.vue'

const specialAssessmentId = 10

const babyStore = useBabyStore()
const { babyList } = storeToRefs(babyStore)

// 当前选中的宝宝
const selectedBabyId = ref<number | null>(null)
// 测评结果列表
const assessmentResultList = ref<IAssessmentResult[]>([])
// 默认头像
const defaultAvatar = 'http://test.yudao.iocoder.cn/user/avatar/20250715/G0bTIS90DRSvc90f423c08a6cb7bb3ab969a5301474c_1752564908905.png'
// 加载状态
const loading = ref(false)
// 切换宝宝加载状态
const switchBabyLoading = ref(false)
// 是否显示宝宝选择器
const showBabyPicker = ref(false)

// 当前选中的宝宝信息
const selectedBaby = computed(() => {
  return babyList.value.find(baby => baby.id === selectedBabyId.value)
})

// 选择宝宝
async function selectBaby(baby: IBabyInfo) {
  switchBabyLoading.value = true
  showBabyPicker.value = false
  selectedBabyId.value = baby.id || null
  await getAssessmentResultList()
  switchBabyLoading.value = false
}

function openSelectBabyPicker() {
  if (babyList.value.length === 0) {
    uni.showToast({
      title: '请先添加宝宝',
      icon: 'none',
    })
  }
  else {
    showBabyPicker.value = true
  }
}

// 查看问卷结果
function handleQuestionnaire(id: number) {
  uni.navigateTo({
    url: `/pages-sub/record/result?id=${id}`,
  })
}

// 查看测评整体结果
function handleViewAssessmentResult(assessmentId: number) {
  uni.navigateTo({
    url: `/pages-sub/record/assessment-result?assessmentId=${assessmentId}&babyId=${selectedBabyId.value}`,
  })
}

// 查看历史对比报告
function handleViewHistoryComparison(assessmentId: number) {
  uni.navigateTo({
    url: `/pages-sub/record/history-comparison?assessmentId=${assessmentId}&babyId=${selectedBabyId.value}`,
  })
}

/**
 * 获取测评结果列表
 */
async function getAssessmentResultList() {
  try {
    const res = await getBabyQuestionnaireResult({ babyId: selectedBabyId.value! })
    const { code, data } = res
    console.log('获取测评结果', res)
    if (code === 0) {
      assessmentResultList.value = (data as unknown as IAssessmentResult[]).sort((a, b) => b.assessmentId - a.assessmentId)
    }
  }
  catch (err) {
    console.error('获取测评结果失败', err)
  }
}

onMounted(async () => {
  loading.value = true
  if (babyList.value.length > 0) {
    selectedBabyId.value = babyList.value[0].id
    await getAssessmentResultList()
  }
  loading.value = false
})
</script>

<template>
  <view class="relative min-h-screen bg-gray-50">
    <view v-if="switchBabyLoading" class="absolute left-0 top-0 z-10 h-full w-full flex items-center justify-center bg-white/70">
      <wd-loading size="18" />
    </view>

    <!-- 宝宝选择器 -->
    <view class="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
      <view class="flex items-center justify-between">
        <text class="text-gray-800">
          选择宝宝
        </text>
        <view
          class="flex items-center rounded-lg bg-blue-50 px-3 py-2 active:bg-blue-100"
          @click="openSelectBabyPicker"
        >
          <image class="mr-2 h-6 w-6 rounded-full" :src="selectedBaby?.avatar || defaultAvatar" mode="aspectFill" />
          <template v-if="selectedBaby?.name">
            <text class="mr-2 text-sm text-blue-600 font-medium">
              {{ selectedBaby.name }}
            </text>
            <wd-icon name="arrow-down" color="#2563EB" size="16px" />
          </template>
          <template v-else>
            <text class="mr-2 text-sm text-gray-500">
              暂无宝宝
            </text>
          </template>
        </view>
      </view>
    </view>

    <!-- 测评主题列表 -->
    <view class="mt-5 px-4 pb-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="mt-50 flex items-center justify-center">
        <wd-loading />
      </div>

      <!-- 空状态 -->
      <div v-else-if="assessmentResultList.length === 0" class="mt-20 flex flex-col items-center justify-center">
        <image src="@/static/images/empty.png" class="w-1/6" mode="widthFix" />
        <span class="mt-4 text-sm text-gray-500">暂无测评记录</span>
      </div>

      <!-- 测评主题卡片 -->
      <div class="flex flex-col gap-5 pb-10">
        <div
          v-for="item in assessmentResultList" :key="item.completedTime"
          class="overflow-hidden rounded-lg shadow-sm"
        >
          <Collapse :info="item" :special-assessment-id="specialAssessmentId" @handle-questionnaire="handleQuestionnaire" @handle-view-assessment-result="handleViewAssessmentResult" @handle-view-history-comparison="handleViewHistoryComparison" />
        </div>
      </div>
    </view>

    <!-- 宝宝选择弹窗 -->
    <wd-popup v-model="showBabyPicker" position="bottom" :safe-area-inset-bottom="true">
      <view class="bg-white px-4 pb-0 pt-6">
        <view class="mb-4 text-center text-gray-800">
          选择宝宝
        </view>

        <view class="flex flex-col gap-3">
          <view
            v-for="baby in babyList" :key="baby.id" class="flex items-center border border-gray-200 rounded-lg p-3"
            :class="{ 'border-blue-500 bg-blue-50': selectedBabyId === baby.id }" @click="selectBaby(baby)"
          >
            <image
              class="mr-3 h-10 w-10 rounded-full"
              :src="baby.avatar || 'https://via.placeholder.com/40x40/E5E7EB/9CA3AF?text=👶'" mode="aspectFill"
            />
            <view class="flex-1">
              <text class="text-sm text-gray-800">
                {{ baby.name }}
              </text>
              <text class="block text-xs text-gray-500">
                生日: {{ baby.birthday }}
              </text>
            </view>
            <wd-icon v-if="selectedBabyId === baby.id" name="check" color="#3B82F6" size="16px" />
          </view>
        </view>
      </view>
    </wd-popup>
  </view>
</template>
