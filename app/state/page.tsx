'use client'
import Link from 'next/link'

export default function StatePage() {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>😊 状態</h1>
      <p style={{ marginTop: '10px', color: '#666' }}>今の気持ちや状態を共有</p>
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <p>※ 機能は実装中です</p>
      </div>
      <div style={{ marginTop: '30px' }}>
        <Link href="/dashboard" style={{ color: '#FF6B9D' }}>← ダッシュボードに戻る</Link>
      </div>
    </div>
  )
}
