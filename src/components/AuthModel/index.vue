<script setup lang="ts">
import { ref } from 'vue'
import { PolicyType } from '@/api/user'
import { useUserStore } from '@/store/user'
import { toast } from '@/utils/toast'

const props = defineProps({
  type: {
    type: String,
    default: 'login',
  },
})

enum PolicyTitle {
  service_agreement = '服务协议',
  privacy_policy = '隐私协议',
}

const show = defineModel({
  type: Boolean,
  default: false,
})

const userStore = useUserStore()

const isAgree = ref(true) // 是否同意协议
const showAgreement = ref(false) // 是否显示协议弹窗
const agreementType = ref<PolicyType>(PolicyType.SERVICE_AGREEMENT) // 协议类型

// 查看协议
function handleAgreement(type: PolicyType) {
  console.log('handleAgreement', type)
  showAgreement.value = true
  agreementType.value = type
}

// 微信登录
async function handleWechatLogin() {
  if (!isAgree.value) {
    toast.error('请先阅读并同意协议')
    return
  }

  try {
    const loginRes = await userStore.wxLogin()
    if (loginRes) {
      show.value = false
      toast.success('登录成功')
    }
    else {
      toast.error('微信登录失败')
    }
  }
  catch (error) {
    console.error('微信登录失败:', error)
    toast.error('登录失败，请重试')
  }
}

// 微信小程序的"手机号快速验证"
async function getPhoneNumber(e: any) {
  if (!isAgree.value) {
    toast.error('请先阅读并同意协议')
    return
  }

  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    toast.error('您已拒绝授权，无法继续登录')
    return
  }

  try {
    const result = await userStore.mobileLogin(e.detail)
    if (result) {
      show.value = false
      toast.success('登录成功')
    }
    else {
      toast.error('登录失败')
    }
  }
  catch (error) {
    console.error('手机号快捷登录失败:', error)
    toast.error('登录失败')
  }
}
</script>

<template>
  <!-- 授权弹窗 -->
  <wd-popup
    v-model="show" position="bottom" custom-style="border-radius: 30rpx 30rpx 0 0;"
    :close-on-click-modal="true" @close="show = false"
  >
    <!-- 自定义关闭按钮 -->
    <view class="close-btn" @tap="show = false">
      <text class="close-icon">
        ✕
      </text>
    </view>

    <!-- 磨砂玻璃背景容器 -->
    <view class="login-wrap">
      <!-- 渐变背景装饰 -->
      <view class="bg-decoration">
        <view class="decoration-circle decoration-circle-1" />
        <view class="decoration-circle decoration-circle-2" />
        <view class="decoration-circle decoration-circle-3" />
      </view>

      <!-- 内容容器 -->
      <view class="content-container">
        <view class="header-section">
          <view class="welcome-text">
            <text class="welcome-title">
              欢迎使用
            </text>
            <text class="welcome-subtitle">
              登录后可使用更多功能
            </text>
          </view>
        </view>

        <!-- 登录方式区域 -->
        <view class="login-section">
          <!-- 微信小程序快捷登录 -->
          <!-- #ifdef MP-WEIXIN -->
          <view class="quick-login-container">
            <button class="quick-login-btn" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
              <wd-icon name="phone" size="16" color="#fff" />
              <text class="btn-text">
                手机号快捷登录
              </text>
            </button>
          </view>

          <!-- 分割线 -->
          <view class="divider-container">
            <view class="divider-line" />
            <text class="divider-text">
              或
            </text>
            <view class="divider-line" />
          </view>

          <!-- 微信登录 -->
          <view class="wechat-login-container">
            <button class="wechat-login-btn" @tap="handleWechatLogin">
              <wd-icon name="chat" size="16" color="#fff" />
              <text class="btn-text">
                微信一键授权登录
              </text>
            </button>
          </view>
        <!-- #endif -->
        </view>

        <!-- 用户协议区域 -->
        <view class="agreement-option">
          <view class="radio-container">
            <wd-checkbox
              v-model="isAgree" color="#3b82f6" style="transform: scale(0.9)" @change="() => console.log('isAgree', isAgree)"
            >
              <view class="agreement-text-container">
                <text class="agreement-text">
                  我已阅读并同意
                </text>
                <text class="protocol-link" @tap.stop="handleAgreement(PolicyType.SERVICE_AGREEMENT)">
                  《用户协议》
                </text>
                <text class="agreement-text">
                  与
                </text>
                <text class="protocol-link" @tap.stop="handleAgreement(PolicyType.PRIVACY_POLICY)">
                  《隐私协议》
                </text>
              </view>
            </wd-checkbox>
          </view>
        </view>
      </view>
    </view>
  </wd-popup>
  <AgreementModel v-model="showAgreement" :type="agreementType" :title="PolicyTitle[agreementType]" @agree="isAgree = true" />
</template>

<style lang="scss" scoped>
// 关闭按钮样式
.close-btn {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);

  .close-icon {
    font-size: 28rpx;
    color: #666;
    font-weight: bold;
  }
}

// 主容器样式
.login-wrap {
  position: relative;
  min-height: 600rpx;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #bae6fd 100%);
  border-radius: 30rpx 30rpx 0 0;
  overflow: hidden;
}

// 背景装饰元素
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.15));
  backdrop-filter: blur(20px);
}

.decoration-circle-1 {
  width: 200rpx;
  height: 200rpx;
  top: -50rpx;
  right: -50rpx;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 197, 253, 0.1));
}

.decoration-circle-2 {
  width: 120rpx;
  height: 120rpx;
  bottom: 100rpx;
  left: -30rpx;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(196, 181, 253, 0.15));
}

.decoration-circle-3 {
  width: 80rpx;
  height: 80rpx;
  top: 200rpx;
  right: 100rpx;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.15));
}

// 内容容器
.content-container {
  position: relative;
  z-index: 2;
  padding: 50rpx 40rpx 30rpx;
}

// 头部区域
.header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}

.welcome-text {
  text-align: center;
}

.welcome-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 10rpx;
}

.welcome-subtitle {
  display: block;
  font-size: 24rpx;
  color: #64748b;
}

// 登录区域
.login-section {
  margin-bottom: 40rpx;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.login-method-title {
  text-align: center;
  margin-bottom: 20rpx;
}

.method-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 5rpx;
}

.method-subtitle {
  display: block;
  font-size: 22rpx;
  color: #64748b;
}

.quick-login-container,
.wechat-login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}

.quick-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 20rpx;
  border: none;
  outline: none;
  box-shadow: 0 4rpx 20rpx rgba(16, 185, 129, 0.3);
  transition: all 0.3s ease;
  gap: 10rpx;

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 2rpx 10rpx rgba(16, 185, 129, 0.3);
  }
}

.wechat-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 20rpx;
  border: none;
  outline: none;
  box-shadow: 0 4rpx 20rpx rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
  gap: 10rpx;

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 2rpx 10rpx rgba(59, 130, 246, 0.3);
  }
}

.btn-icon {
  font-size: 28rpx;
  margin-right: 10rpx;
}

.btn-text {
  font-size: 28rpx;
  color: white;
  font-weight: 500;
}

.divider-container {
  display: flex;
  align-items: center;
  margin: 20rpx 0;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: linear-gradient(to right, transparent, #cbd5e1, transparent);
}

.divider-text {
  margin: 0 20rpx;
  font-size: 24rpx;
  color: #64748b;
}

.not-supported {
  text-align: center;
  padding: 40rpx 20rpx;
}

.not-supported-text {
  font-size: 26rpx;
  color: #64748b;
}

.agreement-option {
  display: flex;
  align-items: flex-start;
  padding: 20rpx;
  border-radius: 15rpx;
  background: rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;

  &:active {
    background: rgba(255, 255, 255, 0.8);
  }
}

.radio-container {
  margin-right: 15rpx;
  margin-top: 2rpx;
}

.agreement-text-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  line-height: 1.5;
}

.agreement-text {
  font-size: 26rpx;
  color: #374151;
  margin-right: 4rpx;
}

.protocol-link {
  font-size: 26rpx;
  color: #3b82f6;
  text-decoration: underline;
  margin: 0 4rpx;
  font-weight: 500;
}

// 底部安全区域
.safe-area {
  height: calc(constant(safe-area-inset-bottom) / 2);
  height: calc(env(safe-area-inset-bottom) / 2);
}

// 摇晃动画
.shake {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-10rpx);
  }

  75% {
    transform: translateX(10rpx);
  }
}

// 按钮重置样式
button {
  padding: 0;
  margin: 0;
  border: none;
  outline: none;
  background: transparent;

  &::after {
    border: none;
  }
}
</style>
