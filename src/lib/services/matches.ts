import { supabase } from '../supabase';
import type { Match } from '../../types';

function mapRowToMatch(row: any): Match {
  return {
    id: row.id,
    homeTeamId: row.home_team_id,
    awayTeamId: row.away_team_id,
    date: row.date,
    time: row.time,
    stadiumId: row.stadium_id,
    status: row.status,
    homeScore: row.home_score ?? undefined,
    awayScore: row.away_score ?? undefined,
    round: row.round,
    tvChannel: row.tv_channel,
    refereeAppointed: row.referee_appointed ?? undefined,
    serie: row.serie ?? 'A',
    phase: row.phase ?? 'Primera Etapa',
    totalRoundsInPhase: row.total_rounds_in_phase ?? 22,
    logistics: {
      seguridadOk: row.seguridad_ok,
      ambulanciaOk: row.ambulancia_ok,
      transmisionTvOk: row.transmision_tv_ok,
      certificacionVarOk: row.certificacion_var_ok,
      balonerosOk: row.baloneros_ok,
      pasabolasCount: row.pasabolas_count ?? 8,
      pasabolasAgesOk: row.pasabolas_ages_ok ?? false,
    },
  };
}

function mapMatchToRow(match: Omit<Match, 'id'> & { id?: string }) {
  return {
    ...(match.id ? { id: match.id } : {}),
    home_team_id: match.homeTeamId,
    away_team_id: match.awayTeamId,
    date: match.date,
    time: match.time,
    stadium_id: match.stadiumId,
    status: match.status,
    home_score: match.homeScore ?? null,
    away_score: match.awayScore ?? null,
    round: match.round,
    tv_channel: match.tvChannel,
    referee_appointed: match.refereeAppointed ?? null,
    serie: match.serie ?? 'A',
    phase: match.phase ?? 'Primera Etapa',
    total_rounds_in_phase: match.totalRoundsInPhase ?? 22,
    seguridad_ok: match.logistics.seguridadOk,
    ambulancia_ok: match.logistics.ambulanciaOk,
    transmision_tv_ok: match.logistics.transmisionTvOk,
    certificacion_var_ok: match.logistics.certificacionVarOk,
    baloneros_ok: match.logistics.balonerosOk,
    pasabolas_count: match.logistics.pasabolasCount ?? 8,
    pasabolas_ages_ok: match.logistics.pasabolasAgesOk ?? false,
  };
}

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('id, home_team_id, away_team_id, stadium_id, date, time, status, home_score, away_score, round, tv_channel, referee_appointed, serie, phase, total_rounds_in_phase, seguridad_ok, ambulancia_ok, transmision_tv_ok, certificacion_var_ok, baloneros_ok, pasabolas_count, pasabolas_ages_ok')
    .order('date', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRowToMatch);
}

export async function createMatch(match: Omit<Match, 'id'>): Promise<Match> {
  const matchId = (match as any).id || `match-${match.homeTeamId}-${match.awayTeamId}-${Date.now()}`;
  const matchWithId = { ...match, id: matchId };
  const { data, error } = await supabase
    .from('matches')
    .insert(mapMatchToRow(matchWithId))
    .select()
    .single();
  if (error) throw error;
  return mapRowToMatch(data);
}

export async function updateMatch(id: string, updates: Partial<Match>): Promise<Match> {
  const row: any = {};
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.homeScore !== undefined) row.home_score = updates.homeScore;
  if (updates.awayScore !== undefined) row.away_score = updates.awayScore;
  if (updates.refereeAppointed !== undefined) row.referee_appointed = updates.refereeAppointed;
  if (updates.date !== undefined) row.date = updates.date;
  if (updates.time !== undefined) row.time = updates.time;
  if (updates.tvChannel !== undefined) row.tv_channel = updates.tvChannel;
  if (updates.logistics) {
    if (updates.logistics.seguridadOk !== undefined) row.seguridad_ok = updates.logistics.seguridadOk;
    if (updates.logistics.ambulanciaOk !== undefined) row.ambulancia_ok = updates.logistics.ambulanciaOk;
    if (updates.logistics.transmisionTvOk !== undefined) row.transmision_tv_ok = updates.logistics.transmisionTvOk;
    if (updates.logistics.certificacionVarOk !== undefined) row.certificacion_var_ok = updates.logistics.certificacionVarOk;
    if (updates.logistics.balonerosOk !== undefined) row.baloneros_ok = updates.logistics.balonerosOk;
  }

  const { data, error } = await supabase
    .from('matches')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapRowToMatch(data);
}

export async function deleteMatch(id: string): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
