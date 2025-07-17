<route lang="jsonc">
{
  "style": {
    "navigationBarTitleText": "我的档案",
    "navigationBarBackgroundColor": "#ffffff",
    "navigationBarTextStyle": "black"
  }
}
</route>

<script lang="ts" setup>
import type { IUserBaseInfo } from '@/api/types/login'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import { getDefaultUserBaseInfo } from '@/api/types/login'
import UploadAvatar from '@/components/UploadAvatar/index.vue'
import { useUserStore } from '@/store'

defineOptions({
  name: 'UserPersonal',
})

const userStore = useUserStore()
const { userInfo } = storeToRefs(userStore)

// 从userInfo中提取基本信息字段
function extractUserBaseInfo(userInfo: any): IUserBaseInfo {
  return {
    avatar: userInfo.avatar || '',
    nickname: userInfo.nickname || '',
    mobile: userInfo.mobile || '',
    idCard: userInfo.idCard || '',
    name: userInfo.name || '',
    sex: userInfo.sex || 0,
    height: userInfo.height || 0,
    weight: userInfo.weight || 0,
    bloodType: userInfo.bloodType || '',
    address: userInfo.address || '',
    school: userInfo.school || '',
    familyRole: userInfo.familyRole || 0,
  }
}

// 表单数据
const formData = ref<IUserBaseInfo>({
  ...getDefaultUserBaseInfo(),
  ...extractUserBaseInfo(userInfo.value),
})

// 监听userInfo变化，同步到表单
watch(userInfo, (newUserInfo) => {
  const extractedInfo = extractUserBaseInfo(newUserInfo)
  formData.value = {
    ...getDefaultUserBaseInfo(),
    ...extractedInfo,
  }
  console.log('用户信息变化，同步到表单:', extractedInfo)
}, { deep: true })

/**
 * 上传头像
 * @param avatar 头像
 */
async function uploadAvatar(avatar: string) {
  formData.value.avatar = avatar
  console.log('formData.value', formData.value)
  await userStore.updateUserInfo(formData.value)
}

// 上传组件的文件列表
const fileList = ref([])

// 表单验证规则
const rules = {
  name: [
    {
      required: true,
      message: '请输入真实姓名',
    },
  ],
  mobile: [
    {
      required: true,
      message: '请输入联系电话',
    },
    {
      required: true,
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
    },
  ],
  idCard: [
    {
      required: true,
      message: '请输入身份证号',
    },
  ],
  familyRole: [
    {
      required: true,
      message: '请选择家庭角色',
    },
  ],
  sex: [
    {
      required: true,
      message: '请选择性别',
    },
  ],
  bloodType: [
    {
      required: true,
      message: '请输入血型',
    },
  ],
}

// 家庭角色选项
const familyRoleOptions = [
  { label: '父亲', value: 1 },
  { label: '母亲', value: 2 },
]

// 性别选项
const genderOptions = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
]

// 表单引用
const formRef = ref()

// 保存档案
async function saveProfile() {
  try {
    // 表单验证
    const valid = await formRef.value.validate()
    if (!valid.valid) {
      uni.showToast({
        title: '请填写完整信息',
        icon: 'none',
      })
      return
    }

    uni.showLoading({
      title: '保存中...',
    })

    await userStore.updateUserInfo(formData.value)
  }
  catch (error) {
    console.log('表单验证失败:', error)
    uni.showToast({
      title: '保存失败',
      icon: 'error',
    })
  }
  finally {
    uni.hideLoading()
  }
}
</script>

<template>
  <scroll-view scroll-y class="scroll-container bg-gray-50 px-5 pb-18 pt-4">
    <!-- 头部信息 -->
    <UploadAvatar :avatar="formData.avatar" @upload="uploadAvatar" />

    <!-- 表单内容区域 -->
    <div class="mt-5 rounded-lg bg-white p-1">
      <wd-form ref="formRef" :model="formData" :rules="rules">
        <wd-cell-group border>
          <!-- 真实姓名 -->
          <wd-input v-model="formData.name" label="真实姓名" label-width="100px" prop="name" placeholder="请输入真实姓名" required />
          <!-- 联系电话 -->
          <wd-input
            v-model="formData.mobile" label="联系电话" label-width="100px" prop="mobile" placeholder="请输入联系电话" required
            type="tel"
          />
          <!-- 身份证号 -->
          <wd-input v-model="formData.idCard" label="身份证号" label-width="100px" prop="idCard" placeholder="请输入身份证号" required />
          <!-- 家庭角色 -->
          <wd-cell title="家庭角色" custom-class="!line-height-0" required center prop="familyRole">
            <wd-radio-group v-model="formData.familyRole" shape="button">
              <wd-radio v-for="option in familyRoleOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </wd-radio>
            </wd-radio-group>
          </wd-cell>
          <!-- 性别 -->
          <wd-cell title="性别" custom-class="!line-height-0" required center prop="sex">
            <wd-radio-group v-model="formData.sex" shape="dot" inline>
              <wd-radio v-for="option in genderOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </wd-radio>
            </wd-radio-group>
          </wd-cell>

          <wd-cell prop="bloodType" title="血型" required title-width="100px" custom-value-class="cell-left">
            <view class="flex justify-end">
              <wd-input
                v-model="formData.bloodType" no-border
                custom-style="display: inline-block; width: 70px; vertical-align: middle" placeholder="请输入血型"
              />
              <view class="ml-2">
                型
              </view>
            </view>
          </wd-cell>

          <!-- 身高 -->
          <wd-input v-model="formData.height" label="身高 (cm)" label-width="100px" placeholder="请输入身高" type="number" />

          <!-- 体重 -->
          <wd-input v-model="formData.weight" label="体重 (kg)" label-width="100px" placeholder="请输入体重" type="number" />

          <!-- 联系地址 -->
          <wd-input v-model="formData.address" label="联系地址" label-width="100px" placeholder="请输入联系地址" />

          <!-- 所属学校 -->
          <wd-input v-model="formData.school" label="所属学校" label-width="100px" placeholder="请输入所属学校" />
        </wd-cell-group>
      </wd-form>
    </div>

    <!-- 保存按钮 -->
    <div class="save-btn" @click="saveProfile">
      保存档案
    </div>
  </scroll-view>
</template>

<style lang="scss" scoped>
.scroll-container {
  height: 100vh;
  box-sizing: border-box;
}

:deep(.is-checked.is-button) {
  .wd-radio__label {
    @apply bg-[#e6f7ff]! text-[#1a91ff]! border-[#1a91ff]!;
  }
}
</style>
