# デプロイ手順

## 現在の状況

✅ GitHubリポジトリ作成完了
- リポジトリURL: https://github.com/rikihisa-alt/Ami-ru
- mainブランチ: 本番用
- developブランチ: 開発用

## 次のステップ: Vercelデプロイ

### 1. Vercelにアクセス

https://vercel.com にアクセスしてログイン

### 2. 新規プロジェクトをインポート

1. **Add New** → **Project** をクリック
2. **Import Git Repository** でGitHubを選択
3. `rikihisa-alt/Ami-ru` を検索して **Import**

### 3. プロジェクト設定

- **Framework Preset**: Next.js（自動検出されます）
- **Root Directory**: ./（デフォルト）
- **Build Command**: `npm run build`（自動設定）
- **Output Directory**: `.next`（自動設定）

### 4. 環境変数を設定

**Environment Variables** セクションで以下を追加:

```
NEXT_PUBLIC_SUPABASE_URL = https://dummy-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = dummy-anon-key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

※ 現在はダミー値です。実際のSupabaseプロジェクト作成後に更新してください。

### 5. デプロイ

**Deploy** ボタンをクリック

デプロイが完了すると、以下のような公開URLが発行されます:
- `https://ami-ru.vercel.app` または
- `https://ami-ru-[hash].vercel.app`

## デプロイ後の確認

### スマホでアクセス

1. **iPhone**
   - Safariで公開URLを開く
   - 共有ボタン → 「ホーム画面に追加」
   - アプリとして起動可能

2. **Android**
   - Chromeで公開URLを開く
   - メニュー → 「ホーム画面に追加」
   - アプリとして起動可能

### PWA確認項目

- [ ] ホーム画面に追加できる
- [ ] アイコンが表示される（現在はプレースホルダー）
- [ ] スタンドアロンモードで起動できる
- [ ] オフラインで基本画面が表示される

## ブランチ戦略

今後の開発では以下のブランチ戦略で進めます:

### main（本番）
- 常に動作する状態を保つ
- Vercelで自動デプロイ
- developからのマージのみ受け入れ

### develop（開発）
- 開発中の機能を統合
- feature/*からのマージを受け入れ
- 安定したらmainにマージ

### feature/*（機能開発）
例:
- `feature/auth` - 認証機能
- `feature/state-management` - 状態管理機能
- `feature/log-system` - ログシステム
- `feature/rule-management` - ルール管理
- `feature/future-plans` - 未来・提案機能

### ブランチの作成例

```bash
# 新機能開発を開始
git checkout develop
git pull origin develop
git checkout -b feature/auth

# 開発...
git add .
git commit -m "feat: 認証機能を実装"
git push -u origin feature/auth

# GitHubでdevelopへのPull Requestを作成
```

## 次の実装タスク

1. **Supabaseセットアップ**
   - プロジェクト作成
   - データベーススキーマ設計
   - 環境変数更新

2. **認証機能** (`feature/auth`)
   - ログイン/サインアップページ
   - セッション管理
   - 認証済みユーザーのみアクセス可能な画面

3. **状態管理機能** (`feature/state-management`)
   - 機嫌・会話状態・距離感・生活ステータスの表示/更新

4. **ログシステム** (`feature/log-system`)
   - 非公開メモ・共有ログ・家事ログ・感謝ログ

5. **ルール管理** (`feature/rule-management`)
   - 同棲チェック・お金ルール・家事ルール

6. **未来・提案機能** (`feature/future-plans`)
   - 行きたい場所・ほしい物・記念日・提案カード

## トラブルシューティング

### ビルドエラーが出る場合

```bash
# ローカルでビルド確認
npm run build

# 型チェック
npx tsc --noEmit
```

### 環境変数が反映されない場合

Vercelの **Settings** → **Environment Variables** で:
1. 変数を確認・更新
2. **Redeploy** で再デプロイ

## 公開URL

デプロイ完了後、ここに公開URLを記載してください:

```
https://ami-ru.vercel.app
```
