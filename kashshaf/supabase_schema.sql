-- ============================================================
-- KASHSHAF DATABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── PROFILES ─────────────────────────────────────────────────
-- Extends Supabase auth.users with app-specific data
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('coach', 'fan', 'club', 'admin')) DEFAULT 'fan',
  club_name TEXT,
  verification_status TEXT CHECK (verification_status IN ('none', 'pending', 'club', 'licensed', 'senior')) DEFAULT 'none',
  bio TEXT,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', COALESCE(NEW.raw_user_meta_data->>'role', 'fan'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── PLAYERS ──────────────────────────────────────────────────
CREATE TABLE players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  name_arabic TEXT,
  position TEXT NOT NULL,
  age INTEGER,
  governorate TEXT,
  club TEXT,
  contact TEXT,
  video_link TEXT,
  endorsed BOOLEAN DEFAULT FALSE,
  votes INTEGER DEFAULT 0,
  claimed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── SIGHTINGS ────────────────────────────────────────────────
CREATE TABLE sightings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  submitted_by UUID REFERENCES profiles(id),
  submitter_name TEXT DEFAULT 'Anonymous',
  text TEXT NOT NULL,
  video_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ENDORSEMENTS ─────────────────────────────────────────────
CREATE TABLE endorsements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  coach_id UUID REFERENCES profiles(id),
  coach_name TEXT NOT NULL,
  coach_badge TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── VOTES ────────────────────────────────────────────────────
CREATE TABLE votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  user_fingerprint TEXT NOT NULL, -- anonymous voting by browser fingerprint
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, user_fingerprint)
);

-- ── REPORTS ──────────────────────────────────────────────────
CREATE TABLE reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  coach_id UUID REFERENCES profiles(id),
  player_name TEXT NOT NULL,
  position TEXT,
  age INTEGER,
  club TEXT,
  match_context TEXT,
  ratings JSONB,
  strengths TEXT,
  development TEXT,
  recommendation TEXT,
  generated_overview TEXT,
  generated_strengths TEXT,
  generated_development TEXT,
  generated_recommendation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MATCHES ──────────────────────────────────────────────────
CREATE TABLE matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  posted_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  governorate TEXT,
  match_date TIMESTAMPTZ NOT NULL,
  age_group TEXT,
  competition TEXT,
  scouts_attending INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── MATCH PLAYER TAGS ────────────────────────────────────────
CREATE TABLE match_players (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL
);

-- ── MATCH ATTENDANCE ─────────────────────────────────────────
CREATE TABLE match_attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  user_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(match_id, user_fingerprint)
);

-- ── VERIFICATION REQUESTS ────────────────────────────────────
CREATE TABLE verification_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  requested_tier TEXT NOT NULL,
  document_url TEXT,
  notes TEXT,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ACCESS REQUESTS ──────────────────────────────────────────
CREATE TABLE access_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  org_name TEXT NOT NULL,
  role TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  target_positions TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE sightings ENABLE ROW LEVEL SECURITY;
ALTER TABLE endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Players: everyone can read, authenticated can insert
CREATE POLICY "players_read_all" ON players FOR SELECT USING (true);
CREATE POLICY "players_insert_auth" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "players_update_auth" ON players FOR UPDATE USING (true);

-- Sightings: everyone can read, anyone can insert
CREATE POLICY "sightings_read_all" ON sightings FOR SELECT USING (true);
CREATE POLICY "sightings_insert_all" ON sightings FOR INSERT WITH CHECK (true);

-- Endorsements: everyone can read, authenticated can insert
CREATE POLICY "endorsements_read_all" ON endorsements FOR SELECT USING (true);
CREATE POLICY "endorsements_insert_auth" ON endorsements FOR INSERT WITH CHECK (true);

-- Votes: everyone can read and insert
CREATE POLICY "votes_read_all" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_insert_all" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "votes_delete_own" ON votes FOR DELETE USING (true);

-- Reports: coaches can read own, insert own
CREATE POLICY "reports_read_own" ON reports FOR SELECT USING (auth.uid() = coach_id);
CREATE POLICY "reports_insert_auth" ON reports FOR INSERT WITH CHECK (auth.uid() = coach_id);

-- Matches: everyone reads, authenticated inserts
CREATE POLICY "matches_read_all" ON matches FOR SELECT USING (true);
CREATE POLICY "matches_insert_auth" ON matches FOR INSERT WITH CHECK (true);

-- Match players and attendance: public read and insert
CREATE POLICY "match_players_read_all" ON match_players FOR SELECT USING (true);
CREATE POLICY "match_players_insert_all" ON match_players FOR INSERT WITH CHECK (true);
CREATE POLICY "match_attendance_read_all" ON match_attendance FOR SELECT USING (true);
CREATE POLICY "match_attendance_insert_all" ON match_attendance FOR INSERT WITH CHECK (true);
CREATE POLICY "match_attendance_delete_all" ON match_attendance FOR DELETE USING (true);

-- Verification requests: users can insert and read own
CREATE POLICY "verif_insert_auth" ON verification_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "verif_read_own" ON verification_requests FOR SELECT USING (auth.uid() = user_id);

-- Access requests: anyone can insert
CREATE POLICY "access_req_insert_all" ON access_requests FOR INSERT WITH CHECK (true);

-- ── SEED DATA ────────────────────────────────────────────────
INSERT INTO players (name, position, age, governorate, club, contact, video_link, endorsed, votes) VALUES
('Youssef El-Sharkawy', 'CAM', 16, 'Cairo', 'Al Ahly Academy', 'Al Ahly Academy youth office', 'youtube.com/watch?v=abc123 — watch from 1:34', true, 34),
('Omar Khalil', 'CB', 17, 'Giza', 'Pyramids FC Youth', 'Pyramids FC youth coordinator', '', true, 19),
('Mostafa Ibrahim', 'ST', 15, 'Alexandria', 'Smouha SC Youth', 'Smouha youth team via club office', 'youtube.com/watch?v=xyz789 — watch from 0:45', false, 11),
('Karim Nasser', 'CM', 18, 'Cairo', 'Zamalek Academy', 'karim.nasser.football@gmail.com', '', true, 28),
('Ibrahim Saad', 'GK', 16, 'Sharqia', 'Independent', 'Father: 010 5678 1234', 'youtube.com/watch?v=gk456 — watch from 2:10', false, 15),
('Ali Mahmoud', 'LW', 17, 'Cairo', 'ENPPI Youth', 'ENPPI youth coordinator', 'youtube.com/watch?v=lw789 — watch from 3:22', true, 22);
