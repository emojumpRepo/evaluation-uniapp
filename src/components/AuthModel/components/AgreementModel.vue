<script setup lang="ts">
import { ref, watch } from 'vue'
import { PolicyType } from '@/api/types/user'
import { getAgreement } from '@/api/user'

const props = defineProps({
  type: {
    type: String as PropType<PolicyType>,
    default: PolicyType.SERVICE_AGREEMENT,
  },
  title: {
    type: String,
    default: '用户协议',
  },
})

const emit = defineEmits(['agree'])

const show = defineModel({
  type: Boolean,
  default: false,
})

const loading = ref(false)
const error = ref('')
const content = ref('')

watch(
  () => show.value,
  (val) => {
    if (val)
      fetchAgreement()
  },
)

function handleAgree() {
  emit('agree')
  show.value = false
}

async function fetchAgreement() {
  loading.value = true
  error.value = ''
  content.value = ''
  try {
    const res = await getAgreement(props.type)
    console.log('getAgreement', res)

    // 假设返回数据结构为 { data: { content: '协议内容html' } }
    content.value = res?.data?.content || ''
    if (!content.value)
      error.value = '未获取到协议内容'
  }
  catch (e) {
    error.value = '获取协议失败，请稍后重试'
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <wd-popup
    v-model="show" closable :title="title"
    custom-style="border-radius: 20rpx; padding: 40rpx; height: 80vh; width: 80%;" @close="show = false"
  >
    <wd-loading v-if="loading" size="32" text="加载中..." />
    <view v-else-if="error" class="agreement-error">
      {{ error }}
    </view>
    <scroll-view v-else scroll-y style="max-height: 60vh;">
      <rich-text :nodes="content" />
    </scroll-view>
    <div class="fixed bottom-0 left-0 right-0 p-4">
      <wd-button type="primary" block @click="handleAgree">
        我已知晓
      </wd-button>
    </div>
  </wd-popup>
</template>

<style scoped>
.agreement-dialog {
  /* 可自定义弹窗样式 */
  padding: 20rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 0 10rpx 0 rgba(0, 0, 0, 0.1);
  width: 90%;
  margin: 0 auto;
  max-height: 80vh;
}

.agreement-error {
  color: #f56c6c;
  text-align: center;
  padding: 24rpx 0;
}
</style>
