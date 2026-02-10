import Link from 'next/link'

export default function HomePage() {
  return (
    <main style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>💕 Ami-ru</h1>
      <p style={{ fontSize: '18px', marginBottom: '40px', color: '#666' }}>
        同棲・カップル向け生活共有アプリ
      </p>

      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          href="/auth/login"
          style={{
            padding: '15px 30px',
            backgroundColor: '#FF6B9D',
            color: 'white',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          ログイン
        </Link>

        <Link
          href="/auth/signup"
          style={{
            padding: '15px 30px',
            backgroundColor: '#FFC2D4',
            color: '#333',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          はじめる
        </Link>
      </div>
    </main>
  )
}
