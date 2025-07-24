<script setup lang="ts">
import type { IArticle } from '@/api/types/article'
import { computed, onMounted, ref } from 'vue'
import { getArticleList, likeArticle } from '@/api/article'
import useRequest from '@/hooks/useRequest'
import { toast } from '@/utils/toast'

const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const searchKeyword = ref('')
const isRefreshing = ref(false)

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
  () => getArticleList({ page: page.value, pageSize: pageSize.value, ...(currentCategory.value !== 'all' && { category: currentCategory.value }) }),
  { immediate: false },
)

// 根据分类和搜索关键词筛选文章
const filteredArticles = computed(() => {
  let result = articles.value

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
  page.value = 1
  hasMore.value = true
  articles.value = []
  getArticleListData()
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

// 初始化
async function init() {
  await getArticleListData()
}

// 暴露初始化方法给父组件
defineExpose({
  init,
})

// 组件挂载时初始化
onMounted(() => {
  init()
})
</script>

<template>
  <view>
    <!-- 推荐文章标题 -->
    <view class="px-4 pb-2 pt-4">
      <text class="text-lg text-gray-800 font-bold">
        推荐文章
      </text>
    </view>

    <!-- 分类标签 -->
    <scroll-view
      scroll-x
      class="whitespace-nowrap bg-gray-100 py-4"
      :show-scrollbar="false"
    >
      <view class="inline-flex px-4">
        <view
          v-for="(item, index) in categories"
          :key="index"
          class="mr-3 rounded-full px-5 py-2 text-sm font-bold transition-all"
          :class="[
            currentCategory === item.id
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-600',
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
      class="box-border w-screen bg-gray-100 px-4 pb-5"
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
        class="mb-4 overflow-hidden rounded-xl bg-white transition-all"
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.transition-all {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
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
