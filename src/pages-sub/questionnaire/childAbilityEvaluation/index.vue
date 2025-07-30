<route lang="json">
  {
    "layout": "default",
    "style": {
      "navigationBarTitleText": "答题详情"
    }
  }
</route>

<script setup lang="ts">
import type { Schema } from '@/hooks/useAssessment'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { submitQuestionnaireAnswer } from '@/api/evaluation'
import { useAssessment } from '@/hooks/useAssessment'
import { aesEncrypt } from '@/utils/crypto'

// ==================== 常量配置 ====================
const QUESTIONNAIRE_FILES: Record<string, string> = {
  儿童精细动作测评量表: 'fineMotorQuestionnaire.json',
  儿童适应能力测评量表: 'adaptiveAbilityQuestionnaire.json',
  儿童语言测评量表: 'languageQuestionnaire.json',
  儿童社会行为测评量表: 'socialBehaviorQuestionnaire.json',
  儿童大运动测评量表: 'grossMotorQuestionnaire.json',
}

// ==================== 响应式状态 ====================
const questionnaireTitle = ref('')
const loading = ref(true)
const error = ref('')
const currentMonthParam = ref('')
const showDesc = ref(false)
const userId = ref<number>(0)
const assessmentId = ref<number>(0)
const questionnaireId = ref<number>(0)
const submitResult = ref<any>(null)
const submitError = ref<string>('')

// ==================== 使用 Composable ====================
const {
  schema,
  currentMonthIndex,
  currentQuestionIndex,
  isCompleted,
  resultData,
  maxTestMonth,
  answers,
  isRetreating,
  retreatStartMonth,
  currentQuestion,
  currentMonth,
  totalQuestions,
  currentFlatIndex,
  handleAnswer,
  initializeAssessment,
  resetAssessment,
  completeAssessment,
  navigateToMonth,
  getCurrentMonthStatus,
  isMonthCompleted,
  hasMonthFailed,
  isMonthAnswered,
  getFormattedAnswers,
} = useAssessment()

// ==================== 工具函数 ====================
const schemaModules = import.meta.glob('./schema/*.json')

/**
 * 根据标题加载问卷
 */
async function loadSchemaByTitle(title: string, month: string) {
  loading.value = true
  error.value = ''

  try {
    const fileName = QUESTIONNAIRE_FILES[title]
    if (!fileName) {
      throw new Error('未知问卷标题')
    }

    const importPath = `./schema/${fileName}`
    const schemaModule = schemaModules[importPath]

    if (!schemaModule) {
      throw new Error('未找到本地问卷文件')
    }

    const res = (await schemaModule() as any).default
    const schemaData: Schema = res

    // 使用 composable 初始化测评
    initializeAssessment(schemaData, month, maxTestMonth.value)
  }
  catch (e: any) {
    error.value = e.message || '加载问卷失败'
  }
  finally {
    loading.value = false
  }
}

// ==================== UI 交互函数 ====================
function toggleShowDesc() {
  showDesc.value = !showDesc.value
}

function playAudio() {
  console.log('播放语音', currentQuestion.value?.questionText)
}

function goBack() {
  uni.navigateBack()
}

/**
 * 处理答案并显示结果
 */
async function handleAnswerWithUI(canDo: boolean) {
  handleAnswer(canDo)

  // 如果测评完成，显示结果
  if (isCompleted.value && resultData.value) {
    // 获取格式化的答案列表
    const formattedAnswers = getFormattedAnswers()
    console.log('格式化的答案列表：', JSON.stringify(formattedAnswers, null, 2))

    try {
      // 加密数据
      const encryptedUserId = aesEncrypt(userId.value)
      const encryptedAssessmentId = aesEncrypt(assessmentId.value)
      const encryptedQuestionnaireId = aesEncrypt(questionnaireId.value)
      const encryptedAnswerData = aesEncrypt(formattedAnswers)

      // 准备接口参数
      const params = {
        encryptedUserId,
        encryptedAssessmentId,
        encryptedQuestionnaireId,
        encryptedAnswerData,
        completedTime: new Date().toISOString(),
      }

      // 调用接口
      const response = await submitQuestionnaireAnswer(params)
      // 检查接口响应状态
      if (response.code === 0) {
        // 成功
        submitResult.value = response.data
        submitError.value = ''
      }
      else {
        // 失败
        submitResult.value = null
        submitError.value = response.msg || '未知错误'
      }
    }
    catch (error) {
      console.error('提交失败：', error)
      submitResult.value = null
      submitError.value = '网络请求失败，请检查网络连接后重试'
    }
  }
}

// ==================== 生命周期 ====================
onLoad((options) => {
  if (options.title) {
    questionnaireTitle.value = options.title
    currentMonthParam.value = options.currentMonth || ''

    // 设置最高测试月龄
    if (options.maxTestMonth) {
      maxTestMonth.value = Number.parseInt(options.maxTestMonth)
    }

    // 获取必要的ID参数
    if (options.userId) {
      userId.value = Number.parseInt(options.userId)
    }
    if (options.assessmentId) {
      assessmentId.value = Number.parseInt(options.assessmentId)
    }
    if (options.questionId) {
      questionnaireId.value = Number.parseInt(options.questionId)
    }

    loadSchemaByTitle(options.title, options.currentMonth)
  }
  else {
    error.value = '未指定问卷标题'
    loading.value = false
  }
})
</script>

<template>
  <view class="min-h-screen bg-gray-50 p-4">
    <view v-if="loading" class="h-40 flex items-center justify-center">
      <text>加载中...</text>
    </view>
    <view v-else-if="error" class="py-10 text-center text-red-500">
      {{ error }}
    </view>
    <view v-else-if="isCompleted && resultData" class="mx-auto max-w-xl">
      <!-- 测评完成结果 -->
      <view class="mb-4 rounded-xl bg-white p-6 text-center shadow">
        <view class="mb-4">
          <text class="text-2xl text-green-600 font-bold">
            问卷已完成
          </text>
        </view>
        <view class="mb-4">
          <text class="text-lg font-medium">
            {{ resultData.questionnaireTitle }}
          </text>
        </view>

        <!-- 提交结果展示 -->
        <view v-if="submitResult" class="mb-4 rounded-lg bg-green-50 p-4">
          <text class="text-green-700 font-medium">
            问卷已成功提交，请等待评估结果
          </text>
          <!-- 可以根据接口返回的数据展示更多内容 -->
          <view v-if="submitResult.message" class="mt-2 text-sm text-green-600">
            {{ submitResult.message }}
          </view>
        </view>

        <view v-else-if="submitError" class="mb-4 rounded-lg bg-red-50 p-4">
          <text class="text-red-700 font-medium">
            提交失败
          </text>
          <view class="mt-2 text-sm text-red-600">
            {{ submitError }}
          </view>
        </view>

        <button
          class="w-full rounded bg-blue-500 text-white"
          @click="goBack"
        >
          返回
        </button>
      </view>
    </view>
    <view v-else-if="schema && currentQuestion" class="mx-auto max-w-xl">
      <!-- 问卷标题与月龄和进度 -->
      <view class="mb-2 flex items-center justify-between">
        <view class="flex items-center gap-2">
          <text class="text-lg font-bold">
            {{ schema.questionnaireTitle }}
          </text>
          <text class="text-xs text-gray-400">
            {{ currentMonth }}个月龄
          </text>
        </view>
      </view>
      <!-- 题目卡片 -->
      <view class="mb-4 rounded-xl bg-white p-4 shadow">
        <!-- 题目+语音按钮 -->
        <view class="mb-2 flex gap-2">
          <view class="h-fit rounded-md bg-blue-50 p-2 text-blue-500 !border-0" @click="playAudio">
            <wd-icon name="sound" size="18" />
          </view>
          <text class="text-base font-medium">
            {{ currentQuestion.questionText }}
          </text>
        </view>
        <!-- 图片 -->
        <view v-if="currentQuestion.pictureUrl || currentQuestion.pictureUrl.length > 0" class="mb-3">
          <template v-if="typeof currentQuestion.pictureUrl === 'string'">
            <image :src="currentQuestion.pictureUrl" class="w-full rounded-xl object-cover" mode="widthFix" />
          </template>
          <template v-else>
            <view class="h-80 w-full overflow-hidden rounded-xl">
              <swiper class="swiper" indicator-dots>
                <swiper-item v-for="(item, index) in currentQuestion.pictureUrl" :key="index">
                  <img :src="item" mode="aspectFit" class="w-full">
                </swiper-item>
              </swiper>
            </view>
          </template>
        </view>
        <!-- 如何操作按钮 -->
        <view class="mb-2">
          <button
            class="w-full flex items-center justify-center gap-4 border-2 border-gray-200 rounded-xl border-solid bg-white py-2 text-base"
            @click="toggleShowDesc"
          >
            <text class="i-carbon-view size-4" />
            <text class="text-base">
              如何操作
            </text>
            <text :class="showDesc ? 'i-carbon-chevron-up' : 'i-carbon-chevron-down'" class="size-4" />
          </button>
        </view>
        <!-- 问题描述和视频（展开时） -->
        <view v-if="showDesc" class="mt-2 rounded bg-yellow-50 p-3 text-sm text-gray-700">
          <view class="mb-2">
            {{ currentQuestion.questionDescription }}
          </view>
          <button
            v-if="currentQuestion.videoUrl"
            class="w-full flex items-center justify-center border border-yellow-300 rounded bg-white py-2 text-yellow-700"
          >
            <text class="iconfont mr-1">
              ▶️
            </text>
            <text>观看演示视频</text>
          </button>
        </view>
      </view>
      <!-- 答题按钮（上下排列） -->
      <view class="mb-2 flex flex-col gap-3">
        <button
          class="w-full flex items-center justify-center border-0 rounded-xl bg-[#16a34a] py-3 text-lg text-white font-semibold"
          @click="handleAnswerWithUI(true)"
        >
          能做到
        </button>
        <button
          class="w-full flex items-center justify-center border-2 border-red-300 rounded-xl border-solid py-3 text-lg text-red-400 font-semibold"
          @click="handleAnswerWithUI(false)"
        >
          暂时不能
        </button>
      </view>
    </view>
    <view v-else class="py-10 text-center text-gray-400">
      暂无题目
    </view>
  </view>
</template>
