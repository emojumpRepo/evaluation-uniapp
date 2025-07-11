<script setup lang="ts">
import { computed, ref } from 'vue'

type BirthType = '自然' | '剖腹产' | '早产' | '足月'
type Guardian = '父母' | '老人' | '其他'

interface BabyForm {
  name: string
  birthday: number
  gender: '男' | '女'
  height: string
  weight: string
  birthType: BirthType
  guardian: Guardian
  avatar: string
}

// 表单数据
const form = ref<BabyForm>({
  name: '',
  birthday: Date.now(),
  gender: '男',
  height: '',
  weight: '',
  birthType: '自然',
  guardian: '父母',
  avatar: '',
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
    form.value[field] = ''
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
      form.value.height = '200'
      return
    }
    form.value.height = num.toString()
  }
  else {
    if (num > 100) {
      uni.showToast({
        title: '体重不能超过100kg',
        icon: 'none',
      })
      form.value.weight = '100'
      return
    }
    form.value.weight = num.toString()
  }
}

// 选择头像
async function chooseAvatar() {
  try {
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })

    if (res.tempFilePaths && res.tempFilePaths[0]) {
      form.value.avatar = res.tempFilePaths[0]
    }
  }
  catch (error) {
    uni.showToast({
      title: '选择头像失败',
      icon: 'none',
    })
  }
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

    console.log('提交表单', form.value)

    uni.hideLoading()
    uni.showToast({
      title: '保存成功',
      icon: 'success',
    })
  }
  catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '保存失败，请重试',
      icon: 'error',
    })
  }
}
</script>

<template>
  <div class="box-border h-screen bg-gray-100 pt-4">
    <!-- 头像选择器 -->
    <div class="mb-4 flex items-center justify-center">
      <div
        class="relative h-24 w-24 flex cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gray-200 shadow"
        @click="chooseAvatar"
      >
        <template v-if="form.avatar">
          <image
            :src="form.avatar"
            class="h-full w-full object-cover"
            mode="aspectFill"
          />
        </template>
        <template v-else>
          <view class="flex flex-col items-center text-gray-400">
            <view class="i-carbon-camera mb-1 text-24px" />
            <text class="text-xs">
              点击上传
            </text>
          </view>
        </template>
      </div>
    </div>

    <!-- 表单内容 -->
    <wd-form :model="form" :rules="rules">
      <wd-cell-group custom-class="mx-4 rounded-lg overflow-hidden" border>
        <wd-cell title="孩子基本信息" title-width="100%" />

        <!-- 姓名 -->
        <wd-input
          v-model="form.name"
          prop="name"
          label="孩子姓名"
          placeholder="请输入姓名"
          clearable
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
        <wd-cell title="性别" prop="gender">
          <wd-radio-group v-model="form.gender" shape="dot" inline>
            <wd-radio value="男">
              男
            </wd-radio>
            <wd-radio value="女">
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
          clearable
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
          clearable
          @change="val => handleNumberInput(val, 'weight')"
        >
          <template #suffix>
            kg
          </template>
        </wd-input>

        <!-- 生育方式 -->
        <wd-cell title="生育方式" prop="birthType" vertical>
          <div class="flex items-center gap-5">
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
    <view class="fixed bottom-0 left-0 right-0 px-4 pb-5">
      <wd-button
        block
        :loading="false"
        :disabled="!formValid"
        custom-class="save-btn"
        @click="onSubmit"
      >
        保存
      </wd-button>
    </view>
  </div>
</template>
