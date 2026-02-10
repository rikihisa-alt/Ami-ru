'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getCurrentUserGroup, getPartnerUser } from '@/lib/group'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [group, setGroup] = useState<any>(null)
  const [partner, setPartner] = useState<any>(null)

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

      const userGroup = await getCurrentUserGroup(currentUser.id)
      setGroup(userGroup)

      if (userGroup) {
        const partnerData = await getPartnerUser(currentUser.id)
        setPartner(partnerData)
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
          <h2>{group.name}</h2>
          {partner ? (
            <p>パートナー: {partner.name}</p>
          ) : (
            <p>⏳ パートナー待機中...</p>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', display: 'grid', gap: '15px' }}>
        <Link href="/state" style={{
          display: 'block',
          padding: '20px',
          backgroundColor: '#FF6B9D',
          color: 'white',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          😊 状態
        </Link>

        <Link href="/logs" style={{
          display: 'block',
          padding: '20px',
          backgroundColor: '#FFC2D4',
          color: '#333',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          📝 ログ・メモ
        </Link>

        <Link href="/rules" style={{
          display: 'block',
          padding: '20px',
          backgroundColor: '#FFE5EC',
          color: '#333',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          📋 ルール
        </Link>

        <Link href="/future" style={{
          display: 'block',
          padding: '20px',
          backgroundColor: '#FFF0F5',
          color: '#333',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          🎉 未来
        </Link>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link href="/settings" style={{ color: '#666' }}>
          ⚙️ 設定
        </Link>
      </div>
    </div>
  )
}
