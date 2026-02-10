/**
 * グループ作成ユーティリティ - DB関数版
 * ensure_group_and_membership() を使用
 */

import { supabase } from '../supabase/client'

/**
 * グループを作成または参加
 * DB関数 ensure_group_and_membership() を呼び出す
 */
export async function createOrJoinGroup(userId: string, userName: string): Promise<string> {
  const { data, error } = await supabase.rpc('ensure_group_and_membership')

  if (error) {
    throw new Error('グループ作成に失敗しました: ' + error.message)
  }

  return data as string
}

/**
 * グループ名を再計算して更新
 * DB関数 update_group_name_if_ready() を呼び出す
 */
export async function updateGroupName(groupId: string): Promise<void> {
  const { error } = await supabase.rpc('update_group_name_if_ready', {
    p_group_id: groupId,
  })

  if (error) {
    throw new Error('グループ名の更新に失敗しました: ' + error.message)
  }
}
