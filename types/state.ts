/**
 * 状態管理の型定義
 * 各ユーザーの現在の状態を記録
 */

// 機嫌の状態 (1-5)
export type MoodScore = 1 | 2 | 3 | 4 | 5

// 理由タグ
export type MoodReasonTag =
  | '仕事'
  | '体調'
  | '睡眠'
  | '疲れ'
  | '楽しい'
  | 'ストレス'
  | '不安'
  | '嬉しい'
  | 'イライラ'
  | 'その他'

// 話せる状態
export type TalkState = 'ok' | 'later' | 'no'

// 会話の深さ
export type TalkDepth = 'light' | 'normal' | 'deep'

// 話し方希望
export type TalkStyle = 'casual' | 'serious' | 'gentle'

// 距離感
export type Distance = 'close' | 'normal' | 'need_space'

// ケンカ耐性
export type ConflictTolerance = 'high' | 'medium' | 'low'

// 在宅状況
export type LifeStatus = 'home' | 'work' | 'out' | 'sleeping'

// 余白時間
export type FreeTime = 'none' | 'little' | 'some' | 'plenty'

// 生活テンポ
export type LifeTempo = 'slow' | 'normal' | 'fast'

export interface UserState {
  id: string
  userId: string

  // 機嫌関連
  mood?: MoodScore
  moodReasonTags?: MoodReasonTag[]
  note?: string

  // 会話関連
  talkState?: TalkState
  talkDepth?: TalkDepth
  talkStyle?: TalkStyle

  // 距離感・関係性
  distance?: Distance
  conflictTolerance?: ConflictTolerance

  // 生活状況
  lifeStatus?: LifeStatus
  quietMode?: boolean
  soloUntil?: Date
  freeTime?: FreeTime
  lifeTempo?: LifeTempo
  lifeNoise?: string

  updatedAt: Date
}

// ラベル定義
export const MoodLabels: Record<MoodScore, string> = {
  1: '😢 最悪',
  2: '😞 悪い',
  3: '😐 普通',
  4: '😊 良い',
  5: '😄 最高'
}

export const TalkStateLabels: Record<TalkState, string> = {
  ok: '今OK',
  later: 'あとで',
  no: '無理'
}

export const TalkDepthLabels: Record<TalkDepth, string> = {
  light: '軽め',
  normal: '普通',
  deep: '深め'
}

export const TalkStyleLabels: Record<TalkStyle, string> = {
  casual: 'カジュアル',
  serious: '真面目に',
  gentle: '優しく'
}

export const DistanceLabels: Record<Distance, string> = {
  close: '近い',
  normal: '普通',
  need_space: '距離がほしい'
}

export const ConflictToleranceLabels: Record<ConflictTolerance, string> = {
  high: '高い',
  medium: '普通',
  low: '低い'
}

export const LifeStatusLabels: Record<LifeStatus, string> = {
  home: '🏠 在宅',
  work: '💼 仕事中',
  out: '🚶 外出中',
  sleeping: '😴 就寝中'
}

export const FreeTimeLabels: Record<FreeTime, string> = {
  none: 'なし',
  little: '少し',
  some: 'まあまあ',
  plenty: 'たくさん'
}

export const LifeTempoLabels: Record<LifeTempo, string> = {
  slow: 'ゆっくり',
  normal: '普通',
  fast: '早め'
}
