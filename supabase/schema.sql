-- ============================================================
-- LIGAPRO — Esquema de Base de Datos para Supabase (PostgreSQL)
-- Ejecuta este script en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── CLUBS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clubs (
  id                 TEXT PRIMARY KEY,
  name               TEXT NOT NULL,
  short_name         TEXT NOT NULL,
  slug               TEXT NOT NULL UNIQUE,
  founded            TEXT,
  city               TEXT NOT NULL,
  stadium            TEXT,
  status             TEXT NOT NULL DEFAULT 'Pendiente'
                     CHECK (status IN ('Habilitado','Observado','Pendiente')),
  legal_representative TEXT,
  contact_email      TEXT,
  logo               TEXT NOT NULL DEFAULT 'CLB',
  estatutos          BOOLEAN NOT NULL DEFAULT false,
  solvencia          BOOLEAN NOT NULL DEFAULT false,
  ministerio_deporte BOOLEAN NOT NULL DEFAULT false,
  registro_ligapro   BOOLEAN NOT NULL DEFAULT false,
  squad_count        INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PLAYERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.players (
  id                   TEXT PRIMARY KEY,
  club_id              TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  number               INTEGER NOT NULL,
  position             TEXT NOT NULL
                       CHECK (position IN ('Arquero','Defensa','Mediocampista','Delantero')),
  nationality          TEXT,
  birth_date           TEXT,
  status               TEXT NOT NULL DEFAULT 'Por Habilitar'
                       CHECK (status IN ('Habilitado','Por Habilitar','Suspendido')),
  shirt_number         INTEGER NOT NULL DEFAULT 0,
  matches_played       INTEGER NOT NULL DEFAULT 0,
  yellow_cards         INTEGER NOT NULL DEFAULT 0,
  red_cards            INTEGER NOT NULL DEFAULT 0,
  goals                INTEGER NOT NULL DEFAULT 0,
  contract_until       TEXT,
  image                TEXT,
  height               TEXT,
  weight               TEXT,
  photo_id             BOOLEAN NOT NULL DEFAULT false,
  contract_signed      BOOLEAN NOT NULL DEFAULT false,
  medical_certificate  BOOLEAN NOT NULL DEFAULT false,
  transfer_certificate TEXT NOT NULL DEFAULT 'N/A',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── STADIUMS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stadiums (
  id                   TEXT PRIMARY KEY,
  name                 TEXT NOT NULL,
  city                 TEXT NOT NULL,
  altitude             INTEGER NOT NULL DEFAULT 0,
  capacity             INTEGER NOT NULL DEFAULT 0,
  lighting_lux         INTEGER NOT NULL DEFAULT 0,
  grass_type           TEXT NOT NULL DEFAULT 'Césped Natural'
                       CHECK (grass_type IN ('Césped Natural','Césped Mixto','Césped Sintético')),
  vor_connectivity     TEXT NOT NULL DEFAULT 'Fibra Única',
  lat                  DOUBLE PRECISION NOT NULL DEFAULT 0,
  lng                  DOUBLE PRECISION NOT NULL DEFAULT 0,
  var_certified        BOOLEAN NOT NULL DEFAULT false,
  last_inspection_date TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── MATCHES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.matches (
  id                   TEXT PRIMARY KEY,
  home_team_id         TEXT NOT NULL REFERENCES public.clubs(id),
  away_team_id         TEXT NOT NULL REFERENCES public.clubs(id),
  stadium_id           TEXT REFERENCES public.stadiums(id),
  date                 TEXT NOT NULL,
  time                 TEXT NOT NULL DEFAULT '15:00',
  status               TEXT NOT NULL DEFAULT 'Programado'
                       CHECK (status IN ('Programado','En Juego','Finalizado','Postergado')),
  home_score           INTEGER,
  away_score           INTEGER,
  round                INTEGER NOT NULL DEFAULT 1,
  tv_channel           TEXT NOT NULL DEFAULT 'Zapping Sports',
  referee_appointed    TEXT,
  seguridad_ok         BOOLEAN NOT NULL DEFAULT false,
  ambulancia_ok        BOOLEAN NOT NULL DEFAULT false,
  transmision_tv_ok    BOOLEAN NOT NULL DEFAULT false,
  certificacion_var_ok BOOLEAN NOT NULL DEFAULT false,
  baloneros_ok         BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SANCTIONS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sanctions (
  id                 TEXT PRIMARY KEY,
  target_type        TEXT NOT NULL CHECK (target_type IN ('Jugador','Club')),
  target_name        TEXT NOT NULL,
  club_name          TEXT NOT NULL,
  offense            TEXT NOT NULL,
  severity           TEXT NOT NULL CHECK (severity IN ('Baja','Media','Alta','Crítica')),
  fine_usd           INTEGER NOT NULL DEFAULT 0,
  matches_suspended  INTEGER NOT NULL DEFAULT 0,
  date_emitted       TEXT NOT NULL,
  resolved           BOOLEAN NOT NULL DEFAULT false,
  appellant_comment  TEXT,
  appeal_date        TEXT,
  appeal_status      TEXT CHECK (appeal_status IN ('Pendiente','Rechazado','Aprobado')),
  resolution_comment TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
-- Enable RLS on all tables
ALTER TABLE public.clubs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stadiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sanctions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all data
CREATE POLICY "Authenticated can read clubs"    ON public.clubs    FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read players"  ON public.players  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read stadiums" ON public.stadiums FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read matches"  ON public.matches  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can read sanctions" ON public.sanctions FOR SELECT TO authenticated USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Authenticated can insert clubs"   ON public.clubs    FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update clubs"   ON public.clubs    FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete clubs"   ON public.clubs    FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert players" ON public.players  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update players" ON public.players  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete players" ON public.players  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert stadiums" ON public.stadiums FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update stadiums" ON public.stadiums FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert matches" ON public.matches  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update matches" ON public.matches  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can insert sanctions" ON public.sanctions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update sanctions" ON public.sanctions FOR UPDATE TO authenticated USING (true);

-- ─── POSTPONEMENTS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.postponements (
  id              TEXT PRIMARY KEY,
  match_id        TEXT NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  original_label  TEXT NOT NULL,
  reason          TEXT NOT NULL,
  proposed_date   TEXT NOT NULL,
  proposed_time   TEXT NOT NULL,
  file_name       TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('Pendiente','Aprobado','Rechazado')),
  date_requested  TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.postponements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read postponements" ON public.postponements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert postponements" ON public.postponements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update postponements" ON public.postponements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete postponements" ON public.postponements FOR DELETE TO authenticated USING (true);

-- ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id          TEXT PRIMARY KEY,
  text        TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT false,
  type        TEXT NOT NULL,
  view        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can read notifications" ON public.notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update notifications" ON public.notifications FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete notifications" ON public.notifications FOR DELETE TO authenticated USING (true);
