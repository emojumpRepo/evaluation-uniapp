<script setup lang="ts">
import { ref } from 'vue'

// 页面加载时获取参数
defineProps<{
  id?: string
}>()

// 模拟文章数据
const articleData = ref({
  id: 0,
  title: '',
  content: '',
  image: '',
  author: '',
  publishTime: '',
  readCount: 0,
})

// 获取路由参数中的文章ID
const articleId = ref<number>(0)

// 使用 onLoad 生命周期钩子获取参数
onLoad((options: Record<string, string>) => {
  const id = Number(options.id || 0)
  articleId.value = id

  // 模拟获取文章数据
  fetchArticleDetail(id)
})

// 模拟获取文章详情数据
function fetchArticleDetail(id: number) {
  // 模拟API请求延迟
  setTimeout(() => {
    // 模拟文章数据
    const mockArticles = [
      {
        id: 1,
        title: '如何进行有效的心理疏导',
        content: '在儿童成长过程中，心理健康显得尤为重要。本文将从以下几个方面为家长提供建议：\n\n1. 建立良好的沟通环境\n营造轻松、开放的家庭氛围，让孩子愿意表达自己的想法和感受。\n\n2. 倾听的艺术\n学会耐心倾听，不急于下判断，让孩子感受到被理解和重视。\n\n3. 情绪引导技巧\n通过游戏和日常互动，帮助孩子认识和管理自己的情绪。\n\n4. 建立自信心\n多给予鼓励和正面反馈，帮助孩子建立健康的自我认知。',
        image: '',
        author: '张医生',
        publishTime: '2024-03-15',
        readCount: 1234,
      },
      {
        id: 2,
        title: '提升儿童专注力的5个小游戏',
        content: '在这个信息爆炸的时代，培养孩子的专注力变得越来越重要。以下是几个简单有效的游戏：\n\n1. 拼图游戏\n不同难度的拼图可以锻炼孩子的观察力和专注力。\n\n2. 找不同\n比较两张相似的图片，找出其中的差异。\n\n3. 积木搭建\n按照图纸搭建积木，培养空间思维和持续注意力。\n\n4. 音乐节奏游戏\n跟随音乐节奏做动作，提升听觉注意力。\n\n5. 故事续编\n听一个故事的开头，让孩子续编故事情节。',
        image: '',
        author: '李老师',
        publishTime: '2024-03-14',
        readCount: 2345,
      },
      {
        id: 3,
        title: '儿童早期发育关键指标解读',
        content: '0-3岁是儿童发育的关键期，本文将为您详细解读各年龄段的重要发育指标：\n\n1. 0-6个月\n- 视觉追踪能力\n- 头部控制\n- 社交性笑容\n\n2. 6-12个月\n- 坐立能力\n- 爬行技能\n- 对简单指令的理解\n\n3. 1-2岁\n- 独立行走\n- 简单语言表达\n- 模仿能力\n\n4. 2-3岁\n- 复杂语言理解\n- 情感表达\n- 社交互动能力',
        image: '',
        author: '王教授',
        publishTime: '2024-03-13',
        readCount: 3456,
      },
    ]

    const article = mockArticles.find(item => item.id === id)
    if (article) {
      articleData.value = article
    }
    else {
      uni.showToast({
        title: '文章不存在',
        icon: 'none',
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  }, 500)
}
</script>

<template>
  <view class="article-detail min-h-screen bg-white">
    <!-- 文章标题 -->
    <view class="p-4 pb-2">
      <text class="text-xl text-gray-900 font-bold">
        {{ articleData.title }}
      </text>
    </view>

    <!-- 文章信息 -->
    <view class="flex items-center px-4 py-2 text-sm text-gray-500">
      <text>{{ articleData.author }}</text>
      <text class="mx-2">
        ·
      </text>
      <text>{{ articleData.publishTime }}</text>
      <text class="mx-2">
        ·
      </text>
      <text>阅读 {{ articleData.readCount }}</text>
    </view>

    <!-- 文章封面图 -->
    <view v-if="articleData.image" class="w-full">
      <image
        :src="articleData.image"
        mode="widthFix"
        class="w-full"
      />
    </view>

    <!-- 文章内容 -->
    <view class="p-4">
      <text class="text-base text-gray-700 leading-7" space="emsp">
        {{ articleData.content }}
      </text>
    </view>
  </view>
</template>

<style>
.article-detail {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
