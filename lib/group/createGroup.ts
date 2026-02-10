/**
 * グループ作成ユーティリティ
 */

import { Group } from '@/types'
import { generateGroupName } from './useGroup'

export interface CreateGroupParams {
  user1Id: string
  user1Name: string
  user2Id: string
  user2Name: string
}

/**
 * 新しいグループを作成
 * @param params - グループ作成パラメータ
 * @returns 作成されたグループ情報
 *
 * TODO: Supabaseにデータを保存する
 */
export async function createGroup(params: CreateGroupParams): Promise<Group> {
  const { user1Id, user1Name, user2Id, user2Name } = params

  // グループ名を生成
  const groupName = generateGroupName(user1Name, user2Name)

  // 仮実装: ダミーグループを返す
  const newGroup: Group = {
    id: `group-${Date.now()}`,
    name: groupName,
    user1Id,
    user2Id,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // TODO: Supabaseに保存
  // await supabase.from('groups').insert(newGroup)

  return newGroup
}

/**
 * グループ名を更新
 * @param groupId - グループID
 * @param user1Name - ユーザー1の新しい名前
 * @param user2Name - ユーザー2の新しい名前
 * @returns 更新されたグループ情報
 *
 * TODO: Supabaseのデータを更新する
 */
export async function updateGroupName(
  groupId: string,
  user1Name: string,
  user2Name: string
): Promise<Group | null> {
  const newName = generateGroupName(user1Name, user2Name)

  // TODO: Supabaseで更新
  // await supabase.from('groups').update({ name: newName }).eq('id', groupId)

  return null
}

/**
 * グループにユーザーを招待
 * @param groupId - グループID
 * @param invitedUserId - 招待されるユーザーID
 * @returns 招待が成功したかどうか
 *
 * 注意: このアプリは2人グループ前提なので、基本的に使用しない
 * TODO: Supabaseで招待ロジックを実装する
 */
export async function inviteUserToGroup(
  groupId: string,
  invitedUserId: string
): Promise<boolean> {
  // 仮実装
  console.warn('このアプリは2人グループ前提です')
  return false
}
