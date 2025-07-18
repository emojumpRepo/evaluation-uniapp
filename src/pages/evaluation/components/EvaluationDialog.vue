<script setup lang="ts">
import { computed, ref } from 'vue'

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', baby: any): void
}

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<Emits>()

// 宝宝数据列表
const babyList = [
  {
    id: 1,
    name: '智无',
    avatar: '/static/images/avatar.jpg',
    birthday: '2024-06-13',
    gender: '男',
  },
  {
    id: 2,
    name: '小明',
    avatar: '/static/images/default-avatar.png',
    birthday: '2024-03-15',
    gender: '女',
  },
  {
    id: 3,
    name: '小红',
    avatar: '/static/images/default-avatar.png',
    birthday: '2024-08-20',
    gender: '男',
  },
]

// 选中的宝宝ID
const selectedBabyId = ref<number>(1)

// 获取当前选中的宝宝
const selectedBaby = computed(() => {
  return babyList.find(baby => baby.id === selectedBabyId.value) || babyList[0]
})

// 选择宝宝
function selectBaby(babyId: number) {
  selectedBabyId.value = babyId
}

// 开始测评
function startEvaluation() {
  emit('confirm', selectedBaby.value)
  emit('update:visible', false)
}

// 关闭弹窗
function closeDialog() {
  emit('update:visible', false)
}
</script>

<template>
  <wd-popup
    :model-value="visible" position="center" closable :close-on-click-modal="true"
    custom-style="border-radius: 32rpx; width: 680rpx;" @close="closeDialog"
  >
    <div class="mx-6 my-8 overflow-hidden bg-white">
      <!-- 头部 -->
      <div class="mb-6 text-center">
        <!-- 标题 -->
        <text class="mb-2 block text-lg font-bold">
          请选择进行测评的宝宝
        </text>

        <!-- 副标题 -->
        <text class="block text-xs text-gray-400">
          请确保宝宝是清醒的准备好，以便老师做出更准确的判断
        </text>
      </div>

      <!-- 宝宝列表 -->
      <div class="mb-8 space-y-3">
        <div
          v-for="baby in babyList" :key="baby.id"
          class="relative flex items-center justify-between border rounded-md p-3 transition-all"
          :class="selectedBabyId === baby.id ? 'border-blue-5 bg-blue-1' : 'border-gray-2 bg-gray-1'"
          @click="selectBaby(baby.id)"
        >
          <div class="flex items-center">
            <!-- 头像 -->
            <div class="relative mr-4">
              <image :src="baby.avatar" class="h-12 w-12 rounded-full" mode="aspectFill" />
              <!-- 头像装饰 -->
              <div
                class="absolute right-50% h-4 w-4 center translate-x-1/2 rounded-full -bottom-2"
                :class="baby.gender === '女' ? 'bg-pink-4' : 'bg-blue-4'"
              >
                <text class="text-[8px] text-white">
                  {{ baby.gender === '女' ? '♀' : '♂' }}
                </text>
              </div>
            </div>

            <!-- 宝宝信息 -->
            <div class="flex flex-1 flex-col">
              <text class="mb-2 font-bold">
                {{ baby.name }}
              </text>
              <text class="text-sm text-gray-4 leading-tight">
                宝宝生日: {{ baby.birthday }}
              </text>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div
        class="w-full rounded-full py-2 text-center text-sm text-white transition-all"
        :class="selectedBabyId ? 'bg-orange-5' : 'bg-gray-3'"
        @click="startEvaluation"
      >
        开始测评
      </div>
    </div>
  </wd-popup>
</template>
