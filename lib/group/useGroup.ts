/**
 * グループ管理ユーティリティ
 *
 * 前提:
 * - グループは常に1つのみ
 * - 所属ユーザーは必ず2人
 * - グループ名の形式: "ユーザーA と ユーザーB"
 */

import { Group, User } from '@/types'

/**
 * 現在のグループを取得
 * @returns グループ情報
 *
 * TODO: Supabaseから実際のデータを取得する
 */
export async function getCurrentGroup(): Promise<Group | null> {
  // 仮実装: ダミーデータを返す
  return {
    id: 'group-1',
    name: '太郎 と 花子',
    user1Id: 'user-1',
    user2Id: 'user-2',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * 現在のユーザーのパートナーを取得
 * @param currentUserId - 現在のユーザーID
 * @returns パートナーのユーザー情報
 *
 * TODO: Supabaseから実際のデータを取得する
 */
export async function getPartnerUser(currentUserId: string): Promise<User | null> {
  const group = await getCurrentGroup()

  if (!group) {
    return null
  }

  // 現在のユーザーではない方のユーザーIDを取得
  const partnerId = group.user1Id === currentUserId ? group.user2Id : group.user1Id

  // 仮実装: ダミーデータを返す
  return {
    id: partnerId,
    email: 'partner@example.com',
    name: 'パートナー',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * グループの両ユーザーを取得
 * @returns 2人のユーザー情報の配列
 *
 * TODO: Supabaseから実際のデータを取得する
 */
export async function getGroupUsers(): Promise<[User, User] | null> {
  const group = await getCurrentGroup()

  if (!group) {
    return null
  }

  // 仮実装: ダミーデータを返す
  const user1: User = {
    id: group.user1Id,
    email: 'user1@example.com',
    name: '太郎',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const user2: User = {
    id: group.user2Id,
    email: 'user2@example.com',
    name: '花子',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  return [user1, user2]
}

/**
 * グループ名を生成
 * @param user1Name - ユーザー1の名前
 * @param user2Name - ユーザー2の名前
 * @returns "ユーザー1 と ユーザー2" 形式の文字列
 */
export function generateGroupName(user1Name: string, user2Name: string): string {
  return `${user1Name} と ${user2Name}`
}

/**
 * 現在のユーザーがグループのメンバーかチェック
 * @param userId - チェックするユーザーID
 * @returns グループメンバーの場合true
 */
export async function isGroupMember(userId: string): Promise<boolean> {
  const group = await getCurrentGroup()

  if (!group) {
    return false
  }

  return group.user1Id === userId || group.user2Id === userId
}

/**
 * グループ内での相手のユーザーIDを取得
 * @param currentUserId - 現在のユーザーID
 * @returns パートナーのユーザーID、グループが存在しない場合はnull
 */
export async function getPartnerId(currentUserId: string): Promise<string | null> {
  const group = await getCurrentGroup()

  if (!group) {
    return null
  }

  if (group.user1Id === currentUserId) {
    return group.user2Id
  } else if (group.user2Id === currentUserId) {
    return group.user1Id
  }

  return null
}
