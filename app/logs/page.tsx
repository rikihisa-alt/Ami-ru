'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getLogs, createLog, updateLogVisibility } from '@/lib/services/logs'
import { getCurrentUserGroup } from '@/lib/group'
import { LogTypeLabels } from '@/types'

export default function LogsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])
  const [tab, setTab] = useState<'all' | 'private'>('all')

  // 新規作成フォーム
  const [showForm, setShowForm] = useState(false)
  const [logType, setLogType] = useState<string>('shared_log')
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

      const data = await getLogs(group.id)
      setLogs(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!content.trim()) return

    setCreating(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      const group = await getCurrentUserGroup(user.id)
      if (!group) return

      await createLog({
        userId: user.id,
        groupId: group.id,
        logType: logType as any,
        content,
        visibility: logType === 'private_memo' ? 'private' : 'shared'
      })

      setContent('')
      setShowForm(false)
      await loadData()
    } catch (error: any) {
      alert('作成に失敗しました: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  const handlePromoteToShared = async (logId: string) => {
    if (!confirm('共有ログに変更しますか？')) return

    try {
      await updateLogVisibility(logId, 'shared')
      await loadData()
    } catch (error: any) {
      alert('変更に失敗しました: ' + error.message)
    }
  }

  const filteredLogs = tab === 'private'
    ? logs.filter(log => log.visibility === 'private')
    : logs

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>📝 ログ・メモ</h1>

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setTab('all')}
          style={{
            padding: '10px 20px',
            backgroundColor: tab === 'all' ? '#FF6B9D' : '#f5f5f5',
            color: tab === 'all' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          すべて
        </button>
        <button
          onClick={() => setTab('private')}
          style={{
            padding: '10px 20px',
            backgroundColor: tab === 'private' ? '#FF6B9D' : '#f5f5f5',
            color: tab === 'private' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          非公開のみ
        </button>
      </div>

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
          + 新規作成
        </button>
      )}

      {showForm && (
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3>新規作成</h3>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>種類</label>
            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            >
              <option value="private_memo">非公開メモ</option>
              <option value="shared_log">共有ログ</option>
              <option value="gratitude">感謝ログ</option>
              <option value="chore_done">家事完了</option>
            </select>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="内容を入力..."
              style={{ width: '100%', padding: '10px', fontSize: '16px', minHeight: '100px' }}
            />
          </div>

          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCreate}
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
        {filteredLogs.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>ログがありません</p>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              style={{
                marginBottom: '15px',
                padding: '15px',
                backgroundColor: log.visibility === 'private' ? '#FFF9E6' : '#FFF0F5',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {LogTypeLabels[log.logType as keyof typeof LogTypeLabels]}
                </span>
                <span style={{ fontSize: '12px', color: '#999' }}>
                  {new Date(log.createdAt).toLocaleString('ja-JP')}
                </span>
              </div>
              <p style={{ marginTop: '10px' }}>{log.content}</p>
              {log.visibility === 'private' && (
                <button
                  onClick={() => handlePromoteToShared(log.id)}
                  style={{
                    marginTop: '10px',
                    padding: '8px 15px',
                    backgroundColor: '#FF6B9D',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  共有に変更
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link href="/dashboard" style={{ color: '#FF6B9D' }}>
          ← ダッシュボードに戻る
        </Link>
      </div>
    </div>
  )
}
