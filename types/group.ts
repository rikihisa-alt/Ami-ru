/**
 * グループ関連の型定義
 * グループは常に1つで、2人のユーザーで構成される
 * グループ名の形式: 「◯◯ と ◯◯」
 */

export interface Group {
  id: string
  name: string // 例: 「太郎 と 花子」
  user1Id: string
  user2Id: string
  createdAt: Date
  updatedAt: Date
}

export interface GroupMember {
  groupId: string
  userId: string
  userName: string
  joinedAt: Date
}
