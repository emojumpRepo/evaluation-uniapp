<script setup lang="ts">
import { uploadFileUrl, useUpload } from '@/utils/uploadFile'

defineProps<{
  avatar: string
}>()

const emit = defineEmits<{
  (e: 'upload', avatar: string): void
}>()

// 上传进度
const uploadProgress = ref(0)

// 使用useUpload钩子
const { loading: uploading, error: uploadError, run: startUpload } = useUpload<{ url: string }>(
  uploadFileUrl.USER_AVATAR,
  {},
  {
    maxSize: 5, // 最大5MB
    sourceType: ['album', 'camera'],
    directory: 'user/avatar',
    onProgress: (p) => {
      uploadProgress.value = p
      console.log(`上传进度：${p}%`)
    },
    onSuccess: async (res) => {
      console.log('上传成功', res)
      if (res) {
        emit('upload', res as unknown as string)
        uni.showToast({
          title: '头像上传成功',
          icon: 'success',
        })
      }
    },
    onError: (err) => {
      console.error('上传失败', err)
      uni.showToast({
        title: '上传失败，请重试',
        icon: 'error',
      })
    },
  },
)

// 处理头像上传
function handleAvatarUpload() {
  startUpload()
}
</script>

<template>
  <div class="flex flex-col items-center rounded-lg bg-white p-5">
    <div class="relative mb-3">
      <image :src="avatar" class="user-avatar" mode="aspectFill" />
      <div v-if="uploading" class="upload-progress">
        {{ uploadProgress }}%
      </div>
    </div>
    <div class="flex justify-center">
      <wd-button type="primary" icon="camera" size="small" :loading="uploading" @click="handleAvatarUpload">
        上传头像
      </wd-button>
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

.upload-progress {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
</style>
