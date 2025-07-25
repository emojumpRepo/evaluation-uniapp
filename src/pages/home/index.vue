<script setup lang="ts">
import type { Banner, IArticle } from '@/api/types/article'
import { computed, ref } from 'vue'
import { getArticleList, getBannerList, likeArticle } from '@/api/article'
import useRequest from '@/hooks/useRequest'
import { toast } from '@/utils/toast'

const tabbarUrl = ['/pages/home/index', '/pages/user/index', '/pages/evaluation/index']

const page = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const searchKeyword = ref('')
const isRefreshing = ref(false)

// 轮播图数据
const banners = ref([])

// 当前轮播图索引
const currentSwiperIndex = ref(0)

// 轮播图切换事件
function onSwiperChange(e: any) {
  currentSwiperIndex.value = e.detail.current
}

// 轮播图点击事件
function onBannerClick(banner: Banner) {
  console.log('👌轮播图点击', banner)

  if (banner.linkUrl) {
    if (tabbarUrl.includes(banner.linkUrl)) {
      uni.switchTab({
        url: banner.linkUrl,
      })
    }
    else {
      uni.navigateTo({
        url: banner.linkUrl,
      })
    }
  }
  else {
    toast.info(`版本号：${uni.getSystemInfoSync().appVersion}`)
  }
}

// 分类数据
const categories = ref([
  { id: '0', name: '全部分类' },
  { id: '1', name: '儿童发展与干预' },
  { id: '2', name: '儿童精神健康' },
  { id: '3', name: '膳食与健康' },
  { id: '4', name: '心理健康与生活方式' },
])

// 当前选中的分类
const currentCategory = ref('0')

// 文章列表数据
const articles = ref<IArticle[]>([])

// 使用 useRequest 管理请求状态
const { loading, error, run: fetchArticles } = useRequest(
  () => getArticleList({ page: page.value, pageSize: pageSize.value, ...(currentCategory.value !== '0' && { category: currentCategory.value }) }),
  { immediate: false },
)

const { loading: bannerLoading, error: bannerError, run: fetchBanner } = useRequest(
  () => getBannerList(),
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

async function getBannerListData() {
  const res = await fetchBanner()
  console.log('👌获取轮播图', res)
  if (res && res.length > 0) {
    banners.value = res.sort((a, b) => a.sort - b.sort)
  }
  else {
    banners.value = []
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

onShow(async () => {
  await getLatestAssessment()
})
</script>

<template>
  <view class="min-h-screen w-screen bg-gray-100">
    <image src="/static/images/logo.png" class="mb-2 mt-2 h-10 px-2" mode="heightFix" />

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
    <RecommendedArticles />
  </view>
</template>

<style scoped>
</style>
