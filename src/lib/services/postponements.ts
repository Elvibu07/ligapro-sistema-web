import { supabase } from '../supabase';
import type { PostponementRequest } from '../../types';

function mapRowToRequest(row: any): PostponementRequest {
  return {
    id: row.id,
    matchId: row.match_id,
    originalLabel: row.original_label,
    reason: row.reason,
    proposedDate: row.proposed_date,
    proposedTime: row.proposed_time,
    fileName: row.file_name,
    status: row.status,
    dateRequested: row.date_requested,
  };
}

function mapRequestToRow(req: Omit<PostponementRequest, 'id'> & { id?: string }) {
  return {
    ...(req.id ? { id: req.id } : {}),
    match_id: req.matchId,
    original_label: req.originalLabel,
    reason: req.reason,
    proposed_date: req.proposedDate,
    proposed_time: req.proposedTime,
    file_name: req.fileName,
    status: req.status,
    date_requested: req.dateRequested,
  };
}

export async function getPostponements(): Promise<PostponementRequest[]> {
  const { data, error } = await supabase
    .from('postponements')
    .select('id, match_id, original_label, reason, proposed_date, proposed_time, file_name, status, date_requested')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRowToRequest);
}

export async function createPostponement(req: Omit<PostponementRequest, 'id'>): Promise<PostponementRequest> {
  const reqId = (req as any).id || `POST-${Math.floor(100 + Math.random() * 900)}`;
  const reqWithId = { ...req, id: reqId };
  const { data, error } = await supabase
    .from('postponements')
    .insert(mapRequestToRow(reqWithId))
    .select()
    .single();
  if (error) throw error;
  return mapRowToRequest(data);
}

export async function updatePostponement(id: string, updates: Partial<PostponementRequest>): Promise<PostponementRequest> {
  const row: any = {};
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.proposedDate !== undefined) row.proposed_date = updates.proposedDate;
  if (updates.proposedTime !== undefined) row.proposed_time = updates.proposedTime;
  if (updates.reason !== undefined) row.reason = updates.reason;

  const { data, error } = await supabase
    .from('postponements')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapRowToRequest(data);
}
