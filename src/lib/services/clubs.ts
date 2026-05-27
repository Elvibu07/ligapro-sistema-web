import { supabase } from '../supabase';
import type { Club } from '../../types';

// Map from DB row to App type
function mapRowToClub(row: any): Club {
  return {
    id: row.id,
    name: row.name,
    shortName: row.short_name,
    slug: row.slug,
    founded: row.founded,
    city: row.city,
    stadium: row.stadium,
    status: row.status,
    legalRepresentative: row.legal_representative,
    contactEmail: row.contact_email,
    logo: row.logo,
    legalDocStatus: {
      estatutos: row.estatutos,
      solvencia: row.solvencia,
      ministerioDeporte: row.ministerio_deporte,
      registroLigaPro: row.registro_ligapro,
    },
    squadCount: row.squad_count,
  };
}

function mapClubToRow(club: Omit<Club, 'id'> & { id?: string }) {
  return {
    ...(club.id ? { id: club.id } : {}),
    name: club.name,
    short_name: club.shortName,
    slug: club.slug,
    founded: club.founded,
    city: club.city,
    stadium: club.stadium,
    status: club.status,
    legal_representative: club.legalRepresentative,
    contact_email: club.contactEmail,
    logo: club.logo,
    estatutos: club.legalDocStatus.estatutos,
    solvencia: club.legalDocStatus.solvencia,
    ministerio_deporte: club.legalDocStatus.ministerioDeporte,
    registro_ligapro: club.legalDocStatus.registroLigaPro,
    squad_count: club.squadCount,
  };
}

export async function getClubs(): Promise<Club[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .order('name');
  if (error) throw error;
  return (data ?? []).map(mapRowToClub);
}

export async function createClub(club: Omit<Club, 'id'>): Promise<Club> {
  const clubId = (club as any).id || club.shortName.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const clubWithId = { ...club, id: clubId };
  const { data, error } = await supabase
    .from('clubs')
    .insert(mapClubToRow(clubWithId))
    .select()
    .single();
  if (error) throw error;
  return mapRowToClub(data);
}

export async function updateClub(id: string, updates: Partial<Club>): Promise<Club> {
  const row: any = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.shortName !== undefined) row.short_name = updates.shortName;
  if (updates.city !== undefined) row.city = updates.city;
  if (updates.stadium !== undefined) row.stadium = updates.stadium;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.legalRepresentative !== undefined) row.legal_representative = updates.legalRepresentative;
  if (updates.contactEmail !== undefined) row.contact_email = updates.contactEmail;
  if (updates.legalDocStatus) {
    if (updates.legalDocStatus.estatutos !== undefined) row.estatutos = updates.legalDocStatus.estatutos;
    if (updates.legalDocStatus.solvencia !== undefined) row.solvencia = updates.legalDocStatus.solvencia;
    if (updates.legalDocStatus.ministerioDeporte !== undefined) row.ministerio_deporte = updates.legalDocStatus.ministerioDeporte;
    if (updates.legalDocStatus.registroLigaPro !== undefined) row.registro_ligapro = updates.legalDocStatus.registroLigaPro;
  }

  const { data, error } = await supabase
    .from('clubs')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapRowToClub(data);
}

export async function deleteClub(id: string): Promise<void> {
  const { error } = await supabase.from('clubs').delete().eq('id', id);
  if (error) throw error;
}
