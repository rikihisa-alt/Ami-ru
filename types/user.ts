/**
 * ユーザー関連の型定義
 * システムには常に2人のユーザーが存在する
 */

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserProfile {
  userId: string
  displayName: string
  bio?: string
}
