# Ami-ru

同棲・カップル向け生活共有アプリ

## 技術スタック

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (認証・データベース)
- **PWA対応** (スマホファースト)

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、Supabaseの認証情報を設定してください。

```bash
cp .env.local.example .env.local
```

`.env.local` を編集:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## プロジェクト構造

```
/app              # Next.js App Router
  /auth           # 認証ページ
  /dashboard      # ダッシュボード
  /state          # 状態管理
  /logs           # ログ
  /rules          # ルール
  /future         # 未来・提案
  /settings       # 設定

/components       # Reactコンポーネント
  /ui             # UIコンポーネント
  /layout         # レイアウトコンポーネント

/lib              # ユーティリティ
  /supabase       # Supabase設定
  /auth           # 認証ヘルパー
  /group          # グループ管理

/types            # TypeScript型定義
  user.ts         # ユーザー
  group.ts        # グループ
  state.ts        # 状態
  log.ts          # ログ
  rule.ts         # ルール
  future.ts       # 未来・提案

/styles           # スタイル
/public           # 静的ファイル
```

## 型定義

アプリ全体で使用する型は `/types` フォルダで管理されています。

- **state.ts**: 機嫌、会話状態、距離感、生活ステータス
- **log.ts**: 非公開メモ、共有ログ、家事ログ、感謝ログ
- **rule.ts**: 同棲チェック、お金ルール、家事ルール
- **future.ts**: 行きたい場所、ほしい物、記念日、提案カード

## コマンド

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm start

# 型チェック
npx tsc --noEmit
```

## デプロイ

### Vercelへのデプロイ

1. **GitHubにプッシュ**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_REPO_URL
git push -u origin main
```

2. **Vercelでプロジェクトをインポート**

- [Vercel](https://vercel.com) にアクセス
- GitHubリポジトリを接続
- プロジェクトをインポート

3. **環境変数を設定**

Vercelのプロジェクト設定で以下の環境変数を追加:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. **デプロイ**

- 自動的にビルド・デプロイが開始されます
- デプロイが完了すると、公開URLが発行されます

### スマホでアクセス

デプロイ後、スマホのブラウザで公開URLにアクセスすると:

1. ブラウザでアプリが開きます
2. **ホーム画面に追加** でPWAとしてインストール可能
3. アプリのようにスマホから使用できます

#### iPhoneの場合
1. Safariで公開URLを開く
2. 共有ボタン → 「ホーム画面に追加」
3. アプリとして起動可能

#### Androidの場合
1. Chromeで公開URLを開く
2. メニュー → 「ホーム画面に追加」
3. アプリとして起動可能

## PWA機能

このアプリはPWA(Progressive Web App)として動作します:

- ✓ ホーム画面に追加可能
- ✓ オフライン対応
- ✓ スマホアプリのような操作感
- ✓ プッシュ通知対応 (今後実装予定)

## Supabaseの設定

### データベース型の生成

Supabaseでデータベーススキーマを作成した後、型定義を生成できます:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
```

## アイコンの設定

PWAアイコンを `/public/icons/` に配置してください:

- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png
