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
defineOptions({
  name: 'UserPersonal',
})

// 表单数据
const formData = ref({
  realName: '张三',
  phone: '13812345678',
  idCard: '440123198001017654',
  familyRole: 'father', // father, mother
  gender: 'male', // male, female
  bloodType: '未知',
  height: '175',
  weight: '70',
  address: '广州市天河区××路',
  school: '广州市第一幼儿园',
  avatar: '/static/images/default-avatar.png', // 添加头像字段
})

// 上传组件的文件列表
const fileList = ref([])

// 表单验证规则
const rules = {
  realName: [
    {
      required: true,
      message: '请输入真实姓名',
    },
  ],
  phone: [
    {
      required: true,
      message: '请输入联系电话',
    },
    {
      required: false,
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
}

// 家庭角色选项
const familyRoleOptions = [
  { label: '父亲', value: 'father' },
  { label: '母亲', value: 'mother' },
]

// 性别选项
const genderOptions = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' },
]

// 血型选项
const bloodTypeOptions = [
  { label: '未知', value: '未知' },
  { label: 'A型', value: 'A型' },
  { label: 'B型', value: 'B型' },
  { label: 'AB型', value: 'AB型' },
  { label: 'O型', value: 'O型' },
  { label: 'Rh血型', value: 'Rh血型' },
  { label: '其他', value: '其他' },
]

// 处理上传变化
function handleChange(event: any) {
  console.log('上传文件变化:', event)

  const { fileList: newFileList, file } = event

  // 更新文件列表
  fileList.value = newFileList

  // 如果有上传成功的文件
  if (file && file.status === 'success' && file.response) {
    // 假设服务器返回的数据格式为 { code: 200, data: { url: 'xxx' } }
    const response = file.response
    if (response.code === 200 && response.data && response.data.url) {
      // 更新头像URL
      formData.value.avatar = response.data.url

      uni.showToast({
        title: '头像上传成功',
        icon: 'success',
      })
    }
    else {
      uni.showToast({
        title: '上传失败，请重试',
        icon: 'error',
      })
    }
  }
  else if (file && file.status === 'error') {
    uni.showToast({
      title: '上传失败，请重试',
      icon: 'error',
    })
  }
}

// 上传前的校验
function beforeUpload(file: any) {
  // 检查文件类型
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    uni.showToast({
      title: '只能上传图片文件',
      icon: 'none',
    })
    return false
  }

  // 检查文件大小（限制为5MB）
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    uni.showToast({
      title: '图片大小不能超过5MB',
      icon: 'none',
    })
    return false
  }

  return true
}

// 表单引用
const formRef = ref()

// 保存档案
async function saveProfile() {
  try {
    // 表单验证
    await formRef.value.validate()

    // 这里添加保存逻辑
    uni.showLoading({
      title: '保存中...',
    })

    // 模拟保存请求
    setTimeout(() => {
      uni.hideLoading()
      uni.showToast({
        title: '保存成功',
        icon: 'success',
      })

      console.log('保存档案数据:', formData.value)

      // 可以在这里调用API保存数据，成功后返回上一页
      // setTimeout(() => {
      //   uni.navigateBack()
      // }, 1500)
    }, 1000)
  }
  catch (error) {
    console.log('表单验证失败:', error)
  }
}

onLoad(() => {
  console.log('我的档案页面加载')
})
</script>

<template>
  <div class="box-border h-screen overflow-hidden bg-gray-50 px-5 pt-4">
    <!-- 头部信息 -->
    <div class="flex flex-col items-center rounded-lg bg-white p-5">
      <div class="mb-3">
        <image :src="formData.avatar" class="user-avatar" mode="aspectFill" />
      </div>
      <div class="flex justify-center">
        <wd-upload
          :file-list="fileList"
          action="https://mockapi.eolink.com/zhTuw2P8c29bc981a741931bdd86eb04dc1e8fd64865cb5/upload"
          :before-upload="beforeUpload" accept="image" :limit="1" list-type="text" @change="handleChange"
        >
          <wd-button type="primary" icon="camera" size="small">
            上传头像
          </wd-button>
        </wd-upload>
      </div>
    </div>

    <!-- 表单内容区域 -->
    <div class="mt-5 rounded-lg bg-white p-1">
      <wd-form ref="formRef" :model="formData" :rules="rules">
        <wd-cell-group border>
          <!-- 真实姓名 -->
          <wd-input
            v-model="formData.realName" label="真实姓名" label-width="100px" prop="realName"
            placeholder="请输入真实姓名"
          />
          <!-- 联系电话 -->
          <wd-input
            v-model="formData.phone" label="联系电话" label-width="100px" prop="phone" placeholder="请输入联系电话"
            type="tel"
          />
          <!-- 身份证号 -->
          <wd-input v-model="formData.idCard" label="身份证号" label-width="100px" prop="idCard" placeholder="请输入身份证号" />
          <!-- 家庭角色 -->
          <wd-cell title="家庭角色" center custom-class="!line-height-0">
            <wd-radio-group v-model="formData.familyRole" shape="button">
              <wd-radio v-for="option in familyRoleOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </wd-radio>
            </wd-radio-group>
          </wd-cell>
          <!-- 性别 -->
          <wd-cell title="性别" center custom-class="!line-height-0">
            <wd-radio-group v-model="formData.gender" shape="dot" inline>
              <wd-radio v-for="option in genderOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </wd-radio>
            </wd-radio-group>
          </wd-cell>

          <!-- 血型 -->
          <wd-picker
            v-model="formData.bloodType" label="血型" label-width="100px" :columns="bloodTypeOptions"
            placeholder="请选择血型"
          />

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
  </div>
</template>

<style lang="scss" scoped>
.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 3px solid #e5e7eb;
}

:deep(.is-checked.is-button) {
  .wd-radio__label {
    @apply bg-[#e6f7ff]! text-[#1a91ff]! border-[#1a91ff]!;
  }
}
</style>
