/**
 * ログ関連の型定義
 * 日々の記録やメモを管理
 */

// ログの可視性
export type LogVisibility = 'private' | 'shared'

// ログの種類
export type LogType =
  | 'private_memo'    // 非公開メモ
  | 'shared_log'      // 共有ログ
  | 'gratitude'       // 感謝ログ
  | 'apology'         // 事前謝罪
  | 'chore_done'      // 家事完了
  | 'satisfaction'    // 今日の満足度

// 家事の種類
export type ChoreType =
  | 'cooking'
  | 'dishes'
  | 'laundry'
  | 'cleaning'
  | 'shopping'
  | 'trash'
  | 'other'

export interface Log {
  id: string
  userId: string
  groupId: string

  logType: LogType
  content: string
  visibility: LogVisibility

  // 消えるメモ用
  expiresAt?: Date

  // 家事ログ用
  choreType?: ChoreType

  // 満足度用
  satisfactionScore?: 1 | 2 | 3 | 4 | 5

  createdAt: Date
  updatedAt: Date
}

export const LogTypeLabels: Record<LogType, string> = {
  private_memo: '📝 非公開メモ',
  shared_log: '📢 共有ログ',
  gratitude: '💖 感謝',
  apology: '🙏 事前謝罪',
  chore_done: '✅ 家事完了',
  satisfaction: '⭐ 今日の満足度'
}

export const ChoreTypeLabels: Record<ChoreType, string> = {
  cooking: '🍳 料理',
  dishes: '🍽️ 皿洗い',
  laundry: '👕 洗濯',
  cleaning: '🧹 掃除',
  shopping: '🛒 買い物',
  trash: '🗑️ ゴミ出し',
  other: 'その他'
}

export const SatisfactionLabels: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '😢 最悪',
  2: '😞 微妙',
  3: '😐 普通',
  4: '😊 良かった',
  5: '😄 最高'
}
