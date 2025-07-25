<route lang="json">
    {
      "layout": "default",
      "style": {
        "navigationBarTitleText": "问卷结果"
      }
    }
    </route>

<script setup lang="ts">
import type { IQuestionnaireResult } from '@/api/types/evaluation'
import { onMounted, ref } from 'vue'
import { getQuestionnaireResult } from '@/api/evaluation'

const props = defineProps<{
  id: number
}>()

const questionnaireResult = ref<IQuestionnaireResult>()

onMounted(async () => {
  if (!props.id) {
    uni.showToast({
      title: '缺少参数id',
      icon: 'none',
    })
    return
  }
  const res = await getQuestionnaireResult({ id: props.id })
  console.log('获取历史记录详情', res)
  const { code, data } = res
  if (code === 0) {
    questionnaireResult.value = data
  }
})
</script>

<template>
  <div class="mx-6 mt-4 pb-10" v-html="questionnaireResult?.report" />
</template>
