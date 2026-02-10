/**
 * 既読・最終閲覧の型定義
 */

export type ScreenType = 'dashboard' | 'state' | 'logs' | 'rules' | 'future' | 'settings'

export interface Read {
  id: string
  userId: string
  screen: ScreenType
  lastSeenAt: Date
}

export const ScreenLabels: Record<ScreenType, string> = {
  dashboard: 'ダッシュボード',
  state: '状態',
  logs: 'ログ',
  rules: 'ルール',
  future: '未来',
  settings: '設定'
}
