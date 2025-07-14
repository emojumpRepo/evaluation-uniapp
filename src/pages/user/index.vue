<route lang="jsonc">
{
  "layout": "tabbar",
  "style": {
    "navigationBarTitleText": "用户中心",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black"
  }
}
</route>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import AuthModel from '@/components/AuthModel/index.vue'
import { useUserStore } from '@/store'
import { phoneDesensitization } from '@/utils/format'

defineOptions({
  name: 'User',
})

const userStore = useUserStore()
const { userInfo, isLogin } = storeToRefs(userStore)

const showAuthModal = ref(false) // 登录弹窗

// 显示登录弹窗
function handleShowAuthModal() {
  console.log('点击立即登录，当前登录状态:', isLogin.value)
  if (isLogin.value)
    return
  console.log('显示登录弹窗')
  showAuthModal.value = true
}

// 菜单点击处理
function handleMenuClick(type: string) {
  console.log('点击菜单:', type)
  if (!isLogin.value) {
    showAuthModal.value = true
    return
  }

  switch (type) {
    case 'profile':
      uni.navigateTo({
        url: '/pages/user/personal',
      })
      break
    case 'baby':
      uni.navigateTo({
        url: '/pages-sub/baby/index',
      })
      break
    case 'evaluation':
      uni.showToast({
        title: '测评记录功能开发中',
        icon: 'none',
      })
      break
    case 'edit':
      uni.navigateTo({
        url: '/pages/user/personal',
      })
      break
    default:
      console.log('未知菜单类型:', type)
  }
}

// 退出登录
function handleLogout() {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        console.log('退出登录')
        userStore.logout()
      }
    },
  })
}
</script>

<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <view class="header-content">
        <view class="user-info">
          <view class="avatar-container">
            <image :src="userInfo.avatar" class="user-avatar" mode="aspectFill" />
            <view class="avatar-badge" />
          </view>
          <view class="user-details">
            <view class="user-name" @click="handleShowAuthModal">
              <text>
                {{ userInfo.nickname || '立即登录' }}
              </text>
              <wd-icon v-if="!isLogin" name="arrow-right" size="20" color="#fff" />
            </view>

            <text class="user-phone">
              {{ isLogin ? phoneDesensitization(userInfo.mobile) : '使用更多功能，请登录' }}
            </text>
          </view>
        </view>
        <view class="edit-btn" @click="handleMenuClick('edit')">
          <text class="i-carbon-edit text-white" />
        </view>
      </view>
    </view>

    <!-- 统计信息卡片 -->
    <view class="stats-container">
      <view class="stats-card">
        <view class="stat-item">
          <text class="stat-number">
            1
          </text>
          <text class="stat-label">
            宝宝数量
          </text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-number">
            5
          </text>
          <text class="stat-label">
            测评记录
          </text>
        </view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-container">
      <view class="menu-card">
        <view class="menu-item" @tap="handleMenuClick('profile')">
          <view class="menu-content">
            <view class="menu-icon-wrapper">
              <text class="i-carbon-user" />
            </view>
            <view class="menu-info">
              <text class="menu-title">
                我的档案
              </text>
              <text class="menu-desc">
                编辑个人信息
              </text>
            </view>
          </view>
          <text class="menu-arrow i-carbon-chevron-right" />
        </view>

        <view class="menu-item" @tap="handleMenuClick('baby')">
          <view class="menu-content">
            <view class="menu-icon-wrapper">
              <text class="i-carbon-face-satisfied" />
            </view>
            <view class="menu-info">
              <text class="menu-title">
                宝宝管理
              </text>
              <text class="menu-desc">
                名下有1个宝宝
              </text>
            </view>
          </view>
          <text class="i-carbon-chevron-right menu-arrow" />
        </view>

        <view class="menu-item" @tap="handleMenuClick('evaluation')">
          <view class="menu-content">
            <view class="menu-icon-wrapper">
              <text class="i-carbon-chart-line" />
            </view>
            <view class="menu-info">
              <text class="menu-title">
                我的测评
              </text>
              <text class="menu-desc">
                查看全部测评记录
              </text>
            </view>
          </view>
          <text class="i-carbon-chevron-right menu-arrow" />
        </view>
      </view>
    </view>

    <!-- 退出登录 -->
    <view v-if="isLogin" class="logout-container">
      <view class="logout-btn" @click="handleLogout">
        <text class="logout-text">
          退出登录
        </text>
      </view>
    </view>
  </view>
  <AuthModel v-model="showAuthModal" />
</template>

<style lang="scss" scoped>
// 用户信息头部
.user-header {
  position: relative;
  background: #3b82f6;
  padding: 60rpx 40rpx 100rpx;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.avatar-container {
  position: relative;
  margin-right: 24rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.avatar-badge {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 20rpx;
  height: 20rpx;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
}

.user-details {
  flex: 1;
}

.user-name {
  display: flex;
  align-items: center;
  font-size: 36rpx;
  font-weight: 600;
  color: white;
  margin-bottom: 8rpx;
  gap: 10rpx;
}

.user-phone {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.edit-btn {
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12rpx;

  text {
    font-size: 32rpx;
  }
}

// 统计信息卡片
.stats-container {
  padding: 0 40rpx;
  margin-top: -60rpx;
  position: relative;
  z-index: 3;
}

.stats-card {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 44rpx;
  font-weight: 700;
  color: #3b82f6;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #6b7280;
}

.stat-divider {
  width: 1rpx;
  height: 50rpx;
  background: #e5e7eb;
}

// 菜单容器
.menu-container {
  padding: 40rpx;
}

.menu-section {
  margin-bottom: 40rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #374151;
  padding-left: 8rpx;
  margin-bottom: 20rpx;
}

.menu-card {
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 40rpx;
  transition: background-color 0.2s ease;

  &:active {
    background-color: #f8fafc;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
  }
}

.menu-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.menu-icon-wrapper {
  width: 72rpx;
  height: 72rpx;
  border-radius: 12rpx;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;

  text {
    color: #3b82f6;
    font-size: 32rpx;
  }
}

.menu-info {
  flex: 1;
}

.menu-title {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 6rpx;
}

.menu-desc {
  font-size: 24rpx;
  color: #9ca3af;
}

.menu-arrow {
  font-size: 24rpx;
  color: #d1d5db;
}

// 退出登录
.logout-container {
  padding: 0 40rpx 40rpx;
}

.logout-btn {
  background: white;
  border-radius: 16rpx;
  padding: 32rpx;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;

  &:active {
    background-color: #fef2f2;
  }
}

.logout-text {
  font-size: 32rpx;
  font-weight: 500;
  color: #ef4444;
}
</style>
