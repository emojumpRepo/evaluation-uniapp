<script setup lang="ts">
import { computed, ref } from 'vue'

// 轮播图数据
const banners = ref([
  {
    id: 1,
    title: '儿童早期教育专题：激发孩子的学习兴趣',
    image: '/static/images/article1.jpg',
    type: 'article',
    articleId: 1,
  },
  {
    id: 2,
    title: '亲子互动游戏合集：增进亲子感情的趣味活动',
    image: '/static/images/article2.jpg',
    type: 'article',
    articleId: 2,
  },
  {
    id: 3,
    title: '育儿专家在线答疑：解决家长的困扰',
    image: '/static/images/article3.jpg',
    type: 'article',
    articleId: 3,
  },
])

// 当前轮播图索引
const currentSwiperIndex = ref(0)

// 轮播图切换事件
function onSwiperChange(e: any) {
  currentSwiperIndex.value = e.detail.current
}

// 轮播图点击事件
function onBannerClick(banner: any) {
  if (banner.type === 'article') {
    goToDetail(banner.articleId)
  }
}

// 分类数据
const categories = ref([
  { id: 'all', name: '全部分类' },
  { id: 'psychology', name: '心理健康' },
  { id: 'guide', name: '发育指导' },
  { id: 'family', name: '家庭' },
])

// 当前选中的分类
const currentCategory = ref('all')

// 文章列表数据
const articles = ref([
  {
    id: 1,
    title: '如何进行有效的心理疏导',
    description: '去文字描述心理疏导的几个维度，帮助家长更好地理解孩子理解孩子理解孩子',
    image: '/static/images/article1.jpg',
    type: 'psychology',
  },
  {
    id: 2,
    title: '提升儿童专注力的5个小游戏',
    description: '通过有趣的游戏，在玩乐中培养孩子的专注力，效果显著理解孩子理解孩子',
    image: '/static/images/article2.jpg',
    type: 'guide',
  },
  {
    id: 3,
    title: '置顶文章：儿童早期发育关键指标解读',
    description: '专家为您详细解读0-3岁儿童发育过程中的重要信号，不容错过理解孩子理解孩子',
    image: '/static/images/article3.jpg',
    type: 'family',
  },
])

// 根据分类筛选文章
const filteredArticles = computed(() => {
  if (currentCategory.value === 'all') {
    return articles.value
  }
  return articles.value.filter(article => article.type === currentCategory.value)
})

// 选择分类
function selectCategory(id: string) {
  currentCategory.value = id
}

// 跳转到文章详情
function goToDetail(id: number) {
  uni.navigateTo({
    url: `/pages/home/detail?id=${id}`,
  })
}
</script>

<template>
  <view class="min-h-screen w-screen bg-gray-100">
    <!-- 轮播图 -->
    <swiper
      class="h-40 w-screen"
      circular
      autoplay
      :interval="3000"
      :duration="500"
      indicator-dots
      indicator-active-color="#3b82f6"
      @change="onSwiperChange"
    >
      <swiper-item
        v-for="banner in banners"
        :key="banner.id"
        class="relative"
        @tap="onBannerClick(banner)"
      >
        <image
          :src="banner.image"
          mode="aspectFill"
          class="h-full w-full"
        />
        <view class="absolute bottom-0 left-0 right-0 bg-black/30 p-2">
          <text class="line-clamp-1 text-sm text-white">
            {{ banner.title }}
          </text>
        </view>
      </swiper-item>
    </swiper>

    <!-- 分类标签 -->
    <scroll-view
      scroll-x
      class="whitespace-nowrap py-3"
      :show-scrollbar="false"
    >
      <view class="inline-flex px-3">
        <view
          v-for="(item, index) in categories"
          :key="index"
          class="mr-2 rounded-full px-4 py-1.5 text-sm"
          :class="[
            currentCategory === item.id
              ? 'text-white bg-blue-500'
              : 'text-gray-600 bg-gray-100',
          ]"
          @tap="selectCategory(item.id)"
        >
          {{ item.name }}
        </view>
      </view>
    </scroll-view>

    <!-- 文章列表 -->
    <scroll-view
      scroll-y
      class="box-border w-screen p-3"
    >
      <view
        v-for="article in filteredArticles"
        :key="article.id"
        class="flex-between mb-3 flex gap-5 rounded-xl bg-white p-4"
        @tap="goToDetail(article.id)"
      >
        <div class="flex-1">
          <text class="line-clamp-2 mb-2 text-base text-gray-800 font-bold">
            {{ article.title }}
          </text>
          <text class="line-clamp-2 text-sm text-gray-500">
            {{ article.description }}
          </text>
        </div>

        <div class="w-30 overflow-hidden rounded bg-gray-100">
          <image
            v-if="article.image"
            class="h-full w-full"
            :src="article.image"
            mode="aspectFill"
          />
        </div>
      </view>

      <!-- 无数据提示 -->
      <view
        v-if="filteredArticles.length === 0"
        class="flex flex-col items-center justify-center py-10"
      >
        <text class="text-sm text-gray-400">
          暂无相关文章
        </text>
      </view>
    </scroll-view>
  </view>
</template>
