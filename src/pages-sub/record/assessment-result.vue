<route lang="json">
{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "测评结果"
  }
}
</route>

<script setup lang="ts">
import type { LatestAssessmentResultRespVO } from '@/api/types/evaluation'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { getLatestAssessmentResult } from '@/api/evaluation'
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

const assessmentResult = ref<LatestAssessmentResultRespVO>()
const loading = ref(false)
const chartRef = ref()

// 当前选中的宝宝信息
const selectedBaby = computed(() => {
  return babyList.value.find(baby => baby.id === babyId.value)
})

// 解析 overall_report JSON 对象
const overallReport = computed(() => {
  if (!assessmentResult.value?.overallReport)
    return null
  try {
    return JSON.parse(assessmentResult.value.overallReport)
  }
  catch (error) {
    console.error('解析报告JSON失败:', error)
    return null
  }
})

// 生成图表配置
const chartOption = computed(() => {
  if (!assessmentResult.value?.questionnaireResults)
    return {}

  const questionnaireData = assessmentResult.value.questionnaireResults
  const names = questionnaireData.map(item => QuestionnaireType[item.questionnaireTitle] || item.questionnaireTitle)
  const scores = questionnaireData.map(item => item.score)
  const levels = questionnaireData.map(item => item.level)

  // 简洁的纯色配置
  const simpleColors = [
    '#3B82F6', // 蓝色
    '#10B981', // 绿色
    '#F59E0B', // 橙色
    '#EF4444', // 红色
    '#8B5CF6', // 紫色
  ]

  // 根据等级设置颜色，使用纯色
  const colors = levels.map((level, index) => {
    const levelInfo = getLevelClass(level, 'color')
    if (levelInfo.includes('green'))
      return '#10B981' // 绿色
    if (levelInfo.includes('red'))
      return '#EF4444' // 红色
    if (levelInfo.includes('orange'))
      return '#F59E0B' // 橙色
    if (levelInfo.includes('yellow'))
      return '#EAB308' // 黄色
    return simpleColors[index % simpleColors.length] // 默认使用循环纯色
  })

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      confine: true,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#E5E7EB',
      borderWidth: 1,
      textStyle: {
        color: '#374151',
        fontSize: 12,
      },
      formatter(params: any) {
        const data = params[0]
        const questionnaire = assessmentResult.value?.questionnaireResults[data.dataIndex]

        return [
          `${data.name}`,
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
      data: names,
      axisLabel: {
        color: '#666666',
        fontSize: 12,
        interval: 0,
        rotate: 45,
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
        type: 'bar',
        data: scores.map((score, index) => ({
          value: score,
          itemStyle: {
            color: colors[index],
            borderRadius: [2, 2, 0, 0],
          },
        })),
        label: {
          show: true,
          position: 'top',
          color: '#374151',
          fontSize: 12,
          fontWeight: 'bold',
          formatter: '{c}月',
        },
        barWidth: '50%',
        barGap: '30%',
        emphasis: {
          itemStyle: {
            opacity: 0.8,
          },
        },
        animationDuration: 1000,
        animationEasing: 'linear',
      },
    ],
  }
})

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

  loadAssessmentResult()
})

// 加载测评结果
async function loadAssessmentResult() {
  try {
    loading.value = true
    const res = await getLatestAssessmentResult({
      assessmentId: assessmentId.value,
      babyId: babyId.value,
    })
    console.log('获取测评结果', res)
    const { code, data } = res
    if (code === 0) {
      assessmentResult.value = data
      // 数据加载完成后初始化图表
      setTimeout(() => {
        initChart()
      }, 300)
    }
  }
  catch (error) {
    console.error('获取测评结果失败:', error)
    uni.showToast({
      title: '获取测评结果失败',
      icon: 'none',
    })
  }
  finally {
    loading.value = false
  }
}

// 初始化图表
async function initChart() {
  if (!chartRef.value || !assessmentResult.value?.questionnaireResults)
    return

  try {
    const myChart = await chartRef.value.init(echarts)
    myChart.setOption(chartOption.value)
  }
  catch (error) {
    console.error('初始化图表失败:', error)
  }
}
</script>

<template>
  <view class="min-h-screen bg-gray-50 pb-8">
    <!-- 加载状态 -->
    <view v-if="loading" class="flex items-center justify-center pt-50">
      <wd-loading />
    </view>

    <view v-else-if="assessmentResult" class="px-4 py-6">
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
              {{ assessmentResult?.babyName || selectedBaby?.name || '未知宝宝' }}
            </text>
            <text class="block text-sm text-gray-500">
              测评时间：{{ dayjs(assessmentResult?.completedTime).format('YYYY-MM-DD HH:mm:ss') }}
            </text>
          </view>
        </view>
      </view>

      <!-- 测评总分概览卡片 -->
      <view class="mb-6 overflow-hidden rounded-xl bg-white shadow-sm">
        <view class="px-6 py-4" style="background: linear-gradient(to right, #10B981, #059669);">
          <text class="text-lg text-white font-bold">
            {{ assessmentResult?.assessmentTitle }}
          </text>
        </view>

        <view class="p-6">
          <view class="mb-6 text-center">
            <text class="mb-2 text-4xl text-gray-800 font-bold">
              {{ assessmentResult?.overallScore }}
            </text>
            <text class="mb-3 block text-sm text-gray-500">
              发育商
            </text>
          </view>

          <view class="rounded-lg bg-amber-50 p-4">
            <text class="mb-2 text-sm text-amber-800 font-bold">
              发育等级
            </text>
            <text class="text-sm text-amber-700 leading-relaxed">
              {{ assessmentResult?.overallLevel }}
            </text>
          </view>
        </view>
      </view>

      <!-- 问卷得分柱状图 -->
      <view class="mb-6 rounded-xl bg-white shadow-sm">
        <view class="border-b border-gray-100 px-6 py-4">
          <text class="flex items-center text-lg text-gray-800 font-bold">
            <text class="mr-2">
              📊
            </text>
            各维度发育月龄情况
          </text>
        </view>
        <view class="p-4">
          <view style="width: 100%; height: 400px;">
            <l-echart ref="chartRef" @finished="initChart" />
          </view>
        </view>
      </view>

      <!-- 测评报告 -->
      <view v-if="overallReport" class="mb-6 rounded-xl bg-white shadow-sm">
        <view class="border-b border-gray-100 px-6 py-4">
          <text class="flex items-center text-lg text-gray-800 font-bold">
            <text class="mr-2">
              📋
            </text>
            测评报告
          </text>
        </view>
        <view class="p-6">
          <!-- 发育商信息 -->
          <view v-if="overallReport.developmentQuotient" class="mb-6">
            <text class="mb-3 block text-sm text-gray-800 font-bold">
              发育商评估
            </text>
            <view class="space-y-3">
              <view class="flex items-center justify-between">
                <text class="text-sm text-gray-600">
                  发育商值：
                </text>
                <text class="text-sm text-gray-800 font-medium">
                  {{ overallReport.developmentQuotient.value }}
                </text>
              </view>
              <view class="flex items-center justify-between">
                <text class="text-sm text-gray-600">
                  发育等级：
                </text>
                <text class="text-sm text-gray-800 font-medium">
                  {{ overallReport.developmentQuotient.level }}
                </text>
              </view>
              <view class="flex items-center justify-between">
                <text class="text-sm text-gray-600">
                  发育月龄：
                </text>
                <text class="text-sm text-gray-800 font-medium">
                  {{ overallReport.developmentQuotient.mentalAge }}月
                </text>
              </view>
              <view class="flex items-center justify-between">
                <text class="text-sm text-gray-600">
                  实际月龄：
                </text>
                <text class="text-sm text-gray-800 font-medium">
                  {{ overallReport.developmentQuotient.actualAge }}月
                </text>
              </view>
            </view>
            <view class="mt-3 rounded-lg bg-blue-50 p-3">
              <text class="text-sm text-blue-800 leading-relaxed">
                {{ overallReport.developmentQuotient.description }}
              </text>
            </view>
          </view>

          <!-- 建议 -->
          <view v-if="overallReport.advice" class="mb-6">
            <text class="mb-3 block text-sm text-gray-800 font-bold">
              发展建议
            </text>
            <view class="mb-3 rounded-lg bg-green-50 p-3">
              <text class="text-sm text-green-800 leading-relaxed">
                {{ overallReport.advice.description }}
              </text>
            </view>
            <view class="space-y-2">
              <view
                v-for="(item, index) in overallReport.advice.content"
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
              本测评结果仅供参考，不能替代专业医疗诊断。如有疑虑，请及时咨询专业的心理健康专家或医生。
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="flex flex-col items-center justify-center pt-20">
      <image src="@/static/images/empty.png" class="w-1/6" mode="widthFix" />
      <text class="mt-4 text-sm text-gray-500">
        暂无测评结果
      </text>
    </view>
  </view>
</template>
