<script setup lang="ts">
import type { IAssessment } from '@/api/types/evaluation'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { getPublishedAssessmentList, participateAssessment } from '@/api/evaluation'
import { useBabyStore, useUserStore } from '@/store/index'
import EvaluationDialog from './components/EvaluationDialog.vue'
import EvaluationItem from './components/EvaluationItem.vue'

const userStore = useUserStore()
const { isLogin } = storeToRefs(userStore)
const babyStore = useBabyStore()

// 搜索关键词
const searchKeyword = ref('')

// 弹窗相关
const showDialog = ref(false)
const selectedEvaluation = ref(null)
const loading = ref(true)
const loadingMore = ref(false)

// 分页参数
const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)

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
  if (!isLogin.value) {
    uni.switchTab({
      url: '/pages/user/index',
    })
    return
  }
  selectedEvaluation.value = evaluation
  showDialog.value = true
}

// 确认开始测评
async function confirmEvaluation(baby: any) {
  if (!baby.id) {
    return
  }
  await participateAssessment({
    assessmentId: selectedEvaluation.value.id,
    babyId: baby.id,
  })

  uni.navigateTo({
    url: `/pages/evaluation/questionnaire?id=${selectedEvaluation.value.id}&babyId=${baby.id}&isRepeatable=${selectedEvaluation.value.isRepeatable}`,
  })
}

async function getAssessmentData(isFirstLoad = false) {
  try {
    const currentPage = isFirstLoad ? 1 : page.value
    console.log('获取测评数据', currentPage, pageSize.value)

    const res = await getPublishedAssessmentList({ page: currentPage, pageSize: pageSize.value })
    console.log('获取测评列表', res.data.list)
    const { code, data } = res

    if (code !== 0) {
      throw new Error(`API返回错误: ${code}`)
    }

    // 数据安全性检查
    if (!data || !Array.isArray(data.list)) {
      throw new Error('API返回数据格式错误')
    }

    if (isFirstLoad) {
      assessmentList.value = data.list
    }
    else {
      assessmentList.value.push(...data.list)
    }

    hasMore.value = assessmentList.value.length < (data.total || 0)
    return { success: true }
  }
  catch (err) {
    console.error('获取测评列表失败', err)
    return { success: false, error: err }
  }
}

// 上拉加载更多
async function onLoadMore() {
  if (loadingMore.value || !hasMore.value) {
    return
  }

  loadingMore.value = true
  const originalPage = page.value

  try {
    page.value += 1
    const result = await getAssessmentData(false)

    if (!result.success) {
      page.value = originalPage
      uni.showToast({
        title: '加载失败，请重试',
        icon: 'none',
      })
    }
  }
  finally {
    loadingMore.value = false
  }
}

onMounted(async () => {
  const result = await getAssessmentData(true)
  if (!result.success) {
    uni.showToast({
      title: '加载数据失败',
      icon: 'none',
    })
  }

  if (isLogin.value) {
    await babyStore.getBabyListData()
  }
  loading.value = false
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
          v-model="searchKeyword" :disabled="loading" placeholder="输入问卷标题的关键词搜索" placeholder-class="text-gray-400"
          class="flex-1 bg-transparent text-sm"
        >
      </view>
    </view>

    <template v-if="loading">
      <div class="mt-50 flex items-center justify-center">
        <wd-loading />
      </div>
    </template>

    <template v-else>
      <scroll-view
        scroll-y class="box-border flex-1 bg-gray-100" style="height: calc(100vh - 80px);"
        lower-threshold="100" @scrolltolower="onLoadMore"
      >
        <div class="px-4 pt-4">
          <!-- 测评列表 -->
          <EvaluationItem
            v-for="assessment in filteredAssessmentList" :key="assessment.id" :assessment="assessment"
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

          <!-- 加载更多状态 -->
          <view v-if="assessmentList.length > 0" class="flex items-center justify-center py-4">
            <template v-if="loadingMore">
              <wd-loading size="16px" />
              <text class="ml-2 text-sm text-gray-400">
                加载中...
              </text>
            </template>
            <template v-else-if="!hasMore">
              <text class="text-sm text-gray-400">
                没有更多数据了
              </text>
            </template>
            <template v-else>
              <text class="text-sm text-gray-400">
                上拉加载更多
              </text>
            </template>
          </view>

          <!-- 底部间距 -->
          <view class="h-20" />
        </div>
      </scroll-view>
    </template>

    <!-- 测评详情弹窗 -->
    <EvaluationDialog v-model:visible="showDialog" @confirm="confirmEvaluation" />
  </view>
</template>

<style scoped></style>
