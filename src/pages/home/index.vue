<script setup lang="ts">
import type { IArticle } from '@/api/types/article'
import { computed, ref } from 'vue'
import { getArticleList, likeArticle } from '@/api/article'
import useRequest from '@/hooks/useRequest'
import { toast } from '@/utils/toast'

const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const searchKeyword = ref('')
const isRefreshing = ref(false)

// 轮播图数据
const banners = ref([
  {
    id: 1,
    title: '儿童早期教育专题：激发孩子的学习兴趣',
    image: '',
    type: 'article',
    articleId: 1,
  },
  {
    id: 2,
    title: '亲子互动游戏合集：增进亲子感情的趣味活动',
    image: '',
    type: 'article',
    articleId: 2,
  },
  {
    id: 3,
    title: '育儿专家在线答疑：解决家长的困扰',
    image: '',
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
const articles = ref<IArticle[]>([])

// 使用 useRequest 管理请求状态
const { loading, error, run: fetchArticles } = useRequest(
  () => getArticleList({ page: page.value, pageSize: pageSize.value }),
  { immediate: false },
)

// 根据分类和搜索关键词筛选文章
const filteredArticles = computed(() => {
  let result = articles.value

  // 按分类筛选
  if (currentCategory.value !== 'all') {
    result = result.filter(article => article.category === currentCategory.value)
  }

  // 按搜索关键词筛选
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(article =>
      article.title.toLowerCase().includes(keyword)
      || (article.remark && article.remark.toLowerCase().includes(keyword)),
    )
  }

  return result
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

// 收藏文章
async function toggleLike(article: IArticle, index: number) {
  try {
    await likeArticle(article.id!)
    // 更新本地数据
    articles.value[index].likeCount = (articles.value[index].likeCount || 0) + 1
    toast.success('收藏成功')
  }
  catch (error) {
    console.error('收藏失败:', error)
    toast.error('收藏失败，请稍后重试')
  }
}

/**
 * 获取文章列表
 */
async function getArticleListData(loadMore = false) {
  try {
    const res = await fetchArticles()
    console.log('👌获取文章列表', res)
    if (res) {
      if (loadMore) {
        // 加载更多
        articles.value.push(...res.list)
      }
      else {
        // 重新加载
        articles.value = res.list
      }

      // 判断是否还有更多数据
      hasMore.value = articles.value.length < res.total
    }
  }
  catch (error) {
    console.error('获取文章列表失败:', error)
    toast.error('加载失败，请稍后重试')
  }
}

// 下拉刷新
async function onRefresh() {
  isRefreshing.value = true
  page.value = 1
  hasMore.value = true

  try {
    await getArticleListData()
    toast.success('刷新成功')
  }
  finally {
    isRefreshing.value = false
  }
}

// 上拉加载更多
async function onLoadMore() {
  if (!hasMore.value || loading.value)
    return

  page.value++
  await getArticleListData(true)
}

// 清空搜索
function clearSearch() {
  searchKeyword.value = ''
}

// 格式化时间
function formatTime(time: string) {
  const date = new Date(time)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000)
    return '刚刚'
  if (diff < 3600000)
    return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000)
    return `${Math.floor(diff / 3600000)}小时前`
  return `${Math.floor(diff / 86400000)}天前`
}

onShow(async () => {
  await getArticleListData()
})
</script>

<template>
  <view class="min-h-screen w-screen bg-white">
    <!-- 搜索栏 -->
    <view class="sticky top-0 z-10 bg-white px-4 py-1 shadow-sm">
      <wd-search
        v-model="searchKeyword"
        placeholder="搜索文章标题"
        hide-cancel
        :focus="false"
      />
    </view>

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
        @click="onBannerClick(banner)"
      >
        <image
          :src="banner.image"
          mode="aspectFill"
          class="h-full w-full"
        />
        <view class="gradient-overlay absolute inset-0" />
        <view class="absolute bottom-0 left-0 right-0 p-4">
          <text class="line-clamp-2 text-base text-white font-medium">
            {{ banner.title }}
          </text>
        </view>
      </swiper-item>
    </swiper>

    <!-- 分类标签 -->
    <scroll-view
      scroll-x
      class="whitespace-nowrap py-4"
      :show-scrollbar="false"
    >
      <view class="inline-flex px-4">
        <view
          v-for="(item, index) in categories"
          :key="index"
          class="mr-3 rounded-full px-5 py-2 text-sm font-bold transition-all"
          :class="[
            currentCategory === item.id
              ? 'bg-blue-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-600',
          ]"
          @click="selectCategory(item.id)"
        >
          {{ item.name }}
        </view>
      </view>
    </scroll-view>

    <!-- 文章列表 -->
    <scroll-view
      scroll-y
      class="box-border w-screen bg-white px-4 pb-5"
      :refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <!-- 加载状态 -->
      <view
        v-if="loading && articles.length === 0"
        class="flex flex-col items-center justify-center py-20"
      >
        <text class="text-gray-400">
          加载中...
        </text>
      </view>

      <!-- 文章列表 -->
      <view
        v-for="(article) in filteredArticles"
        :key="article.id"
        class="article-shadow mb-4 overflow-hidden rounded-xl transition-all"
        @click="goToDetail(article.id!)"
      >
        <view class="flex gap-4 p-4">
          <view class="flex-1">
            <text class="line-clamp-2 mb-2 text-base text-gray-800 font-bold">
              {{ article.title }}
            </text>
            <text v-if="article.remark" class="line-clamp-2 mb-3 text-sm text-gray-500 leading-relaxed">
              {{ article.remark }}
            </text>

            <!-- 文章信息 -->
            <view class="flex items-center justify-between">
              <view class="flex items-center gap-4 text-xs text-gray-400">
                <text>{{ formatTime(article.publishTime) }}</text>
                <text>{{ article.viewCount || 0 }} 阅读</text>
              </view>

              <!-- 收藏按钮 -->
              <!-- <view
                class="flex items-center gap-1 rounded-full"
                @click.stop="toggleLike(article, index)"
              >
                <wd-icon name="heart-filled" size="14px" color="#ccc" />
                <text class="text-xs text-gray-600">
                  {{ article.likeCount || 0 }}
                </text>
              </view> -->
            </view>
          </view>

          <!-- 文章封面 -->
          <view class="h-20 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <image
              v-if="article.coverImage"
              class="h-full w-full"
              :src="article.coverImage"
              mode="aspectFill"
              :lazy-load="true"
            />
            <view v-else class="h-full w-full flex items-center justify-center">
              <text class="iconfont icon-image text-2xl text-gray-300" />
            </view>
          </view>
        </view>
      </view>

      <!-- 加载更多 -->
      <view
        v-if="loading && articles.length > 0"
        class="flex items-center justify-center py-4"
      >
        <text class="text-sm text-gray-400">
          加载中...
        </text>
      </view>

      <!-- 没有更多数据 -->
      <view
        v-if="!hasMore && articles.length > 0"
        class="flex items-center justify-center py-4"
      >
        <text class="text-sm text-gray-400">
          没有更多数据了
        </text>
      </view>

      <!-- 无数据提示 -->
      <view
        v-if="!loading && filteredArticles.length === 0"
        class="flex flex-col items-center justify-center py-20"
      >
        <text class="mb-2 text-6xl text-gray-200">
          📝
        </text>
        <text class="text-sm text-gray-400">
          {{ searchKeyword ? '没有找到相关文章' : '暂无文章' }}
        </text>
        <text
          v-if="searchKeyword"
          class="mt-2 text-sm text-blue-500"
          @click="clearSearch"
        >
          清空搜索条件
        </text>
      </view>

      <!-- 错误提示 -->
      <view
        v-if="error"
        class="flex flex-col items-center justify-center py-20"
      >
        <text class="mb-2 text-6xl text-gray-200">
          😵
        </text>
        <text class="mb-4 text-sm text-gray-400">
          加载失败
        </text>
        <text
          class="rounded-full bg-blue-500 px-6 py-2 text-sm text-white"
          @click="getArticleListData"
        >
          重新加载
        </text>
      </view>
    </scroll-view>
  </view>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.transition-all {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.gradient-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
}

/* 文章卡片阴影 */
.article-shadow {
  box-shadow:
    0 2px 8px 0 rgba(0, 0, 0, 0.08),
    0 1px 4px 0 rgba(0, 0, 0, 0.04);
}

.article-shadow:active {
  box-shadow:
    0 1px 4px 0 rgba(0, 0, 0, 0.06),
    0 0 2px 0 rgba(0, 0, 0, 0.02);
}
</style>
