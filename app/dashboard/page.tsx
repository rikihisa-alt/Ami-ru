'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getCurrentUserGroup, getPartnerUser } from '@/lib/group'
import { getCurrentUserState, getPartnerState } from '@/lib/services/state'
import { getLogs } from '@/lib/services/logs'
import { getRules } from '@/lib/services/rules'
import { getFutureItems } from '@/lib/services/future'
import { updateLastSeen, getPartnerLastSeen, formatLastSeen } from '@/lib/services/reads'
import Link from 'next/link'
import { MoodLabels, MoodScore } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [group, setGroup] = useState<any>(null)
  const [partner, setPartner] = useState<any>(null)
  const [myState, setMyState] = useState<any>(null)
  const [partnerState, setPartnerState] = useState<any>(null)
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const [rules, setRules] = useState<any[]>([])
  const [futureItems, setFutureItems] = useState<any[]>([])
  const [partnerLastSeen, setPartnerLastSeen] = useState<string>('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/login')
        return
      }

      setUser(currentUser)

      // ダッシュボード閲覧を記録
      await updateLastSeen(currentUser.id, 'dashboard')

      const userGroup = await getCurrentUserGroup(currentUser.id)
      setGroup(userGroup)

      if (userGroup) {
        const [partnerData, state, pState, logs, rulesData, future, lastSeen] = await Promise.all([
          getPartnerUser(currentUser.id),
          getCurrentUserState(currentUser.id),
          getPartnerState(currentUser.id),
          getLogs(userGroup.id, 5),
          getRules(userGroup.id),
          getFutureItems(userGroup.id, currentUser.id),
          getPartnerLastSeen(currentUser.id, 'dashboard'),
        ])

        setPartner(partnerData)
        setMyState(state)
        setPartnerState(pState)
        setRecentLogs(logs)
        setRules(rulesData.slice(0, 3))
        setFutureItems(future.slice(0, 3))

        if (lastSeen) {
          setPartnerLastSeen(formatLastSeen(lastSeen))
        }
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>読み込み中...</div>
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>📱 Ami-ru</h1>

      {group && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>{group.name}</h2>
            {partnerLastSeen && (
              <span style={{ fontSize: '12px', color: '#999' }}>{partnerLastSeen}に閲覧</span>
            )}
          </div>
          {partner ? (
            <p style={{ margin: '5px 0 0 0' }}>パートナー: {partner.name}</p>
          ) : (
            <p style={{ margin: '5px 0 0 0' }}>⏳ パートナー待機中...</p>
          )}
        </div>
      )}

      {/* 状態カード */}
      <div style={{ marginTop: '30px' }}>
        <h3>😊 状態</h3>
        <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
          <div style={{ padding: '15px', backgroundColor: '#FFE5EC', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0' }}>あなた</h4>
            {myState ? (
              <>
                <p style={{ margin: '5px 0' }}>機嫌: {myState.stateData.mood ? MoodLabels[myState.stateData.mood as MoodScore] : '未設定'}</p>
                {myState.stateData.note && <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>メモ: {myState.stateData.note}</p>}
              </>
            ) : (
              <p style={{ color: '#999', margin: '5px 0' }}>未設定</p>
            )}
          </div>

          {partner && (
            <div style={{ padding: '15px', backgroundColor: '#FFF0F5', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>{partner.name}</h4>
              {partnerState ? (
                <>
                  <p style={{ margin: '5px 0' }}>機嫌: {partnerState.stateData.mood ? MoodLabels[partnerState.stateData.mood as MoodScore] : '未設定'}</p>
                  {partnerState.stateData.note && <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>メモ: {partnerState.stateData.note}</p>}
                </>
              ) : (
                <p style={{ color: '#999', margin: '5px 0' }}>未設定</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ルール要点 */}
      {rules.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>📋 ルール</h3>
          <div style={{ marginTop: '15px' }}>
            {rules.map(rule => (
              <div key={rule.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px', fontSize: '14px' }}>
                <strong>{rule.title}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 最新ログ */}
      {recentLogs.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>📝 最新ログ</h3>
          <div style={{ marginTop: '15px' }}>
            {recentLogs.map(log => (
              <div key={log.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px', fontSize: '14px' }}>
                {log.content.substring(0, 50)}{log.content.length > 50 ? '...' : ''}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 未来カード */}
      {futureItems.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>🎉 未来</h3>
          <div style={{ marginTop: '15px' }}>
            {futureItems.map(item => (
              <div key={item.id} style={{ marginBottom: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '5px', fontSize: '14px' }}>
                {item.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ナビゲーション */}
      <div style={{ marginTop: '30px', display: 'grid', gap: '15px' }}>
        <Link href="/state" style={{ display: 'block', padding: '20px', backgroundColor: '#FF6B9D', color: 'white', borderRadius: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', textDecoration: 'none' }}>
          😊 状態
        </Link>
        <Link href="/logs" style={{ display: 'block', padding: '20px', backgroundColor: '#FFC2D4', color: '#333', borderRadius: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', textDecoration: 'none' }}>
          📝 ログ・メモ
        </Link>
        <Link href="/rules" style={{ display: 'block', padding: '20px', backgroundColor: '#FFE5EC', color: '#333', borderRadius: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', textDecoration: 'none' }}>
          📋 ルール
        </Link>
        <Link href="/future" style={{ display: 'block', padding: '20px', backgroundColor: '#FFF0F5', color: '#333', borderRadius: '8px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', textDecoration: 'none' }}>
          🎉 未来
        </Link>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link href="/settings" style={{ color: '#666', textDecoration: 'none' }}>⚙️ 設定</Link>
      </div>
    </div>
  )
}
