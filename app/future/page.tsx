'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getFutureItems, createFutureItem } from '@/lib/services/future'
import { getCurrentUserGroup } from '@/lib/group'
import { FutureItemTypeLabels, TemperatureLabels } from '@/types'

export default function FuturePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  // 新規作成フォーム
  const [showForm, setShowForm] = useState(false)
  const [itemType, setItemType] = useState('place')
  const [title, setTitle] = useState('')
  const [detail, setDetail] = useState('')
  const [temperature, setTemperature] = useState('warm')
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

      const data = await getFutureItems(group.id, user.id)
      setItems(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!title.trim()) return

    setCreating(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      const group = await getCurrentUserGroup(user.id)
      if (!group) return

      await createFutureItem({
        groupId: group.id,
        userId: user.id,
        itemType: itemType as any,
        title,
        detail,
        temperature: temperature as any,
        surpriseProtected: false
      })

      setTitle('')
      setDetail('')
      setShowForm(false)
      await loadData()
    } catch (error: any) {
      alert('作成に失敗しました: ' + error.message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>🎉 未来</h1>

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
          + 追加する
        </button>
      )}

      {showForm && (
        <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <h3>新規追加</h3>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>種類</label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            >
              <option value="place">行きたい場所</option>
              <option value="wish">ほしい物</option>
              <option value="anniversary">記念日</option>
            </select>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: 沖縄旅行"
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>温度感</label>
            <select
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            >
              {Object.entries(TemperatureLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>詳細</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="詳細を入力..."
              style={{ width: '100%', padding: '10px', fontSize: '16px', minHeight: '80px' }}
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
                setTitle('')
                setDetail('')
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
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>アイテムがありません</p>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              style={{
                marginBottom: '15px',
                padding: '15px',
                backgroundColor: '#FFF0F5',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
                  {FutureItemTypeLabels[item.itemType as keyof typeof FutureItemTypeLabels]}
                </span>
                <span style={{ fontSize: '14px' }}>
                  {TemperatureLabels[item.temperature as keyof typeof TemperatureLabels]}
                </span>
              </div>
              <h4 style={{ marginTop: '10px' }}>{item.title}</h4>
              {item.detail && (
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                  {item.detail}
                </p>
              )}
              <p style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>
                {new Date(item.createdAt).toLocaleString('ja-JP')}
              </p>
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
