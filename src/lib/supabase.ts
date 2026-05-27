import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno de Supabase. Verifica VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type Database = {
  public: {
    Tables: {
      clubs: {
        Row: {
          id: string;
          name: string;
          short_name: string;
          slug: string;
          founded: string;
          city: string;
          stadium: string;
          status: 'Habilitado' | 'Observado' | 'Pendiente';
          legal_representative: string;
          contact_email: string;
          logo: string;
          estatutos: boolean;
          solvencia: boolean;
          ministerio_deporte: boolean;
          registro_ligapro: boolean;
          squad_count: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['clubs']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['clubs']['Insert']>;
      };
      players: {
        Row: {
          id: string;
          club_id: string;
          name: string;
          number: number;
          position: 'Arquero' | 'Defensa' | 'Mediocampista' | 'Delantero';
          nationality: string;
          birth_date: string;
          status: 'Habilitado' | 'Por Habilitar' | 'Suspendido';
          shirt_number: number;
          matches_played: number;
          yellow_cards: number;
          red_cards: number;
          goals: number;
          contract_until: string;
          image: string;
          height: string;
          weight: string;
          photo_id: boolean;
          contract_signed: boolean;
          medical_certificate: boolean;
          transfer_certificate: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['players']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['players']['Insert']>;
      };
      matches: {
        Row: {
          id: string;
          home_team_id: string;
          away_team_id: string;
          date: string;
          time: string;
          stadium_id: string;
          status: 'Programado' | 'En Juego' | 'Finalizado' | 'Postergado';
          home_score: number | null;
          away_score: number | null;
          round: number;
          tv_channel: string;
          referee_appointed: string | null;
          seguridad_ok: boolean;
          ambulancia_ok: boolean;
          transmision_tv_ok: boolean;
          certificacion_var_ok: boolean;
          baloneros_ok: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['matches']['Insert']>;
      };
      stadiums: {
        Row: {
          id: string;
          name: string;
          city: string;
          altitude: number;
          capacity: number;
          lighting_lux: number;
          grass_type: 'Césped Natural' | 'Césped Mixto' | 'Césped Sintético';
          vor_connectivity: string;
          lat: number;
          lng: number;
          var_certified: boolean;
          last_inspection_date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['stadiums']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['stadiums']['Insert']>;
      };
      sanctions: {
        Row: {
          id: string;
          target_type: 'Jugador' | 'Club';
          target_name: string;
          club_name: string;
          offense: string;
          severity: 'Baja' | 'Media' | 'Alta' | 'Crítica';
          fine_usd: number;
          matches_suspended: number;
          date_emitted: string;
          resolved: boolean;
          appellant_comment: string | null;
          appeal_date: string | null;
          appeal_status: 'Pendiente' | 'Rechazado' | 'Aprobado' | null;
          resolution_comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sanctions']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['sanctions']['Insert']>;
      };
    };
  };
};
