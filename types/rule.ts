/**
 * ルール関連の型定義
 * 同棲生活のルールや決め事を管理
 */

// ルールのカテゴリ
export type RuleCategory = 'cohabitation_check' | 'money' | 'chore' | 'general'

// ルールの状態
export type RuleStatus = 'active' | 'archived'

export interface Rule {
  id: string
  groupId: string

  category: RuleCategory
  title: string
  description: string

  conclusion?: string // 結論・合意事項
  note?: string // 備考

  status: RuleStatus

  createdAt: Date
  updatedAt: Date
  createdBy: string // 作成者のuserId
}

// 同棲チェック項目
export interface CohabitationCheckItem extends Omit<Rule, 'category'> {
  category: 'cohabitation_check'
  isChecked: boolean
  checkedAt?: Date
}

// お金ルール
export interface MoneyRule extends Omit<Rule, 'category'> {
  category: 'money'
  amount?: number // 金額が関係する場合
  paymentMethod?: PaymentMethod
}

// 家事ルール
export interface ChoreRule extends Omit<Rule, 'category'> {
  category: 'chore'
  assignedTo?: 'user1' | 'user2' | 'both' | 'rotation'
  frequency?: ChoreFrequency
}

// 支払い方法
export type PaymentMethod = 'split' | 'alternate' | 'user1' | 'user2' | 'proportional'

// 家事の頻度
export type ChoreFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'as_needed'

export const RuleCategoryLabels: Record<RuleCategory, string> = {
  cohabitation_check: '同棲チェック',
  money: 'お金ルール',
  chore: '家事ルール',
  general: '一般ルール'
}

export const PaymentMethodLabels: Record<PaymentMethod, string> = {
  split: '折半',
  alternate: '交互',
  user1: 'パートナー1負担',
  user2: 'パートナー2負担',
  proportional: '比率分担'
}

export const ChoreFrequencyLabels: Record<ChoreFrequency, string> = {
  daily: '毎日',
  weekly: '週1回',
  biweekly: '2週に1回',
  monthly: '月1回',
  as_needed: '必要に応じて'
}
