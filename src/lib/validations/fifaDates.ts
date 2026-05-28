/**
 * Catálogo de fechas FIFA internacionales 2026.
 * Usado como fallback cuando Supabase no está disponible.
 * Fuente: Calendario FIFA oficial 2026.
 */
import type { JornadaFifa } from '../../types';

export const FIFA_DATES_2026: JornadaFifa[] = [
  {
    id: 'fifa-2026-01',
    startDate: '2026-03-23',
    endDate: '2026-03-31',
    description: 'Fecha FIFA - Marzo 2026 (Eliminatorias Sudamericanas)',
    season: '2026',
  },
  {
    id: 'fifa-2026-02',
    startDate: '2026-06-01',
    endDate: '2026-06-09',
    description: 'Fecha FIFA - Junio 2026 (Preparación Copa Mundial)',
    season: '2026',
  },
  {
    id: 'fifa-2026-03',
    startDate: '2026-06-11',
    endDate: '2026-07-19',
    description: 'Copa Mundial FIFA 2026 (USA/México/Canadá)',
    season: '2026',
  },
  {
    id: 'fifa-2026-04',
    startDate: '2026-09-07',
    endDate: '2026-09-15',
    description: 'Fecha FIFA - Septiembre 2026',
    season: '2026',
  },
  {
    id: 'fifa-2026-05',
    startDate: '2026-10-05',
    endDate: '2026-10-13',
    description: 'Fecha FIFA - Octubre 2026',
    season: '2026',
  },
  {
    id: 'fifa-2026-06',
    startDate: '2026-11-09',
    endDate: '2026-11-17',
    description: 'Fecha FIFA - Noviembre 2026',
    season: '2026',
  },
];
