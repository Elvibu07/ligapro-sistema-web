import { useState, useEffect, useCallback } from 'react';
import { getClubs, createClub, updateClub, deleteClub } from '../lib/services/clubs';
import { getPlayers, createPlayer, updatePlayer, deletePlayer } from '../lib/services/players';
import { getMatches, createMatch, updateMatch, deleteMatch } from '../lib/services/matches';
import { getSanctions, createSanction, updateSanction } from '../lib/services/sanctions';
import { getStadiums, createStadium, updateStadium } from '../lib/services/stadiums';
import { getPostponements, createPostponement, updatePostponement } from '../lib/services/postponements';
import type { Club, Player, Match, Sanction, Stadium, PostponementRequest } from '../types';
import { initialClubs } from '../mockData';
import { createNotification } from '../lib/services/notifications';

const dispatchNotification = (text: string, type: string, view: string) => {
  window.dispatchEvent(new CustomEvent('ligapro-notification', {
    detail: { text, type, view }
  }));
  
  createNotification({ text, type, view, read: false }).catch(err => {
    console.warn('Silent fallback on Supabase notify:', err.message);
  });
};

const getMatchLabel = (homeId: string, awayId: string) => {
  const home = initialClubs.find(c => c.id === homeId);
  const away = initialClubs.find(c => c.id === awayId);
  const homeName = home ? home.shortName : homeId;
  const awayName = away ? away.shortName : awayId;
  return `${homeName} vs ${awayName}`;
};

// ─── useClubs ────────────────────────────────────────────────────────────────
export function useClubs(fallback: Club[]) {
  const [clubs, setClubs] = useState<Club[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getClubs();
      setClubs(data.length > 0 ? data : fallback);
    } catch (e: any) {
      console.warn('Supabase clubs error, using fallback:', e.message);
      setClubs(fallback);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (club: Omit<Club, 'id' | 'squadCount'>) => {
    try {
      const created = await createClub({ ...club, squadCount: 0 });
      setClubs(prev => [...prev, created]);
      dispatchNotification(`Nuevo club agregado: "${created.name}"`, 'club', 'clubes');
      return created;
    } catch (e: any) {
      console.warn('Supabase add club error, using local fallback:', e.message);
      const localId = club.shortName.toLowerCase().replace(/[^a-z0-9]/g, "-") || `club-${Date.now()}`;
      const localClub: Club = { ...club, id: localId, squadCount: 0 };
      setClubs(prev => [...prev, localClub]);
      dispatchNotification(`Nuevo club agregado (Local): "${localClub.name}"`, 'club', 'clubes');
      return localClub;
    }
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Club>) => {
    try {
      const updated = await updateClub(id, updates);
      setClubs(prev => prev.map(c => c.id === id ? updated : c));
      dispatchNotification(`Club "${updated.name}" actualizado`, 'club', 'clubes');
      return updated;
    } catch (e: any) {
      console.warn('Supabase update club error, using local fallback:', e.message);
      let updatedClub: any = null;
      setClubs(prev => prev.map(c => {
        if (c.id === id) {
          updatedClub = { ...c, ...updates };
          return updatedClub;
        }
        return c;
      }));
      if (updatedClub) {
        dispatchNotification(`Club "${updatedClub.name}" actualizado (Local)`, 'club', 'clubes');
      }
      return updatedClub;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    let clubName = '';
    setClubs(prev => {
      const found = prev.find(c => c.id === id);
      if (found) clubName = found.name;
      return prev;
    });
    try {
      await deleteClub(id);
      dispatchNotification(`Club "${clubName || id}" eliminado del sistema`, 'club', 'clubes');
    } catch (e: any) {
      console.warn('Supabase delete club error, removing locally:', e.message);
      dispatchNotification(`Club "${clubName || id}" eliminado del sistema (Local)`, 'club', 'clubes');
    } finally {
      setClubs(prev => prev.filter(c => c.id !== id));
    }
  }, []);

  return { clubs, setClubs, loading, error, add, update, remove, reload: load };
}

// ─── usePlayers ───────────────────────────────────────────────────────────────
export function usePlayers(fallback: Player[]) {
  const [players, setPlayers] = useState<Player[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPlayers();
      setPlayers(data.length > 0 ? data : fallback);
    } catch (e: any) {
      console.warn('Supabase players error, using fallback:', e.message);
      setPlayers(fallback);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (player: Omit<Player, 'id'>) => {
    try {
      const created = await createPlayer(player);
      setPlayers(prev => [...prev, created]);
      dispatchNotification(`Nuevo jugador registrado: "${created.name}"`, 'plantel', 'plantel');
      return created;
    } catch (e: any) {
      console.warn('Supabase add player error, using local fallback:', e.message);
      const localId = `ply-${player.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Date.now()}`;
      const localPlayer: Player = { ...player, id: localId };
      setPlayers(prev => [...prev, localPlayer]);
      dispatchNotification(`Nuevo jugador registrado (Local): "${localPlayer.name}"`, 'plantel', 'plantel');
      return localPlayer;
    }
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Player>) => {
    try {
      const updated = await updatePlayer(id, updates);
      setPlayers(prev => prev.map(p => p.id === id ? updated : p));
      dispatchNotification(`Jugador "${updated.name}" actualizado`, 'plantel', 'plantel');
      return updated;
    } catch (e: any) {
      console.warn('Supabase update player error, using local fallback:', e.message);
      let updatedPlayer: any = null;
      setPlayers(prev => prev.map(p => {
        if (p.id === id) {
          updatedPlayer = { ...p, ...updates };
          if (updates.documentStatus) {
            updatedPlayer.documentStatus = { ...p.documentStatus, ...updates.documentStatus };
          }
          return updatedPlayer;
        }
        return p;
      }));
      if (updatedPlayer) {
        dispatchNotification(`Jugador "${updatedPlayer.name}" actualizado (Local)`, 'plantel', 'plantel');
      }
      return updatedPlayer;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    let playerName = '';
    setPlayers(prev => {
      const found = prev.find(p => p.id === id);
      if (found) playerName = found.name;
      return prev;
    });
    try {
      await deletePlayer(id);
      dispatchNotification(`Jugador "${playerName || id}" eliminado del plantel`, 'plantel', 'plantel');
    } catch (e: any) {
      console.warn('Supabase delete player error, removing locally:', e.message);
      dispatchNotification(`Jugador "${playerName || id}" eliminado del plantel (Local)`, 'plantel', 'plantel');
    } finally {
      setPlayers(prev => prev.filter(p => p.id !== id));
    }
  }, []);

  return { players, setPlayers, loading, error, add, update, remove, reload: load };
}

// ─── useMatches ───────────────────────────────────────────────────────────────
export function useMatches(fallback: Match[]) {
  const [matches, setMatches] = useState<Match[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMatches();
      setMatches(data.length > 0 ? data : fallback);
    } catch (e: any) {
      console.warn('Supabase matches error, using fallback:', e.message);
      setMatches(fallback);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (match: Omit<Match, 'id'>) => {
    const matchLabel = getMatchLabel(match.homeTeamId, match.awayTeamId);
    try {
      const created = await createMatch(match);
      setMatches(prev => [...prev, created]);
      dispatchNotification(`Nuevo partido programado: ${matchLabel} (Jornada ${match.round})`, 'programacion', 'programacion');
      return created;
    } catch (e: any) {
      console.warn('Supabase add match error, using local fallback:', e.message);
      const localId = `match-${match.homeTeamId}-${match.awayTeamId}-${Date.now()}`;
      const localMatch: Match = { ...match, id: localId };
      setMatches(prev => [...prev, localMatch]);
      dispatchNotification(`Nuevo partido programado (Local): ${matchLabel} (Jornada ${match.round})`, 'programacion', 'programacion');
      return localMatch;
    }
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Match>) => {
    try {
      const updated = await updateMatch(id, updates);
      setMatches(prev => prev.map(m => m.id === id ? updated : m));
      const matchLabel = getMatchLabel(updated.homeTeamId, updated.awayTeamId);
      let updateMsg = `Partido ${matchLabel} actualizado`;
      if (updates.status) {
        updateMsg = `Partido ${matchLabel} cambió de estado a "${updates.status}"`;
      } else if (updates.homeScore !== undefined || updates.awayScore !== undefined) {
        updateMsg = `Resultado actualizado: ${matchLabel} (${updates.homeScore ?? updated.homeScore} - ${updates.awayScore ?? updated.awayScore})`;
      }
      dispatchNotification(updateMsg, 'programacion', 'programacion');
      return updated;
    } catch (e: any) {
      console.warn('Supabase update match error, using local fallback:', e.message);
      let updatedMatch: any = null;
      setMatches(prev => prev.map(m => {
        if (m.id === id) {
          updatedMatch = { ...m, ...updates };
          if (updates.logistics) {
            updatedMatch.logistics = { ...m.logistics, ...updates.logistics };
          }
          return updatedMatch;
        }
        return m;
      }));
      if (updatedMatch) {
        const matchLabel = getMatchLabel(updatedMatch.homeTeamId, updatedMatch.awayTeamId);
        let updateMsg = `Partido ${matchLabel} actualizado (Local)`;
        if (updates.status) {
          updateMsg = `Partido ${matchLabel} cambió de estado a "${updates.status}" (Local)`;
        } else if (updates.homeScore !== undefined || updates.awayScore !== undefined) {
          updateMsg = `Resultado actualizado (Local): ${matchLabel} (${updates.homeScore ?? updatedMatch.homeScore} - ${updates.awayScore ?? updatedMatch.awayScore})`;
        }
        dispatchNotification(updateMsg, 'programacion', 'programacion');
      }
      return updatedMatch;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteMatch(id);
      setMatches(prev => prev.filter(m => m.id !== id));
      dispatchNotification(`Partido eliminado`, 'programacion', 'programacion');
    } catch (e: any) {
      console.warn('Supabase delete match error, using local fallback:', e.message);
      setMatches(prev => prev.filter(m => m.id !== id));
      dispatchNotification(`Partido eliminado (Local)`, 'programacion', 'programacion');
    }
  }, []);

  return { matches, setMatches, loading, error, add, update, remove, reload: load };
}

// ─── useSanctions ─────────────────────────────────────────────────────────────
export function useSanctions(fallback: Sanction[]) {
  const [sanctions, setSanctions] = useState<Sanction[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSanctions();
      setSanctions(data.length > 0 ? data : fallback);
    } catch (e: any) {
      console.warn('Supabase sanctions error, using fallback:', e.message);
      setSanctions(fallback);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (sanction: Omit<Sanction, 'id'>) => {
    try {
      const created = await createSanction(sanction);
      setSanctions(prev => [created, ...prev]);
      dispatchNotification(`Nueva sanción emitida: ${created.targetName} (${created.offense})`, 'disciplina', 'disciplina');
      return created;
    } catch (e: any) {
      console.warn('Supabase add sanction error, using local fallback:', e.message);
      const localId = `sanc-${Date.now()}`;
      const localSanction: Sanction = { ...sanction, id: localId };
      setSanctions(prev => [localSanction, ...prev]);
      dispatchNotification(`Nueva sanción emitida (Local): ${localSanction.targetName} (${localSanction.offense})`, 'disciplina', 'disciplina');
      return localSanction;
    }
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Sanction>) => {
    try {
      const updated = await updateSanction(id, updates);
      setSanctions(prev => prev.map(s => s.id === id ? updated : s));
      let msg = `Sanción a ${updated.targetName} actualizada`;
      if (updates.appealDetails?.status) {
        msg = `Apelación de ${updated.targetName}: estado cambiado a "${updates.appealDetails.status}"`;
      }
      dispatchNotification(msg, 'disciplina', 'disciplina');
      return updated;
    } catch (e: any) {
      console.warn('Supabase update sanction error, using local fallback:', e.message);
      let updatedSanction: any = null;
      setSanctions(prev => prev.map(s => {
        if (s.id === id) {
          updatedSanction = { ...s, ...updates };
          if (updates.appealDetails) {
            updatedSanction.appealDetails = { ...s.appealDetails, ...updates.appealDetails };
          }
          return updatedSanction;
        }
        return s;
      }));
      if (updatedSanction) {
        let msg = `Sanción a ${updatedSanction.targetName} actualizada (Local)`;
        if (updates.appealDetails?.status) {
          msg = `Apelación de ${updatedSanction.targetName}: estado cambiado a "${updates.appealDetails.status}" (Local)`;
        }
        dispatchNotification(msg, 'disciplina', 'disciplina');
      }
      return updatedSanction;
    }
  }, []);

  return { sanctions, setSanctions, loading, error, add, update, reload: load };
}

// ─── useStadiums ─────────────────────────────────────────────────────────────
export function useStadiums(fallback: Stadium[]) {
  const [stadiums, setStadiums] = useState<Stadium[]>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStadiums();
      setStadiums(data.length > 0 ? data : fallback);
    } catch (e: any) {
      console.warn('Supabase stadiums error, using fallback:', e.message);
      setStadiums(fallback);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (stadium: Omit<Stadium, 'id'>) => {
    try {
      const created = await createStadium(stadium);
      setStadiums(prev => [...prev, created]);
      dispatchNotification(`Nuevo estadio agregado: "${created.name}"`, 'estadios', 'estadios');
      return created;
    } catch (e: any) {
      console.warn('Supabase add stadium error, using local fallback:', e.message);
      const localId = `std-${Date.now()}`;
      const localStadium: Stadium = { ...stadium, id: localId };
      setStadiums(prev => [...prev, localStadium]);
      dispatchNotification(`Nuevo estadio agregado (Local): "${localStadium.name}"`, 'estadios', 'estadios');
      return localStadium;
    }
  }, []);

  const update = useCallback(async (id: string, updates: Partial<Stadium>) => {
    try {
      const updated = await updateStadium(id, updates);
      setStadiums(prev => prev.map(s => s.id === id ? updated : s));
      dispatchNotification(`Estadio "${updated.name}" actualizado`, 'estadios', 'estadios');
      return updated;
    } catch (e: any) {
      console.warn('Supabase update stadium error, using local fallback:', e.message);
      let updatedStadium: any = null;
      setStadiums(prev => prev.map(s => {
        if (s.id === id) {
          updatedStadium = { ...s, ...updates };
          return updatedStadium;
        }
        return s;
      }));
      if (updatedStadium) {
        dispatchNotification(`Estadio "${updatedStadium.name}" actualizado (Local)`, 'estadios', 'estadios');
      }
      return updatedStadium;
    }
  }, []);

  return { stadiums, setStadiums, loading, error, add, update, reload: load };
}

// ─── usePostponements ────────────────────────────────────────────────────────
export function usePostponements(fallback: PostponementRequest[]) {
  const STORAGE_KEY = 'ligapro-postponements';

  const [postponements, setPostponements] = useState<PostponementRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : fallback;
    } catch {
      return fallback;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPostponements();
      if (data.length > 0) {
        setPostponements(data);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
      } else {
        const saved = localStorage.getItem(STORAGE_KEY);
        setPostponements(saved ? JSON.parse(saved) : fallback);
      }
    } catch (e: any) {
      console.warn('Supabase postponements error, using fallback:', e.message);
      const saved = localStorage.getItem(STORAGE_KEY);
      setPostponements(saved ? JSON.parse(saved) : fallback);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fallback]);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (req: Omit<PostponementRequest, 'id'>) => {
    try {
      const created = await createPostponement(req);
      setPostponements(prev => {
        const next = [created, ...prev];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      dispatchNotification(`Nueva solicitud de postergación: ${created.originalLabel}`, 'postergaciones', 'postergaciones');
      return created;
    } catch (e: any) {
      console.warn('Supabase add postponement error, using local fallback:', e.message);
      const localId = `POST-${Math.floor(100 + Math.random() * 900)}`;
      const localReq: PostponementRequest = { ...req, id: localId };
      setPostponements(prev => {
        const next = [localReq, ...prev];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      dispatchNotification(`Nueva solicitud de postergación (Local): ${localReq.originalLabel}`, 'postergaciones', 'postergaciones');
      return localReq;
    }
  }, []);

  const update = useCallback(async (id: string, updates: Partial<PostponementRequest>) => {
    try {
      const updated = await updatePostponement(id, updates);
      setPostponements(prev => {
        const next = prev.map(r => r.id === id ? updated : r);
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      let msg = `Solicitud de postergación de ${updated.originalLabel} actualizada`;
      if (updates.status) {
        msg = `Postergación de ${updated.originalLabel} fue "${updates.status === 'Aprobado' ? 'Aprobada' : 'Rechazada'}"`;
      }
      dispatchNotification(msg, 'postergaciones', 'postergaciones');
      return updated;
    } catch (e: any) {
      console.warn('Supabase update postponement error, using local fallback:', e.message);
      let updatedReq: any = null;
      setPostponements(prev => {
        const next = prev.map(r => {
          if (r.id === id) {
            updatedReq = { ...r, ...updates };
            return updatedReq;
          }
          return r;
        });
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
        return next;
      });
      if (updatedReq) {
        let msg = `Solicitud de postergación de ${updatedReq.originalLabel} actualizada (Local)`;
        if (updates.status) {
          msg = `Postergación de ${updatedReq.originalLabel} fue "${updates.status === 'Aprobado' ? 'Aprobada' : 'Rechazada'}" (Local)`;
        }
        dispatchNotification(msg, 'postergaciones', 'postergaciones');
      }
      return updatedReq;
    }
  }, []);

  return { postponements, setPostponements, loading, error, add, update, reload: load };
}
