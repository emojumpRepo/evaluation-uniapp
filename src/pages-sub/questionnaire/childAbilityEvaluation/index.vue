<script setup lang="ts">
import { onLoad } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'

const titleToFile: Record<string, string> = {
  儿童精细动作测评量表: 'fineMotorQuestionnaire.json',
  儿童适应能力测评量表: 'adaptiveAbilityQuestionnaire.json',
  儿童语言测评量表: 'languageQuestionnaire.json',
  儿童社会行为测评量表: 'socialBehaviorQuestionnaire.json',
  儿童大运动测评量表: 'grossMotorQuestionnaire.json',
}

const questionnaireTitle = ref('')
const schema = ref<any>(null)
const loading = ref(true)
const error = ref('')

const currentMonthIndex = ref(0)
const currentQuestionIndex = ref(0)
const currentMonthParam = ref('')
const showDesc = ref(false)

const schemaModules = import.meta.glob('./schema/*.json')

const currentQuestion = computed(() => {
  if (!schema.value || !Array.isArray(schema.value.questions))
    return null
  const monthObj = schema.value.questions[currentMonthIndex.value]
  if (!monthObj || !Array.isArray(monthObj.questions))
    return null
  return monthObj.questions[currentQuestionIndex.value] || null
})

const currentMonth = computed(() => {
  if (!schema.value || !Array.isArray(schema.value.questions))
    return ''
  const monthObj = schema.value.questions[currentMonthIndex.value]
  return monthObj?.targetMonth || ''
})

const totalQuestions = computed(() => {
  if (!schema.value || !Array.isArray(schema.value.questions))
    return 0
  return schema.value.questions.reduce((sum: number, m: any) => Array.isArray(m.questions) ? sum + m.questions.length : sum, 0)
})

const currentFlatIndex = computed(() => {
  if (!schema.value || !Array.isArray(schema.value.questions))
    return 1
  let idx = 0
  for (let i = 0; i < currentMonthIndex.value; i++) {
    if (Array.isArray(schema.value.questions[i].questions)) {
      idx += schema.value.questions[i].questions.length
    }
  }
  return idx + currentQuestionIndex.value + 1
})

function nextQuestion() {
  if (!schema.value || !Array.isArray(schema.value.questions))
    return
  const monthObj = schema.value.questions[currentMonthIndex.value]
  if (!monthObj || !Array.isArray(monthObj.questions))
    return
  if (currentQuestionIndex.value < monthObj.questions.length - 1) {
    currentQuestionIndex.value++
  }
  else if (currentMonthIndex.value < schema.value.questions.length - 1) {
    currentMonthIndex.value++
    currentQuestionIndex.value = 0
  }
  showDesc.value = false
}
function prevQuestion() {
  if (!schema.value || !Array.isArray(schema.value.questions))
    return
  const monthObj = schema.value.questions[currentMonthIndex.value]
  if (!monthObj || !Array.isArray(monthObj.questions))
    return
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
  else if (currentMonthIndex.value > 0) {
    currentMonthIndex.value--
    const prevMonthObj = schema.value.questions[currentMonthIndex.value]
    currentQuestionIndex.value = Array.isArray(prevMonthObj.questions) ? prevMonthObj.questions.length - 1 : 0
  }
  showDesc.value = false
}

async function loadSchemaByTitle(title: string, month: string) {
  loading.value = true
  error.value = ''
  try {
    const fileName = titleToFile[title]
    if (!fileName)
      throw new Error('未知问卷标题')
    const importPath = `./schema/${fileName}`
    let res: any
    if (schemaModules[importPath]) {
      res = (await schemaModules[importPath]() as any).default
    }
    else {
      throw new Error('未找到本地问卷文件')
    }
    schema.value = res
    let foundIndex = 0
    if (month && Array.isArray(schema.value.questions)) {
      foundIndex = schema.value.questions.findIndex((q: any) => String(q.targetMonth) === String(month))
      if (foundIndex === -1)
        foundIndex = 0
    }
    currentMonthIndex.value = foundIndex
    currentQuestionIndex.value = 0
    showDesc.value = false
  }
  catch (e: any) {
    error.value = e.message || '加载问卷失败'
  }
  finally {
    loading.value = false
  }
}

function toggleShowDesc() {
  showDesc.value = !showDesc.value
}

function playAudio() {
  // 这里可以集成tts或播放音频，暂用console模拟
  console.log('播放语音', currentQuestion.value?.questionText)
}

onLoad((options) => {
  if (options.title) {
    questionnaireTitle.value = options.title
    currentMonthParam.value = options.currentMonth || ''
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
        <text class="text-xs text-gray-400">
          {{ currentFlatIndex }}/{{ totalQuestions }}
        </text>
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
        <view class="mb-3">
          <image v-if="currentQuestion.pictureUrl" :src="currentQuestion.pictureUrl" class="h-40 w-full rounded-xl object-cover" mode="aspectFill" />
          <view v-else class="h-40 w-full flex items-center justify-center rounded-xl bg-gray-100 text-gray-300">
            <text>暂无图片</text>
          </view>
        </view>
        <!-- 如何操作按钮 -->
        <view class="mb-2">
          <button class="w-full flex items-center justify-center gap-4 border-2 border-gray-200 rounded-xl border-solid bg-white py-2 text-base" @click="toggleShowDesc">
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
          <button v-if="currentQuestion.videoUrl" class="w-full flex items-center justify-center border border-yellow-300 rounded bg-white py-2 text-yellow-700">
            <text class="iconfont mr-1">
              ▶️
            </text>
            <text>观看演示视频</text>
          </button>
        </view>
      </view>
      <!-- 答题按钮（上下排列） -->
      <view class="mb-2 flex flex-col gap-3">
        <button class="w-full flex items-center justify-center rounded bg-green-500 py-3 text-lg text-white" @click="nextQuestion">
          <text class="iconfont mr-2">
            ✔️
          </text>能做到
        </button>
        <button class="w-full flex items-center justify-center border border-red-200 rounded bg-red-50 py-3 text-lg text-red-500" @click="nextQuestion">
          <text class="iconfont mr-2">
            ❌
          </text>暂时不能
        </button>
      </view>
      <!-- 题目切换（已移除） -->
    </view>
    <view v-else class="py-10 text-center text-gray-400">
      暂无题目
    </view>
  </view>
</template>
