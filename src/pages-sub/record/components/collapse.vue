<script setup lang="ts">
import type { IAssessmentResult } from '@/api/types/evaluation'
import dayjs from 'dayjs'
import { ref } from 'vue'
import { getLevelClass } from '@/api/types/evaluation'

defineProps<{
  info: IAssessmentResult
}>()

const emit = defineEmits<{
  (e: 'handleQuestionnaire', questionnaireId: number, assessmentId: number): void
}>()

// 当前展开的测评ID数组（用于折叠面板）
const expandedAssessments = ref<string[]>([])
</script>

<script lang="ts">
export default {
  options: {
    styleIsolation: 'shared',
  },
}
</script>

<template>
  <wd-collapse v-model="expandedAssessments">
    <wd-collapse-item :name="`item-${info.assessmentId}`">
      <template #title="{ expanded }">
        <view class="w-full flex items-center">
          <view class="flex-1">
            <view class="mb-2 flex items-center justify-between">
              <text class="text-base text-gray-800 font-medium">
                {{ info?.assessmentTitle }}
              </text>
              <wd-icon v-if="expanded" name="chevron-up" size="22px" color="#999" />
              <wd-icon v-else name="chevron-down" size="22px" color="#999" />
            </view>
            <!-- 进度条 -->
            <div class="mr-4 flex items-center gap-2 text-xs text-gray-400">
              <span class="whitespace-nowrap">完成进度</span>
              <div class="w-full flex items-center gap-3">
                <wd-progress
                  :percentage="Math.round((info.questionnaireResults.length / info.questionnaireCount) * 100)"
                  :color="info.questionnaireResults.length === info.questionnaireCount ? '#10B981' : '#3B82F6'"
                  hide-text
                />
                <span>{{ info.questionnaireResults.length }}/{{ info.questionnaireCount }}</span>
              </div>
            </div>
          </view>
        </view>
      </template>

      <!-- 问卷列表 -->
      <div
        v-for="questionnaire in info.questionnaireResults" :key="questionnaire.questionnaireId"
        class="collapse-item py-4 space-y-1" @click="emit('handleQuestionnaire', questionnaire.questionnaireId, info.assessmentId)"
      >
        <view class="flex flex-col gap-3">
          <view class="flex items-center justify-between">
            <text class="text-sm">
              {{ questionnaire.questionnaireTitle }}
            </text>
            <wd-tag type="success" size="small">
              已完成
            </wd-tag>
          </view>
          <view class="flex items-center gap-4 text-xs">
            <text class="text-gray-600">
              得分：<text class="text-gray-800">
                {{ questionnaire.score }}
              </text>
            </text>
            <text class="text-gray-600">
              等级：<text :class="getLevelClass(questionnaire.level, 'color')">
                {{ questionnaire.level }}
              </text>
            </text>
          </view>
          <text class="text-xs text-gray-400">
            完成时间：{{ dayjs(questionnaire.completedTime).format('YYYY-MM-DD HH:mm:ss') }}
          </text>
        </view>
      </div>
    </wd-collapse-item>
  </wd-collapse>
</template>

<style lang="scss" scoped>
:deep(.wd-collapse-item__body) {
  padding-top: 3px !important;
  padding-left: 28px !important;
  padding-right: 28px !important;
}

.collapse-item {
  border-bottom: 1px solid #e8e8e8;
}

.collapse-item:last-child {
  border-bottom: none;
}
</style>
