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
import { onMounted } from 'vue'
import { getUserAssessmentRecords } from '@/api/evaluation'
import AuthModel from '@/components/AuthModel/index.vue'
import { useUserStore } from '@/store'
import { useBabyStore } from '@/store/index'
import { phoneDesensitization } from '@/utils/format'

defineOptions({
  name: 'User',
})

const userStore = useUserStore()
const { userInfo, isLogin } = storeToRefs(userStore)
const babyStore = useBabyStore()
const { babyList } = storeToRefs(babyStore)

const showAuthModal = ref(false) // 登录弹窗
const userAssessmentRecords = ref<number[]>([])

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
      uni.navigateTo({
        url: '/pages-sub/record/index',
      })
      break
    case 'contact':
      // #ifdef MP-WEIXIN
      // 在微信小程序中，使用 open-type="contact" 的按钮直接拉起客服，无需在这里处理
      // 这里作为兜底，避免其它平台误触
      // #endif
      // #ifndef MP-WEIXIN
      uni.showModal({
        title: '联系客服',
        content: '请在微信小程序内使用“联系客服”，或添加客服微信：wecare。',
        showCancel: false,
      })
      // #endif
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

/**
 * 获取用户测评记录
 */
async function getUserAssessmentRecordsData() {
  try {
    const res = await getUserAssessmentRecords(userInfo.value.userId)
    console.log('用户测评记录', res)
    const { code, data } = res
    if (code === 0) {
      userAssessmentRecords.value = data.assessmentIds
    }
  }
  catch (error) {
    console.error('获取用户测评记录失败', error)
  }
}

onMounted(async () => {
  if (isLogin.value) {
    await userStore.getUserInfo()
    await babyStore.getBabyListData()
    await getUserAssessmentRecordsData()
  }
})
</script>

<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 用户信息头部 -->
    <view class="user-header">
      <view class="header-content">
        <view class="user-info">
          <view class="avatar-container">
            <image :src="isLogin ? userInfo.avatar : '/static/images/default-avatar.png'" class="user-avatar" mode="aspectFill" />
            <view class="avatar-badge" />
          </view>
          <view class="user-details">
            <view class="user-name" @click="handleShowAuthModal">
              <text>
                {{ isLogin ? userInfo.nickname : '立即登录' }}
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
            {{ babyList.length || 0 }}
          </text>
          <text class="stat-label">
            宝宝数量
          </text>
        </view>
        <view class="stat-divider" />
        <view class="stat-item">
          <text class="stat-number">
            {{ userAssessmentRecords.length || 0 }}
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
                名下有{{ babyList.length || 0 }}个宝宝
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

        <!-- 微信小程序内使用 open-type=contact 直接拉起客服 -->
        <!-- #ifdef MP-WEIXIN -->
        <button open-type="contact" session-from="user-center" class="menu-item" hover-class="none">
          <view class="menu-content">
            <view class="menu-icon-wrapper">
              <text class="i-carbon-chat" />
            </view>
            <view class="menu-info">
              <text class="menu-title">
                联系客服
              </text>
              <text class="menu-desc">
                遇到问题？请联系客服
              </text>
            </view>
          </view>
          <text class="i-carbon-chevron-right menu-arrow" />
        </button>
        <!-- #endif -->
        <!-- 其它平台回退为点击提示 -->
        <!-- #ifndef MP-WEIXIN -->
        <view class="menu-item" @tap="handleMenuClick('contact')">
          <view class="menu-content">
            <view class="menu-icon-wrapper">
              <text class="i-carbon-chat" />
            </view>
            <view class="menu-info">
              <text class="menu-title">
                联系客服
              </text>
              <text class="menu-desc">
                遇到问题？请联系客服
              </text>
            </view>
          </view>
          <text class="i-carbon-chevron-right menu-arrow" />
        </view>
        <!-- #endif -->
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
wx-button {
  background: transparent;

  .menu-content {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .menu-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 20rpx;

      .menu-title {
        width: fit-content;
        line-height: 32rpx;
      }

      .menu-desc {
        width: fit-content;
        line-height: 1.6;
      }
    }
  }

  &:after {
    border: none;
  }
}

// 用户信息头部
.user-header {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 100rpx;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 300rpx;
    height: 300rpx;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 250rpx;
    height: 250rpx;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 50%;
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
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
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.avatar-badge {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 20rpx;
  height: 20rpx;
  background: #10b981;
  border: 3px solid white;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-phone {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.edit-btn {
  padding: 16rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12rpx;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;

  &:active {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0.95);
  }

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
  border-radius: 20rpx;
  padding: 40rpx 0;
  display: flex;
  align-items: center;
  justify-content: space-around;
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 4px 12px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
}

.stat-item {
  text-align: center;
  flex: 1;
  position: relative;
  transition: transform 0.3s ease;

  &:active {
    transform: scale(0.95);
  }
}

.stat-number {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 26rpx;
  color: #6b7280;
  font-weight: 500;
}

.stat-divider {
  width: 2rpx;
  height: 50rpx;
  background: linear-gradient(180deg, transparent 0%, #e5e7eb 50%, transparent 100%);
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
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.03);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 40rpx;
  transition: all 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:active {
    background-color: #f8fafc;
    transform: scale(0.98);

    &::after {
      opacity: 0.03;
    }
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f1f5f9;
  }
}

.menu-content {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
  z-index: 1;
}

.menu-icon-wrapper {
  width: 80rpx;
  height: 80rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8eeff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;

  text {
    color: #667eea;
    font-size: 36rpx;
  }
}

.menu-item:active .menu-icon-wrapper {
  transform: scale(0.95);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.menu-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20rpx;
}

.menu-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1f2937;
}

.menu-desc {
  font-size: 26rpx;
  color: #9ca3af;
}

.menu-arrow {
  font-size: 28rpx;
  color: #d1d5db;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.menu-item:active .menu-arrow {
  color: #667eea;
  transform: translateX(4rpx);
}

// 退出登录
.logout-container {
  padding: 0 40rpx 40rpx;
}

.logout-btn {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
  text-align: center;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 2px 8px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:active {
    background-color: #fef2f2;
    transform: scale(0.98);
    border-color: #fecaca;

    &::before {
      opacity: 1;
    }
  }
}

.logout-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #ef4444;
  position: relative;
  z-index: 1;
}
</style>
