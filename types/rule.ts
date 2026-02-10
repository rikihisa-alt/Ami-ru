/**
 * ルール関連の型定義
 * 同棲生活のルールや決め事を管理
 */

// ルールのカテゴリ
export type RuleCategory = 'money' | 'chore' | 'general'

export interface Rule {
  id: string
  groupId: string

  category: RuleCategory
  title: string
  content: string
  memo?: string

  createdAt: Date
  updatedAt: Date
}

// 同棲チェックリストのカテゴリ
export type ChecklistCategory = 'money' | 'chore' | 'lifestyle' | 'communication'

// チェックリストのステータス
export type ChecklistStatus = 'decided' | 'undecided' | 'unnecessary'

export interface ChecklistItem {
  id: string
  groupId: string

  category: ChecklistCategory
  question: string
  status: ChecklistStatus
  conclusion?: string
  memo?: string

  createdAt: Date
  updatedAt: Date
}

export const RuleCategoryLabels: Record<RuleCategory, string> = {
  money: '💰 お金',
  chore: '🏠 家事',
  general: '📋 一般'
}

export const ChecklistCategoryLabels: Record<ChecklistCategory, string> = {
  money: '💰 お金',
  chore: '🏠 家事',
  lifestyle: '🌟 生活習慣',
  communication: '💬 コミュニケーション'
}

export const ChecklistStatusLabels: Record<ChecklistStatus, string> = {
  decided: '✅ 決めた',
  undecided: '❓ 未決',
  unnecessary: '➖ 不要'
}
