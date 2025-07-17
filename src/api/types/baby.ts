export type BirthType = '自然' | '剖腹产' | '早产' | '足月'
export type Guardian = '父母' | '老人' | '其他'

export interface IBabyInfo {
  id?: number
  userId?: number
  name: string
  birthday: string | number
  gender: number
  height: number
  weight: number
  birthType: BirthType
  guardian: Guardian
  avatar: string
}
