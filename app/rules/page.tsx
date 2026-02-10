'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getRules, createRule, getChecklistItems, updateChecklistItem } from '@/lib/services/rules'
import { getCurrentUserGroup } from '@/lib/group'
import { upsertRead } from '@/lib/services/readService'
import { ChecklistStatusLabels } from '@/types'

export default function RulesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rules, setRules] = useState<any[]>([])
  const [checklist, setChecklist] = useState<any[]>([])
  const [tab, setTab] = useState<'rules' | 'checklist'>('rules')

  // 検索・フィルタ
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterUndecidedOnly, setFilterUndecidedOnly] = useState(false)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // 新規ルール作成
  const [showForm, setShowForm] = useState(false)
  const [category, setCategory] = useState('money')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // ルールページ閲覧を記録
      await upsertRead(user.id, 'rules')

      const group = await getCurrentUserGroup(user.id)
      if (!group) return

      const [rulesData, checklistData] = await Promise.all([
        getRules(group.id),
        getChecklistItems(group.id)
      ])

      setRules(rulesData)
      setChecklist(checklistData)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return

    setCreating(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      const group = await getCurrentUserGroup(user.id)
      if (!group) return

      await createRule({
        groupId: group.id,
        category: category as any,
        title,
        content,
      })

      setTitle('')
      setContent('')
      setShowForm(false)
      await loadData()
    } catch (error: any) {
      alert('作成に失敗しました: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const handleChecklistStatusChange = async (itemId: string, newStatus: string) => {
    try {
      await updateChecklistItem(itemId, newStatus as any)
      await loadData()
    } catch (error: any) {
      alert('更新に失敗しました: ' + error.message)
    }
  }

  // クライアント側フィルタリング（NOTE: データ量が増えたらサーバー側で実装すること）
  const filteredRules = useMemo(() => {
    let result = rules

    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      result = result.filter(rule =>
        rule.title.toLowerCase().includes(keyword) ||
        rule.content.toLowerCase().includes(keyword)
      )
    }

    return result
  }, [rules, searchKeyword])

  const filteredChecklist = useMemo(() => {
    let result = checklist

    // 未決のみフィルタ
    if (filterUndecidedOnly) {
      result = result.filter(item => item.status === 'undecided')
    }

    // カテゴリフィルタ
    if (filterCategory !== 'all') {
      result = result.filter(item => item.category === filterCategory)
    }

    // キーワード検索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      result = result.filter(item =>
        item.question.toLowerCase().includes(keyword)
      )
    }

    return result
  }, [checklist, filterUndecidedOnly, filterCategory, searchKeyword])

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>📋 ルール</h1>

      {/* タブ */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setTab('rules')}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: tab === 'rules' ? '#FF6B9D' : '#f5f5f5',
            color: tab === 'rules' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          ルール
        </button>
        <button
          onClick={() => setTab('checklist')}
          style={{
            flex: 1,
            padding: '10px',
            backgroundColor: tab === 'checklist' ? '#FF6B9D' : '#f5f5f5',
            color: tab === 'checklist' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          チェックリスト
        </button>
      </div>

      {/* 検索・フィルタ */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="キーワード検索..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ddd' }}
          />
        </div>
        {tab === 'checklist' && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ddd' }}
              >
                <option value="all">すべてのカテゴリ</option>
                <option value="money">お金</option>
                <option value="chore">家事</option>
                <option value="lifestyle">生活習慣</option>
                <option value="communication">コミュニケーション</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filterUndecidedOnly}
                  onChange={(e) => setFilterUndecidedOnly(e.target.checked)}
                  style={{ marginRight: '8px' }}
                />
                <span>未決のみ表示</span>
              </label>
            </div>
          </>
        )}
      </div>

      {tab === 'rules' && (
        <>
          {/* 新規作成ボタン */}
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '12px',
              backgroundColor: '#FF6B9D',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {showForm ? '閉じる' : '+ 新しいルールを作成'}
          </button>

          {/* 作成フォーム */}
          {showForm && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>カテゴリ</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                >
                  <option value="money">お金</option>
                  <option value="chore">家事</option>
                  <option value="general">一般</option>
                </select>
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>タイトル</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ルールのタイトル"
                  style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>内容</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="ルールの内容..."
                  style={{ width: '100%', padding: '10px', fontSize: '16px', minHeight: '80px' }}
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={creating}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#FF6B9D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: creating ? 'not-allowed' : 'pointer'
                }}
              >
                {creating ? '作成中...' : '作成'}
              </button>
            </div>
          )}

          {/* ルール一覧 */}
          <div style={{ marginTop: '30px' }}>
            {filteredRules.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999' }}>ルールがありません</p>
            ) : (
              filteredRules.map(rule => (
                <div key={rule.id} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#FF6B9D', color: 'white', borderRadius: '12px' }}>
                      {rule.category === 'money' ? 'お金' : rule.category === 'chore' ? '家事' : '一般'}
                    </span>
                  </div>
                  <h3 style={{ margin: '10px 0' }}>{rule.title}</h3>
                  <p style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}>{rule.content}</p>
                  <p style={{ fontSize: '12px', color: '#999', margin: '5px 0' }}>
                    更新: {new Date(rule.updatedAt).toLocaleString('ja-JP')}
                  </p>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {tab === 'checklist' && (
        <div style={{ marginTop: '30px' }}>
          {filteredChecklist.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999' }}>該当するチェックリストがありません</p>
          ) : (
            filteredChecklist.map(item => (
              <div key={item.id} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#999', color: 'white', borderRadius: '12px' }}>
                    {item.category === 'money' ? 'お金' : item.category === 'chore' ? '家事' : item.category === 'lifestyle' ? '生活習慣' : 'コミュニケーション'}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    padding: '2px 8px',
                    backgroundColor: item.status === 'decided' ? '#4CAF50' : item.status === 'undecided' ? '#FFA726' : '#999',
                    color: 'white',
                    borderRadius: '12px'
                  }}>
                    {ChecklistStatusLabels[item.status as keyof typeof ChecklistStatusLabels]}
                  </span>
                </div>
                <p style={{ margin: '10px 0', fontWeight: 'bold' }}>{item.question}</p>
                <select
                  value={item.status}
                  onChange={(e) => handleChecklistStatusChange(item.id, e.target.value)}
                  style={{ width: '100%', padding: '8px', fontSize: '14px', marginTop: '10px' }}
                >
                  {Object.entries(ChecklistStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            ))
          )}
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <Link href="/dashboard" style={{ color: '#FF6B9D' }}>
          ← ダッシュボードに戻る
        </Link>
      </div>
    </div>
  )
}
