'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getLogs, createLog, updateLogVisibility } from '@/lib/services/logs'
import { getCurrentUserGroup } from '@/lib/group'
import { upsertRead } from '@/lib/services/readService'
import { LogTypeLabels } from '@/types'

export default function LogsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])
  const [tab, setTab] = useState<'all' | 'private'>('all')

  // 検索・フィルタ
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterVisibility, setFilterVisibility] = useState<'all' | 'shared' | 'private'>('all')

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

      // ログページ閲覧を記録
      await upsertRead(user.id, 'logs')

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
    try {
      await updateLogVisibility(logId, 'shared')
      await loadData()
    } catch (error: any) {
      alert('共有に失敗しました: ' + error.message)
    }
  }

  // クライアント側フィルタリング（NOTE: データ量が増えたらサーバー側で実装すること）
  const filteredLogs = useMemo(() => {
    let result = logs

    // タブフィルタ
    if (tab === 'private') {
      result = result.filter(log => log.visibility === 'private')
    }

    // visibilityフィルタ
    if (filterVisibility !== 'all') {
      result = result.filter(log => log.visibility === filterVisibility)
    }

    // キーワード検索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      result = result.filter(log =>
        log.content.toLowerCase().includes(keyword)
      )
    }

    return result
  }, [logs, tab, filterVisibility, searchKeyword])

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>📝 ログ・メモ</h1>

      {/* タブ */}
      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setTab('all')}
          style={{
            flex: 1,
            padding: '10px',
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
            flex: 1,
            padding: '10px',
            backgroundColor: tab === 'private' ? '#FF6B9D' : '#f5f5f5',
            color: tab === 'private' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          プライベートのみ
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
        <div>
          <select
            value={filterVisibility}
            onChange={(e) => setFilterVisibility(e.target.value as any)}
            style={{ width: '100%', padding: '8px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="all">すべて</option>
            <option value="shared">共有のみ</option>
            <option value="private">プライベートのみ</option>
          </select>
        </div>
      </div>

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
        {showForm ? '閉じる' : '+ 新しいログを作成'}
      </button>

      {/* 作成フォーム */}
      {showForm && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>種類</label>
            <select
              value={logType}
              onChange={(e) => setLogType(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            >
              {Object.entries(LogTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="ログの内容を入力..."
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

      {/* ログ一覧 */}
      <div style={{ marginTop: '30px' }}>
        {filteredLogs.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>ログがありません</p>
        ) : (
          filteredLogs.map(log => (
            <div key={log.id} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#FF6B9D', color: 'white', borderRadius: '12px' }}>
                      {LogTypeLabels[log.logType as keyof typeof LogTypeLabels]}
                    </span>
                    <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: log.visibility === 'shared' ? '#4CAF50' : '#999', color: 'white', borderRadius: '12px' }}>
                      {log.visibility === 'shared' ? '共有' : 'プライベート'}
                    </span>
                  </div>
                  <p style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}>{log.content}</p>
                  <p style={{ fontSize: '12px', color: '#999', margin: '5px 0' }}>
                    {new Date(log.createdAt).toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>

              {log.visibility === 'private' && (
                <button
                  onClick={() => handlePromoteToShared(log.id)}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px'
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
