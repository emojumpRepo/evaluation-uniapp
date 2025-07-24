<route lang="json">
    {
      "layout": "default",
      "style": {
        "navigationBarTitleText": "测评记录"
      }
    }
    </route>

<script setup lang="ts">
import type { IBabyInfo } from '@/api/types/baby'
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useBabyStore } from '@/store/index'

// 问卷记录接口定义
interface IQuestionnaireRecord {
  id: number
  questionnaireId: number
  title: string
  description: string
  totalQuestions: number
  answeredQuestions: number
  score?: number
  level?: string
  completeTime?: string
  status: 'completed' | 'in-progress' | 'not-started'
  category: string
  ageRange: string
  estimatedTime: number
}

// 测评主题接口定义
interface IEvaluationTheme {
  id: number
  title: string
  description: string
  icon: string
  color: string
  totalQuestionnaires: number
  completedQuestionnaires: number
  questionnaires: IQuestionnaireRecord[]
}

const babyStore = useBabyStore()
const { babyList } = storeToRefs(babyStore)

// 当前选中的宝宝
const selectedBabyId = ref<number | null>(null)
// 测评主题列表
const themeList = ref<IEvaluationTheme[]>([])
// 加载状态
const loading = ref(false)
// 是否显示宝宝选择器
const showBabyPicker = ref(false)
// 当前展开的主题ID
const expandedThemeId = ref<number | null>(null)

// 当前选中的宝宝信息
const selectedBaby = computed(() => {
  return babyList.value.find(baby => baby.id === selectedBabyId.value)
})

// 筛选后的主题列表（根据宝宝年龄，只显示已完成的问卷）
const filteredThemes = computed(() => {
  if (!selectedBaby.value)
    return themeList.value

  // 根据宝宝年龄筛选适合的测评主题，并且只显示已完成的问卷
  const babyAge = calculateAge(selectedBaby.value.birthday)
  return themeList.value.map(theme => ({
    ...theme,
    questionnaires: theme.questionnaires.filter(q =>
      isAgeAppropriate(q.ageRange, babyAge) && q.status === 'completed',
    ),
  })).filter(theme => theme.questionnaires.length > 0)
})

// 统计信息
const statistics = computed(() => {
  const themes = filteredThemes.value
  const totalQuestionnaires = themes.reduce((sum, theme) => sum + theme.questionnaires.length, 0)
  const completedQuestionnaires = themes.reduce((sum, theme) =>
    sum + theme.questionnaires.filter(q => q.status === 'completed').length, 0)
  const inProgressQuestionnaires = themes.reduce((sum, theme) =>
    sum + theme.questionnaires.filter(q => q.status === 'in-progress').length, 0)

  return {
    totalQuestionnaires,
    completedQuestionnaires,
    inProgressQuestionnaires,
    completionRate: totalQuestionnaires > 0 ? Math.round((completedQuestionnaires / totalQuestionnaires) * 100) : 0,
  }
})

// 计算年龄（月数）
function calculateAge(birthday: string): number {
  const birth = new Date(birthday)
  const now = new Date()
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  return months
}

// 判断年龄是否适合
function isAgeAppropriate(ageRange: string, babyAge: number): boolean {
  const [min, max] = ageRange.split('-').map(age => Number.parseInt(age.replace('个月', '')))
  return babyAge >= min && babyAge <= max
}

// 获取测评主题和问卷记录
async function getEvaluationThemes() {
  loading.value = true
  try {
    // 模拟API调用 - 实际项目中替换为真实API
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟数据 - 测评主题和问卷记录
    themeList.value = [
      {
        id: 1,
        title: '语言发展测评',
        description: '评估宝宝的语言理解和表达能力',
        icon: '💬',
        color: 'bg-blue-500',
        totalQuestionnaires: 3,
        completedQuestionnaires: 3,
        questionnaires: [
          {
            id: 101,
            questionnaireId: 1,
            title: '语言理解能力问卷',
            description: '评估宝宝对语言的理解程度',
            totalQuestions: 15,
            answeredQuestions: 15,
            score: 85,
            level: '良好',
            completeTime: '2024-01-15 14:30',
            status: 'completed',
            category: '语言发展',
            ageRange: '12-24个月',
            estimatedTime: 10,
          },
          {
            id: 102,
            questionnaireId: 2,
            title: '语言表达能力问卷',
            description: '评估宝宝的语言表达和沟通能力',
            totalQuestions: 12,
            answeredQuestions: 12,
            score: 78,
            level: '良好',
            completeTime: '2024-01-16 10:20',
            status: 'completed',
            category: '语言发展',
            ageRange: '12-36个月',
            estimatedTime: 8,
          },
          {
            id: 103,
            questionnaireId: 3,
            title: '词汇量评估问卷',
            description: '评估宝宝的词汇掌握情况',
            totalQuestions: 20,
            answeredQuestions: 20,
            score: 88,
            level: '良好',
            completeTime: '2024-01-18 16:45',
            status: 'completed',
            category: '语言发展',
            ageRange: '18-36个月',
            estimatedTime: 15,
          },
        ],
      },
      {
        id: 2,
        title: '运动能力测评',
        description: '评估宝宝的大运动和精细运动发展',
        icon: '🏃',
        color: 'bg-green-500',
        totalQuestionnaires: 2,
        completedQuestionnaires: 2,
        questionnaires: [
          {
            id: 201,
            questionnaireId: 4,
            title: '大运动发展问卷',
            description: '评估宝宝的大肌肉群运动能力',
            totalQuestions: 18,
            answeredQuestions: 18,
            score: 92,
            level: '优秀',
            completeTime: '2024-01-10 10:15',
            status: 'completed',
            category: '运动能力',
            ageRange: '6-24个月',
            estimatedTime: 12,
          },
          {
            id: 202,
            questionnaireId: 5,
            title: '精细运动发展问卷',
            description: '评估宝宝的手部精细动作能力',
            totalQuestions: 16,
            answeredQuestions: 16,
            score: 86,
            level: '良好',
            completeTime: '2024-01-12 14:20',
            status: 'completed',
            category: '运动能力',
            ageRange: '12-36个月',
            estimatedTime: 10,
          },
        ],
      },
      {
        id: 3,
        title: '认知能力测评',
        description: '评估宝宝的认知发展和学习能力',
        icon: '🧠',
        color: 'bg-purple-500',
        totalQuestionnaires: 2,
        completedQuestionnaires: 2,
        questionnaires: [
          {
            id: 301,
            questionnaireId: 6,
            title: '注意力发展问卷',
            description: '评估宝宝的注意力集中程度',
            totalQuestions: 14,
            answeredQuestions: 14,
            score: 75,
            level: '良好',
            completeTime: '2024-01-08 11:30',
            status: 'completed',
            category: '认知能力',
            ageRange: '12-30个月',
            estimatedTime: 8,
          },
          {
            id: 302,
            questionnaireId: 7,
            title: '记忆能力问卷',
            description: '评估宝宝的记忆和学习能力',
            totalQuestions: 16,
            answeredQuestions: 16,
            score: 82,
            level: '良好',
            completeTime: '2024-01-14 09:15',
            status: 'completed',
            category: '认知能力',
            ageRange: '18-36个月',
            estimatedTime: 12,
          },
        ],
      },
      {
        id: 4,
        title: '社交情感测评',
        description: '评估宝宝的社交技能和情感发展',
        icon: '😊',
        color: 'bg-pink-500',
        totalQuestionnaires: 1,
        completedQuestionnaires: 1,
        questionnaires: [
          {
            id: 401,
            questionnaireId: 9,
            title: '社交互动问卷',
            description: '评估宝宝与他人的互动能力',
            totalQuestions: 15,
            answeredQuestions: 15,
            score: 90,
            level: '优秀',
            completeTime: '2024-01-05 15:45',
            status: 'completed',
            category: '社交情感',
            ageRange: '6-24个月',
            estimatedTime: 10,
          },
        ],
      },
    ]
  }
  catch (error) {
    console.error('获取测评主题失败:', error)
    uni.showToast({
      title: '获取数据失败',
      icon: 'none',
    })
  }
  finally {
    loading.value = false
  }
}

// 选择宝宝
function selectBaby(baby: IBabyInfo) {
  selectedBabyId.value = baby.id || null
  showBabyPicker.value = false
}

// 切换主题展开状态
function toggleTheme(themeId: number) {
  expandedThemeId.value = expandedThemeId.value === themeId ? null : themeId
}

// 查看问卷结果
function handleQuestionnaire(questionnaire: IQuestionnaireRecord) {
  // 只有已完成的问卷，直接查看结果
  uni.navigateTo({
    url: `/pages-sub/record/questionnaire-result?id=${questionnaire.id}`,
  })
}

// 获取状态标签样式
function getStatusClass(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-600'
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-600'
    case 'not-started':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

// 获取状态文本
function getStatusText(status: string) {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'in-progress':
      return '进行中'
    case 'not-started':
      return '未开始'
    default:
      return '未知'
  }
}

// 获取等级颜色
function getLevelColor(level: string) {
  switch (level) {
    case '优秀':
      return 'text-green-600'
    case '良好':
      return 'text-blue-600'
    case '一般':
      return 'text-yellow-600'
    case '需改进':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

onMounted(async () => {
  // 获取宝宝列表
  await babyStore.getBabyListData()

  // 如果有宝宝，默认选择第一个
  if (babyList.value.length > 0) {
    selectedBabyId.value = babyList.value[0].id || null
  }

  // 获取测评主题和问卷记录
  await getEvaluationThemes()
})
</script>

<template>
  <view class="min-h-screen bg-gray-50">
    <!-- 宝宝选择器 -->
    <view class="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
      <view class="flex items-center justify-between">
        <text class="text-gray-800">
          选择宝宝
        </text>
        <view
          class="flex items-center rounded-lg bg-blue-50 px-3 py-2 active:bg-blue-100"
          @click="showBabyPicker = true"
        >
          <image
            v-if="selectedBaby?.avatar"
            class="mr-2 h-6 w-6 rounded-full"
            :src="selectedBaby.avatar"
            mode="aspectFill"
          />
          <text class="mr-2 text-sm text-blue-600 font-medium">
            {{ selectedBaby?.name || '选择宝宝' }}
          </text>
          <wd-icon name="arrow-down" color="#2563EB" size="16px" />
        </view>
      </view>
    </view>

    <!-- 测评主题列表 -->
    <view class="mt-4 px-4 pb-4">
      <!-- 加载状态 -->
      <view v-if="loading" class="center py-20">
        <wd-loading />
      </view>

      <!-- 空状态 -->
      <view v-else-if="filteredThemes.length === 0" class="center flex-col py-20">
        <wd-icon name="file-text" color="#D1D5DB" size="48px" />
        <text class="mt-4 text-base text-gray-500">
          暂无已完成的测评记录
        </text>
        <text class="mt-1 text-sm text-gray-400">
          请选择宝宝查看已完成的测评记录
        </text>
      </view>

      <!-- 测评主题卡片 -->
      <view v-else class="flex flex-col gap-4">
        <view
          v-for="theme in filteredThemes"
          :key="theme.id"
          class="overflow-hidden rounded-xl bg-white shadow-sm"
        >
          <!-- 主题头部 -->
          <view
            class="flex items-center p-4 active:bg-gray-50"
            @click="toggleTheme(theme.id)"
          >
            <view class="mr-3 h-12 w-12 flex items-center justify-center rounded-full text-xl text-white" :class="theme.color">
              {{ theme.icon }}
            </view>
            <view class="flex-1">
              <view class="mb-1 flex items-center justify-between">
                <text class="text-base text-gray-800 font-medium">
                  {{ theme.title }}
                </text>
                <text class="text-xs text-gray-400">
                  {{ theme.completedQuestionnaires }}/{{ theme.totalQuestionnaires }}
                </text>
              </view>
              <text class="mb-2 block text-sm text-gray-500">
                {{ theme.description }}
              </text>
              <view class="flex items-center">
                <view class="mr-2 h-1.5 flex-1 rounded-full bg-gray-200">
                  <view
                    class="h-1.5 rounded-full transition-all"
                    :class="theme.completedQuestionnaires === theme.totalQuestionnaires ? 'bg-green-500' : 'bg-blue-500'"
                    :style="{ width: `${(theme.completedQuestionnaires / theme.totalQuestionnaires) * 100}%` }"
                  />
                </view>
                <text class="text-xs text-gray-400">
                  {{ Math.round((theme.completedQuestionnaires / theme.totalQuestionnaires) * 100) }}%
                </text>
              </view>
            </view>
            <view class="ml-3">
              <wd-icon
                :name="expandedThemeId === theme.id ? 'arrow-up' : 'arrow-down'"
                color="#9CA3AF"
                size="16px"
              />
            </view>
          </view>

          <!-- 问卷列表 -->
          <view v-if="expandedThemeId === theme.id" class="border-t border-gray-100">
            <view
              v-for="questionnaire in theme.questionnaires"
              :key="questionnaire.id"
              class="border-b border-gray-50 p-4 last:border-b-0 active:bg-gray-50"
              @click="handleQuestionnaire(questionnaire)"
            >
              <view class="flex items-start">
                <view class="flex-1">
                  <view class="mb-2 flex items-center justify-between">
                    <text class="text-sm text-gray-800 font-medium">
                      {{ questionnaire.title }}
                    </text>
                    <view
                      class="rounded-full px-2 py-1 text-xs"
                      :class="getStatusClass(questionnaire.status)"
                    >
                      {{ getStatusText(questionnaire.status) }}
                    </view>
                  </view>

                  <text class="mb-2 text-xs text-gray-500">
                    {{ questionnaire.description }}
                  </text>

                  <view class="flex items-center text-xs text-gray-400">
                    <text class="mr-4">
                      {{ questionnaire.ageRange }}
                    </text>
                    <text class="mr-4">
                      约{{ questionnaire.estimatedTime }}分钟
                    </text>
                    <text>{{ questionnaire.totalQuestions }}题</text>
                  </view>

                  <!-- 完成状态信息 -->
                  <view class="mt-2">
                    <view class="flex items-center text-xs">
                      <text class="mr-4 text-gray-600">
                        得分: <text class="text-gray-800 font-medium">
                          {{ questionnaire.score }}
                        </text>
                      </text>
                      <text class="text-gray-600">
                        等级: <text class="font-medium" :class="getLevelColor(questionnaire.level!)">
                          {{ questionnaire.level }}
                        </text>
                      </text>
                    </view>
                    <text class="mt-1 text-xs text-gray-400">
                      完成时间: {{ questionnaire.completeTime }}
                    </text>
                  </view>
                </view>

                <!-- 箭头图标 -->
                <view class="ml-2 flex-shrink-0">
                  <wd-icon name="arrow-right" color="#D1D5DB" size="14px" />
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 宝宝选择弹窗 -->
    <wd-popup v-model="showBabyPicker" position="bottom" :safe-area-inset-bottom="true">
      <view class="bg-white px-4 py-6">
        <view class="mb-4 text-center text-lg text-gray-800 font-medium">
          选择宝宝
        </view>

        <view class="flex flex-col gap-3">
          <view
            v-for="baby in babyList"
            :key="baby.id"
            class="flex items-center border border-gray-200 rounded-lg p-3"
            :class="{ 'border-blue-500 bg-blue-50': selectedBabyId === baby.id }"
            @click="selectBaby(baby)"
          >
            <image
              class="mr-3 h-10 w-10 rounded-full"
              :src="baby.avatar || 'https://via.placeholder.com/40x40/E5E7EB/9CA3AF?text=👶'"
              mode="aspectFill"
            />
            <view class="flex-1">
              <text class="text-base text-gray-800 font-medium">
                {{ baby.name }}
              </text>
              <text class="block text-sm text-gray-500">
                生日: {{ baby.birthday }}
              </text>
            </view>
            <wd-icon
              v-if="selectedBabyId === baby.id"
              name="check"
              color="#3B82F6"
              size="20px"
            />
          </view>
        </view>

        <view class="mt-6">
          <wd-button type="primary" block @click="showBabyPicker = false">
            确定
          </wd-button>
        </view>
      </view>
    </wd-popup>
  </view>
</template>
