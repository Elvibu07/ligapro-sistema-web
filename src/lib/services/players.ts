import { supabase } from '../supabase';
import type { Player } from '../../types';

function mapRowToPlayer(row: any): Player {
  return {
    id: row.id,
    clubId: row.club_id,
    name: row.name,
    number: row.number,
    position: row.position,
    nationality: row.nationality,
    birthDate: row.birth_date,
    status: row.status,
    shirtNumber: row.shirt_number,
    matchesPlayed: row.matches_played,
    yellowCards: row.yellow_cards,
    redCards: row.red_cards,
    goals: row.goals,
    contractUntil: row.contract_until,
    image: row.image,
    height: row.height,
    weight: row.weight,
    documentStatus: {
      photoId: row.photo_id,
      contractSigned: row.contract_signed,
      medicalCertificate: row.medical_certificate,
      transferCertificate: row.transfer_certificate,
    },
  };
}

function mapPlayerToRow(player: Omit<Player, 'id'> & { id?: string }) {
  return {
    ...(player.id ? { id: player.id } : {}),
    club_id: player.clubId,
    name: player.name,
    number: player.number,
    position: player.position,
    nationality: player.nationality,
    birth_date: player.birthDate,
    status: player.status,
    shirt_number: player.shirtNumber,
    matches_played: player.matchesPlayed,
    yellow_cards: player.yellowCards,
    red_cards: player.redCards,
    goals: player.goals,
    contract_until: player.contractUntil,
    image: player.image,
    height: player.height,
    weight: player.weight,
    photo_id: player.documentStatus.photoId,
    contract_signed: player.documentStatus.contractSigned,
    medical_certificate: player.documentStatus.medicalCertificate,
    transfer_certificate: player.documentStatus.transferCertificate,
  };
}

export async function getPlayers(clubId?: string): Promise<Player[]> {
  let query = supabase.from('players').select('*').order('name');
  if (clubId) query = query.eq('club_id', clubId);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRowToPlayer);
}

export async function createPlayer(player: Omit<Player, 'id'>): Promise<Player> {
  const playerId = (player as any).id || `ply-${player.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
  const playerWithId = { ...player, id: playerId };
  const { data, error } = await supabase
    .from('players')
    .insert(mapPlayerToRow(playerWithId))
    .select()
    .single();
  if (error) throw error;
  return mapRowToPlayer(data);
}

export async function updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
  const row: any = {};
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.yellowCards !== undefined) row.yellow_cards = updates.yellowCards;
  if (updates.redCards !== undefined) row.red_cards = updates.redCards;
  if (updates.goals !== undefined) row.goals = updates.goals;
  if (updates.matchesPlayed !== undefined) row.matches_played = updates.matchesPlayed;
  if (updates.clubId !== undefined) row.club_id = updates.clubId;
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.number !== undefined) row.number = updates.number;
  if (updates.position !== undefined) row.position = updates.position;
  if (updates.nationality !== undefined) row.nationality = updates.nationality;
  if (updates.contractUntil !== undefined) row.contract_until = updates.contractUntil;
  if (updates.documentStatus) {
    if (updates.documentStatus.photoId !== undefined) row.photo_id = updates.documentStatus.photoId;
    if (updates.documentStatus.contractSigned !== undefined) row.contract_signed = updates.documentStatus.contractSigned;
    if (updates.documentStatus.medicalCertificate !== undefined) row.medical_certificate = updates.documentStatus.medicalCertificate;
    if (updates.documentStatus.transferCertificate !== undefined) row.transfer_certificate = updates.documentStatus.transferCertificate;
  }

  const { data, error } = await supabase
    .from('players')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapRowToPlayer(data);
}

export async function deletePlayer(id: string): Promise<void> {
  const { error } = await supabase.from('players').delete().eq('id', id);
  if (error) throw error;
}
