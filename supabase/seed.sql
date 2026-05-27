-- ============================================================
-- LIGAPRO — Datos Iniciales (Seed) para Supabase
-- Ejecuta este script DESPUÉS de schema.sql
-- ============================================================

-- ─── ESTADIOS ────────────────────────────────────────────────────────────────
INSERT INTO public.stadiums (id, name, city, altitude, capacity, lighting_lux, grass_type, vor_connectivity, lat, lng, var_certified, last_inspection_date) VALUES
('monumental',    'Estadio Monumental Banco Pichincha', 'Guayaquil',  4,    57267, 1530, 'Césped Natural',   'Fibra Principal + Respaldo', -2.1862, -79.9248, true,  '2026-04-15'),
('rodrigo-paz',   'Estadio Rodrigo Paz Delgado',        'Quito',      2850, 41575, 1480, 'Césped Mixto',     'Fibra Principal + Respaldo', -0.1077, -78.4891, true,  '2026-04-20'),
('capwell',       'Estadio George Capwell',              'Guayaquil',  4,    40000, 1600, 'Césped Natural',   'Fibra Única',                -2.2094, -79.8930, true,  '2026-03-12'),
('banco-guayaquil','Estadio Banco Guayaquil',            'Sangolquí',  2500, 12000, 1200, 'Césped Natural',   'Fibra Principal + Respaldo', -0.3228, -78.4375, true,  '2026-05-02'),
('atahualpa',     'Estadio Olímpico Atahualpa',          'Quito',      2780, 35258, 980,  'Césped Natural',   'Satelital',                  -0.1772, -78.4764, false, '2026-05-10')
ON CONFLICT (id) DO NOTHING;

-- ─── CLUBES ──────────────────────────────────────────────────────────────────
INSERT INTO public.clubs (id, name, short_name, slug, founded, city, stadium, status, legal_representative, contact_email, logo, estatutos, solvencia, ministerio_deporte, registro_ligapro, squad_count) VALUES
('barcelona-sc', 'Barcelona Sporting Club',     'Barcelona S.C.',  'barcelona-sc', '1925-05-01', 'Guayaquil', 'Estadio Monumental Banco Pichincha', 'Habilitado', 'Antonio Álvarez', 'contacto@barcelonasc.com.ec', 'BSC', true, true,  true,  true,  7),
('ldu-quito',    'Liga Deportiva Universitaria','L.D.U. Quito',    'ldu-quito',    '1918-10-23', 'Quito',     'Estadio Rodrigo Paz Delgado',        'Habilitado', 'Isaac Álvarez',   'oficina@ldu.com.ec',          'LDU', true, true,  true,  true,  5),
('ind-valle',    'Independiente del Valle',     'IDV',             'ind-valle',    '1958-03-01', 'Sangolquí', 'Estadio Banco Guayaquil',            'Habilitado', 'Franklin Tello',  'contacto@idv.ec',             'IDV', true, true,  true,  true,  4),
('emelec',       'Club Sport Emelec',           'C.S. Emelec',     'emelec',       '1929-04-28', 'Guayaquil', 'Estadio George Capwell',             'Observado',  'José Pileggi',    'socios@emelec.com.ec',        'CSE', true, false, true,  true,  4),
('el-nacional',  'Club Deportivo El Nacional',  'El Nacional',     'el-nacional',  '1964-06-01', 'Quito',     'Estadio Olímpico Atahualpa',         'Pendiente',  'Marco Pazos',     'directorio@elnacional.ec',    'ELN', true, false, false, false, 3),
('aucas',        'Sociedad Deportiva Aucas',    'S.D. Aucas',      'aucas',        '1945-02-06', 'Quito',     'Estadio Gonzalo Pozo Ripalda',       'Habilitado', 'Danny Walker',    'comunicaciones@aucas.ec',     'SDA', true, true,  true,  true,  2)
ON CONFLICT (id) DO NOTHING;

-- ─── JUGADORES ───────────────────────────────────────────────────────────────
INSERT INTO public.players (id, club_id, name, number, position, nationality, birth_date, status, shirt_number, matches_played, yellow_cards, red_cards, goals, contract_until, image, height, weight, photo_id, contract_signed, medical_certificate, transfer_certificate) VALUES
-- Barcelona SC
('j-burrai',  'barcelona-sc', 'Javier Burrai',   1,  'Arquero',        'Argentino / Ecuatoriano', '1990-11-23', 'Habilitado',   1,  11, 1, 0, 0,  '2026-12', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200', '1.88 m', '83 kg', true, true, true, 'Aprobado'),
('l-sosa',    'barcelona-sc', 'Luca Sosa',        3,  'Defensa',        'Argentino / Ecuatoriano', '1994-06-03', 'Habilitado',   3,  12, 2, 0, 1,  '2026-12', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200', '1.89 m', '81 kg', true, true, true, 'Aprobado'),
('a-chala',   'barcelona-sc', 'Aníbal Chalá',     6,  'Defensa',        'Ecuatoriano',             '1996-05-09', 'Habilitado',   6,  11, 1, 0, 0,  '2025-12', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', '1.78 m', '74 kg', true, true, true, 'Aprobado'),
('d-diaz',    'barcelona-sc', 'Damián Díaz',      10, 'Mediocampista',  'Argentino / Ecuatoriano', '1986-05-01', 'Habilitado',   10, 8,  1, 0, 3,  '2025-06', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200', '1.73 m', '70 kg', true, true, true, 'Aprobado'),
('a-preciado','barcelona-sc', 'Adonis Preciado',  7,  'Delantero',      'Ecuatoriano',             '1997-05-15', 'Suspendido',   7,  9,  1, 1, 2,  '2026-12', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200', '1.78 m', '73 kg', true, true, true, 'Aprobado'),
('j-corozo',  'barcelona-sc', 'Janner Corozo',    11, 'Delantero',      'Ecuatoriano',             '1995-09-08', 'Habilitado',   11, 11, 0, 0, 4,  '2026-12', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200', '1.75 m', '69 kg', true, true, true, 'Aprobado'),
('l-souza',   'barcelona-sc', 'Leonai Souza',     22, 'Mediocampista',  'Brasileño',               '1995-10-20', 'Habilitado',   22, 10, 4, 0, 0,  '2025-12', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', '1.74 m', '72 kg', true, true, true, 'Aprobado'),
-- LDU
('a-dominguez','ldu-quito',   'Alexander Domínguez', 22, 'Arquero',     'Ecuatoriano',             '1987-06-05', 'Habilitado',   22, 11, 1, 0, 0,  '2026-12', 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&q=80&w=200', '1.96 m', '90 kg', true, true, true, 'Aprobado'),
('r-ade',     'ldu-quito',   'Ricardo Adé',       4,  'Defensa',        'Haitiano',                '1990-05-21', 'Habilitado',   4,  12, 2, 0, 0,  '2026-12', 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&q=80&w=200', '1.90 m', '85 kg', true, true, true, 'Aprobado'),
('e-piovi',   'ldu-quito',   'Ezequiel Piovi',    5,  'Mediocampista',  'Argentino',               '1992-06-12', 'Habilitado',   5,  12, 3, 0, 1,  '2026-12', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=200', '1.79 m', '74 kg', true, true, true, 'Aprobado'),
('a-arce',    'ldu-quito',   'Alex Arce',         19, 'Delantero',      'Paraguayo',               '1995-06-16', 'Habilitado',   19, 12, 2, 0, 12, '2027-12', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200', '1.87 m', '82 kg', true, true, true, 'Aprobado'),
('j-julio',   'ldu-quito',   'Jhojan Julio',      10, 'Mediocampista',  'Ecuatoriano',             '1998-02-11', 'Suspendido',   10, 8,  5, 0, 2,  '2025-12', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200', '1.72 m', '68 kg', true, true, true, 'N/A'),
-- IDV
('m-ramirez', 'ind-valle',   'Moisés Ramírez',    1,  'Arquero',        'Ecuatoriano',             '2000-09-09', 'Habilitado',   1,  10, 0, 1, 0,  '2026-12', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200', '1.86 m', '82 kg', true, true, true, 'Aprobado'),
('k-paez',    'ind-valle',   'Kendry Páez',       16, 'Mediocampista',  'Ecuatoriano',             '2007-05-04', 'Habilitado',   16, 11, 1, 0, 4,  '2025-06', 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=200', '1.77 m', '71 kg', true, true, true, 'Aprobado')
ON CONFLICT (id) DO NOTHING;

-- ─── PARTIDOS ────────────────────────────────────────────────────────────────
INSERT INTO public.matches (id, home_team_id, away_team_id, stadium_id, date, time, status, round, tv_channel, referee_appointed, seguridad_ok, ambulancia_ok, transmision_tv_ok, certificacion_var_ok, baloneros_ok) VALUES
('match-1', 'barcelona-sc', 'ldu-quito',   'monumental',     '2026-05-24', '18:00', 'Programado', 12, 'Zapping Sports', 'Guillermo Guerrero', true,  true,  true,  true,  true),
('match-2', 'ind-valle',    'emelec',      'banco-guayaquil','2026-05-23', '15:30', 'Programado', 12, 'Zapping Sports', 'Augusto Aragón',     true,  true,  true,  true,  false),
('match-3', 'aucas',        'el-nacional', 'atahualpa',      '2026-05-24', '13:00', 'Programado', 12, 'Zapping Sports', 'Franklin Congo',     false, true,  false, false, true)
ON CONFLICT (id) DO NOTHING;

-- ─── SANCIONES ───────────────────────────────────────────────────────────────
INSERT INTO public.sanctions (id, target_type, target_name, club_name, offense, severity, fine_usd, matches_suspended, date_emitted, resolved, appellant_comment, appeal_date, appeal_status) VALUES
('sanc-1', 'Jugador', 'Adonis Preciado', 'Barcelona S.C.', 'Conducta violenta contra adversario (Falta grave)',                'Alta',  1500, 2, '2026-05-18', false, 'El club argumenta que el jugador no tuvo intención de agredir, sino que fue producto de la inercia de la jugada.', '2026-05-19', 'Pendiente'),
('sanc-2', 'Jugador', 'Jhojan Julio',    'L.D.U. Quito',   'Acumulación de cinco tarjetas amarillas en el torneo',             'Baja',  500,  1, '2026-05-17', true,  NULL, NULL, NULL),
('sanc-3', 'Club',    'Emelec',          'C.S. Emelec',    'Uso indebido de pirotecnia no autorizada en graderíos',            'Media', 3000, 0, '2026-05-12', true,  NULL, NULL, NULL),
('sanc-4', 'Club',    'El Nacional',     'El Nacional',    'Retraso en el ingreso del equipo al terreno de juego (2da advert)','Baja',  1000, 0, '2026-05-14', true,  NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ─── POSTPONEMENTS ──────────────────────────────────────────────────────────
INSERT INTO public.postponements (id, match_id, original_label, reason, proposed_date, proposed_time, file_name, status, date_requested) VALUES
('POST-102', 'match-3', 'Aucas vs El Nacional', 'Copa Libertadores - Desplazamiento Internacional', '2026-05-27', '19:00', 'informe_oficial_conmebol_102.pdf', 'Pendiente', '2026-05-21')
ON CONFLICT (id) DO NOTHING;
