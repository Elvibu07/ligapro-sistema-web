import { supabase } from '../supabase';
import type { Sanction } from '../../types';

function mapRowToSanction(row: any): Sanction {
  return {
    id: row.id,
    targetType: row.target_type,
    targetName: row.target_name,
    clubName: row.club_name,
    offense: row.offense,
    severity: row.severity,
    fineUSD: row.fine_usd,
    matchesSuspended: row.matches_suspended,
    dateEmitted: row.date_emitted,
    resolved: row.resolved,
    ...(row.appellant_comment ? {
      appealDetails: {
        appellantComment: row.appellant_comment,
        appealDate: row.appeal_date,
        status: row.appeal_status,
        resolutionComment: row.resolution_comment ?? undefined,
      },
    } : {}),
  };
}

export async function getSanctions(): Promise<Sanction[]> {
  const { data, error } = await supabase
    .from('sanctions')
    .select('id, target_type, target_name, club_name, offense, severity, fine_usd, matches_suspended, date_emitted, resolved, appellant_comment, appeal_date, appeal_status, resolution_comment, end_date')
    .order('date_emitted', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRowToSanction);
}

export async function createSanction(sanction: Omit<Sanction, 'id'>): Promise<Sanction> {
  const sanctionId = (sanction as any).id || `sanc-${Date.now()}`;
  const row = {
    id: sanctionId,
    target_type: sanction.targetType,
    target_name: sanction.targetName,
    club_name: sanction.clubName,
    offense: sanction.offense,
    severity: sanction.severity,
    fine_usd: sanction.fineUSD,
    matches_suspended: sanction.matchesSuspended,
    date_emitted: sanction.dateEmitted,
    resolved: sanction.resolved,
    appellant_comment: sanction.appealDetails?.appellantComment ?? null,
    appeal_date: sanction.appealDetails?.appealDate ?? null,
    appeal_status: sanction.appealDetails?.status ?? null,
    resolution_comment: sanction.appealDetails?.resolutionComment ?? null,
  };

  const { data, error } = await supabase
    .from('sanctions')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return mapRowToSanction(data);
}

export async function updateSanction(id: string, updates: Partial<Sanction>): Promise<Sanction> {
  const row: any = {};
  if (updates.resolved !== undefined) row.resolved = updates.resolved;
  if (updates.severity !== undefined) row.severity = updates.severity;
  if (updates.fineUSD !== undefined) row.fine_usd = updates.fineUSD;
  if (updates.matchesSuspended !== undefined) row.matches_suspended = updates.matchesSuspended;
  if (updates.appealDetails) {
    if (updates.appealDetails.appellantComment !== undefined) row.appellant_comment = updates.appealDetails.appellantComment;
    if (updates.appealDetails.appealDate !== undefined) row.appeal_date = updates.appealDetails.appealDate;
    if (updates.appealDetails.status !== undefined) row.appeal_status = updates.appealDetails.status;
    if (updates.appealDetails.resolutionComment !== undefined) row.resolution_comment = updates.appealDetails.resolutionComment;
  }

  const { data, error } = await supabase
    .from('sanctions')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapRowToSanction(data);
}
