import { supabase } from '../supabase';
import type { Stadium } from '../../types';

function mapRowToStadium(row: any): Stadium {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    altitude: row.altitude,
    capacity: row.capacity,
    lightingLux: row.lighting_lux,
    grassType: row.grass_type,
    vorConnectivity: row.vor_connectivity,
    locationCoords: { lat: row.lat, lng: row.lng },
    varCertified: row.var_certified,
    lastInspectionDate: row.last_inspection_date,
    grassHeight: row.grass_height,
    fifaQualityPro: row.fifa_quality_pro,
  };
}

export async function getStadiums(): Promise<Stadium[]> {
  const { data, error } = await supabase
    .from('stadiums')
    .select('id, name, city, altitude, capacity, lighting_lux, grass_type, vor_connectivity, lat, lng, var_certified, last_inspection_date, grass_height, fifa_quality_pro')
    .order('name');
  if (error) throw error;
  return (data ?? []).map(mapRowToStadium);
}

export async function createStadium(stadium: Omit<Stadium, 'id'>): Promise<Stadium> {
  const stadiumId = (stadium as any).id || `std-${stadium.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
  const row = {
    id: stadiumId,
    name: stadium.name,
    city: stadium.city,
    altitude: stadium.altitude,
    capacity: stadium.capacity,
    lighting_lux: stadium.lightingLux,
    grass_type: stadium.grassType,
    vor_connectivity: stadium.vorConnectivity,
    lat: stadium.locationCoords.lat,
    lng: stadium.locationCoords.lng,
    var_certified: stadium.varCertified,
    last_inspection_date: stadium.lastInspectionDate,
    grass_height: stadium.grassHeight,
    fifa_quality_pro: stadium.fifaQualityPro,
  };

  const { data, error } = await supabase
    .from('stadiums')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return mapRowToStadium(data);
}

export async function updateStadium(id: string, updates: Partial<Stadium>): Promise<Stadium> {
  const row: any = {};
  if (updates.name !== undefined) row.name = updates.name;
  if (updates.city !== undefined) row.city = updates.city;
  if (updates.capacity !== undefined) row.capacity = updates.capacity;
  if (updates.lightingLux !== undefined) row.lighting_lux = updates.lightingLux;
  if (updates.grassType !== undefined) row.grass_type = updates.grassType;
  if (updates.vorConnectivity !== undefined) row.vor_connectivity = updates.vorConnectivity;
  if (updates.varCertified !== undefined) row.var_certified = updates.varCertified;
  if (updates.lastInspectionDate !== undefined) row.last_inspection_date = updates.lastInspectionDate;
  if (updates.grassHeight !== undefined) row.grass_height = updates.grassHeight;
  if (updates.fifaQualityPro !== undefined) row.fifa_quality_pro = updates.fifaQualityPro;
  if (updates.locationCoords) {
    row.lat = updates.locationCoords.lat;
    row.lng = updates.locationCoords.lng;
  }

  const { data, error } = await supabase
    .from('stadiums')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapRowToStadium(data);
}

export async function deleteStadium(id: string): Promise<void> {
  const { error } = await supabase
    .from('stadiums')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
