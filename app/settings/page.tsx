'use client'
import Link from 'next/link'
import { signOut } from '@/lib/auth'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>⚙️ 設定</h1>
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={handleSignOut}
          style={{
            padding: '12px 24px',
            backgroundColor: '#FF6B9D',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ログアウト
        </button>
      </div>
      <div style={{ marginTop: '30px' }}>
        <Link href="/dashboard" style={{ color: '#FF6B9D' }}>← ダッシュボードに戻る</Link>
      </div>
    </div>
  )
}
