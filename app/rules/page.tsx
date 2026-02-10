'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getRules, createRule, getChecklistItems, updateChecklistItem } from '@/lib/services/rules'
import { getCurrentUserGroup } from '@/lib/group'
import { ChecklistStatusLabels } from '@/types'

export default function RulesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [rules, setRules] = useState<any[]>([])
  const [checklist, setChecklist] = useState<any[]>([])
  const [tab, setTab] = useState<'rules' | 'checklist'>('rules')

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

  const handleCreateRule = async () => {
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
        content
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

  const handleUpdateChecklistItem = async (itemId: string, status: string) => {
    try {
      await updateChecklistItem(itemId, { status: status as any })
      await loadData()
    } catch (error: any) {
      alert('更新に失敗しました: ' + error.message)
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>📋 ルール</h1>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setTab('rules')}
          style={{
            padding: '10px 20px',
            backgroundColor: tab === 'rules' ? '#FF6B9D' : '#f5f5f5',
            color: tab === 'rules' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          即見ルール
        </button>
        <button
          onClick={() => setTab('checklist')}
          style={{
            padding: '10px 20px',
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

      {tab === 'rules' && (
        <>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                marginTop: '20px',
                width: '100%',
                padding: '15px',
                backgroundColor: '#FFC2D4',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              + ルール追加
            </button>
          )}

          {showForm && (
            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <h3>新規ルール</h3>

              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>カテゴリ</label>
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

              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>タイトル</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 家賃の分担"
                  style={{ width: '100%', padding: '10px', fontSize: '16px' }}
                />
              </div>

              <div style={{ marginTop: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>内容</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="決めたことを記録..."
                  style={{ width: '100%', padding: '10px', fontSize: '16px', minHeight: '100px' }}
                />
              </div>

              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleCreateRule}
                  disabled={creating}
                  style={{
                    flex: 1,
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
                <button
                  onClick={() => {
                    setShowForm(false)
                    setTitle('')
                    setContent('')
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#ccc',
                    color: '#333',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: '30px' }}>
            {rules.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999' }}>ルールがありません</p>
            ) : (
              rules.map(rule => (
                <div
                  key={rule.id}
                  style={{
                    marginBottom: '15px',
                    padding: '15px',
                    backgroundColor: '#FFF0F5',
                    borderRadius: '8px'
                  }}
                >
                  <h4>{rule.title}</h4>
                  <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                    {rule.content}
                  </p>
                  <p style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
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
          {checklist.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999' }}>チェックリストがありません</p>
          ) : (
            checklist.map(item => (
              <div
                key={item.id}
                style={{
                  marginBottom: '15px',
                  padding: '15px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ flex: 1 }}>{item.question}</h4>
                  <select
                    value={item.status}
                    onChange={(e) => handleUpdateChecklistItem(item.id, e.target.value)}
                    style={{
                      padding: '8px',
                      fontSize: '14px',
                      borderRadius: '5px',
                      border: '1px solid #ddd'
                    }}
                  >
                    {Object.entries(ChecklistStatusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
                {item.conclusion && (
                  <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                    結論: {item.conclusion}
                  </p>
                )}
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
