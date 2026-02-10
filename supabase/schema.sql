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
-- State Current (現在の状態)
-- ========================================
CREATE TABLE state_current (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- 機嫌関連
  mood INTEGER CHECK (mood >= 1 AND mood <= 5), -- 1:最悪 ~ 5:最高
  mood_reason_tags TEXT[], -- 理由タグ（複数）
  note TEXT, -- 補足メモ

  -- 会話関連
  talk_state TEXT CHECK (talk_state IN ('ok', 'later', 'no')), -- 話せる状態
  talk_depth TEXT CHECK (talk_depth IN ('light', 'normal', 'deep')), -- 会話の深さ
  talk_style TEXT CHECK (talk_style IN ('casual', 'serious', 'gentle')), -- 話し方希望

  -- 距離感・関係性
  distance TEXT CHECK (distance IN ('close', 'normal', 'need_space')), -- 距離感
  conflict_tolerance TEXT CHECK (conflict_tolerance IN ('high', 'medium', 'low')), -- ケンカ耐性

  -- 生活状況
  life_status TEXT CHECK (life_status IN ('home', 'work', 'out', 'sleeping')), -- 在宅状況
  quiet_mode BOOLEAN DEFAULT FALSE, -- 静かモード
  solo_until TIMESTAMPTZ, -- ソロ時間（〜時まで）
  free_time TEXT CHECK (free_time IN ('none', 'little', 'some', 'plenty')), -- 余白時間
  life_tempo TEXT CHECK (life_tempo IN ('slow', 'normal', 'fast')), -- 生活テンポ
  life_noise TEXT, -- 生活ノイズ予告（自由記述）

  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX idx_state_current_user ON state_current(user_id);
CREATE INDEX idx_state_current_updated ON state_current(updated_at DESC);

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
-- Reads (既読・最終閲覧)
-- ========================================
CREATE TABLE reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  screen TEXT NOT NULL, -- 'dashboard', 'state', 'logs', 'rules', 'future'
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, screen)
);

CREATE INDEX idx_reads_user ON reads(user_id);
CREATE INDEX idx_reads_screen ON reads(screen);
CREATE INDEX idx_reads_last_seen ON reads(last_seen_at DESC);

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

-- State Current
ALTER TABLE state_current ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view state in their group"
  ON state_current FOR SELECT
  USING (user_id IN (
    SELECT gm2.user_id FROM group_members gm1
    JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.user_id = auth.uid()
  ));

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

CREATE POLICY "Users can manage own reads"
  ON reads FOR ALL
  USING (user_id = auth.uid());

-- ========================================
-- Initial Data / Templates
-- ========================================

-- 同棲チェックリストのテンプレート項目を挿入する関数
CREATE OR REPLACE FUNCTION initialize_checklist_for_group(p_group_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO checklist_items (group_id, category, question) VALUES
    -- お金
    (p_group_id, 'money', '家賃の分担方法'),
    (p_group_id, 'money', '食費の分担方法'),
    (p_group_id, 'money', '光熱費の分担方法'),
    (p_group_id, 'money', '高額支出の相談基準（いくらから？）'),
    (p_group_id, 'money', 'プレゼント予算感'),
    (p_group_id, 'money', '貯金の方針'),

    -- 家事
    (p_group_id, 'chore', '料理の分担'),
    (p_group_id, 'chore', '皿洗いの分担'),
    (p_group_id, 'chore', '洗濯の分担'),
    (p_group_id, 'chore', '掃除の分担'),
    (p_group_id, 'chore', '買い物の分担'),
    (p_group_id, 'chore', 'ゴミ出しの分担'),

    -- 生活習慣
    (p_group_id, 'lifestyle', '起床・就寝時間'),
    (p_group_id, 'lifestyle', '休日の過ごし方'),
    (p_group_id, 'lifestyle', '友人を家に呼ぶルール'),
    (p_group_id, 'lifestyle', '実家への帰省頻度'),
    (p_group_id, 'lifestyle', 'ペットを飼うか'),

    -- コミュニケーション
    (p_group_id, 'communication', 'ケンカした時のルール'),
    (p_group_id, 'communication', '一人の時間の確保'),
    (p_group_id, 'communication', 'スマホの扱い（見る？見ない？）'),
    (p_group_id, 'communication', '記念日の重要度');
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
