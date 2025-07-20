<script setup lang="ts">
import { ref } from 'vue'

const svgPlaceholder
  = 'data:image/svg+xml;utf8,<svg width="400" height="176" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="176" rx="24" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="20">无封面</text></svg>'

const questionnaires = ref([
  {
    id: 1024,
    title: '儿童发展问卷',
    description: '这是一个关于儿童发展的问题问卷',
    link: 'https://example.com/questionnaire/1024',
    estimatedDuration: 15,
    accessCount: 100,
    isPopular: true,
    cover: '/static/images/avatar.jpg',
  },
  {
    id: 1025,
    title: '健康生活调查',
    description: '关注您的健康生活方式，欢迎参与本问卷。',
    link: 'https://example.com/questionnaire/1025',
    estimatedDuration: 10,
    accessCount: 80,
    isPopular: false,
    cover: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 1026,
    title: '心理健康评估',
    description: '帮助您了解自身心理健康状况。',
    link: 'https://example.com/questionnaire/1026',
    estimatedDuration: 20,
    accessCount: 150,
    isPopular: true,
    cover: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  },
])

function goToDetail(link: string) {
  window.open(link, '_blank')
}
</script>

<template>
  <div class="min-h-screen from-blue-50 via-white to-pink-50 bg-gradient-to-br p-6">
    <div class="flex flex-wrap justify-center gap-6">
      <div
        v-for="item in questionnaires"
        :key="item.id"
        class="relative w-full flex flex-col overflow-hidden rounded-2xl from-white to-gray-50 bg-gradient-to-b shadow-xl transition-all duration-300 lg:w-1/4 md:w-96 sm:w-80 hover:scale-105 hover:shadow-2xl"
      >
        <div class="relative">
          <img
            :src="item.cover"
            alt="封面"
            class="h-44 w-full border-b border-gray-200 rounded-t-2xl bg-gray-100 object-cover"
            @error="e => e.target.src = svgPlaceholder"
          >
          <span v-if="item.isPopular" class="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full from-pink-500 to-yellow-400 bg-gradient-to-r px-2 py-0.5 text-sm text-white font-semibold ring-2 ring-white drop-shadow">
            <span>🔥</span>热门
          </span>
        </div>
        <div class="flex flex-1 flex-col gap-2 p-5">
          <div class="truncate from-blue-600 to-indigo-500 bg-gradient-to-r bg-clip-text text-xl text-transparent font-bold">
            {{ item.title }}
          </div>
          <div class="line-clamp-2 text-sm text-gray-600">
            {{ item.description }}
          </div>
          <div class="my-2 border-t border-gray-100" />
          <div class="mt-1 flex items-center gap-6 text-xs text-gray-400">
            <span class="flex items-center gap-1"><span>⏱️</span>预计时长：{{ item.estimatedDuration }}分钟</span>
            <span class="flex items-center gap-1"><span>👁️</span>访问次数：{{ item.accessCount }}</span>
          </div>
        </div>
        <div class="border-t border-gray-100" />
        <div class="flex justify-end p-5 pt-3">
          <button
            class="flex items-center gap-1 rounded-full from-blue-500 to-indigo-500 bg-gradient-to-r px-5 py-1.5 text-white font-semibold shadow transition-all duration-200 hover:scale-105 hover:brightness-110"
            @click="goToDetail(item.link)"
          >
            查看详情 <span>→</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
