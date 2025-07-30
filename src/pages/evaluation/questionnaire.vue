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
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { generateAssessmentResult, getPublishedQuestionnaires, recordQuestionnaireAccess } from '@/api/evaluation'
import { useBabyStore } from '@/store/baby'

const props = defineProps<{
  id: number
  babyId: number
  isRepeatable: number
}>()

const specialAssessmentId = 10

const babyStore = useBabyStore()
const { babyList } = storeToRefs(babyStore)

// 将数字参数转换为布尔值
const isRepeatable = computed(() => Boolean(Number(props.isRepeatable)))

const questionnaires = ref<IQuestionnaire[]>([])

const ORDERED_TITLES = [
  '儿童精细动作测评量表',
  '儿童适应能力测评量表',
  '儿童语言测评量表',
  '儿童社会行为测评量表',
  '儿童大运动测评量表',
]

// 量表所有月龄段
const ALL_MONTH_LIST = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 18, 21, 24, 27, 30, 33, 36, 42, 48, 54, 60, 66, 72, 78, 84]

/**
 * 获取问卷状态
 */
function getQuestionnaireStatus(item: IQuestionnaire) {
  if (props.id === specialAssessmentId) {
    return item.completed ? '已完成' : '开始答题'
  }

  if (isRepeatable.value) {
    return '开始答题'
  }

  return item.completed ? '已完成' : '开始答题'
}

/**
 * 判断问卷是否可点击（顺序填写）
 */
function isQuestionnaireEnabled(item: IQuestionnaire) {
  if (Number(props.id) !== specialAssessmentId) {
    return true
  }
  const orderIdx = ORDERED_TITLES.indexOf(item.title)
  if (orderIdx === -1) {
    return true
  }
  for (let i = 0; i < orderIdx; i++) {
    const prev = questionnaires.value.find(q => q.title === ORDERED_TITLES[i])
    if (!prev || !prev.completed) {
      return false
    }
  }
  return true
}

/**
 * 跳转到问卷页面
 * @param item 问卷信息
 */
async function goToQuestionnaire(item: IQuestionnaire) {
  if (Number(props.id) === specialAssessmentId && !item.completed) {
    const orderIdx = ORDERED_TITLES.indexOf(item.title)
    const enabled = isQuestionnaireEnabled(item)
    if (orderIdx !== -1 && !enabled) {
      uni.showToast({ title: '请按顺序完成以上问卷', icon: 'none' })
      return
    }
  }

  if (!isRepeatable.value || Number(props.id) === specialAssessmentId) {
    if (item.completed) {
      uni.showToast({ title: '该问卷已完成', icon: 'none' })
      return
    }
  }

  try {
    // 添加访问次数
    await recordQuestionnaireAccess({ id: item.id, babyId: props.babyId })

    const urlParams: string[] = [
      `userId=${props.babyId}`,
      `assessmentId=${props.id}`,
      `questionId=${item.id}`,
    ]
    // 只有儿童能力测评才传currentMonth
    if (item.link.includes('/pages-sub/questionnaire/childAbilityEvaluation/index')) {
      // 直接从store查找baby信息
      const baby = babyList.value.find(b => b.id === Number(props.babyId))
      if (baby) {
        const currentMonth = getMainTestMonth(baby.monthAge, ALL_MONTH_LIST)
        urlParams.push(`currentMonth=${currentMonth}`)
      }
    }
    const urlParamStr = urlParams.join('&')

    // 跳转
    if (item.link.includes('/pages-sub/questionnaire/childAbilityEvaluation/index')) {
      const targetUrl = `${item.link}&${urlParamStr}`
      uni.navigateTo({ url: targetUrl })
    }
    else {
      const link = `${item.link}&${urlParamStr}`
      const answerUrl = `/pages/evaluation/answer?link=${encodeURIComponent(link)}`
      uni.navigateTo({ url: answerUrl })
    }
  }
  catch (error) {
    console.error('跳转问卷失败:', error)
    uni.showToast({ title: '跳转失败，请重试', icon: 'none' })
  }
}

async function getQuestionnaires() {
  try {
    console.log('问卷列表参数', props)
    const res = await getPublishedQuestionnaires({ assessmentId: props.id, babyId: props.babyId })
    console.log('获取问卷列表', res)
    const { code, data } = res
    if (code === 0) {
      questionnaires.value = data
    }
    else {
      uni.showToast({ title: '获取问卷列表失败', icon: 'none' })
    }
  }
  catch (err) {
    console.log('获取问卷列表失败', err)
  }
}

function allQuestionnairesCompleted() {
  return questionnaires.value.length > 0 && questionnaires.value.every(q => q.completed)
}

async function handleGenerateAssessmentResult() {
  try {
    const res = await generateAssessmentResult({
      assessmentId: props.id,
      babyId: props.babyId,
    })

    if (res.code === 0) {
      uni.showToast({ title: '测评结果生成成功', icon: 'success' })
    }
    else {
      uni.showToast({ title: res.msg || '生成失败', icon: 'none' })
    }
  }
  catch (error) {
    console.error('生成测评结果失败:', error)
    uni.showToast({ title: '网络错误，请重试', icon: 'none' })
  }
}

onShow(async () => {
  await getQuestionnaires()
})

// 获取主测月龄（取最接近且不大于实际月龄的区间）
function getMainTestMonth(monthAge: number, monthList: number[]): number {
  let mainMonth = monthList[0]
  for (let i = 0; i < monthList.length; i++) {
    if (monthAge < monthList[i]) {
      break
    }
    mainMonth = monthList[i]
  }
  return mainMonth
}
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
        :class="{ 'opacity-50': Number(props.id) === specialAssessmentId && !item.completed && ORDERED_TITLES.includes(item.title) && !isQuestionnaireEnabled(item) }"
        @tap="goToQuestionnaire(item)"
      >
        <!-- 热门标识 -->
        <view
          v-if="item.isPopular"
          class="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-red-100 px-2 py-1"
        >
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
                {{ getQuestionnaireStatus(item) }}
              </text>
              <text class="text-sm">
                {{ item.completed ? '✔' : '→' }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 生成测评结果按钮 -->
    <view v-if="Number(props.id) === specialAssessmentId && allQuestionnairesCompleted()" class="mb-6 flex justify-center">
      <button class="rounded bg-blue-600 px-8 py-3 text-lg text-white font-bold shadow" @click="handleGenerateAssessmentResult">
        生成测评结果
      </button>
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
