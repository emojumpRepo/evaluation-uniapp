<script setup lang="ts">
import type { Banner } from '@/api/types/article'
import { onMounted, ref } from 'vue'
import { getBannerList } from '@/api/article'
import useRequest from '@/hooks/useRequest'
import { toast } from '@/utils/toast'

const tabbarUrl = ['/pages/home/index', '/pages/user/index', '/pages/evaluation/index']

// 轮播图数据
const banners = ref<Banner[]>([])

// 当前轮播图索引
const currentSwiperIndex = ref(0)

// 弹窗相关
const showPopup = ref(false)
const clickBanner = ref()

// 使用 useRequest 管理请求状态
const { loading: bannerLoading, error: bannerError, run: fetchBanner } = useRequest(
  () => getBannerList(),
  { immediate: false },
)

// 轮播图切换事件
function onSwiperChange(e: any) {
  currentSwiperIndex.value = e.detail.current
}

// 轮播图点击事件
function onBannerClick(banner: Banner) {
  console.log('👌轮播图点击', banner)

  // 根据type判断处理方式
  if (banner.type === 2) {
    // type为2显示弹窗
    clickBanner.value = banner
    showPopup.value = true
  }
  else if (banner.type === 1) {
    // type为1跳转链接
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
}

// 关闭弹窗
function closePopup() {
  showPopup.value = false
  clickBanner.value = null
}

// 获取轮播图数据
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

// 初始化
async function init() {
  await getBannerListData()
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
  <view class="relative px-4">
    <swiper
      v-if="banners.length > 0" class="h-40 w-full overflow-hidden rounded-lg" circular autoplay :interval="3000"
      :duration="500" indicator-dots indicator-active-color="#ffa07a" :loading="bannerLoading" @change="onSwiperChange"
    >
      <swiper-item v-for="banner in banners" :key="banner.id" class="relative" @tap="onBannerClick(banner)">
        <image :src="banner.imageUrl" mode="aspectFill" class="h-full w-full" />
        <view class="gradient-overlay absolute inset-0" />
        <view class="absolute bottom-0 left-0 right-0 p-4 text-white">
          <text class="block text-lg font-bold leading-tight">
            {{ banner.title }}
          </text>
          <text v-if="banner.subtitle" class="mt-1 block text-sm leading-tight">
            {{ banner.subtitle }}
          </text>
        </view>
      </swiper-item>
    </swiper>

    <!-- 弹窗 -->
    <wd-popup
      v-model="showPopup" position="bottom" :safe-area-inset-bottom="true" closable
      custom-style="height: auto; max-height: 60vh; border-top-left-radius: 32rpx; border-top-right-radius: 32rpx;" @close="closePopup"
    >
      <view class="p-6 space-y-2">
        <view v-if="clickBanner?.title" class="text-lg text-gray-900 font-bold">
          {{ clickBanner.title }}
        </view>

        <view v-if="clickBanner?.subtitle" class="text-base text-gray-600">
          {{ clickBanner.subtitle }}
        </view>

        <view v-if="clickBanner?.popupContent" class="mt-1.5 text-sm text-gray-700 leading-normal">
          <rich-text :nodes="clickBanner.popupContent" />
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<style scoped>
.gradient-overlay {
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
}

/* 弹窗样式 */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.popup-content {
  background-color: white;
  padding: 20px;
  border-radius: 12px;
  width: 80%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.popup-close-btn {
  background-color: #ffa07a;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}
</style>
