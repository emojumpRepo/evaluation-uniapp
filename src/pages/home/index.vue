<script setup lang="ts">
import type { IAssessment } from '@/api/types/evaluation'
import { ref } from 'vue'
import { getPublishedAssessmentList } from '@/api/evaluation'
import EvaluationItem from '@/pages/evaluation/components/EvaluationItem.vue'
import BannerSwiper from './components/BannerSwiper.vue'
import RecommendedArticles from './components/RecommendedArticles.vue'

// 测评数据
const latestAssessment = ref<IAssessment | null>(null)
// 推荐文章组件引用
const recommendedArticlesRef = ref<InstanceType<typeof RecommendedArticles> | null>(null)

// 跳转到测评页面
function goToEvaluation() {
  uni.switchTab({
    url: '/pages/evaluation/index',
  })
}

// 开始测评 - 处理EvaluationItem组件的start事件
function startEvaluation(assessment: IAssessment) {
  // 这里可以直接跳转到测评页面，或者显示测评对话框
  // 为了保持一致性，我们跳转到测评页面
  uni.switchTab({
    url: '/pages/evaluation/index',
  })
}

/**
 * 获取最新测评
 */
async function getLatestAssessment() {
  try {
    const res = await getPublishedAssessmentList({ page: 1, pageSize: 1 })
    if (res && res.data && res.data.list && res.data.list.length > 0) {
      latestAssessment.value = res.data.list[0]
    }
  }
  catch (error) {
    console.error('获取最新测评失败:', error)
  }
}

onMounted(async () => {
  await getLatestAssessment()
})

// 上拉加载更多
onReachBottom(() => {
  // 调用推荐文章组件的上拉加载更多方法
  if (recommendedArticlesRef.value && recommendedArticlesRef.value.onLoadMore) {
    recommendedArticlesRef.value.onLoadMore()
  }
})
</script>

<template>
  <view class="min-h-screen w-screen bg-gray-100">
    <view class="mb-2 h-10 flex items-center justify-between px-2">
      <image src="/static/images/logo.png" class="h-full" mode="heightFix" />
      <button open-type="contact" session-from="home" class="contact-btn" hover-class="none" aria-label="联系客服">
        <text class="contact-icon i-carbon-headset" />
      </button>
    </view>

    <!-- 轮播图组件 -->
    <BannerSwiper />

    <!-- 最新测评 -->
    <view v-if="latestAssessment" class="px-4 pt-4">
      <view class="mb-3 flex items-center justify-between">
        <text class="text-lg text-gray-800 font-bold">
          最新测评
        </text>
        <text class="text-sm text-blue-500" @click="goToEvaluation">
          查看更多
        </text>
      </view>

      <EvaluationItem
        :assessment="latestAssessment"
        @start="startEvaluation"
      />
    </view>

    <!-- 推荐文章组件 -->
    <RecommendedArticles ref="recommendedArticlesRef" />
  </view>
</template>

<style scoped>
.contact-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 50%;
  margin: 0;
}

.contact-btn:after {
  border: none; /* 去除小程序按钮默认边框 */
}

.contact-icon {
  color: #9ca3af; /* 灰色，低对比度 */
  font-size: 36rpx;
}
</style>
