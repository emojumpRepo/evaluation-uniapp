<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useBabyStore } from '@/store/index'

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', baby: any): void
}

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<Emits>()

const babyStore = useBabyStore()
const { babyList, isLoading, error } = storeToRefs(babyStore)

// 选中的宝宝ID
const selectedBabyId = ref<number>(null)

// 获取当前选中的宝宝
const selectedBaby = computed(() => {
  return babyList.value.find(baby => baby.id === selectedBabyId.value)
})

// 当宝宝列表变化时，自动选中逻辑
watch(babyList, (newBabyList) => {
  if (newBabyList.length === 1) {
    // 如果只有一个宝宝，自动选中
    selectedBabyId.value = newBabyList[0].id
  }
  else if (newBabyList.length > 1 && !selectedBabyId.value) {
    // 如果有多个宝宝且当前没有选中，清空选择让用户自己选择
    selectedBabyId.value = null
  }
}, { immediate: true })

// 检查是否有宝宝
const hasBabies = computed(() => babyList.value.length > 0)

// 对话框状态
const dialogState = computed(() => {
  if (isLoading.value)
    return 'loading'
  if (error.value)
    return 'error'
  if (!hasBabies.value)
    return 'empty'
  return 'normal'
})

// 监听弹窗显示状态，自动刷新数据
watch(() => props.visible, async (newVisible) => {
  if (newVisible) {
    try {
      // 重置选择状态
      selectedBabyId.value = null
      await babyStore.getBabyListData()
    }
    catch (err) {
      console.error('Failed to refresh baby data:', err)
    }
  }
})

// 选择宝宝
function selectBaby(babyId: number) {
  selectedBabyId.value = babyId
}

// 开始测评
function startEvaluation() {
  if (!selectedBabyId.value || !selectedBaby.value) {
    uni.showToast({
      title: '请选择宝宝',
      icon: 'none',
    })
    return
  }
  emit('confirm', selectedBaby.value)
  closeDialog()
}

// 关闭弹窗
function closeDialog() {
  selectedBabyId.value = null
  emit('update:visible', false)
}
</script>

<template>
  <wd-popup
    :model-value="visible" position="center" closable :close-on-click-modal="true"
    custom-style="border-radius: 16rpx; width: 680rpx; max-width: 90vw;" @close="closeDialog"
  >
    <div class="rounded-lg bg-white">
      <!-- 加载状态 -->
      <div v-if="dialogState === 'loading'" class="flex flex-col items-center justify-center px-6 py-16">
        <div class="mb-4">
          <div class="h-8 w-8 animate-spin border-2 border-gray-300 border-t-blue-500 rounded-full" />
        </div>
        <text class="text-gray-600">
          正在加载...
        </text>
      </div>

      <!-- 空状态 -->
      <div v-else-if="dialogState === 'empty'" class="flex flex-col items-center justify-center px-6 py-16">
        <div class="mb-6">
          <text class="text-4xl">
            👶
          </text>
        </div>
        <text class="mb-2 text-lg text-gray-800 font-medium">
          还没有宝宝信息
        </text>
        <text class="mb-8 text-center text-sm text-gray-500">
          需要先添加宝宝信息才能进行测评
        </text>
        <button class="w-full rounded-lg bg-blue-500 py-3 text-center text-white" @click="navigateToBabyManagement">
          添加宝宝
        </button>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="dialogState === 'error'" class="flex flex-col items-center justify-center px-6 py-16">
        <div class="mb-6">
          <text class="text-4xl">
            😕
          </text>
        </div>
        <text class="mb-2 text-lg text-gray-800 font-medium">
          加载失败
        </text>
        <text class="mb-8 text-center text-sm text-gray-500">
          {{ error || '请检查网络连接' }}
        </text>
        <button class="w-full rounded-lg bg-blue-500 py-3 text-center text-white" @click="babyStore.getBabyListData">
          重试
        </button>
      </div>

      <!-- 正常状态 -->
      <div v-else class="p-6">
        <!-- 标题 -->
        <div class="mb-6 text-center">
          <text class="text-lg text-gray-800 font-medium">
            选择宝宝进行测评
          </text>
          <text class="mt-1 block text-sm text-gray-500">
            {{ babyList.length === 1 ? '已自动选择宝宝' : '请选择要进行测评的宝宝' }}
          </text>
        </div>

        <!-- 宝宝列表 -->
        <div class="mb-6 space-y-3">
          <div
            v-for="baby in babyList" :key="baby.id" class="flex items-center border rounded-lg p-3 transition-colors"
            :class="selectedBabyId === baby.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
            @click="selectBaby(baby.id)"
          >
            <div class="flex flex-1 items-center">
              <!-- 头像 -->
              <div class="relative mr-3">
                <image :src="baby.avatar" class="h-12 w-12 rounded-full" mode="aspectFill" />
                <!-- 性别标识 -->
                <div
                  class="absolute h-5 w-5 flex items-center justify-center rounded-full text-xs text-white -bottom-1 -right-1"
                  :class="baby.gender === 2 ? 'bg-pink-400' : 'bg-blue-400'"
                >
                  {{ baby.gender === 2 ? '♀' : '♂' }}
                </div>
              </div>

              <!-- 宝宝信息 -->
              <div class="flex-1">
                <text class="block text-base text-gray-800 font-medium">
                  {{ baby.name }}
                </text>
                <text class="text-sm text-gray-500">
                  {{ baby.birthday }}
                </text>
              </div>

              <!-- 选中状态 -->
              <div v-if="selectedBabyId === baby.id" class="ml-3 flex flex-col items-end">
                <div class="h-5 w-5 flex items-center justify-center rounded-full bg-blue-500">
                  <text class="text-xs text-white">
                    ✓
                  </text>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 开始按钮 -->
        <button
          class="w-full rounded-lg py-2.5 text-center text-sm text-white transition-colors"
          :class="selectedBabyId ? 'bg-blue-500' : 'bg-gray-300'" :disabled="!selectedBabyId" @click="startEvaluation"
        >
          {{ babyList.length === 1 ? '开始测评' : (selectedBabyId ? '开始测评' : '请先选择宝宝') }}
        </button>
      </div>
    </div>
  </wd-popup>
</template>
