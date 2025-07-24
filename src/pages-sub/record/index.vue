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

const babyStore = useBabyStore()
const { babyList } = storeToRefs(babyStore)

// 当前选中的宝宝
const selectedBabyId = ref<number | null>(null)
// 测评结果列表
const assessmentResultList = ref<IAssessmentResult[]>([])
// 加载状态
const loading = ref(false)
// 是否显示宝宝选择器
const showBabyPicker = ref(false)
// 当前展开的主题ID
const expandedAssessment = ref<number | null>(null)

// 当前选中的宝宝信息
const selectedBaby = computed(() => {
  return babyList.value.find(baby => baby.id === selectedBabyId.value)
})

// 选择宝宝
function selectBaby(baby: IBabyInfo) {
  selectedBabyId.value = baby.id || null
  showBabyPicker.value = false
}

// 筛选后的测评结果列表
const filterAssessmentResultList = computed(() => {
  if (!selectedBaby.value)
    return []

  return getAssessmentResultList()
})

// 切换主题展开状态
function toggleTheme(themeId: number) {
  expandedAssessment.value = expandedAssessment.value === themeId ? null : themeId
}

// 查看问卷结果
function handleQuestionnaire(questionnaire) {
  // 只有已完成的问卷，直接查看结果
  uni.navigateTo({
    url: `/pages-sub/record/questionnaire-result?id=${questionnaire.id}`,
  })
}

// 获取状态标签样式
function getStatusClass(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-600'
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-600'
    case 'not-started':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

// 获取状态文本
function getStatusText(status: string) {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'in-progress':
      return '进行中'
    case 'not-started':
      return '未开始'
    default:
      return '未知'
  }
}

// 获取等级颜色
function getLevelColor(level: string) {
  switch (level) {
    case '优秀':
      return 'text-green-600'
    case '良好':
      return 'text-blue-600'
    case '一般':
      return 'text-yellow-600'
    case '需改进':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

/**
 * 获取测评结果列表
 */
async function getAssessmentResultList() {
  const res = await getBabyQuestionnaireResult({ babyId: selectedBabyId.value! })
  const { code, data } = res
  console.log('获取测评结果', res)
  if (code === 0) {
    return data as unknown as IAssessmentResult[]
  }
  else {
    return []
  }
}

onMounted(async () => {
  if (babyList.value.length > 0) {
    selectedBabyId.value = babyList.value[0].id
    assessmentResultList.value = await getAssessmentResultList()
  }
})
</script>

<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 宝宝选择器 -->
    <view class="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
      <view class="flex items-center justify-between">
        <text class="text-gray-800">
          选择宝宝
        </text>
        <view
          class="flex items-center rounded-lg bg-blue-50 px-3 py-2 active:bg-blue-100"
          @click="showBabyPicker = true"
        >
          <image
            v-if="selectedBaby?.avatar"
            class="mr-2 h-6 w-6 rounded-full"
            :src="selectedBaby.avatar"
            mode="aspectFill"
          />
          <text class="mr-2 text-sm text-blue-600 font-medium">
            {{ selectedBaby?.name || '选择宝宝' }}
          </text>
          <wd-icon name="arrow-down" color="#2563EB" size="16px" />
        </view>
      </view>
    </view>

    <!-- 测评主题列表 -->
    <view class="mt-4 px-4 pb-4">
      <!-- 加载状态 -->
      <view v-if="loading" class="center py-20">
        <wd-loading />
      </view>

      <!-- 空状态 -->
      <view v-else-if="filterAssessmentResultList.length === 0" class="center flex-col py-20">
        <wd-icon name="file-text" color="#D1D5DB" size="48px" />
        <text class="mt-4 text-base text-gray-500">
          暂无已完成的测评记录
        </text>
        <text class="mt-1 text-sm text-gray-400">
          请选择宝宝查看已完成的测评记录
        </text>
      </view>

      <!-- 测评主题卡片 -->
      <view v-else class="flex flex-col gap-4">
        <view
          v-for="theme in filterAssessmentResultList"
          :key="theme.id"
          class="overflow-hidden rounded-xl bg-white shadow-sm"
        >
          <!-- 主题头部 -->
          <view
            class="flex items-center p-4 active:bg-gray-50"
            @click="toggleTheme(theme.id)"
          >
            <view class="mr-3 h-12 w-12 flex items-center justify-center rounded-full text-xl text-white" :class="theme.color">
              {{ theme.icon }}
            </view>
            <view class="flex-1">
              <view class="mb-1 flex items-center justify-between">
                <text class="text-base text-gray-800 font-medium">
                  {{ theme.title }}
                </text>
                <text class="text-xs text-gray-400">
                  {{ theme.completedQuestionnaires }}/{{ theme.totalQuestionnaires }}
                </text>
              </view>
              <text class="mb-2 block text-sm text-gray-500">
                {{ theme.description }}
              </text>
              <view class="flex items-center">
                <view class="mr-2 h-1.5 flex-1 rounded-full bg-gray-200">
                  <view
                    class="h-1.5 rounded-full transition-all"
                    :class="theme.completedQuestionnaires === theme.totalQuestionnaires ? 'bg-green-500' : 'bg-blue-500'"
                    :style="{ width: `${(theme.completedQuestionnaires / theme.totalQuestionnaires) * 100}%` }"
                  />
                </view>
                <text class="text-xs text-gray-400">
                  {{ Math.round((theme.completedQuestionnaires / theme.totalQuestionnaires) * 100) }}%
                </text>
              </view>
            </view>
            <view class="ml-3">
              <wd-icon
                :name="expandedAssessment === theme.id ? 'arrow-up' : 'arrow-down'"
                color="#9CA3AF"
                size="16px"
              />
            </view>
          </view>

          <!-- 问卷列表 -->
          <view v-if="expandedAssessment === theme.id" class="border-t border-gray-100">
            <view
              v-for="questionnaire in theme.questionnaires"
              :key="questionnaire.id"
              class="border-b border-gray-50 p-4 last:border-b-0 active:bg-gray-50"
              @click="handleQuestionnaire(questionnaire)"
            >
              <view class="flex items-start">
                <view class="flex-1">
                  <view class="mb-2 flex items-center justify-between">
                    <text class="text-sm text-gray-800 font-medium">
                      {{ questionnaire.title }}
                    </text>
                    <view
                      class="rounded-full px-2 py-1 text-xs"
                      :class="getStatusClass(questionnaire.status)"
                    >
                      {{ getStatusText(questionnaire.status) }}
                    </view>
                  </view>

                  <text class="mb-2 text-xs text-gray-500">
                    {{ questionnaire.description }}
                  </text>

                  <view class="flex items-center text-xs text-gray-400">
                    <text class="mr-4">
                      {{ questionnaire.ageRange }}
                    </text>
                    <text class="mr-4">
                      约{{ questionnaire.estimatedTime }}分钟
                    </text>
                    <text>{{ questionnaire.totalQuestions }}题</text>
                  </view>

                  <!-- 完成状态信息 -->
                  <view class="mt-2">
                    <view class="flex items-center text-xs">
                      <text class="mr-4 text-gray-600">
                        得分: <text class="text-gray-800 font-medium">
                          {{ questionnaire.score }}
                        </text>
                      </text>
                      <text class="text-gray-600">
                        等级: <text class="font-medium" :class="getLevelColor(questionnaire.level!)">
                          {{ questionnaire.level }}
                        </text>
                      </text>
                    </view>
                    <text class="mt-1 text-xs text-gray-400">
                      完成时间: {{ questionnaire.completeTime }}
                    </text>
                  </view>
                </view>

                <!-- 箭头图标 -->
                <view class="ml-2 flex-shrink-0">
                  <wd-icon name="arrow-right" color="#D1D5DB" size="14px" />
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 宝宝选择弹窗 -->
    <wd-popup v-model="showBabyPicker" position="bottom" :safe-area-inset-bottom="true">
      <view class="bg-white px-4 py-6">
        <view class="mb-4 text-center text-lg text-gray-800 font-medium">
          选择宝宝
        </view>

        <view class="flex flex-col gap-3">
          <view
            v-for="baby in babyList"
            :key="baby.id"
            class="flex items-center border border-gray-200 rounded-lg p-3"
            :class="{ 'border-blue-500 bg-blue-50': selectedBabyId === baby.id }"
            @click="selectBaby(baby)"
          >
            <image
              class="mr-3 h-10 w-10 rounded-full"
              :src="baby.avatar || 'https://via.placeholder.com/40x40/E5E7EB/9CA3AF?text=👶'"
              mode="aspectFill"
            />
            <view class="flex-1">
              <text class="text-base text-gray-800 font-medium">
                {{ baby.name }}
              </text>
              <text class="block text-sm text-gray-500">
                生日: {{ baby.birthday }}
              </text>
            </view>
            <wd-icon
              v-if="selectedBabyId === baby.id"
              name="check"
              color="#3B82F6"
              size="20px"
            />
          </view>
        </view>

        <view class="mt-6">
          <wd-button type="primary" block @click="showBabyPicker = false">
            确定
          </wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>
