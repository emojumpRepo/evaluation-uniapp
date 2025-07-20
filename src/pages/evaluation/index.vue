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

const ASSESSMENT_TYPE_OPTIONS = [
  { type: 1, label: '儿童发展测评', backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', typeColor: '#ff6b6b' },
  { type: 2, label: '行为评估', backgroundGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', typeColor: '#4ecdc4' },
  { type: 3, label: '认知能力测评', backgroundGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', typeColor: '#45b7d1' },
  { type: 4, label: '情感发展测评', backgroundGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', typeColor: '#ff6b6b' },
  { type: 5, label: '社交技能测评', backgroundGradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', typeColor: '#45b7d1' },
]

// 测评数据
const assessmentList = ref<IAssessment[]>([
  {
    id: 1,
    title: '儿童专注力测试',
    description: '通过一系列互动游戏，评估孩子在不同情境下的注意力水平。',
    coverImage: '/static/coverImages/avatar.jpg',
    backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    category: '热门',
    categoryColor: '#ff6b6b',
    participants: 8321,
    duration: 15,
    ageRange: '3-12岁',
  },
  {
    id: 2,
    title: '社交情绪能力评估',
    description: '了解孩子社交互动中的情绪反应与适应能力。',
    coverImage: '/static/coverImages/avatar.jpg',
    backgroundGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    category: '官方推荐',
    categoryColor: '#4ecdc4',
    participants: 12450,
    duration: 20,
    ageRange: '4-16岁',
  },
  {
    id: 3,
    title: '语言发展评测',
    description: '全面评估儿童语言理解、表达和沟通技能发展水平。',
    coverImage: '/static/coverImages/avatar.jpg',
    backgroundGradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    category: '基础',
    categoryColor: '#45b7d1',
    participants: 6789,
    duration: 25,
    ageRange: '2-10岁',
  },
  {
    id: 4,
    title: '认知能力综合测评',
    description: '通过多维度任务测试，全面了解孩子的认知发展状况。',
    coverImage: '/static/coverImages/avatar.jpg',
    backgroundGradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    category: '热门',
    categoryColor: '#ff6b6b',
    participants: 15234,
    duration: 30,
    ageRange: '5-15岁',
  },
  {
    id: 5,
    title: '运动协调能力评估',
    description: '评测儿童大运动和精细运动的协调发展水平。',
    coverImage: '/static/coverImages/avatar.jpg',
    backgroundGradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    category: '专业',
    categoryColor: '#45b7d1',
    participants: 4567,
    duration: 18,
    ageRange: '3-8岁',
  },
])

// 获取测评背景
function getAssessmentBackground(type: number) {
  const option = ASSESSMENT_TYPE_OPTIONS.find(item => item.type === type)
  return {
    background: option?.backgroundGradient,
  }
}

// 获取测评类型颜色
function getAssessmentTypeColor(type: number) {
  const option = ASSESSMENT_TYPE_OPTIONS.find(item => item.type === type)
  return {
    backgroundColor: option?.typeColor,
  }
}

// 获取测评类型标签
function getAssessmentTypeLabel(type: number) {
  const option = ASSESSMENT_TYPE_OPTIONS.find(item => item.type === type)
  return option?.label
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
  // selectedEvaluation.value = evaluation
  // showDialog.value = true
  uni.navigateTo({
    url: '/pages/evaluation/questionnaire',
  })
}

// 确认开始测评
function confirmEvaluation(baby: any) {
  uni.showToast({
    title: `为${baby.name}开始${selectedEvaluation.value.title}`,
  })
  // 这里可以跳转到具体的测评页面
  // uni.navigateTo({
  //   url: `/pages/evaluation/detail?id=${evaluation.id}&babyId=${baby.id}`
  // })
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

onMounted(async () => {
  await getAssessmentData()
})
</script>

<template>
  <view class="min-h-screen bg-gray-50">
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
    <scroll-view scroll-y class="box-border flex-1 px-4 pt-4">
      <view
        v-for="assessment in filteredAssessmentList" :key="assessment.id"
        class="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm"
      >
        <!-- 卡片头部图片区域 -->
        <view class="relative h-40 flex items-end p-4" :style="getAssessmentBackground(assessment.type)">
          <!-- 分类标签 -->
          <view
            class="absolute left-3 top-3 rounded-full px-2 py-1 text-xs text-white"
            :style="getAssessmentTypeColor(assessment.type)"
          >
            {{ getAssessmentTypeLabel(assessment.type) }}
          </view>

          <!-- 标题 -->
          <text class="text-lg text-white font-bold leading-tight">
            {{ assessment.title }}
          </text>
        </view>

        <!-- 卡片内容区域 -->
        <view class="p-4">
          <!-- 描述 -->
          <text class="mb-3 block text-sm text-gray-600 leading-relaxed">
            {{ assessment.description }}
          </text>

          <!-- 测评信息 -->
          <view class="mb-4 flex items-center justify-between">
            <view class="flex items-center gap-4 text-xs text-gray-500">
              <text>
                {{ formatParticipants(assessment.currentParticipants) }}
              </text>
              <text>
                {{ assessment.duration }}分钟
              </text>
              <text>
                适合 {{ assessment.targetAudience }}
              </text>
            </view>
          </view>

          <!-- 立即测评按钮 -->
          <view
            class="rounded-full bg-blue-500 py-3 text-center text-sm text-white font-medium"
            @tap="startEvaluation(assessment)"
          >
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
