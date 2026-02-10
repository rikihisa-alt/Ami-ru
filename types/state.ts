/**
 * 状態管理の型定義
 * 各ユーザーの現在の状態を記録
 */

// 機嫌の状態
export type Mood = 'great' | 'good' | 'normal' | 'bad' | 'terrible'

// 会話状態
export type ConversationStatus = 'active' | 'quiet' | 'tense' | 'not_talking'

// 距離感
export type Distance = 'very_close' | 'close' | 'normal' | 'distant' | 'very_distant'

// 生活ステータス
export type LifeStatus = 'home' | 'work' | 'out' | 'sleeping' | 'busy'

export interface UserState {
  id: string
  userId: string
  groupId: string

  // 状態項目
  mood: Mood
  conversationStatus: ConversationStatus
  distance: Distance
  lifeStatus: LifeStatus

  // メタデータ
  updatedAt: Date
  note?: string // 任意の補足メモ
}

// 状態表示用のラベル
export const MoodLabels: Record<Mood, string> = {
  great: '最高',
  good: '良い',
  normal: '普通',
  bad: '悪い',
  terrible: '最悪'
}

export const ConversationStatusLabels: Record<ConversationStatus, string> = {
  active: '会話中',
  quiet: '静か',
  tense: '緊張',
  not_talking: '話していない'
}

export const DistanceLabels: Record<Distance, string> = {
  very_close: 'とても近い',
  close: '近い',
  normal: '普通',
  distant: '遠い',
  very_distant: 'とても遠い'
}

export const LifeStatusLabels: Record<LifeStatus, string> = {
  home: '自宅',
  work: '仕事中',
  out: '外出中',
  sleeping: '就寝中',
  busy: '忙しい'
}
