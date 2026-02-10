'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { getCurrentUserState, getPartnerState, upsertUserState } from '@/lib/services/state'
import { upsertRead, getPartnerLastSeen, formatLastSeen } from '@/lib/services/readService'
import { getPartnerUser } from '@/lib/group'
import { MoodScore, MoodLabels, TalkStateLabels, LifeStatusLabels } from '@/types'

export default function StatePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [myState, setMyState] = useState<any>(null)
  const [partnerState, setPartnerState] = useState<any>(null)
  const [partner, setPartner] = useState<any>(null)
  const [partnerLastSeen, setPartnerLastSeen] = useState<string>('')

  // フォーム状態
  const [mood, setMood] = useState<MoodScore | undefined>()
  const [note, setNote] = useState('')
  const [talkState, setTalkState] = useState<string>('')
  const [lifeStatus, setLifeStatus] = useState<string>('')

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

      // 自分の画面閲覧を記録
      await upsertRead(user.id, 'state')

      const [state, pState, pUser, lastSeen] = await Promise.all([
        getCurrentUserState(user.id),
        getPartnerState(user.id),
        getPartnerUser(user.id),
        getPartnerLastSeen(user.id, 'state'),
      ])

      setMyState(state)
      setPartnerState(pState)
      setPartner(pUser)

      if (lastSeen) {
        setPartnerLastSeen(formatLastSeen(lastSeen))
      }

      // フォームに現在の値をセット
      if (state) {
        const data = state.stateData
        setMood(data.mood as MoodScore | undefined)
        setNote(data.note || '')
        setTalkState(data.talkState || '')
        setLifeStatus(data.lifeStatus || '')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const user = await getCurrentUser()
      if (!user) return

      await upsertUserState(user.id, {
        mood,
        note,
        talkState: talkState as any,
        lifeStatus: lifeStatus as any,
      })

      await loadData()
      alert('保存しました！')
    } catch (error: any) {
      alert('保存に失敗しました: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>😊 状態</h1>

      {/* パートナーの状態 */}
      {partner && partnerState && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#FFF0F5', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>{partner.name}の状態</h3>
            {partnerLastSeen && (
              <span style={{ fontSize: '12px', color: '#999' }}>{partnerLastSeen}に閲覧</span>
            )}
          </div>
          <p>機嫌: {partnerState.stateData.mood ? MoodLabels[partnerState.stateData.mood as MoodScore] : '未設定'}</p>
          <p>話せる: {partnerState.stateData.talkState ? TalkStateLabels[partnerState.stateData.talkState as keyof typeof TalkStateLabels] : '未設定'}</p>
          <p>状況: {partnerState.stateData.lifeStatus ? LifeStatusLabels[partnerState.stateData.lifeStatus as keyof typeof LifeStatusLabels] : '未設定'}</p>
          {partnerState.stateData.note && <p>メモ: {partnerState.stateData.note}</p>}
          <p style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
            更新: {new Date(partnerState.updatedAt).toLocaleString('ja-JP')}
          </p>
        </div>
      )}

      {/* 自分の状態編集 */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>あなたの状態</h3>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>今日の機嫌</label>
          <select
            value={mood || ''}
            onChange={(e) => setMood(e.target.value ? Number(e.target.value) as MoodScore : undefined)}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          >
            <option value="">選択してください</option>
            {Object.entries(MoodLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>話せる状態</label>
          <select
            value={talkState}
            onChange={(e) => setTalkState(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          >
            <option value="">選択してください</option>
            {Object.entries(TalkStateLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>在宅状況</label>
          <select
            value={lifeStatus}
            onChange={(e) => setLifeStatus(e.target.value)}
            style={{ width: '100%', padding: '10px', fontSize: '16px' }}
          >
            <option value="">選択してください</option>
            {Object.entries(LifeStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>補足メモ</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="今日の気分や理由など..."
            style={{ width: '100%', padding: '10px', fontSize: '16px', minHeight: '80px' }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            marginTop: '15px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#FF6B9D',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: saving ? 'not-allowed' : 'pointer'
          }}
        >
          {saving ? '保存中...' : '保存'}
        </button>
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link href="/dashboard" style={{ color: '#FF6B9D' }}>
          ← ダッシュボードに戻る
        </Link>
      </div>
    </div>
  )
}
