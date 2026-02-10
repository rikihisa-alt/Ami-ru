/**
 * 未来・提案関連の型定義
 * 将来の予定や希望を管理
 */

// 提案の種類
export type FutureType = 'place' | 'item' | 'anniversary' | 'suggestion'

// 提案の状態
export type FutureStatus = 'proposed' | 'agreed' | 'done' | 'cancelled'

// 優先度
export type Priority = 'high' | 'medium' | 'low'

export interface FuturePlan {
  id: string
  groupId: string
  userId: string // 提案者

  type: FutureType
  title: string
  description?: string

  status: FutureStatus
  priority: Priority

  targetDate?: Date // 目標日
  completedAt?: Date // 完了日

  createdAt: Date
  updatedAt: Date
}

// 行きたい場所
export interface PlaceToGo extends Omit<FuturePlan, 'type'> {
  type: 'place'
  location?: string
  address?: string
  url?: string
}

// ほしい物
export interface ItemToGet extends Omit<FuturePlan, 'type'> {
  type: 'item'
  estimatedPrice?: number
  url?: string
}

// 記念日
export interface Anniversary extends Omit<FuturePlan, 'type'> {
  type: 'anniversary'
  date: Date // 記念日は日付必須
  isRecurring: boolean // 毎年繰り返すか
}

// 提案カード
export interface SuggestionCard extends Omit<FuturePlan, 'type'> {
  type: 'suggestion'
  category?: SuggestionCategory
}

// 提案のカテゴリ
export type SuggestionCategory = 'date' | 'activity' | 'habit' | 'improvement' | 'other'

export const FutureTypeLabels: Record<FutureType, string> = {
  place: '行きたい場所',
  item: 'ほしい物',
  anniversary: '記念日',
  suggestion: '提案'
}

export const FutureStatusLabels: Record<FutureStatus, string> = {
  proposed: '提案中',
  agreed: '合意済み',
  done: '完了',
  cancelled: 'キャンセル'
}

export const PriorityLabels: Record<Priority, string> = {
  high: '高',
  medium: '中',
  low: '低'
}

export const SuggestionCategoryLabels: Record<SuggestionCategory, string> = {
  date: 'デート',
  activity: 'アクティビティ',
  habit: '習慣',
  improvement: '改善提案',
  other: 'その他'
}
