export interface AssessmentQuestionnaire {
  questionnaireId: number
  sortOrder?: number
  isRequired?: boolean
  weight?: number
}

export interface IAssessment {
  id?: number
  title: string
  description?: string
  coverImage?: string
  questionnaires: AssessmentQuestionnaire[]
  type: number
  status?: number
  targetAudience?: string
  duration?: number
  startTime?: string
  endTime?: string
  needAppointment?: boolean
  maxParticipants?: number
  currentParticipants?: number
  remark?: string
  createTime?: string
  creator?: string
}

export interface IQuestionnaire {
  id?: number
  title: string
  description?: string
  link: string
  estimatedDuration?: number
  accessCount?: number
  isPopular?: boolean
}
