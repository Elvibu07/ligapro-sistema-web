-- ============================================================
-- LIGAPRO — Migración: Tablas de Validación de Negocio
-- Ejecuta este script en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ─── CLUB STAFF (Médicos, DT, Cuerpo Técnico) ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.club_staff (
  id          TEXT PRIMARY KEY,
  club_id     TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('Médico','Director Técnico','Asistente','Preparador Físico','Otro')),
  status      TEXT NOT NULL DEFAULT 'Activo' CHECK (status IN ('Activo','Inactivo')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.club_staff ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read club_staff" ON public.club_staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert club_staff" ON public.club_staff FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update club_staff" ON public.club_staff FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete club_staff" ON public.club_staff FOR DELETE TO authenticated USING (true);

-- ─── CLUB ECONOMIC APPROVAL (Aprobación Control Económico) ──────────────────
CREATE TABLE IF NOT EXISTS public.club_economic_approval (
  id             TEXT PRIMARY KEY,
  club_id        TEXT NOT NULL REFERENCES public.clubs(id) ON DELETE CASCADE,
  approved       BOOLEAN NOT NULL DEFAULT false,
  approved_by    TEXT,
  approved_date  TEXT,
  season         TEXT NOT NULL DEFAULT '2026',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.club_economic_approval ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read club_economic_approval" ON public.club_economic_approval FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert club_economic_approval" ON public.club_economic_approval FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update club_economic_approval" ON public.club_economic_approval FOR UPDATE TO authenticated USING (true);

-- ─── JORNADAS FIFA (Calendario Internacional Bloqueado) ─────────────────────
CREATE TABLE IF NOT EXISTS public.jornadas_fifa (
  id           TEXT PRIMARY KEY,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  description  TEXT NOT NULL,
  season       TEXT NOT NULL DEFAULT '2026',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.jornadas_fifa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read jornadas_fifa" ON public.jornadas_fifa FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert jornadas_fifa" ON public.jornadas_fifa FOR INSERT TO authenticated WITH CHECK (true);

-- Seed FIFA dates for 2026
INSERT INTO public.jornadas_fifa (id, start_date, end_date, description, season) VALUES
  ('fifa-2026-01', '2026-03-23', '2026-03-31', 'Fecha FIFA - Marzo 2026 (Eliminatorias)', '2026'),
  ('fifa-2026-02', '2026-06-01', '2026-06-09', 'Fecha FIFA - Junio 2026 (Preparación Mundial)', '2026'),
  ('fifa-2026-03', '2026-06-11', '2026-07-19', 'Copa Mundial FIFA 2026 (USA/MEX/CAN)', '2026'),
  ('fifa-2026-04', '2026-09-07', '2026-09-15', 'Fecha FIFA - Septiembre 2026', '2026'),
  ('fifa-2026-05', '2026-10-05', '2026-10-13', 'Fecha FIFA - Octubre 2026', '2026'),
  ('fifa-2026-06', '2026-11-09', '2026-11-17', 'Fecha FIFA - Noviembre 2026', '2026')
ON CONFLICT (id) DO NOTHING;

-- ─── AUDIT LOG (Registro de Auditoría) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
  id          SERIAL PRIMARY KEY,
  action      TEXT NOT NULL,
  module      TEXT NOT NULL,
  user_email  TEXT NOT NULL DEFAULT 'system',
  reason      TEXT NOT NULL,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read audit_log" ON public.audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert audit_log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- ─── ALTER MATCHES: Agregar campo serie y phase ─────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='serie') THEN
    ALTER TABLE public.matches ADD COLUMN serie TEXT NOT NULL DEFAULT 'A' CHECK (serie IN ('A','B'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='phase') THEN
    ALTER TABLE public.matches ADD COLUMN phase TEXT NOT NULL DEFAULT 'Primera Etapa';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='matches' AND column_name='total_rounds_in_phase') THEN
    ALTER TABLE public.matches ADD COLUMN total_rounds_in_phase INTEGER NOT NULL DEFAULT 22;
  END IF;
END $$;

-- ─── ALTER SANCTIONS: Agregar campo end_date ────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sanctions' AND column_name='end_date') THEN
    ALTER TABLE public.sanctions ADD COLUMN end_date TEXT;
  END IF;
END $$;
