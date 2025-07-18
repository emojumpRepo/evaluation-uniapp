<route lang="json">
{
  "layout": "default",
  "style": {
    "navigationBarTitleText": "添加宝宝"
  }
}
</route>

<script setup lang="ts">
import type { BirthType, Guardian, IBabyInfo } from '@/api/types/baby'
import dayjs from 'dayjs'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { createBaby, getBabyInfo, updateBabyInfo } from '@/api/baby'
import UploadAvatar from '@/components/UploadAvatar/index.vue'
import { useUserStore } from '@/store/user'

const props = defineProps<{
  id?: number
}>()
const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 表单数据
const form = ref<IBabyInfo>({
  name: '',
  birthday: '',
  gender: 1,
  height: null,
  weight: null,
  birthType: '自然',
  guardian: '父母',
  avatar: 'http://test.yudao.iocoder.cn/user/avatar/20250715/G0bTIS90DRSvc90f423c08a6cb7bb3ab969a5301474c_1752564908905.png',
})

// 选项配置
const birthTypeOptions: BirthType[] = ['自然', '剖腹产', '早产', '足月']
const guardianOptions: Guardian[] = ['父母', '老人', '其他']

// 表单验证
const formValid = computed(() => {
  return form.value.name.trim()
    && form.value.birthday
    && form.value.gender
    && form.value.birthType
    && form.value.guardian
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入姓名' }],
  birthday: [{ required: true, message: '请选择生日' }],
  gender: [{ required: true, message: '请选择性别' }],
  birthType: [{ required: true, message: '请选择生育方式' }],
  guardian: [{ required: true, message: '请选择带养人' }],
}

// 格式化日期
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 处理数值输入
function handleNumberInput(value: string, field: 'height' | 'weight') {
  if (value === '') {
    form.value[field] = null
    return
  }

  const num = Number.parseFloat(value)
  if (Number.isNaN(num))
    return

  if (field === 'height') {
    if (num > 200) {
      uni.showToast({
        title: '身高不能超过200cm',
        icon: 'none',
      })
      form.value.height = 200
      return
    }
    form.value.height = num
  }
  else {
    if (num > 100) {
      uni.showToast({
        title: '体重不能超过100kg',
        icon: 'none',
      })
      form.value.weight = 100
      return
    }
    form.value.weight = num
  }
}

/**
 * 上传头像
 * @param avatar 头像
 */
async function uploadAvatar(avatar: string) {
  form.value.avatar = avatar
  console.log('form.value', form.value)
}

// 提交表单
async function onSubmit() {
  if (!formValid.value) {
    uni.showToast({
      title: '请填写必填项',
      icon: 'none',
    })
    return
  }

  try {
    uni.showLoading({
      title: '保存中...',
    })

    const data = {
      ...form.value,
      birthday: dayjs(form.value.birthday).format('YYYY-MM-DD'),
    }

    console.log('😊😊需要保存的数据', data)

    if (props.id) {
      await updateBabyInfo(data)
    }
    else {
      await createBaby({
        ...data,
        userId: userInfo.value.userId,
      })
    }

    uni.hideLoading()
    uni.showToast({
      title: '保存成功',
      icon: 'success',
    })
    uni.navigateBack()
  }
  catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'error',
    })
  }
}

async function getBabyInfoData() {
  try {
    const res = await getBabyInfo(props.id!)
    console.log('获取宝宝信息', res)
    if (res.code === 0) {
      form.value = {
        ...res.data,
        birthday: dayjs(res.data.birthday).valueOf(),
      }

      console.log('😊😊获取宝宝信息', form.value)
    }
  }
  catch (error) {
    console.error('获取宝宝信息失败:', error)
  }
}

onMounted(async () => {
  if (props.id) {
    await getBabyInfoData()
  }
})
</script>

<template>
  <div class="box-border h-screen bg-gray-50 pt-4">
    <!-- 头像选择器 -->
    <div class="mx-5 mb-4">
      <UploadAvatar :avatar="form.avatar" @upload="uploadAvatar" />
    </div>

    <!-- 表单内容 -->
    <wd-form :model="form" :rules="rules">
      <wd-cell-group custom-class="mx-5 rounded-lg overflow-hidden" border>
        <wd-cell title="孩子基本信息" title-width="100%" />

        <!-- 姓名 -->
        <wd-input
          v-model="form.name"
          prop="name"
          label="孩子姓名"
          placeholder="请输入姓名"
          :maxlength="20"
        />

        <!-- 生日 -->
        <wd-datetime-picker
          v-model="form.birthday"
          :default-value="form.birthday"
          prop="birthday"
          label="孩子生日"
          type="date"
        />

        <!-- 性别 -->
        <wd-cell title="性别" prop="gender" center custom-class="!line-height-0">
          <wd-radio-group v-model="form.gender" shape="dot" inline>
            <wd-radio :value="1">
              男
            </wd-radio>
            <wd-radio :value="2">
              女
            </wd-radio>
          </wd-radio-group>
        </wd-cell>

        <!-- 身高 -->
        <wd-input
          v-model="form.height"
          label="身高"
          placeholder="请输入身高"
          type="digit"
          @change="val => handleNumberInput(val, 'height')"
        >
          <template #suffix>
            cm
          </template>
        </wd-input>

        <!-- 体重 -->
        <wd-input
          v-model="form.weight"
          label="体重"
          placeholder="请输入体重"
          type="digit"
          @change="val => handleNumberInput(val, 'weight')"
        >
          <template #suffix>
            kg
          </template>
        </wd-input>

        <!-- 生育方式 -->
        <wd-cell title="生育方式" prop="birthType" vertical>
          <div class="flex items-center justify-between">
            <span
              v-for="type in birthTypeOptions"
              :key="type"
              class="border border-transparent rounded-full border-solid bg-[#f5f5f5] px-4 py-1"
              :class="{ 'bg-[#e6f7ff]! text-[#1a91ff]! border-[#1a91ff]!': form.birthType === type }"
              @click="form.birthType = type"
            >
              {{ type }}
            </span>
          </div>
        </wd-cell>

        <!-- 带养人 -->
        <wd-cell title="带养人" prop="guardian" vertical>
          <div class="flex items-center gap-5">
            <span
              v-for="type in guardianOptions"
              :key="type"
              class="border border-transparent rounded-full border-solid bg-[#f5f5f5] px-4 py-1"
              :class="{ 'bg-[#e6f7ff]! text-[#1a91ff]! border-[#1a91ff]!': form.guardian === type }"
              @click="form.guardian = type"
            >
              {{ type }}
            </span>
          </div>
        </wd-cell>
      </wd-cell-group>
    </wd-form>

    <!-- 提交按钮 -->
    <view class="fixed bottom-0 left-0 right-0 z-10 px-5 pb-5">
      <wd-button
        :disabled="!formValid"
        custom-class="save-btn w-full"
        @click="onSubmit"
      >
        保存
      </wd-button>
    </view>
  </div>
</template>
