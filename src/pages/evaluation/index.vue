<script setup lang="ts">
import type { IAssessment } from '@/api/types/evaluation'
import { computed, ref } from 'vue'
import { getAssessmentList } from '@/api/evaluation'
import EvaluationDialog from './components/EvaluationDialog.vue'

// 搜索关键词
const searchKeyword = ref('')

// 弹窗相关
const showDialog = ref(false)
const selectedEvaluation = ref(null)

// 测评类型 - 使用更柔和的颜色，确保文字可读性
const assessment_type = [
  {
    type: 1,
    label: '儿童发展测评',
    backgroundGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    icon: '🧠',
  },
  {
    type: 2,
    label: '行为评估',
    backgroundGradient: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
    icon: '🎯',
  },
  {
    type: 3,
    label: '认知能力测评',
    backgroundGradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
    icon: '🧩',
  },
  {
    type: 4,
    label: '情感发展测评',
    backgroundGradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    icon: '💝',
  },
  {
    type: 5,
    label: '社交技能测评',
    backgroundGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    icon: '👥',
  },
]

// 测评数据
const assessmentList = ref<IAssessment[]>([])

// 获取测评背景
function getAssessmentBackground(type: number) {
  const option = assessment_type.find(item => item.type === type)
  return {
    background: option?.backgroundGradient,
  }
}

// 获取测评类型标签
function getAssessmentTypeLabel(type: number) {
  const option = assessment_type.find(item => item.type === type)
  return option?.label
}

// 获取测评类型图标
function getAssessmentTypeIcon(type: number) {
  const option = assessment_type.find(item => item.type === type)
  return option?.icon || '📋'
}

// 获取随机装饰元素 - 基于测评ID生成不同的装饰效果
function getRandomDecorations(assessmentId: string | number) {
  // 使用测评ID作为种子生成伪随机数
  const seed = typeof assessmentId === 'string' ? assessmentId.length : assessmentId

  // 预设的3种好看的装饰组合
  const decorationSets = [
    // 组合1: 经典圆形 + 三角形
    [
      { size: 'h-16 w-16', position: '-right-3 -top-3', opacity: 'opacity-12', shape: 'circle' },
      { size: 'h-8 w-8', position: '-bottom-2 right-16', opacity: 'opacity-18', shape: 'triangle' },
      { size: 'h-6 w-6', position: 'top-2 right-20', opacity: 'opacity-20', shape: 'circle' },
    ],
    // 组合2: 菱形 + 圆形组合
    [
      { size: 'h-12 w-12', position: '-right-2 -top-2', opacity: 'opacity-15', shape: 'diamond' },
      { size: 'h-10 w-10', position: '-bottom-1 right-12', opacity: 'opacity-16', shape: 'circle' },
      { size: 'h-14 w-14', position: 'top-4 right-24', opacity: 'opacity-10', shape: 'diamond' },
      { size: 'h-6 w-6', position: 'right-18 top-1', opacity: 'opacity-22', shape: 'circle' },
    ],
    // 组合3: 三角形主导
    [
      { size: 'h-18 w-18', position: '-right-4 -top-4', opacity: 'opacity-8', shape: 'triangle' },
      { size: 'h-8 w-8', position: '-bottom-3 right-8', opacity: 'opacity-16', shape: 'triangle' },
      { size: 'h-10 w-10', position: 'top-3 right-28', opacity: 'opacity-14', shape: 'circle' },
    ],
  ]

  // 基于ID选择装饰组合
  const setIndex = seed % decorationSets.length
  return decorationSets[setIndex]
}

// 获取形状对应的CSS类
function getShapeClass(shape: string) {
  const shapeClasses = {
    circle: 'rounded-full',
    triangle: 'triangle-shape',
    diamond: 'diamond-shape',
    square: 'rounded-sm',
  }
  return shapeClasses[shape] || 'rounded-full'
}

// 根据搜索关键词筛选测评
const filteredAssessmentList = computed(() => {
  if (!searchKeyword.value.trim()) {
    return assessmentList.value
  }
  return assessmentList.value.filter(item =>
    item.title.includes(searchKeyword.value)
    || item.description.includes(searchKeyword.value),
  )
})

// 开始测评
function startEvaluation(evaluation: any) {
  selectedEvaluation.value = evaluation
  showDialog.value = true
}

// 确认开始测评
function confirmEvaluation(baby: any) {
  uni.navigateTo({
    url: `/pages/evaluation/questionnaire?id=${selectedEvaluation.value.id}&babyId=${baby.id}`,
  })
}

// 格式化参与人数
function formatParticipants(num: number) {
  if (num >= 10000) {
    return `${Math.floor(num / 1000) / 10}万人已测`
  }
  return `${num}人已测`
}

async function getAssessmentData() {
  try {
    const res = await getAssessmentList({ page: 1, pageSize: 10 })
    console.log('获取测评列表', res)
    const { code, data } = res

    if (code !== 0) {
      return
    }

    assessmentList.value = data.list
  }
  catch (err) {
    console.error('获取测评列表失败', err)
  }
}

onShow(async () => {
  await getAssessmentData()
})
</script>

<template>
  <view class="min-h-screen bg-white">
    <!-- 搜索框 -->
    <view class="px-4 pb-4 pt-4 shadow-sm">
      <view class="flex items-center rounded-full bg-gray-100 px-4 py-3">
        <text class="mr-2 text-gray-400">
          🔍
        </text>
        <input
          v-model="searchKeyword" placeholder="输入问卷标题的关键词搜索" placeholder-class="text-gray-400"
          class="flex-1 bg-transparent text-sm"
        >
      </view>
    </view>

    <!-- 测评列表 -->
    <scroll-view scroll-y class="box-border flex-1 bg-gray-100 px-4 pt-4">
      <view
        v-for="assessment in filteredAssessmentList" :key="assessment.id"
        class="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm"
      >
        <!-- 卡片头部区域 -->
        <view
          class="relative h-24 flex items-center justify-between p-4"
          :style="getAssessmentBackground(assessment.type)"
        >
          <!-- 左侧内容 -->
          <view class="flex-1">
            <!-- 分类标签 -->
            <view
              class="mb-2 inline-block rounded-full bg-black bg-opacity-20 px-3 py-1 text-xs text-white font-medium"
            >
              {{ getAssessmentTypeLabel(assessment.type) }}
            </view>

            <!-- 标题 -->
            <view class="text-lg text-white font-bold leading-tight drop-shadow-sm">
              {{ assessment.title }}
            </view>
          </view>

          <!-- 右侧图标 -->
          <view class="ml-4 h-16 w-16 flex items-center justify-center rounded-full bg-black bg-opacity-20">
            <text class="text-2xl">
              {{ getAssessmentTypeIcon(assessment.type) }}
            </text>
          </view>

          <!-- 随机装饰性图案 -->
          <view
            v-for="(decoration, index) in getRandomDecorations(assessment.id)" :key="index"
            :class="`absolute ${decoration.position} ${decoration.size} ${getShapeClass(decoration.shape)} bg-white ${decoration.opacity}`"
          />
        </view>

        <!-- 卡片内容区域 -->
        <view class="p-4">
          <!-- 描述 -->
          <text class="mb-4 block text-sm text-gray-600 leading-relaxed">
            {{ assessment.description }}
          </text>

          <!-- 测评信息 -->
          <view class="mb-4 flex items-center justify-between">
            <view class="flex items-center gap-3">
              <!-- 参与人数 -->
              <view class="flex items-center">
                <text class="mr-1 text-xs">
                  👥
                </text>
                <text class="text-xs text-gray-500">
                  {{ formatParticipants(assessment.currentParticipants) }}
                </text>
              </view>

              <!-- 时长 -->
              <view class="flex items-center">
                <text class="mr-1 text-xs">
                  ⏱️
                </text>
                <text class="text-xs text-gray-500">
                  {{ assessment.duration }}分钟
                </text>
              </view>

              <!-- 适合年龄 -->
              <view class="flex items-center">
                <text class="mr-1 text-xs">
                  🎯
                </text>
                <text class="text-xs text-gray-500">
                  {{ assessment.targetAudience }}
                </text>
              </view>
            </view>
          </view>

          <!-- 立即测评按钮 -->
          <view
            class="rounded-full py-3 text-center text-sm text-white font-medium shadow-sm transition-all"
            :style="{ background: getAssessmentBackground(assessment.type).background }"
            @tap="startEvaluation(assessment)"
          >
            <text class="mr-1">
              🚀
            </text>
            立即测评
          </view>
        </view>
      </view>

      <!-- 无搜索结果提示 -->
      <view v-if="filteredAssessmentList.length === 0" class="flex flex-col items-center justify-center py-20">
        <text class="text-sm text-gray-400">
          没有找到相关测评
        </text>
        <text class="mt-1 text-xs text-gray-400">
          试试其他关键词
        </text>
      </view>

      <!-- 底部间距 -->
      <view class="h-20" />
    </scroll-view>

    <!-- 测评详情弹窗 -->
    <EvaluationDialog v-model:visible="showDialog" @confirm="confirmEvaluation" />
  </view>
</template>

<style scoped>
/* 三角形形状 */
.triangle-shape {
  width: 0;
  height: 0;
  background: transparent !important;
  border-left: 50% solid transparent;
  border-right: 50% solid transparent;
  border-bottom: 100% solid currentColor;
}

.triangle-shape::before {
  content: '';
  position: absolute;
  top: 0;
  left: -50%;
  width: 0;
  height: 0;
  border-left: 50% solid transparent;
  border-right: 50% solid transparent;
  border-bottom: 100% solid white;
}

/* 菱形形状 */
.diamond-shape {
  transform: rotate(45deg);
  border-radius: 0;
}

/* 确保装饰元素的颜色继承 */
.triangle-shape,
.diamond-shape {
  background-color: inherit;
}
</style>
