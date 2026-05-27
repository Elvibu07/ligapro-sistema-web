import { supabase } from '../supabase';

export interface DBNotification {
  id: string;
  text: string;
  read: boolean;
  type: string;
  view: string;
  created_at?: string;
}

export async function getNotifications(): Promise<DBNotification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e: any) {
    console.warn('Supabase getNotifications error:', e.message);
    throw e;
  }
}

export async function createNotification(n: Omit<DBNotification, 'id' | 'created_at'>): Promise<DBNotification> {
  const id = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({ id, ...n })
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e: any) {
    console.warn('Supabase createNotification error, falling back:', e.message);
    throw e;
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    if (error) throw error;
  } catch (e: any) {
    console.warn('Supabase markNotificationRead error:', e.message);
    throw e;
  }
}

export async function clearAllNotifications(): Promise<void> {
  try {
    // Delete all rows in the notifications table
    const { error } = await supabase
      .from('notifications')
      .delete()
      .neq('id', 'keep-none'); // targets all ids
    if (error) throw error;
  } catch (e: any) {
    console.warn('Supabase clearAllNotifications error:', e.message);
    throw e;
  }
}
