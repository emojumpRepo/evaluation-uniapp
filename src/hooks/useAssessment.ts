import { computed, ref } from 'vue'

// ==================== 类型定义 ====================
export interface Question {
  questionText: string
  questionDescription: string
  pictureUrl: string | string[]
  videoUrl?: string
}

export interface MonthQuestion {
  targetMonth: string
  questions: Question[]
}

export interface Schema {
  questionnaireTitle: string
  questionnaireType: string
  questions: MonthQuestion[]
}

export interface AssessmentResult {
  questionnaireTitle: string
  answers: Record<number, Record<number, boolean>>
  highestPassedMonth: string | null
  lowestFailedMonth: string | null
  finalResultMonth: string | null
  assessmentLevel: string
  completedAt: string
  isRetreating: boolean
  retreatStartMonth: string | null
}

export interface MonthStatus {
  isCompleted: boolean
  hasFailed: boolean
  isAnswered: boolean
}

export interface FormattedAnswer {
  title: string
  answer: string
  index: number
}

// ==================== 常量配置 ====================
const ASSESSMENT_LEVELS = {
  EXCELLENT: '优秀',
  NORMAL: '正常',
  MILD_DELAY: '轻度延迟',
  NEED_EVALUATION: '需要进一步评估',
} as const

const CONSECUTIVE_PASS_REQUIRED = 2

// ==================== Composable ====================
export function useAssessment() {
  // ==================== 响应式状态 ====================
  const schema = ref<Schema | null>(null)
  const currentMonthIndex = ref(0)
  const currentQuestionIndex = ref(0)
  const isCompleted = ref(false)
  const resultData = ref<AssessmentResult | null>(null)
  const maxTestMonth = ref(42)

  // 答案记录：Record<月龄索引, Record<题目索引, boolean>>
  const answers = ref<Record<number, Record<number, boolean>>>({})

  // 回退状态
  const isRetreating = ref(false)
  const retreatStartMonth = ref(-1)

  // ==================== 计算属性 ====================
  const currentQuestion = computed(() => {
    if (!schema.value?.questions?.[currentMonthIndex.value]?.questions) {
      return null
    }
    return schema.value.questions[currentMonthIndex.value].questions[currentQuestionIndex.value] || null
  })

  const currentMonth = computed(() => {
    return schema.value?.questions?.[currentMonthIndex.value]?.targetMonth || ''
  })

  const totalQuestions = computed(() => {
    if (!schema.value?.questions)
      return 0
    return schema.value.questions.reduce((sum, month) =>
      Array.isArray(month.questions) ? sum + month.questions.length : sum, 0)
  })

  const currentFlatIndex = computed(() => {
    if (!schema.value?.questions)
      return 1

    let idx = 0
    for (let i = 0; i < currentMonthIndex.value; i++) {
      if (Array.isArray(schema.value.questions[i].questions)) {
        idx += schema.value.questions[i].questions.length
      }
    }
    return idx + currentQuestionIndex.value + 1
  })

  // ==================== 工具函数 ====================
  /**
   * 获取指定月龄的答案记录
   */
  function getMonthAnswers(monthIndex: number): Record<number, boolean> {
    return answers.value[monthIndex] || {}
  }

  /**
   * 检查指定月龄的所有题目是否都已完成
   */
  function isMonthCompleted(monthIndex: number): boolean {
    const monthObj = schema.value?.questions?.[monthIndex]
    if (!monthObj?.questions)
      return false

    const monthAnswers = getMonthAnswers(monthIndex)

    // 检查是否所有题目都已回答
    const allAnswered = monthObj.questions.every((_, questionIndex) => monthAnswers[questionIndex] !== undefined)
    if (!allAnswered) {
      return false
    }

    // 检查是否所有题目都是"能做到"
    return monthObj.questions.every((_, questionIndex) => monthAnswers[questionIndex] === true)
  }

  /**
   * 检查指定月龄是否有任何题目失败
   */
  function hasMonthFailed(monthIndex: number): boolean {
    const monthObj = schema.value?.questions?.[monthIndex]
    if (!monthObj?.questions)
      return false

    const monthAnswers = getMonthAnswers(monthIndex)

    // 检查是否所有题目都已回答
    const allAnswered = monthObj.questions.every((_, questionIndex) => monthAnswers[questionIndex] !== undefined)
    if (!allAnswered) {
      return false
    }

    // 只有当所有题目都回答后，才检查是否有失败
    return monthObj.questions.some((_, questionIndex) => monthAnswers[questionIndex] === false)
  }

  /**
   * 检查指定月龄是否所有题目都已回答
   */
  function isMonthAnswered(monthIndex: number): boolean {
    const monthObj = schema.value?.questions?.[monthIndex]
    if (!monthObj?.questions)
      return false

    const monthAnswers = getMonthAnswers(monthIndex)
    return monthObj.questions.every((_, questionIndex) => monthAnswers[questionIndex] !== undefined)
  }

  /**
   * 检查是否超过最高测试月龄
   */
  function isExceedMaxTestMonth(monthIndex: number): boolean {
    if (!schema.value?.questions?.[monthIndex])
      return false

    const monthValue = Number.parseInt(schema.value.questions[monthIndex].targetMonth)
    return monthValue > maxTestMonth.value
  }

  // ==================== 测评逻辑函数 ====================
  /**
   * 获取下一个需要测试的月龄
   */
  function getNextMonthToTest(): number | null {
    if (!schema.value?.questions)
      return null

    if (isRetreating.value) {
      return handleRetreatMode()
    }

    return handleNormalMode()
  }

  /**
   * 处理回退模式逻辑
   */
  function handleRetreatMode(): number | null {
    if (isMonthCompleted(currentMonthIndex.value)) {
      const retreatResult = checkRetreatCompletion()
      if (retreatResult === null) {
        return null
      }
      return retreatResult
    }
    else {
      const nextRetreatMonth = currentMonthIndex.value - 1
      if (nextRetreatMonth >= 0) {
        return nextRetreatMonth
      }
      else {
        return null
      }
    }
  }

  /**
   * 处理正常模式逻辑
   */
  function handleNormalMode(): number | null {
    const nextHigherMonth = currentMonthIndex.value + 1

    if (nextHigherMonth < schema.value!.questions.length) {
      if (isExceedMaxTestMonth(nextHigherMonth)) {
        return null
      }

      if (!isMonthAnswered(nextHigherMonth)) {
        return nextHigherMonth
      }
    }

    return null
  }

  /**
   * 检查回退是否完成
   */
  function checkRetreatCompletion(): number | null {
    if (!schema.value?.questions)
      return null

    const { startMonth, endMonth } = getRetreatCheckRange()

    const consecutiveResult = checkConsecutivePassedMonths(startMonth, endMonth)
    if (consecutiveResult) {
      return null // 找到连续通过，结束测评
    }

    return getNextRetreatMonth()
  }

  /**
   * 获取回退检查范围
   */
  function getRetreatCheckRange() {
    const startMonth = Math.max(retreatStartMonth.value, currentMonthIndex.value)
    const endMonth = Math.min(retreatStartMonth.value, currentMonthIndex.value)
    return { startMonth, endMonth }
  }

  /**
   * 检查连续通过的月龄
   */
  function checkConsecutivePassedMonths(startMonth: number, endMonth: number): boolean {
    let consecutivePassed = 0

    for (let i = startMonth; i >= endMonth; i--) {
      if (isMonthCompleted(i)) {
        consecutivePassed++
        if (consecutivePassed >= CONSECUTIVE_PASS_REQUIRED) {
          return true
        }
      }
      else if (hasMonthFailed(i)) {
        consecutivePassed = 0
      }
      else if (!isMonthAnswered(i)) {
        continue
      }
    }

    return false
  }

  /**
   * 获取下一个回退月龄
   */
  function getNextRetreatMonth(): number | null {
    const nextRetreatMonth = currentMonthIndex.value - 1
    if (nextRetreatMonth >= 0) {
      return nextRetreatMonth
    }
    return null
  }

  /**
   * 获取评估等级
   */
  function getAssessmentLevel(highestPassed: number, lowestFailed: number): string {
    if (highestPassed === -1) {
      return ASSESSMENT_LEVELS.NEED_EVALUATION
    }

    if (lowestFailed === schema.value!.questions.length) {
      return ASSESSMENT_LEVELS.EXCELLENT
    }

    const gap = lowestFailed - highestPassed
    if (gap <= 1) {
      return ASSESSMENT_LEVELS.NORMAL
    }
    else if (gap <= 2) {
      return ASSESSMENT_LEVELS.MILD_DELAY
    }
    else {
      return ASSESSMENT_LEVELS.NEED_EVALUATION
    }
  }

  /**
   * 计算测评结果
   */
  function calculateResult(): AssessmentResult | null {
    if (!schema.value?.questions)
      return null

    const { highestPassedMonth, lowestFailedMonth } = findPassedAndFailedMonths()
    const finalResultMonth = calculateFinalResultMonth(highestPassedMonth)

    return {
      questionnaireTitle: schema.value.questionnaireTitle,
      answers: answers.value,
      highestPassedMonth: getMonthString(highestPassedMonth),
      lowestFailedMonth: getMonthString(lowestFailedMonth),
      finalResultMonth: getMonthString(finalResultMonth),
      assessmentLevel: getAssessmentLevel(finalResultMonth, lowestFailedMonth),
      completedAt: new Date().toISOString(),
      isRetreating: isRetreating.value,
      retreatStartMonth: getMonthString(retreatStartMonth.value),
    }
  }

  /**
   * 找到最高通过和最低失败的月龄
   */
  function findPassedAndFailedMonths() {
    let highestPassedMonth = -1
    let lowestFailedMonth = schema.value!.questions.length

    // 找到最高通过的月龄
    for (let i = 0; i < schema.value!.questions.length; i++) {
      if (isMonthCompleted(i)) {
        highestPassedMonth = i
      }
    }

    // 找到最低失败的月龄
    for (let i = 0; i < schema.value!.questions.length; i++) {
      if (hasMonthFailed(i)) {
        lowestFailedMonth = i
        break
      }
    }

    return { highestPassedMonth, lowestFailedMonth }
  }

  /**
   * 计算最终结果月龄
   */
  function calculateFinalResultMonth(highestPassedMonth: number): number {
    let finalResultMonth = highestPassedMonth

    if (isRetreating.value && retreatStartMonth.value >= 0) {
      const consecutiveResult = findConsecutivePassedInRetreat()
      if (consecutiveResult !== -1) {
        finalResultMonth = consecutiveResult
      }
    }

    return finalResultMonth
  }

  /**
   * 在回退模式中找到连续通过的两个月龄中的较低月龄
   */
  function findConsecutivePassedInRetreat(): number {
    let consecutivePassed = 0
    let lastConsecutiveMonth = -1

    for (let i = retreatStartMonth.value; i >= 0; i--) {
      if (isMonthCompleted(i)) {
        consecutivePassed++
        if (consecutivePassed === 1) {
          lastConsecutiveMonth = i
        }
        if (consecutivePassed >= CONSECUTIVE_PASS_REQUIRED) {
          return lastConsecutiveMonth
        }
      }
      else if (hasMonthFailed(i)) {
        consecutivePassed = 0
        lastConsecutiveMonth = -1
      }
    }

    return -1
  }

  /**
   * 获取月龄字符串表示
   */
  function getMonthString(monthIndex: number): string | null {
    if (monthIndex < 0 || !schema.value?.questions?.[monthIndex]) {
      return null
    }
    return schema.value.questions[monthIndex].targetMonth
  }

  // ==================== 主要业务函数 ====================
  /**
   * 处理答案并决定下一步
   */
  function handleAnswer(canDo: boolean) {
    // 如果测评已经完成，不再处理答案
    if (isCompleted.value) {
      return
    }

    if (!schema.value?.questions)
      return

    recordAnswer(canDo)

    const monthObj = schema.value.questions[currentMonthIndex.value]
    if (!monthObj?.questions)
      return

    const monthStatus = getCurrentMonthStatus()

    if (monthStatus.isAnswered) {
      handleCompletedMonth(canDo, monthStatus)
    }
    else {
      handleIncompleteMonth(canDo, monthObj)
    }
  }

  /**
   * 记录答案
   */
  function recordAnswer(canDo: boolean) {
    if (!answers.value[currentMonthIndex.value]) {
      answers.value[currentMonthIndex.value] = {}
    }
    answers.value[currentMonthIndex.value][currentQuestionIndex.value] = canDo
  }

  /**
   * 获取当前月龄状态
   */
  function getCurrentMonthStatus(): MonthStatus {
    return {
      isCompleted: isMonthCompleted(currentMonthIndex.value),
      hasFailed: hasMonthFailed(currentMonthIndex.value),
      isAnswered: isMonthAnswered(currentMonthIndex.value),
    }
  }

  /**
   * 处理已完成的月龄
   */
  function handleCompletedMonth(canDo: boolean, monthStatus: MonthStatus) {
    if (canDo && monthStatus.isCompleted) {
      if (isRetreating.value) {
        handleRetreatModeCompletion()
      }
      else {
        handleNormalModeCompletion()
      }
    }
    else if (canDo) {
      // 选择"能做到"但月龄未完成，继续下一题
      // 重新检查月龄状态，因为答案可能已经更新
      const updatedMonthStatus = getCurrentMonthStatus()
      if (updatedMonthStatus.isCompleted) {
        if (isRetreating.value) {
          handleRetreatModeCompletion()
        }
        else {
          handleNormalModeCompletion()
        }
      }
      else {
        // 这里需要调用 handleIncompleteMonth 的逻辑
        const monthObj = schema.value!.questions[currentMonthIndex.value]
        if (currentQuestionIndex.value < monthObj.questions.length - 1) {
          currentQuestionIndex.value++
        }
        else {
          handleLastQuestionOfMonth(canDo)
        }
      }
    }
    else if (!canDo) {
      handleMonthFailure()
    }
  }

  /**
   * 处理回退模式完成
   */
  function handleRetreatModeCompletion() {
    const retreatResult = checkRetreatCompletion()

    if (retreatResult === null) {
      completeAssessment()
    }
    else {
      navigateToMonth(retreatResult)
    }
  }

  /**
   * 处理正常模式完成
   */
  function handleNormalModeCompletion() {
    const nextMonth = getNextMonthToTest()

    if (nextMonth !== null && nextMonth > currentMonthIndex.value) {
      navigateToMonth(nextMonth)
    }
    else {
      completeAssessment()
    }
  }

  /**
   * 处理月龄失败
   */
  function handleMonthFailure() {
    if (!isRetreating.value) {
      isRetreating.value = true
      retreatStartMonth.value = currentMonthIndex.value
    }

    const targetMonth = Math.max(0, currentMonthIndex.value - 1)

    if (targetMonth < currentMonthIndex.value) {
      navigateToMonth(targetMonth)
    }
    else {
      completeAssessment()
    }
  }

  /**
   * 处理未完成的月龄
   */
  function handleIncompleteMonth(canDo: boolean, monthObj: MonthQuestion) {
    if (currentQuestionIndex.value < monthObj.questions.length - 1) {
      currentQuestionIndex.value++
    }
    else {
      handleLastQuestionOfMonth(canDo)
    }
  }

  /**
   * 处理月龄的最后一题
   */
  function handleLastQuestionOfMonth(canDo: boolean) {
    if (canDo && isMonthCompleted(currentMonthIndex.value)) {
      if (isRetreating.value) {
        handleRetreatModeCompletion()
      }
      else {
        handleNormalModeCompletion()
      }
    }
    else if (canDo && !isMonthCompleted(currentMonthIndex.value)) {
      // 即使月龄未完成，也要决定下一步
      if (isRetreating.value) {
        handleRetreatModeCompletion()
      }
      else {
        handleNormalModeCompletion()
      }
    }
    else if (!canDo) {
      handleMonthFailure()
    }
  }

  /**
   * 导航到指定月龄
   */
  function navigateToMonth(monthIndex: number) {
    currentMonthIndex.value = monthIndex
    currentQuestionIndex.value = 0
  }

  /**
   * 完成测评
   */
  function completeAssessment() {
    isCompleted.value = true
    resultData.value = calculateResult()
  }

  /**
   * 初始化测评
   */
  function initializeAssessment(schemaData: Schema, initialMonth: string, maxMonth: number = 42) {
    schema.value = schemaData
    maxTestMonth.value = maxMonth

    // 设置初始月龄
    let foundIndex = 0
    if (initialMonth && schema.value?.questions) {
      foundIndex = schema.value.questions.findIndex(q => String(q.targetMonth) === String(initialMonth))
      if (foundIndex === -1)
        foundIndex = 0
    }

    currentMonthIndex.value = foundIndex
    currentQuestionIndex.value = 0

    // 初始化答案记录
    answers.value = {}
    isRetreating.value = false
    retreatStartMonth.value = -1
    isCompleted.value = false
    resultData.value = null
  }

  /**
   * 重置测评状态
   */
  function resetAssessment() {
    currentMonthIndex.value = 0
    currentQuestionIndex.value = 0
    answers.value = {}
    isRetreating.value = false
    retreatStartMonth.value = -1
    isCompleted.value = false
    resultData.value = null
  }

  /**
   * 获取格式化的答案列表
   */
  function getFormattedAnswers(): FormattedAnswer[] {
    if (!schema.value?.questions) {
      return []
    }

    const formattedAnswers: FormattedAnswer[] = []

    // 遍历所有月龄
    for (let monthIndex = 0; monthIndex < schema.value.questions.length; monthIndex++) {
      const monthObj = schema.value.questions[monthIndex]
      const monthAnswers = answers.value[monthIndex]

      if (!monthAnswers || !monthObj?.questions) {
        continue
      }

      // 获取目标月龄（去掉"个月"后缀，只保留数字）
      const targetMonth = Number.parseInt(monthObj.targetMonth.replace('个月', '')) || 0

      // 遍历该月龄的所有题目
      for (let questionIndex = 0; questionIndex < monthObj.questions.length; questionIndex++) {
        const answer = monthAnswers[questionIndex]

        // 只包含已回答的题目
        if (answer !== undefined) {
          const question = monthObj.questions[questionIndex]
          formattedAnswers.push({
            title: question.questionText,
            answer: answer ? '能做到' : '暂时不能',
            index: targetMonth, // 使用目标月龄作为index
          })
        }
      }
    }

    return formattedAnswers
  }

  return {
    // 状态
    schema,
    currentMonthIndex,
    currentQuestionIndex,
    isCompleted,
    resultData,
    maxTestMonth,
    answers,
    isRetreating,
    retreatStartMonth,

    // 计算属性
    currentQuestion,
    currentMonth,
    totalQuestions,
    currentFlatIndex,

    // 方法
    handleAnswer,
    initializeAssessment,
    resetAssessment,
    completeAssessment,
    navigateToMonth,
    getCurrentMonthStatus,
    isMonthCompleted,
    hasMonthFailed,
    isMonthAnswered,
    getFormattedAnswers,
  }
}
