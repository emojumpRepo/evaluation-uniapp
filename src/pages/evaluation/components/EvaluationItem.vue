<script setup lang="ts">
import type { IAssessment } from '@/api/types/evaluation'

// Props 定义
interface Props {
  assessment: IAssessment
}

const props = defineProps<Props>()

// Emits 定义
const emit = defineEmits<{
  start: [assessment: IAssessment]
}>()

// 测评类型 - 使用统一的主题色系渐变
const assessment_type = [
  {
    type: 1,
    label: '儿童发展测评',
    backgroundGradient: 'linear-gradient(135deg, #fda691 0%, #ffa07a 100%)',
    icon: '🧠',
  },
  {
    type: 2,
    label: '行为评估',
    backgroundGradient: 'linear-gradient(135deg, #ffa07a 0%, #ffdab9 100%)',
    icon: '🎯',
  },
  {
    type: 3,
    label: '认知能力测评',
    backgroundGradient: 'linear-gradient(135deg, #ffdab9 0%, #fda691 100%)',
    icon: '🧩',
  },
  {
    type: 4,
    label: '情感发展测评',
    backgroundGradient: 'linear-gradient(135deg, #fda691 0%, #ffdab9 100%)',
    icon: '💝',
  },
  {
    type: 5,
    label: '社交技能测评',
    backgroundGradient: 'linear-gradient(135deg, #ffa07a 0%, #fda691 100%)',
    icon: '👥',
  },
]

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

// 格式化参与人数
function formatParticipants(num: number) {
  if (num >= 10000) {
    return `${Math.floor(num / 1000) / 10}万人已测`
  }
  return `${num}人已测`
}

// 开始测评
function startEvaluation() {
  emit('start', props.assessment)
}
</script>

<template>
  <view class="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm">
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
      <view class="flex justify-end">
        <view
          class="w-30vw rounded-full bg-blue-400 py-2 text-center text-sm text-white font-medium shadow-sm transition-all"
          @tap="startEvaluation"
        >
          立即测评
        </view>
      </view>
    </view>
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
