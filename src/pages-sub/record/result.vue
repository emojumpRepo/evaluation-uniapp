<route lang="json">
  {
    "layout": "default",
    "style": {
      "navigationBarTitleText": "问卷结果"
    }
  }
  </route>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getQuestionnaireResult } from '@/api/evaluation'
import { getLevelClass } from '@/api/types/evaluation'

interface QuestionnaireData {
  summary: {
    label: string
    value: number
    level: string
    range: [number, number]
    description: string
    interpretation: string
    advice: {
      description: string
      content: string[]
    }
  }
  details: Array<{
    label: string
    value: number
    level: string
    range: [number, number]
    interpretation: string
  }>
}

const props = defineProps<{
  id: number
}>()

const questionnaireResult = ref<QuestionnaireData>()
const loading = ref(false)

onMounted(async () => {
  if (!props.id) {
    uni.showToast({
      title: '缺少参数id',
      icon: 'none',
    })
    return
  }

  try {
    loading.value = true
    const res = await getQuestionnaireResult({ id: props.id })
    console.log('获取历史记录详情', res)
    const { code, data } = res
    if (code === 0) {
      questionnaireResult.value = JSON.parse(data.resultData)
    }
  }
  catch (error) {
    console.error('获取问卷结果失败:', error)
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pb-8">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center pt-50">
      <wd-loading />
    </div>

    <div v-else class="px-4 py-6">
      <!-- 总分概览卡片 -->
      <div class="mb-6 overflow-hidden rounded-xl bg-white shadow-sm">
        <div class="px-6 py-4" style="background: linear-gradient(to right, #3b82f6, #2563eb);">
          <h2 class="text-lg text-white font-bold">
            评估结果
          </h2>
        </div>

        <div class="p-6">
          <div class="mb-6 text-center">
            <div class="mb-2 text-4xl text-gray-800 font-bold">
              {{ questionnaireResult?.summary?.value }}
            </div>
            <div class="mb-3 text-sm text-gray-500">
              {{ questionnaireResult?.summary?.label }}
              ({{ questionnaireResult?.summary?.range[0] }}-{{ questionnaireResult?.summary?.range[1] }})
            </div>
            <div
              class="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
              :class="getLevelClass(questionnaireResult?.summary?.level, 'color')"
            >
              <span class="mr-1">{{ getLevelClass(questionnaireResult?.summary?.level, 'icon') }}</span>
              {{ questionnaireResult?.summary?.level }}
            </div>
          </div>

          <div class="space-y-4">
            <div class="rounded-lg bg-blue-50 p-4">
              <h3 class="mb-2 text-sm text-blue-800 font-bold">
                结果说明
              </h3>
              <p class="text-sm text-blue-700 leading-relaxed">
                {{ questionnaireResult?.summary?.description }}
              </p>
            </div>

            <div class="rounded-lg bg-amber-50 p-4">
              <h3 class="mb-2 text-sm text-amber-800 font-bold">
                专业解读
              </h3>
              <p class="text-sm text-amber-700 leading-relaxed">
                {{ questionnaireResult?.summary?.interpretation }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 建议卡片 -->
      <div v-if="questionnaireResult?.summary?.advice" class="mb-6 rounded-xl bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4">
          <h3 class="flex items-center text-lg text-gray-800 font-bold">
            <span class="mr-2">💡</span>
            {{ questionnaireResult?.summary?.advice?.description }}
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-3">
            <div
              v-for="(item, index) in questionnaireResult?.summary?.advice?.content"
              :key="index"
              class="flex items-start"
            >
              <div class="mr-3 mt-0.5 h-6 w-6 flex flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-600 font-medium">
                {{ index + 1 }}
              </div>
              <p class="text-sm text-gray-700 leading-relaxed">
                {{ item }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细分析 -->
      <div class="rounded-xl bg-white shadow-sm">
        <div class="border-b border-gray-100 px-6 py-4">
          <h3 class="flex items-center text-lg text-gray-800 font-bold">
            <span class="mr-2">📊</span>
            详细分析
          </h3>
        </div>
        <div class="p-6">
          <div class="space-y-6">
            <div
              v-for="(detail, index) in questionnaireResult?.details"
              :key="index"
              class="border border-gray-100 rounded-lg"
            >
              <div class="mb-3 flex items-center justify-between">
                <h4 class="text-gray-800 font-medium">
                  {{ detail?.label }}
                </h4>
                <div class="flex items-center space-x-2">
                  <span class="text-2xl text-gray-800 font-bold">{{ detail?.value }}</span>
                  <div
                    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                    :class="getLevelClass(detail?.level, 'color')"
                  >
                    <span class="mr-1">{{ getLevelClass(detail?.level, 'icon') }}</span>
                    {{ detail?.level }}
                  </div>
                </div>
              </div>

              <!-- 分数范围指示器 -->
              <div class="mb-3">
                <div class="mb-1 flex justify-between text-xs text-gray-500">
                  <span>{{ detail?.range[0] }}</span>
                  <span>{{ detail?.range[1] }}</span>
                </div>
                <div class="relative h-2 w-full rounded-full bg-gray-200">
                  <div
                    class="h-2 rounded-full bg-blue-500 transition-all duration-300"
                    :style="{ width: `${((detail?.value - detail?.range[0]) / (detail?.range[1] - detail?.range[0])) * 100}%` }"
                  />
                  <div
                    class="absolute top-0 h-2 w-1 rounded-full bg-gray-600"
                    :style="{ left: `${((detail?.value - detail?.range[0]) / (detail?.range[1] - detail?.range[0])) * 100}%` }"
                  />
                </div>
              </div>

              <div class="rounded-lg bg-gray-50 p-3">
                <p class="text-sm text-gray-700 leading-relaxed">
                  {{ detail?.interpretation }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 温馨提示 -->
      <div class="mt-6 rounded-xl p-6" style="background: linear-gradient(to right, #f0fdf4, #eff6ff);">
        <div class="flex items-start">
          <div class="mr-3 flex-shrink-0">
            <span class="text-2xl">🏥</span>
          </div>
          <div>
            <h4 class="mb-2 text-gray-800 font-bold">
              温馨提示
            </h4>
            <p class="text-sm text-gray-600 leading-relaxed">
              本评估结果仅供参考，不能替代专业医疗诊断。如有疑虑，请及时咨询专业的心理健康专家或医生。
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
