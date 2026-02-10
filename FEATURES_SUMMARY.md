# 実装完了機能まとめ

## 完了した機能

### 1. 既読/最終閲覧の強化（domain単位）
- **readsテーブル拡張**: group_id, domain, screen, entity_id列を追加
- **readService作成**: upsertRead, getPartnerReads, formatLastSeen関数
- **すべてのページに実装**: dashboard, state, logs, rules, futureで閲覧記録
- **dashboardに表示**: 相手の各domain最終閲覧時刻を「◯分前」形式で表示

### 2. 新着バッジ機能
- **updateTracker作成**: パートナーの各domain最新更新日時を取得
- **notificationLikeService作成**: 新着バッジの計算ロジック
- **dashboardに表示**: 状態/ログ/ルール/未来の各カードに"New"バッジ表示
- **判定ロジック**: 相手の更新日時 > 自分の閲覧日時 = New

### 3. 検索・絞り込み機能
#### Logs
- キーワード検索（content）
- visibility切替（shared/private）
- タブ（すべて / プライベートのみ）

#### Rules
- キーワード検索（title, content）
- チェックリスト: カテゴリフィルタ（お金/家事/生活習慣/コミュニケーション）
- チェックリスト: 未決のみ表示トグル

#### Future
- キーワード検索（title, detail）
- typeフィルタ（place/wish/anniversary）
- temperatureフィルタ（hot/warm/cool）

### 4. 添付ファイル機能（基盤準備完了）
- **attachmentsテーブル作成**: group_id, user_id, owner_table, owner_id, file_key等
- **RLSポリシー設定**: group内は閲覧可、投稿者のみ削除可
- **attachmentService作成**: uploadAttachment, listAttachments, deleteAttachment, getSignedUrl
- **制約**:
  - 最大5件
  - 最大10MB/ファイル
  - 署名付きURL（public bucketではない）
  - Storage bucket名: couple-app

## DB変更

### readsテーブル
```sql
CREATE TABLE reads (
  id UUID PRIMARY KEY,
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  screen TEXT,
  entity_id UUID,
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, domain)
);
```

### attachmentsテーブル
```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY,
  group_id UUID NOT NULL,
  user_id UUID NOT NULL,
  owner_table TEXT NOT NULL,
  owner_id UUID NOT NULL,
  file_key TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 実装ファイル

### 新規作成
- `lib/services/readService.ts` - 既読管理
- `lib/services/updateTracker.ts` - パートナー更新追跡
- `lib/services/notificationLikeService.ts` - 新着バッジ計算
- `lib/services/attachmentService.ts` - 添付ファイル管理

### 更新
- `supabase/schema.sql` - readsとattachmentsテーブル追加、RLS設定
- `app/dashboard/page.tsx` - 新着バッジ、パートナー閲覧状況表示
- `app/state/page.tsx` - upsertRead呼び出し
- `app/logs/page.tsx` - upsertRead + 検索機能
- `app/rules/page.tsx` - upsertRead + 検索機能
- `app/future/page.tsx` - upsertRead + 検索機能

## Supabase側で必要な作業

### 1. SQLを実行
`supabase/schema.sql` の内容をSupabase SQL Editorで実行

### 2. Storageバケット作成（添付ファイル用）
1. Supabase Dashboard → Storage → Create bucket
2. Bucket名: `couple-app`
3. Public: **OFF**（署名付きURLで保護）
4. RLS policies:
```sql
-- 読み取り: グループメンバーのみ
CREATE POLICY "Group members can read files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'couple-app' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

-- アップロード: 認証済みユーザーのみ
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'couple-app' AND
  auth.role() = 'authenticated'
);

-- 削除: 投稿者のみ
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'couple-app' AND
  auth.uid()::text = (storage.foldername(name))[2]
);
```

## 動作確認手順

### 1. 既読/新着バッジ
1. ユーザーAでログイン → 「状態」ページで機嫌を更新
2. ユーザーBでログイン → ダッシュボードに「状態」に"New"バッジ表示
3. ユーザーBが「状態」ページを開く
4. ダッシュボードに戻ると"New"バッジが消える
5. ダッシュボードの「相手の最終閲覧」に各domainの閲覧時刻が表示される

### 2. 検索機能
1. 「ログ」ページで複数のログを作成
2. キーワード検索欄にテキスト入力 → リアルタイムフィルタ
3. visibilityドロップダウンで「共有のみ」選択 → 絞り込み
4. 「ルール」→「チェックリスト」タブ → カテゴリ選択、未決のみトグル
5. 「未来」ページ → type, temperatureフィルタ

### 3. 添付ファイル（UIは未実装）
- attachmentServiceの各関数を手動でテストできます
- logs/future画面への実装は今後の拡張です

## 注意事項

### パフォーマンス
- 検索機能は現在**クライアント側フィルタ**
- データ量が増えたら**サーバー側フィルタ**（Supabaseクエリ）に移行すること
- 各ファイルに `NOTE: データ量が増えたらサーバー側で実装すること` とコメント記載済み

### 添付ファイル
- 添付ファイルサービスは完成しているが、UIへの組み込みは未実装
- logs/futureページに添付UIを追加する場合は、attachmentServiceを使用

## 追加パッケージ
```json
{
  "uuid": "^10.0.0",
  "@types/uuid": "^10.0.0"
}
```

## ビルド確認
```bash
npm run build
# ✓ ビルド成功確認済み
```

## 今後の拡張候補
1. logs/futureページに添付ファイルUI追加
2. 検索機能のサーバー側実装（.ilike(), .contains()）
3. 期間フィルタ（過去7日/30日/全て）
4. reads のentity_id活用（個別アイテム既読）
5. プッシュ通知（オプション）
