/**
 * Rules管理サービス
 */

import { supabase } from '../supabase/client'
import type { Rule, ChecklistItem } from '@/types'

export async function getRules(groupId: string): Promise<Rule[]> {
  const { data, error } = await supabase
    .from('rules')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data.map(mapRuleFromDB)
}

export async function createRule(rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Rule> {
  const { data, error } = await supabase
    .from('rules')
    .insert(mapRuleToDB(rule))
    .select()
    .single()

  if (error) throw error

  return mapRuleFromDB(data)
}

export async function updateRule(ruleId: string, updates: Partial<Omit<Rule, 'id' | 'groupId' | 'createdAt' | 'updatedAt'>>): Promise<Rule> {
  const { data, error } = await supabase
    .from('rules')
    .update(mapRuleToDB(updates))
    .eq('id', ruleId)
    .select()
    .single()

  if (error) throw error

  return mapRuleFromDB(data)
}

export async function getChecklistItems(groupId: string): Promise<ChecklistItem[]> {
  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('group_id', groupId)
    .order('category', { ascending: true })

  if (error) throw error

  return data.map(mapChecklistFromDB)
}

export async function updateChecklistItem(
  itemId: string,
  updates: Partial<Pick<ChecklistItem, 'status' | 'conclusion' | 'memo'>>
): Promise<ChecklistItem> {
  const { data, error} = await supabase
    .from('checklist_items')
    .update({
      status: updates.status,
      conclusion: updates.conclusion,
      memo: updates.memo
    })
    .eq('id', itemId)
    .select()
    .single()

  if (error) throw error

  return mapChecklistFromDB(data)
}

function mapRuleFromDB(data: any): Rule {
  return {
    id: data.id,
    groupId: data.group_id,
    category: data.category,
    title: data.title,
    content: data.content,
    memo: data.memo,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

function mapRuleToDB(rule: Partial<Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>>): any {
  return {
    group_id: rule.groupId,
    category: rule.category,
    title: rule.title,
    content: rule.content,
    memo: rule.memo
  }
}

function mapChecklistFromDB(data: any): ChecklistItem {
  return {
    id: data.id,
    groupId: data.group_id,
    category: data.category,
    question: data.question,
    status: data.status,
    conclusion: data.conclusion,
    memo: data.memo,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}
