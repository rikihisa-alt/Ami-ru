/**
 * ログ関連の型定義
 * 日々の記録やメモを管理
 */

// ログの可視性
export type LogVisibility = 'private' | 'shared'

// ログの種類
export type LogType = 'memo' | 'shared' | 'chore' | 'gratitude'

export interface Log {
  id: string
  groupId: string
  userId: string // 作成者

  type: LogType
  visibility: LogVisibility

  content: string
  title?: string

  createdAt: Date
  updatedAt: Date
}

// 非公開メモ
export interface PrivateMemo extends Omit<Log, 'type' | 'visibility'> {
  type: 'memo'
  visibility: 'private'
}

// 共有ログ
export interface SharedLog extends Omit<Log, 'type' | 'visibility'> {
  type: 'shared'
  visibility: 'shared'
}

// 家事ログ
export interface ChoreLog extends Omit<Log, 'type' | 'visibility'> {
  type: 'chore'
  visibility: 'shared'
  choreType: ChoreType
  completedAt: Date
}

// 感謝ログ
export interface GratitudeLog extends Omit<Log, 'type' | 'visibility'> {
  type: 'gratitude'
  visibility: 'shared'
  toUserId: string // 感謝を伝える相手
}

// 家事の種類
export type ChoreType =
  | 'cooking'
  | 'dishes'
  | 'laundry'
  | 'cleaning'
  | 'shopping'
  | 'trash'
  | 'other'

export const LogTypeLabels: Record<LogType, string> = {
  memo: '非公開メモ',
  shared: '共有ログ',
  chore: '家事ログ',
  gratitude: '感謝ログ'
}

export const ChoreTypeLabels: Record<ChoreType, string> = {
  cooking: '料理',
  dishes: '皿洗い',
  laundry: '洗濯',
  cleaning: '掃除',
  shopping: '買い物',
  trash: 'ゴミ出し',
  other: 'その他'
}
