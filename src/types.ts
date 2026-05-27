export type ClubStatus = "Habilitado" | "Observado" | "Pendiente";

export interface Club {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  founded: string;
  city: string;
  stadium: string;
  status: ClubStatus;
  legalRepresentative: string;
  contactEmail: string;
  logo: string;
  legalDocStatus: {
    estatutos: boolean;
    solvencia: boolean;
    ministerioDeporte: boolean;
    registroLigaPro: boolean;
  };
  squadCount: number;
}

export interface Player {
  id: string;
  clubId: string;
  name: string;
  number: number;
  position: "Arquero" | "Defensa" | "Mediocampista" | "Delantero";
  nationality: string;
  birthDate: string;
  status: "Habilitado" | "Por Habilitar" | "Suspendido";
  shirtNumber: number;
  matchesPlayed: number;
  yellowCards: number;
  redCards: number;
  goals: number;
  contractUntil: string;
  image: string;
  height: string;
  weight: string;
  documentStatus: {
    photoId: boolean;
    contractSigned: boolean;
    medicalCertificate: boolean;
    transferCertificate: string; // "N/A", "Aprobado", "Pendiente"
  };
}

export interface Sanction {
  id: string;
  targetType: "Jugador" | "Club";
  targetName: string;
  clubName: string;
  offense: string;
  severity: "Baja" | "Media" | "Alta" | "Crítica";
  fineUSD: number;
  matchesSuspended: number;
  dateEmitted: string;
  resolved: boolean;
  appealDetails?: {
    appellantComment: string;
    appealDate: string;
    status: "Pendiente" | "Rechazado" | "Aprobado";
    resolutionComment?: string;
  };
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  date: string;
  time: string;
  stadiumId: string;
  status: "Programado" | "En Juego" | "Finalizado" | "Postergado";
  homeScore?: number;
  awayScore?: number;
  round: number;
  tvChannel: string;
  refereeAppointed?: string;
  logistics: {
    seguridadOk: boolean;
    ambulanciaOk: boolean;
    transmisionTvOk: boolean;
    certificacionVarOk: boolean;
    balonerosOk: boolean;
  };
}

export interface Referee {
  id: string;
  name: string;
  category: "FIFA" | "Nacional" | "Asistente";
  province: string;
  matchesThisSeason: number;
  activeConflicts: string[]; // List of club names they cannot referee due to bias/origin
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  altitude: number; // in meters (high altitude vs sea level effects)
  capacity: number;
  lightingLux: number; // Stadium light power
  grassType: "Césped Natural" | "Césped Mixto" | "Césped Sintético";
  vorConnectivity: "Fibra Principal + Respaldo" | "Fibra Única" | "Satelital";
  locationCoords: { lat: number; lng: number };
  varCertified: boolean;
  lastInspectionDate: string;
}

export interface SystemUser {
  name: string;
  role: "Administrador General" | "Registrador de Clubes" | "Auditor Disciplinario" | "Coordinador VAR" | "Comisión Arbitral";
  email: string;
  avatar: string;
}

export interface VarCamera {
  id: string;
  name: string;
  angle: string;
  status: "Óptimo" | "Falla de Calibración" | "Fuera de Servicio";
  lastVerified: string;
}

export interface PostponementRequest {
  id: string;
  matchId: string;
  originalLabel: string;
  reason: string;
  proposedDate: string;
  proposedTime: string;
  fileName: string;
  status: "Pendiente" | "Aprobado" | "Rechazado";
  dateRequested: string;
}
