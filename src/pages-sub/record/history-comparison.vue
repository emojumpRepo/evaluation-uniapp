<route lang="json">
{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "历史对比报告"
  }
}
</route>

<script setup lang="ts">
import type { AssessmentResultRespVO, ProjectMastery } from '@/api/types/evaluation'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { getHistoryAssessmentResult } from '@/api/evaluation'
import { getLevelClass } from '@/api/types/evaluation'
import { useBabyStore } from '@/store/index'

// 引入 echarts
let echarts: any = null
// 尝试导入echarts，如果失败则使用空对象
try {
  // eslint-disable-next-line ts/no-require-imports
  echarts = require('../../uni_modules/lime-echart_1.0.4/static/echarts.min.js')
}
catch (error) {
  console.warn('echarts加载失败，图表功能将不可用:', error)
  echarts = {}
}

enum QuestionnaireType {
  儿童精细动作测评量表 = '精细动作',
  儿童适应能力测评量表 = '适应能力',
  儿童语言测评量表 = '语言测评',
  儿童社会行为测评量表 = '社会行为',
  儿童大运动测评量表 = '大运动',
}

const assessmentId = ref(0)
const babyId = ref(0)
const babyStore = useBabyStore()
const { babyList } = storeToRefs(babyStore)

const historyResults = ref<AssessmentResultRespVO[]>([])
const loading = ref(false)
const chartRef = ref()
const selectedDimension = ref('')
const chartType = ref<'line' | 'radar'>('line')

// 当前选中的宝宝信息
const selectedBaby = computed(() => {
  return babyList.value.find(baby => baby.id === babyId.value)
})

// 获取所有维度选项
const dimensionOptions = computed(() => {
  if (!historyResults.value.length)
    return []
  const firstResult = historyResults.value[0]
  return firstResult.questionnaireResults.map(item => ({
    value: item.questionnaireTitle,
    label: QuestionnaireType[item.questionnaireTitle] || item.questionnaireTitle,
  }))
})

// 生成折线图配置
const lineChartOption = computed(() => {
  if (!historyResults.value.length || !selectedDimension.value)
    return {}

  // 获取最近5次测评结果（按时间倒序，最新的在前）
  const recentResults = historyResults.value.slice(0, 5)

  const dimensionData = recentResults.map((result) => {
    const questionnaire = result.questionnaireResults.find(q => q.questionnaireTitle === selectedDimension.value)
    return {
      date: dayjs(result.completedTime).format('YYYY-MM-DD HH:mm'),
      score: questionnaire?.score || 0,
      level: questionnaire?.level || '',
    }
  })

  const dates = dimensionData.map(item => item.date)
  const scores = dimensionData.map(item => item.score)

  return {
    tooltip: {
      trigger: 'axis',
      formatter(params: any) {
        const data = params[0]
        const result = dimensionData[data.dataIndex]
        return [
          `${result.date}`,
          `发育月龄：${data.value}月`,
        ].join('\n')
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        color: '#666666',
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: '#E5E7EB',
        },
      },
    },
    yAxis: {
      type: 'value',
      name: '发育月龄(月)',
      nameTextStyle: {
        color: '#666666',
      },
      axisLabel: {
        color: '#666666',
      },
      axisLine: {
        lineStyle: {
          color: '#E5E7EB',
        },
      },
      splitLine: {
        lineStyle: {
          color: '#F3F4F6',
        },
      },
    },
    series: [
      {
        name: '发育月龄',
        type: 'line',
        data: scores,
        smooth: true,
        lineStyle: {
          color: '#3B82F6',
          width: 3,
        },
        itemStyle: {
          color: '#3B82F6',
          borderWidth: 2,
          borderColor: '#fff',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.1)' },
            ],
          },
        },
        label: {
          show: true,
          position: 'top',
          color: '#374151',
          fontSize: 12,
        },
      },
    ],
  }
})

// 生成雷达图配置
const radarChartOption = computed(() => {
  if (!historyResults.value.length)
    return {}

  // 获取最近3次测评结果（按时间倒序，最新的在前）
  const recentResults = historyResults.value.slice(0, 3)

  // 使用最新的结果作为维度基准
  const latestResult = recentResults[0]
  const dimensions = latestResult.questionnaireResults.map(item => ({
    name: QuestionnaireType[item.questionnaireTitle] || item.questionnaireTitle,
    value: item.score,
  }))

  // 计算所有历史数据中的最大值作为雷达图的最大值
  const indicator = dimensions.map(dim => ({
    name: dim.name,
    max: Math.max(...historyResults.value.flatMap(r =>
      r.questionnaireResults
        .filter(q => QuestionnaireType[q.questionnaireTitle] === dim.name)
        .map(q => q.score),
    )) + 5,
  }))

  // 为最近3次测评生成数据系列
  const series = recentResults.reverse().map((result, index) => { // Reverse to show oldest of the three first in legend
    // 确保数据顺序与维度顺序一致
    const values = dimensions.map((dim) => {
      const questionnaire = result.questionnaireResults.find(q =>
        QuestionnaireType[q.questionnaireTitle] === dim.name,
      )
      return questionnaire?.score || 0
    })

    return {
      name: dayjs(result.completedTime).format('YYYY-MM-DD HH:mm'), // Include full date and time for uniqueness
      value: values,
      lineStyle: {
        color: ['#3B82F6', '#10B981', '#F59E0B'][index] || '#6B7280',
        width: 2,
      },
      itemStyle: {
        color: ['#3B82F6', '#10B981', '#F59E0B'][index] || '#6B7280',
      },
      areaStyle: {
        color: ['rgba(59, 130, 246, 0.1)', 'rgba(16, 185, 129, 0.1)', 'rgba(245, 158, 11, 0.1)'][index] || 'rgba(107, 114, 128, 0.1)',
      },
    }
  })

  return {
    tooltip: {
      trigger: 'item',
      formatter(params: any) {
        const data = params.data
        const date = data.name
        const values = data.value
        let tooltipText = `${date}\n`
        dimensions.forEach((dim, index) => {
          tooltipText += `${dim.name}: ${values[index]}月\n`
        })
        return tooltipText
      },
    },
    legend: {
      data: series.map(s => s.name),
      bottom: 0,
      textStyle: {
        color: '#666666',
        fontSize: 12,
      },
    },
    radar: {
      indicator,
      radius: '65%',
      center: ['50%', '50%'],
      axisName: {
        color: '#666666',
        fontSize: 12,
      },
      splitLine: {
        lineStyle: {
          color: '#E5E7EB',
        },
      },
      splitArea: {
        show: false,
      },
    },
    series: [
      {
        type: 'radar',
        data: series,
        emphasis: {
          lineStyle: {
            width: 3,
          },
        },
      },
    ],
  }
})

// 解析项目掌握情况
const projectMastery = computed(() => {
  if (!historyResults.value.length)
    return null

  const masteryByType: Record<string, ProjectMastery> = {}

  // 按时间升序排序历史测评结果
  const sortedResults = [...historyResults.value].sort((a, b) =>
    new Date(a.completedTime).getTime() - new Date(b.completedTime).getTime(),
  )

  // 遍历所有历史测评结果
  sortedResults.forEach((result) => {
    result.questionnaireResults.forEach((questionnaire) => {
      const questionnaireType = QuestionnaireType[questionnaire.questionnaireTitle] || questionnaire.questionnaireTitle

      if (!masteryByType[questionnaireType]) {
        masteryByType[questionnaireType] = {
          mastered: [],
          pending: [],
        }
      }

      try {
        const answerData = JSON.parse(questionnaire.answerData || '{}')
        // 处理不同的数据结构
        const questions = Array.isArray(answerData) ? answerData : (answerData.questions || [])

        questions.forEach((question: any) => {
          const questionTitle = question.title || question.content || '未知项目'

          // 检查该项目是否已经在已掌握或待发展列表中
          const isInMastered = masteryByType[questionnaireType].mastered.includes(questionTitle)
          const isInPending = masteryByType[questionnaireType].pending.includes(questionTitle)

          if (question.answer === '能做到') {
            // 如果之前不在已掌握列表中，则添加到已掌握
            if (!isInMastered) {
              masteryByType[questionnaireType].mastered.push(questionTitle)
            }
            // 如果之前在待发展列表中，则移除
            if (isInPending) {
              const index = masteryByType[questionnaireType].pending.indexOf(questionTitle)
              if (index > -1) {
                masteryByType[questionnaireType].pending.splice(index, 1)
              }
            }
          }
          else if (question.answer === '暂时不能') {
            // 如果之前不在待发展列表中，则添加到待发展
            if (!isInPending) {
              masteryByType[questionnaireType].pending.push(questionTitle)
            }
            // 如果之前在已掌握列表中，则移除
            if (isInMastered) {
              const index = masteryByType[questionnaireType].mastered.indexOf(questionTitle)
              if (index > -1) {
                masteryByType[questionnaireType].mastered.splice(index, 1)
              }
            }
          }
        })
      }
      catch (error) {
        console.error('解析答案数据失败:', error)
      }
    })
  })

  return masteryByType
})

// 获取所有问卷类型
const questionnaireTypes = computed(() => {
  if (!projectMastery.value)
    return []
  return Object.keys(projectMastery.value)
})

// 当前选中的问卷类型
const selectedQuestionnaireType = ref('')

// 页面加载时获取参数
onLoad((options: any) => {
  assessmentId.value = Number(options.assessmentId) || 0
  babyId.value = Number(options.babyId) || 0

  if (!assessmentId.value || !babyId.value) {
    uni.showToast({
      title: '缺少必要参数',
      icon: 'none',
    })
    return
  }

  loadHistoryResults()
})

// 加载历史测评结果
async function loadHistoryResults() {
  try {
    loading.value = true
    const res = await getHistoryAssessmentResult({
      assessmentId: assessmentId.value,
      babyId: babyId.value,
    })
    console.log('获取历史测评结果', res)
    const { code, data } = res
    if (code === 0) {
      historyResults.value = data
      // 默认选择第一个维度
      if (data.length > 0 && data[0].questionnaireResults.length > 0) {
        selectedDimension.value = data[0].questionnaireResults[0].questionnaireTitle
      }
      // 默认选择第一个问卷类型
      if (questionnaireTypes.value.length > 0) {
        selectedQuestionnaireType.value = questionnaireTypes.value[0]
      }
      // 数据加载完成后初始化图表
      setTimeout(() => {
        initChart()
      }, 300)
    }
  }
  catch (error) {
    console.error('获取历史测评结果失败:', error)
    uni.showToast({
      title: '获取历史测评结果失败',
      icon: 'none',
    })
  }
  finally {
    loading.value = false
  }
}

// 初始化图表
async function initChart() {
  if (!chartRef.value)
    return

  try {
    const myChart = await chartRef.value.init(echarts)
    const option = chartType.value === 'line' ? lineChartOption.value : radarChartOption.value
    myChart.setOption(option)
  }
  catch (error) {
    console.error('初始化图表失败:', error)
  }
}

// 切换图表类型
function switchChartType(type: 'line' | 'radar') {
  chartType.value = type
  setTimeout(() => {
    initChart()
  }, 100)
}

// 切换维度
function switchDimension(dimension: string) {
  selectedDimension.value = dimension
  if (chartType.value === 'line') {
    setTimeout(() => {
      initChart()
    }, 100)
  }
}

// 切换问卷类型
function switchQuestionnaireType(type: string) {
  selectedQuestionnaireType.value = type
}
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-8">
    <!-- 加载状态 -->
    <view v-if="loading" class="flex items-center justify-center pt-50">
      <wd-loading />
    </view>

    <view v-else-if="historyResults.length" class="px-4 py-6">
      <!-- 宝宝信息 -->
      <view class="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <view class="flex items-center">
          <image
            class="mr-3 h-12 w-12 rounded-full"
            :src="selectedBaby?.avatar || 'https://via.placeholder.com/48x48/E5E7EB/9CA3AF?text=👶'"
            mode="aspectFill"
          />
          <view class="flex-1">
            <text class="text-lg text-gray-800 font-bold">
              {{ historyResults[0]?.babyName || selectedBaby?.name || '未知宝宝' }}
            </text>
            <text class="block text-sm text-gray-500">
              测评次数：{{ historyResults.length }}次
            </text>
          </view>
        </view>
      </view>

      <!-- 图表类型切换 -->
      <view class="mb-6 rounded-xl bg-white p-4 shadow-sm">
        <view class="mb-4 flex items-center justify-between">
          <text class="text-lg text-gray-800 font-bold">
            {{ chartType === 'radar' ? '最近三次测评对比' : '发育月龄趋势分析' }}
          </text>
          <view class="flex rounded-lg bg-gray-100 p-1">
            <view
              class="rounded-md px-3 py-1 text-sm font-medium transition-colors"
              :class="chartType === 'line' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'"
              @click="switchChartType('line')"
            >
              趋势图
            </view>
            <view
              class="rounded-md px-3 py-1 text-sm font-medium transition-colors"
              :class="chartType === 'radar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'"
              @click="switchChartType('radar')"
            >
              雷达图
            </view>
          </view>
        </view>

        <!-- 维度选择（仅折线图显示） -->
        <view v-if="chartType === 'line'" class="mb-4">
          <text class="mb-2 block text-sm text-gray-600">
            选择维度：
          </text>
          <view class="flex flex-wrap gap-1">
            <view
              v-for="option in dimensionOptions"
              :key="option.value"
              class="cursor-pointer rounded-lg px-2 py-1 text-xs font-medium transition-colors"
              :class="selectedDimension === option.value ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
              @click="switchDimension(option.value)"
            >
              {{ option.label }}
            </view>
          </view>
        </view>

        <!-- 图表容器 -->
        <view class="h-full w-full">
          <view style="width: 100%; height: 400px;">
            <l-echart ref="chartRef" @finished="initChart" />
          </view>
        </view>
      </view>

      <!-- 项目掌握情况 -->
      <view v-if="projectMastery && questionnaireTypes.length" class="mb-6 rounded-xl bg-white shadow-sm">
        <view class="border-b border-gray-100 px-4 py-4">
          <text class="flex items-center text-lg text-gray-800 font-bold">
            <text class="mr-2">
              📋
            </text>
            项目掌握情况
          </text>
        </view>

        <!-- 问卷类型切换 -->
        <view class="border-b border-gray-100 px-4 py-3">
          <view class="flex flex-wrap gap-1">
            <view
              v-for="type in questionnaireTypes"
              :key="type"
              class="cursor-pointer rounded-lg px-2 py-1 text-xs font-medium transition-colors"
              :class="selectedQuestionnaireType === type ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'"
              @click="switchQuestionnaireType(type)"
            >
              {{ type }}
            </view>
          </view>
        </view>

        <view class="p-4">
          <view v-if="selectedQuestionnaireType && projectMastery[selectedQuestionnaireType]">
            <!-- 已掌握项目 -->
            <view class="mb-6">
              <text class="mb-3 block text-sm text-green-800 font-bold">
                ✅ 已掌握项目 ({{ projectMastery[selectedQuestionnaireType].mastered.length }}项)
              </text>
              <view class="space-y-2">
                <view
                  v-for="(item, index) in projectMastery[selectedQuestionnaireType].mastered"
                  :key="index"
                  class="flex items-start"
                >
                  <text class="mr-2 mt-1 text-green-500">
                    •
                  </text>
                  <text class="text-sm text-gray-700 leading-relaxed">
                    {{ item }}
                  </text>
                </view>
              </view>
            </view>

            <!-- 待发展项目 -->
            <view>
              <text class="mb-3 block text-sm text-orange-800 font-bold">
                🔄 待发展项目 ({{ projectMastery[selectedQuestionnaireType].pending.length }}项)
              </text>
              <view class="space-y-2">
                <view
                  v-for="(item, index) in projectMastery[selectedQuestionnaireType].pending"
                  :key="index"
                  class="flex items-start"
                >
                  <text class="mr-2 mt-1 text-orange-500">
                    •
                  </text>
                  <text class="text-sm text-gray-700 leading-relaxed">
                    {{ item }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 历史记录列表 -->
      <view class="mb-6 rounded-xl bg-white shadow-sm">
        <view class="border-b border-gray-100 px-6 py-4">
          <text class="flex items-center text-lg text-gray-800 font-bold">
            <text class="mr-2">
              📊
            </text>
            历史测评记录
          </text>
        </view>
        <view class="px-4 pb-4">
          <view class="space-y-4">
            <view
              v-for="result in historyResults"
              :key="result.id"
              class="border border-gray-100 rounded-lg px-4 py-2"
            >
              <view class="mb-3 flex items-center justify-between">
                <text class="text-gray-800 font-medium">
                  {{ dayjs(result.completedTime).format('YYYY-MM-DD HH:mm') }}
                </text>
                <view class="flex items-center space-x-2">
                  <text class="text-2xl text-gray-800 font-bold">
                    {{ result.overallScore }}
                  </text>
                  <view
                    class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium"
                    :class="getLevelClass(result.overallLevel, 'color')"
                  >
                    <text class="mr-1">
                      {{ getLevelClass(result.overallLevel, 'icon') }}
                    </text>
                    <text>{{ result.overallLevel }}</text>
                  </view>
                </view>
              </view>

              <!-- 各维度得分 -->
              <view class="grid grid-cols-2 gap-2">
                <view
                  v-for="questionnaire in result.questionnaireResults"
                  :key="questionnaire.id"
                  class="flex items-center justify-between rounded bg-gray-50 p-2"
                >
                  <text class="text-xs text-gray-600">
                    {{ QuestionnaireType[questionnaire.questionnaireTitle] }}
                  </text>
                  <text class="text-sm text-gray-800 font-medium">
                    {{ questionnaire.score }}
                  </text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 温馨提示 -->
      <view class="mt-6 rounded-xl p-6" style="background: linear-gradient(to right, #f0fdf4, #eff6ff);">
        <view class="flex items-start">
          <view class="mr-3 flex-shrink-0">
            <text class="text-2xl">
              🏥
            </text>
          </view>
          <view>
            <text class="mb-2 text-gray-800 font-bold">
              温馨提示
            </text>
            <text class="text-sm text-gray-600 leading-relaxed">
              历史对比报告展示了宝宝的发展趋势，有助于了解干预效果。建议定期进行测评以跟踪发展进度。
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="flex flex-col items-center justify-center pt-20">
      <image src="@/static/images/empty.png" class="w-1/6" mode="widthFix" />
      <text class="mt-4 text-sm text-gray-500">
        暂无历史测评记录
      </text>
    </view>
  </view>
</template>
