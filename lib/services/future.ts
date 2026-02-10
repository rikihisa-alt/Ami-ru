/**
 * Future Items管理サービス
 */

import { supabase } from '../supabase/client'
import type { FutureItem } from '@/types'

export async function getFutureItems(groupId: string, userId: string): Promise<FutureItem[]> {
  const { data, error } = await supabase
    .from('future_items')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  if (error) throw error

  // サプライズ保護フィルタリング
  return data
    .filter((item: any) => !item.surprise_protected || item.user_id === userId)
    .map(mapFutureItemFromDB)
}

export async function createFutureItem(item: Omit<FutureItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<FutureItem> {
  const { data, error } = await supabase
    .from('future_items')
    .insert(mapFutureItemToDB(item))
    .select()
    .single()

  if (error) throw error

  return mapFutureItemFromDB(data)
}

export async function updateFutureItem(
  itemId: string,
  updates: Partial<Omit<FutureItem, 'id' | 'groupId' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<FutureItem> {
  const { data, error } = await supabase
    .from('future_items')
    .update(mapFutureItemToDB(updates))
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error

  return mapFutureItemFromDB(data)
}

export async function deleteFutureItem(itemId: string): Promise<void> {
  const { error } = await supabase
    .from('future_items')
    .delete()
    .eq('id', itemId)

  if (error) throw error
}

function mapFutureItemFromDB(data: any): FutureItem {
  return {
    id: data.id,
    groupId: data.group_id,
    userId: data.user_id,
    itemType: data.item_type,
    title: data.title,
    detail: data.detail,
    temperature: data.temperature,
    surpriseProtected: data.surprise_protected,
    anniversaryDate: data.anniversary_date ? new Date(data.anniversary_date) : undefined,
    anniversaryWeight: data.anniversary_weight,
    preDiscussion: data.pre_discussion,
    owned: data.owned,
    reason: data.reason,
    extra: data.extra,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

function mapFutureItemToDB(item: Partial<Omit<FutureItem, 'id' | 'createdAt' | 'updatedAt'>>): any {
  return {
    group_id: item.groupId,
    user_id: item.userId,
    item_type: item.itemType,
    title: item.title,
    detail: item.detail,
    temperature: item.temperature,
    surprise_protected: item.surpriseProtected,
    anniversary_date: item.anniversaryDate?.toISOString().split('T')[0],
    anniversary_weight: item.anniversaryWeight,
    pre_discussion: item.preDiscussion,
    owned: item.owned,
    reason: item.reason,
    extra: item.extra
  }
}
