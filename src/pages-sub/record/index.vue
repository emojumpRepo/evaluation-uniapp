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
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { getBabyQuestionnaireResult } from '@/api/evaluation'
import { getLevelClass } from '@/api/types/evaluation'
import { useBabyStore } from '@/store/index'

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
// 是否显示宝宝选择器
const showBabyPicker = ref(false)
// 当前展开的测评ID数组（用于折叠面板）
const expandedAssessments = ref<string[]>([])

// 当前选中的宝宝信息
const selectedBaby = computed(() => {
  return babyList.value.find(baby => baby.id === selectedBabyId.value)
})

// 选择宝宝
async function selectBaby(baby: IBabyInfo) {
  selectedBabyId.value = baby.id || null
  await getAssessmentResultList()
  showBabyPicker.value = false
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
function handleQuestionnaire(questionnaire: any, assessmentId: number) {
  uni.navigateTo({
    url: `/pages-sub/record/history-record?babyId=${selectedBabyId.value}&questionnaireId=${questionnaire.questionnaireId}&assessmentId=${assessmentId}`,
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
      assessmentResultList.value = data as unknown as IAssessmentResult[]
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

<script lang="ts">
export default {
  options: {
    styleIsolation: 'shared',
  },
}
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
      <div class="flex flex-col gap-5">
        <div
          v-for="item in assessmentResultList" :key="item.assessmentId"
          class="overflow-hidden rounded-lg shadow-sm"
        >
          <wd-collapse v-model="expandedAssessments">
            <wd-collapse-item :name="`item-${item.assessmentId}`">
              <template #title="{ expanded }">
                <view class="w-full flex items-center">
                  <view class="flex-1">
                    <view class="mb-2 flex items-center justify-between">
                      <text class="text-base text-gray-800 font-medium">
                        {{ item.assessmentTitle }}
                      </text>
                      <wd-icon v-if="expanded" name="chevron-up" size="22px" color="#999" />
                      <wd-icon v-else name="chevron-down" size="22px" color="#999" />
                    </view>
                    <!-- 进度条 -->
                    <div class="mr-4 flex items-center gap-2 text-xs text-gray-400">
                      <span class="whitespace-nowrap">完成进度</span>
                      <div class="w-full flex items-center gap-3">
                        <wd-progress
                          :percentage="Math.round((item.questionnaireResults.length / item.questionnaireCount) * 100)"
                          :color="item.questionnaireResults.length === item.questionnaireCount ? '#10B981' : '#3B82F6'"
                          hide-text
                        />
                        <span>{{ item.questionnaireResults.length }}/{{ item.questionnaireCount }}</span>
                      </div>
                    </div>
                  </view>
                </view>
              </template>

              <!-- 问卷列表 -->
              <div
                v-for="questionnaire in item.questionnaireResults" :key="questionnaire.questionnaireId"
                class="collapse-item py-4 space-y-1" @click="handleQuestionnaire(questionnaire, item.assessmentId)"
              >
                <view class="flex flex-col gap-3">
                  <view class="flex items-center justify-between">
                    <text class="text-sm">
                      {{ questionnaire.questionnaireTitle }}
                    </text>
                    <wd-tag type="success" size="small">
                      已完成
                    </wd-tag>
                  </view>
                  <view class="flex items-center gap-4 text-xs">
                    <text class="text-gray-600">
                      得分：<text class="text-gray-800">
                        {{ questionnaire.score }}
                      </text>
                    </text>
                    <text class="text-gray-600">
                      等级：<text :class="getLevelClass(questionnaire.level, 'color')">
                        {{ questionnaire.level }}
                      </text>
                    </text>
                  </view>
                  <text class="text-xs text-gray-400">
                    完成时间：{{ dayjs(questionnaire.completedTime).format('YYYY-MM-DD HH:mm:ss') }}
                  </text>
                </view>
              </div>
            </wd-collapse-item>
          </wd-collapse>
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

<style lang="scss" scoped>
:deep(.wd-collapse-item__body) {
  padding-top: 3px !important;
  padding-left: 28px !important;
  padding-right: 28px !important;
}

.collapse-item {
  border-bottom: 1px solid #e8e8e8;
}

.collapse-item:last-child {
  border-bottom: none;
}
</style>
