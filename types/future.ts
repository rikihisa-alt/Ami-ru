/**
 * 未来・提案関連の型定義
 * 将来の予定や希望を管理
 */

// アイテムの種類
export type FutureItemType = 'place' | 'wish' | 'anniversary'

// 温度感
export type Temperature = 'hot' | 'warm' | 'cool'

// 記念日の重さ
export type AnniversaryWeight = 'light' | 'medium' | 'heavy'

export interface FutureItem {
  id: string
  groupId: string
  userId: string // 提案者

  itemType: FutureItemType
  title: string
  detail?: string

  // 温度感・優先度
  temperature: Temperature

  // サプライズ保護
  surpriseProtected: boolean

  // 記念日用
  anniversaryDate?: Date
  anniversaryWeight?: AnniversaryWeight
  preDiscussion?: boolean // 事前すり合わせ済み

  // ほしい物用
  owned?: boolean // 所有済み
  reason?: string

  // その他の拡張用データ
  extra?: Record<string, any>

  createdAt: Date
  updatedAt: Date
}

export const FutureItemTypeLabels: Record<FutureItemType, string> = {
  place: '📍 行きたい場所',
  wish: '🎁 ほしい物',
  anniversary: '🎉 記念日'
}

export const TemperatureLabels: Record<Temperature, string> = {
  hot: '🔥 めっちゃ',
  warm: '☀️ まあまあ',
  cool: '🌤️ いつか'
}

export const AnniversaryWeightLabels: Record<AnniversaryWeight, string> = {
  light: '軽め',
  medium: '普通',
  heavy: '重め'
}
