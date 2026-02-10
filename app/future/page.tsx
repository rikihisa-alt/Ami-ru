'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getFutureItems, createFutureItem } from '@/lib/services/future'
import { getCurrentUserGroup } from '@/lib/group'
import { upsertRead } from '@/lib/services/readService'
import { FutureItemTypeLabels, TemperatureLabels } from '@/types'

export default function FuturePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<any[]>([])

  // 検索・フィルタ
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterTemperature, setFilterTemperature] = useState<string>('all')

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

      // 未来ページ閲覧を記録
      await upsertRead(user.id, 'future')

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
        surpriseProtected: false,
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

  // クライアント側フィルタリング（NOTE: データ量が増えたらサーバー側で実装すること）
  const filteredItems = useMemo(() => {
    let result = items

    // typeフィルタ
    if (filterType !== 'all') {
      result = result.filter(item => item.itemType === filterType)
    }

    // temperatureフィルタ
    if (filterTemperature !== 'all') {
      result = result.filter(item => item.temperature === filterTemperature)
    }

    // キーワード検索
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase()
      result = result.filter(item =>
        item.title.toLowerCase().includes(keyword) ||
        (item.detail && item.detail.toLowerCase().includes(keyword))
      )
    }

    return result
  }, [items, filterType, filterTemperature, searchKeyword])

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>🎉 未来</h1>

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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '8px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="all">すべてのタイプ</option>
            <option value="place">行きたい場所</option>
            <option value="wish">ほしい物</option>
            <option value="anniversary">記念日</option>
          </select>
          <select
            value={filterTemperature}
            onChange={(e) => setFilterTemperature(e.target.value)}
            style={{ padding: '8px', fontSize: '14px', borderRadius: '5px', border: '1px solid #ddd' }}
          >
            <option value="all">すべての温度</option>
            <option value="hot">🔥 hot</option>
            <option value="warm">☀️ warm</option>
            <option value="cool">❄️ cool</option>
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
        {showForm ? '閉じる' : '+ 新しい未来を追加'}
      </button>

      {/* 作成フォーム */}
      {showForm && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>種類</label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            >
              {Object.entries(FutureItemTypeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="タイトルを入力..."
              style={{ width: '100%', padding: '10px', fontSize: '16px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>詳細</label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="詳細を入力..."
              style={{ width: '100%', padding: '10px', fontSize: '16px', minHeight: '60px' }}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>温度感</label>
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

      {/* アイテム一覧 */}
      <div style={{ marginTop: '30px' }}>
        {filteredItems.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#999' }}>未来のアイテムがありません</p>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} style={{ marginBottom: '15px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', padding: '2px 8px', backgroundColor: '#FF6B9D', color: 'white', borderRadius: '12px' }}>
                  {FutureItemTypeLabels[item.itemType as keyof typeof FutureItemTypeLabels]}
                </span>
                <span style={{
                  fontSize: '12px',
                  padding: '2px 8px',
                  backgroundColor: item.temperature === 'hot' ? '#FF5722' : item.temperature === 'warm' ? '#FFA726' : '#03A9F4',
                  color: 'white',
                  borderRadius: '12px'
                }}>
                  {TemperatureLabels[item.temperature as keyof typeof TemperatureLabels]}
                </span>
              </div>
              <h3 style={{ margin: '10px 0' }}>{item.title}</h3>
              {item.detail && <p style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}>{item.detail}</p>}
              <p style={{ fontSize: '12px', color: '#999', margin: '5px 0' }}>
                作成: {new Date(item.createdAt).toLocaleDateString('ja-JP')}
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
