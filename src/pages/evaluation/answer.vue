<route lang="jsonc">
  {
    "style": {
      "navigationBarTitleText": "问卷答题",
      "navigationBarBackgroundColor": "#ffffff",
      "navigationBarTextStyle": "black"
    }
  }
</route>

<script setup lang="ts">
import { ref } from 'vue'

const link = ref('')

onLoad((options) => {
  if (options.link) {
    link.value = decodeURIComponent(options.link)
    console.log('link', link.value)
  }
})
</script>

<template>
  <web-view v-if="link" :src="link" />
  <view v-else class="h-screen flex items-center justify-center">
    <text class="text-gray-500">
      加载中...
    </text>
  </view>
</template>
