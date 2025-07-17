<script setup lang="ts">
import type { IArticle } from '@/api/types/article'
import dayjs from 'dayjs'
import { onMounted, ref } from 'vue'
import { getArticleDetail, likeArticle } from '@/api/article'

const props = defineProps<{
  id: number
}>()

const articleData = ref<IArticle>({})
const isLiked = ref(false) // 点赞状态
const isLiking = ref(false) // 点赞loading状态

/**
 * 获取文章详情
 * @param id 文章ID
 */
async function getArticleDetailData(id: number) {
  try {
    const res = await getArticleDetail(id)
    console.log('👌获取文章详情', res)
    articleData.value = res.data
  }
  catch (error) {
    console.log('👌获取文章详情失败', error)
  }
}

/**
 * 点赞文章
 */
async function handleLike() {
  if (isLiking.value)
    return

  try {
    isLiking.value = true
    await likeArticle(props.id)

    // 更新点赞状态和数量
    isLiked.value = !isLiked.value
    if (isLiked.value) {
      articleData.value.likeCount = (articleData.value.likeCount || 0) + 1
    }
  }
  catch (error) {
    console.log('👌点赞失败', error)
  }
  finally {
    isLiking.value = false
  }
}

onMounted(async () => {
  await getArticleDetailData(props.id)
})
</script>

<template>
  <view class="min-h-screen bg-white">
    <!-- 内容容器 -->
    <view class="relative z-10 px-4 pb-2 pt-6">
      <!-- 文章卡片 -->
      <view class="mb-1 overflow-hidden rounded-2xl bg-white shadow-lg">
        <!-- 文章标题区域 -->
        <view class="px-4 py-3">
          <text class="text-xl text-gray-900 font-bold">
            {{ articleData.title }}
          </text>
        </view>

        <!-- 文章信息栏 -->
        <view class="border-b border-gray-100 px-4 py-1">
          <view class="flex items-center justify-between">
            <!-- 时间和阅读量 -->
            <view class="flex items-center text-sm text-gray-500 space-x-3">
              <view class="flex items-center">
                <text class="mr-1">
                  🕐
                </text>
                <text>{{ dayjs(articleData.publishTime).format('MM-DD HH:mm') }}</text>
              </view>
              <view class="flex items-center">
                <wd-icon name="browse" size="18px" color="#bbb" custom-class="mr-1" />
                <text>{{ articleData.viewCount || 0 }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 文章封面图 -->
        <view v-if="articleData.coverImage" class="relative">
          <image
            :src="articleData.coverImage"
            mode="aspectFill"
            class="h-48 w-full object-cover"
          />
          <view class="absolute inset-0 from-black/20 to-transparent bg-gradient-to-t" />
        </view>

        <!-- 文章内容 -->
        <view class="px-4 py-3">
          <view class="max-w-none text-gray-700 leading-7">
            <rich-text
              :nodes="articleData.content"
              class="text-base text-gray-800 leading-8 [&_blockquote]:my-6 [&_img]:my-6 [&_h1]:mb-4 [&_h1]:mt-8 [&_h2]:mb-4 [&_h2]:mt-8 [&_h3]:mb-4 [&_h3]:mt-8 [&_h4]:mb-4 [&_h4]:mt-8 [&_h5]:mb-4 [&_h5]:mt-8 [&_h6]:mb-4 [&_h6]:mt-8 [&_p]:mb-5 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:rounded-lg [&_img]:rounded-lg [&_blockquote]:bg-slate-50 [&_blockquote]:p-4 [&_blockquote]:pl-4 [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_blockquote]:text-gray-600 [&_h1]:text-gray-800 [&_h2]:text-gray-800 [&_h3]:text-gray-800 [&_h4]:text-gray-800 [&_h5]:text-gray-800 [&_h6]:text-gray-800 [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_h4]:font-semibold [&_h5]:font-semibold [&_h6]:font-semibold [&_h1]:leading-9 [&_h2]:leading-8 [&_h3]:leading-7 [&_blockquote]:italic [&_h1]:md:text-2xl [&_h2]:md:text-xl [&_h1]:md:leading-8 [&_h2]:md:leading-7"
            />
          </view>
        </view>

        <!-- 底部操作栏 -->
        <!-- <view class="border-t border-gray-100 px-4 py-3">
          <view class="flex items-center justify-center">
            <view
              class="flex items-center justify-center rounded-full px-6 py-2 transition-all duration-200 space-x-2"
              :class="[
                isLiked ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-600',
                isLiking ? 'opacity-60' : 'active:scale-95',
              ]"
              @tap="handleLike"
            >
              <view class="text-xl transition-transform duration-200" :class="{ 'animate-pulse': isLiking }">
                {{ isLiked ? '❤️' : '🤍' }}
              </view>
              <text class="text-sm font-medium">
                {{ articleData.likeCount || 0 }}
              </text>
            </view>
          </view>
        </view> -->
      </view>
    </view>
  </view>
</template>
