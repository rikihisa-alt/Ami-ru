-- Ami-ru Database Schema
-- 同棲・カップル向け生活共有アプリ

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- Profiles (ユーザープロフィール)
-- ========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_name ON profiles(name);

-- ========================================
-- Groups (グループ)
-- ========================================
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- Group Members (グループメンバー)
-- ========================================
CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);

-- ========================================
-- State Current (現在の状態) - JSONB版
-- ========================================
CREATE TABLE state_current (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- すべての状態情報をJSONBで保存
  state_json JSONB DEFAULT '{}'::jsonb,

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_state_current_user ON state_current(user_id);
CREATE INDEX idx_state_current_group ON state_current(group_id);
CREATE INDEX idx_state_current_updated ON state_current(updated_at DESC);
CREATE INDEX idx_state_current_json ON state_current USING GIN (state_json);

-- ========================================
-- Logs (ログ・メモ)
-- ========================================
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  log_type TEXT NOT NULL CHECK (log_type IN (
    'private_memo',     -- 非公開メモ
    'shared_log',       -- 共有ログ
    'gratitude',        -- 感謝ログ
    'apology',          -- 事前謝罪
    'chore_done',       -- 家事完了
    'satisfaction'      -- 今日の満足度
  )),

  content TEXT NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('private', 'shared')) DEFAULT 'private',

  -- 消えるメモ用
  expires_at TIMESTAMPTZ,

  -- 家事ログ用
  chore_type TEXT, -- 'cooking', 'dishes', 'laundry', 'cleaning', 'shopping', 'trash', 'other'

  -- 満足度用
  satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_logs_user ON logs(user_id);
CREATE INDEX idx_logs_group ON logs(group_id);
CREATE INDEX idx_logs_created ON logs(created_at DESC);
CREATE INDEX idx_logs_visibility ON logs(visibility);
CREATE INDEX idx_logs_expires ON logs(expires_at) WHERE expires_at IS NOT NULL;

-- ========================================
-- Rules (ルール)
-- ========================================
CREATE TABLE rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  category TEXT NOT NULL CHECK (category IN ('money', 'chore', 'general')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  memo TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rules_group ON rules(group_id);
CREATE INDEX idx_rules_category ON rules(category);

-- ========================================
-- Checklist Items (同棲チェックリスト)
-- ========================================
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

  category TEXT NOT NULL, -- 'money', 'chore', 'lifestyle', 'communication'
  question TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('decided', 'undecided', 'unnecessary')) DEFAULT 'undecided',
  conclusion TEXT,
  memo TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_checklist_group ON checklist_items(group_id);
CREATE INDEX idx_checklist_category ON checklist_items(category);
CREATE INDEX idx_checklist_status ON checklist_items(status);

-- ========================================
-- Future Items (未来・ほしい物・記念日)
-- ========================================
CREATE TABLE future_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  item_type TEXT NOT NULL CHECK (item_type IN ('place', 'wish', 'anniversary')),

  title TEXT NOT NULL,
  detail TEXT,

  -- 温度感・優先度
  temperature TEXT CHECK (temperature IN ('hot', 'warm', 'cool')) DEFAULT 'warm',

  -- サプライズ保護
  surprise_protected BOOLEAN DEFAULT FALSE,

  -- 記念日用
  anniversary_date DATE,
  anniversary_weight TEXT CHECK (anniversary_weight IN ('light', 'medium', 'heavy')),
  pre_discussion BOOLEAN DEFAULT FALSE, -- 事前すり合わせ済み

  -- ほしい物用
  owned BOOLEAN DEFAULT FALSE, -- 所有済み
  reason TEXT,

  -- その他の拡張用データ
  extra JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_future_group ON future_items(group_id);
CREATE INDEX idx_future_user ON future_items(user_id);
CREATE INDEX idx_future_type ON future_items(item_type);
CREATE INDEX idx_future_temperature ON future_items(temperature);

-- ========================================
-- Reads (既読・最終閲覧) - domain単位に拡張
-- ========================================
CREATE TABLE reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  domain TEXT NOT NULL, -- 'dashboard', 'state', 'logs', 'rules', 'future'
  screen TEXT, -- オプション: 詳細画面名（将来の拡張用）
  entity_id UUID, -- オプション: エンティティID（将来の拡張用）
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, domain)
);

CREATE INDEX idx_reads_user ON reads(user_id);
CREATE INDEX idx_reads_group ON reads(group_id);
CREATE INDEX idx_reads_domain ON reads(domain);
CREATE INDEX idx_reads_last_seen ON reads(last_seen_at DESC);

-- ========================================
-- Attachments (添付ファイル)
-- ========================================
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_table TEXT NOT NULL, -- 'logs', 'future_items'
  owner_id UUID NOT NULL,
  file_key TEXT NOT NULL, -- Storage上のパス（UUID/filename形式）
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_attachments_group ON attachments(group_id);
CREATE INDEX idx_attachments_owner ON attachments(owner_table, owner_id);
CREATE INDEX idx_attachments_user ON attachments(user_id);

-- ========================================
-- Functions & Triggers
-- ========================================

-- Updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_groups_updated_at BEFORE UPDATE ON groups
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_state_current_updated_at BEFORE UPDATE ON state_current
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_logs_updated_at BEFORE UPDATE ON logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_updated_at BEFORE UPDATE ON checklist_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_future_items_updated_at BEFORE UPDATE ON future_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DB Functions for Group Management
-- ========================================

-- グループを確保してメンバーシップを確保する関数
-- 2人揃ったら "A と B" にグループ名を更新
CREATE OR REPLACE FUNCTION ensure_group_and_membership()
RETURNS UUID
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_group_id UUID;
  v_waiting_group_id UUID;
  v_member_count INTEGER;
  v_user_name TEXT;
  v_partner_name TEXT;
  v_new_group_name TEXT;
BEGIN
  -- 現在のユーザーIDを取得
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 既存のグループメンバーシップをチェック
  SELECT group_id INTO v_group_id
  FROM group_members
  WHERE user_id = v_user_id
  LIMIT 1;

  -- 既に所属していればそのgroup_idを返す
  IF v_group_id IS NOT NULL THEN
    RETURN v_group_id;
  END IF;

  -- 待機中のグループ（メンバーが1人だけ）を探す
  SELECT gm.group_id INTO v_waiting_group_id
  FROM group_members gm
  GROUP BY gm.group_id
  HAVING COUNT(*) = 1
  LIMIT 1;

  -- 待機中のグループが見つかった場合、参加する
  IF v_waiting_group_id IS NOT NULL THEN
    -- 自分を追加
    INSERT INTO group_members (group_id, user_id)
    VALUES (v_waiting_group_id, v_user_id);

    -- グループ名を "A と B" 形式に更新
    PERFORM update_group_name_if_ready(v_waiting_group_id);

    RETURN v_waiting_group_id;
  END IF;

  -- 待機中のグループがなければ新規作成
  SELECT name INTO v_user_name
  FROM profiles
  WHERE id = v_user_id;

  INSERT INTO groups (name)
  VALUES (v_user_name || ' (待機中)')
  RETURNING id INTO v_group_id;

  -- 自分をメンバーに追加
  INSERT INTO group_members (group_id, user_id)
  VALUES (v_group_id, v_user_id);

  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql;

-- グループメンバーが2人揃ったら "A と B" 形式に名前を更新
CREATE OR REPLACE FUNCTION update_group_name_if_ready(p_group_id UUID)
RETURNS VOID
SECURITY DEFINER
AS $$
DECLARE
  v_member_count INTEGER;
  v_name1 TEXT;
  v_name2 TEXT;
  v_new_name TEXT;
BEGIN
  -- メンバー数を確認
  SELECT COUNT(*) INTO v_member_count
  FROM group_members
  WHERE group_id = p_group_id;

  -- 2人揃っていない場合は何もしない
  IF v_member_count <> 2 THEN
    RETURN;
  END IF;

  -- 2人の名前を取得
  SELECT p.name INTO v_name1
  FROM group_members gm
  JOIN profiles p ON gm.user_id = p.id
  WHERE gm.group_id = p_group_id
  ORDER BY gm.joined_at ASC
  LIMIT 1;

  SELECT p.name INTO v_name2
  FROM group_members gm
  JOIN profiles p ON gm.user_id = p.id
  WHERE gm.group_id = p_group_id
  ORDER BY gm.joined_at ASC
  OFFSET 1
  LIMIT 1;

  -- グループ名を "A と B" 形式に更新
  v_new_name := v_name1 || ' と ' || v_name2;

  UPDATE groups
  SET name = v_new_name
  WHERE id = p_group_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Row Level Security (RLS)
-- ========================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Groups & Group Members
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view groups they belong to"
  ON groups FOR SELECT
  USING (id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view group members of their groups"
  ON group_members FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert group members"
  ON group_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- State Current
ALTER TABLE state_current ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view state in their group"
  ON state_current FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own state"
  ON state_current FOR ALL
  USING (user_id = auth.uid());

-- Logs
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shared logs in their group"
  ON logs FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    AND (visibility = 'shared' OR user_id = auth.uid())
  );

CREATE POLICY "Users can manage own logs"
  ON logs FOR ALL
  USING (user_id = auth.uid());

-- Rules
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rules in their group"
  ON rules FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage rules in their group"
  ON rules FOR ALL
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

-- Checklist Items
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view checklist in their group"
  ON checklist_items FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage checklist in their group"
  ON checklist_items FOR ALL
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

-- Future Items
ALTER TABLE future_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view future items in their group"
  ON future_items FOR SELECT
  USING (
    group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid())
    AND (NOT surprise_protected OR user_id = auth.uid())
  );

CREATE POLICY "Users can manage own future items"
  ON future_items FOR ALL
  USING (user_id = auth.uid());

-- Reads
ALTER TABLE reads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reads in their group"
  ON reads FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage own reads"
  ON reads FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own reads"
  ON reads FOR UPDATE
  USING (user_id = auth.uid());

-- Attachments
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view attachments in their group"
  ON attachments FOR SELECT
  USING (group_id IN (SELECT group_id FROM group_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own attachments"
  ON attachments FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own attachments"
  ON attachments FOR DELETE
  USING (user_id = auth.uid());

-- ========================================
-- Initial Data / Templates
-- ========================================

-- 同棲チェックリストのテンプレート項目を挿入する関数（20+項目）
CREATE OR REPLACE FUNCTION initialize_checklist_for_group(p_group_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO checklist_items (group_id, category, question) VALUES
    -- お金（7項目）
    (p_group_id, 'money', '家賃の分担方法'),
    (p_group_id, 'money', '食費の分担方法'),
    (p_group_id, 'money', '光熱費の分担方法'),
    (p_group_id, 'money', '高額支出の相談基準（いくらから？）'),
    (p_group_id, 'money', 'プレゼント予算感'),
    (p_group_id, 'money', '貯金の方針'),
    (p_group_id, 'money', '共同口座を作るか'),

    -- 家事（8項目）
    (p_group_id, 'chore', '料理の分担'),
    (p_group_id, 'chore', '皿洗いの分担'),
    (p_group_id, 'chore', '洗濯の分担'),
    (p_group_id, 'chore', '掃除の分担'),
    (p_group_id, 'chore', '買い物の分担'),
    (p_group_id, 'chore', 'ゴミ出しの分担'),
    (p_group_id, 'chore', 'トイレ掃除の分担'),
    (p_group_id, 'chore', '食材管理・在庫チェックの担当'),

    -- 生活習慣（10項目）
    (p_group_id, 'lifestyle', '起床・就寝時間'),
    (p_group_id, 'lifestyle', '休日の過ごし方'),
    (p_group_id, 'lifestyle', '友人を家に呼ぶルール'),
    (p_group_id, 'lifestyle', '実家への帰省頻度'),
    (p_group_id, 'lifestyle', 'ペットを飼うか'),
    (p_group_id, 'lifestyle', '寝室を分けるか'),
    (p_group_id, 'lifestyle', '冷暖房の温度設定'),
    (p_group_id, 'lifestyle', '騒音・物音への配慮'),
    (p_group_id, 'lifestyle', '共有スペースの使い方'),
    (p_group_id, 'lifestyle', '食事は一緒に食べるか'),

    -- コミュニケーション（8項目）
    (p_group_id, 'communication', 'ケンカした時のルール'),
    (p_group_id, 'communication', '一人の時間の確保'),
    (p_group_id, 'communication', 'スマホの扱い（見る？見ない？）'),
    (p_group_id, 'communication', '記念日の重要度'),
    (p_group_id, 'communication', '連絡頻度の期待値'),
    (p_group_id, 'communication', '相手の親との関わり方'),
    (p_group_id, 'communication', '異性の友人との付き合い方'),
    (p_group_id, 'communication', '将来の話（結婚・子ども）をするタイミング');
END;
$$ LANGUAGE plpgsql;

-- グループ作成時に自動でチェックリストを初期化
CREATE OR REPLACE FUNCTION auto_initialize_checklist()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM initialize_checklist_for_group(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_initialize_checklist
  AFTER INSERT ON groups
  FOR EACH ROW
  EXECUTE FUNCTION auto_initialize_checklist();
