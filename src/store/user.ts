import type { IUserInfoVo } from '@/api/types/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getUserInfo as _getUserInfo,
  logout as _logout,
  phoneLogin as _phoneLogin,
  wxLogin as _wxLogin,
} from '@/api/login'

// 初始化状态
const userInfoState: IUserInfoVo = {
  userId: 0,
  avatar: '/static/images/default-avatar.png',
  nickname: '',
  accessToken: '',
  refreshToken: '',
  openid: '',
  mobile: '',
  expiresTime: 0,
}

const socialType = 34 // 社交类型 - 微信小程序

export const useUserStore = defineStore(
  'user',
  () => {
    // 定义用户信息
    const userInfo = ref<IUserInfoVo>({ ...(uni.getStorageSync('userInfo') || userInfoState) })

    const isLogin = computed(() => !!(userInfo.value.expiresTime && userInfo.value.expiresTime > Date.now()))

    // 设置用户信息
    const setUserInfo = (val: IUserInfoVo) => {
      console.log('设置用户信息', val)
      // 若头像为空 则使用默认头像
      if (!val.avatar) {
        val.avatar = userInfoState.avatar
      }
      else {
        val.avatar = 'https://oss.laf.run/ukw0y1-site/avatar.jpg?feige'
      }
      userInfo.value = val
    }
    const setUserAvatar = (avatar: string) => {
      userInfo.value.avatar = avatar
      console.log('设置用户头像', avatar)
      console.log('userInfo', userInfo.value)
    }
    // 删除用户信息
    const removeUserInfo = () => {
      userInfo.value = { ...userInfoState }
      uni.removeStorageSync('userInfo')
    }
    /**
     * 获取用户信息
     */
    const getUserInfo = async () => {
      const res = await _getUserInfo()
      console.log('getUserInfo', res)
      const userInfoData = res.data as any // 使用any类型处理API返回的数据结构
      // 合并用户信息，将接口返回的字段映射到IUserInfoVo类型
      setUserInfo({
        ...userInfo.value, // 保留当前登录状态（accessToken等）
        userId: userInfoData.id || userInfo.value.userId, // 映射 id -> userId
        avatar: userInfoData.avatar || userInfoState.avatar,
        nickname: userInfoData.nickname || '',
        mobile: userInfoData.mobile || '',
        // 保留现有的登录相关字段
        accessToken: userInfo.value.accessToken,
        refreshToken: userInfo.value.refreshToken,
        openid: userInfo.value.openid,
        expiresTime: userInfo.value.expiresTime,
      })
      uni.setStorageSync('userInfo', userInfo.value)
      return res
    }

    // 微信小程序静默授权登陆
    const wxLogin = async () => {
      try {
        // 1. 获得微信 code
        const codeResult = await uni.login()
        if (codeResult.errMsg !== 'login:ok') {
          return false
        }

        // 2. 社交登录
        const loginResult = await _wxLogin({ type: socialType, code: codeResult.code, state: 'default' })
        if (loginResult.code === 0) {
          // 只设置登录相关字段，保留其他字段的当前值
          setUserInfo({
            ...userInfo.value, // 保留当前用户信息
            ...loginResult.data, // 更新登录相关字段：accessToken, refreshToken, openid, expiresTime, userId
            mobile: userInfo.value.mobile || '', // 确保mobile字段存在
          })
          await getUserInfo()
        }
        return loginResult.code === 0
      }
      catch (error) {
        console.error('微信登录失败:', error)
        return false
      }
    }

    // 微信小程序手机号授权登陆
    const mobileLogin = async (e: any) => {
      try {
        if (e.errMsg !== 'getPhoneNumber:ok') {
          return false
        }

        // 1. 获得微信 code
        const codeResult = await uni.login()
        if (codeResult.errMsg !== 'login:ok') {
          return false
        }

        // 2. 一键登录
        const loginResult = await _phoneLogin({ phoneCode: e.code, loginCode: codeResult.code, state: 'default' })
        if (loginResult.code === 0) {
          // 只设置登录相关字段，保留其他字段的当前值
          setUserInfo({
            ...userInfo.value, // 保留当前用户信息
            ...loginResult.data, // 更新登录相关字段：accessToken, refreshToken, openid, expiresTime, userId
            mobile: userInfo.value.mobile || '', // 确保mobile字段存在
          })
          await getUserInfo()
        }
        return loginResult.code === 0
      }
      catch (error) {
        console.error('手机号登录失败:', error)
        return false
      }
    }

    /**
     * 退出登录 并 删除用户信息
     */
    const logout = async () => {
      _logout()
      removeUserInfo()
    }

    return {
      userInfo,
      isLogin,
      wxLogin,
      mobileLogin,
      getUserInfo,
      setUserAvatar,
      logout,
    }
  },
  {
    persist: true,
  },
)
