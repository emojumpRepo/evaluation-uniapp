<script setup lang="ts">
import type { IAssessment } from '@/api/types/evaluation'
import { computed, ref } from 'vue'
import { getAssessmentList } from '@/api/evaluation'
import EvaluationDialog from './components/EvaluationDialog.vue'
import EvaluationItem from './components/EvaluationItem.vue'

// 搜索关键词
const searchKeyword = ref('')

// 弹窗相关
const showDialog = ref(false)
const selectedEvaluation = ref(null)

// 测评数据
const assessmentList = ref<IAssessment[]>([])

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
      <EvaluationItem
        v-for="assessment in filteredAssessmentList"
        :key="assessment.id"
        :assessment="assessment"
        @start="startEvaluation"
      />

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
</style>
