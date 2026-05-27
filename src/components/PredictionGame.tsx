import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, ChevronRight, Gamepad2, Award, Zap, AlertCircle } from 'lucide-react';
import type { Club, Match } from '../types';
import type { AuthUser } from '../lib/services/auth';

interface PredictionGameProps {
  matches: Match[];
  clubs: Club[];
  user: AuthUser | null;
}

interface Prediction {
  homeScore: number;
  awayScore: number;
}

export default function PredictionGame({ matches, clubs, user }: PredictionGameProps) {
  const [activeTab, setActiveTab] = useState<'pronosticos' | 'ranking'>('pronosticos');
  const [predictions, setPredictions] = useState<Record<string, Prediction>>({});
  const [showConfetti, setShowConfetti] = useState(false);

  // Load predictions from local storage
  useEffect(() => {
    const key = `ligapro_predictions_${user?.email || 'guest'}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setPredictions(JSON.parse(saved));
      } catch (e) {}
    }
  }, [user]);

  // Save prediction
  const handleSavePrediction = (matchId: string, home: number, away: number) => {
    const newPredictions = { ...predictions, [matchId]: { homeScore: home, awayScore: away } };
    setPredictions(newPredictions);
    localStorage.setItem(`ligapro_predictions_${user?.email || 'guest'}`, JSON.stringify(newPredictions));
    
    // Confetti effect
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  const getClub = (id: string) => clubs.find(c => c.id === id);

  // Filter matches
  const upcomingMatches = matches.filter(m => m.status === 'Programado');
  const finishedMatches = matches.filter(m => m.status === 'Finalizado');

  // Calculate user points
  let userPoints = 0;
  let exactHits = 0;
  let winnerHits = 0;

  finishedMatches.forEach(m => {
    const pred = predictions[m.id];
    if (pred && m.homeScore != null && m.awayScore != null) {
      const realHomeWin = m.homeScore > m.awayScore;
      const realAwayWin = m.awayScore > m.homeScore;
      const realTie = m.homeScore === m.awayScore;

      const predHomeWin = pred.homeScore > pred.awayScore;
      const predAwayWin = pred.awayScore > pred.homeScore;
      const predTie = pred.homeScore === pred.awayScore;

      if (pred.homeScore === m.homeScore && pred.awayScore === m.awayScore) {
        userPoints += 3;
        exactHits++;
      } else if ((realHomeWin && predHomeWin) || (realAwayWin && predAwayWin) || (realTie && predTie)) {
        userPoints += 1;
        winnerHits++;
      }
    }
  });

  // Mock Ranking Data
  const mockRanking = [
    { name: 'JuanPerez10', points: userPoints + 12, exact: exactHits + 4, avatar: 'https://ui-avatars.com/api/?name=JP&background=random' },
    { name: 'Ecuagol_99', points: userPoints + 8, exact: exactHits + 2, avatar: 'https://ui-avatars.com/api/?name=EG&background=random' },
    { name: 'BarcelonaCampeon', points: userPoints + 5, exact: exactHits + 1, avatar: 'https://ui-avatars.com/api/?name=BC&background=random' },
    { name: user?.name || 'Tú', points: userPoints, exact: exactHits, avatar: user?.avatar || 'https://ui-avatars.com/api/?name=TU&background=CCFF00', isUser: true },
    { name: 'LigaReyDeCopas', points: Math.max(0, userPoints - 3), exact: Math.max(0, exactHits - 1), avatar: 'https://ui-avatars.com/api/?name=LR&background=random' },
    { name: 'EmelecPasión', points: Math.max(0, userPoints - 7), exact: Math.max(0, exactHits - 2), avatar: 'https://ui-avatars.com/api/?name=EP&background=random' },
  ].sort((a, b) => b.points - a.points);

  return (
    <div className="space-y-6 relative">
      {/* Confetti Overlay */}
      {showConfetti && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden rounded-2xl">
          <div className="w-full h-full bg-[url('https://i.gifer.com/origin/d3/d3f472b06590a25cb4372ff289d81711_w200.gif')] bg-cover opacity-50 mix-blend-screen" />
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#CCFF00]/20 via-slate-900 to-[#CCFF00]/5 border border-[#CCFF00]/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-[#CCFF00]/5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 size={24} className="text-[#CCFF00]" />
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">La Polla LigaPro</h2>
          </div>
          <p className="text-slate-400 text-sm max-w-md">
            Pronostica los resultados de la LigaPro, acumula puntos y compite contra miles de hinchas en todo el país.
          </p>
        </div>
        
        {/* User Stats Card */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex gap-6 shrink-0 w-full sm:w-auto">
          <div className="text-center">
            <p className="text-slate-500 text-[10px] font-mono uppercase">Tus Puntos</p>
            <p className="text-3xl font-black text-[#CCFF00]">{userPoints}</p>
          </div>
          <div className="w-px bg-slate-800" />
          <div className="flex flex-col gap-2 justify-center">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">3</span>
              <span className="text-slate-400 font-mono">pts por exacto</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">1</span>
              <span className="text-slate-400 font-mono">pt por ganador</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('pronosticos')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'pronosticos' ? 'bg-[#CCFF00] text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Próximos Partidos
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ranking' ? 'bg-[#CCFF00] text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Ranking Global <Trophy size={14} className={activeTab === 'ranking' ? 'text-slate-950' : 'text-amber-400'} />
        </button>
      </div>

      {/* Content */}
      {activeTab === 'pronosticos' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <AlertCircle size={14} className="text-blue-400" />
            Ingresa tu pronóstico y se guardará automáticamente al hacer clic en el botón verde.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingMatches.map(match => {
              const home = getClub(match.homeTeamId);
              const away = getClub(match.awayTeamId);
              const pred = predictions[match.id];

              return (
                <div key={match.id} className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 hover:border-[#CCFF00]/30 transition-all">
                  <div className="text-center mb-4">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      JORNADA {match.round}
                    </span>
                    <p className="text-slate-500 text-[10px] font-mono mt-2">{match.date} • {match.time}</p>
                  </div>

                  <PredictionInput 
                    matchId={match.id}
                    home={home} 
                    away={away} 
                    existingPrediction={pred}
                    onSave={handleSavePrediction} 
                  />
                </div>
              );
            })}

            {upcomingMatches.length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-500 font-mono text-sm border border-slate-800 rounded-2xl bg-slate-900/30">
                No hay partidos programados actualmente para pronosticar.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ranking' && (
        <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy size={20} className="text-amber-400" />
              <h3 className="font-black text-white text-lg">Top 50 - Nacional</h3>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-slate-800 px-3 py-1 rounded-full">Temporada 2026</span>
          </div>

          <div className="divide-y divide-slate-800/50">
            {mockRanking.map((userRow, i) => (
              <div key={userRow.name} className={`flex items-center p-4 transition-colors hover:bg-slate-800/30 ${userRow.isUser ? 'bg-[#CCFF00]/5 border-l-4 border-l-[#CCFF00]' : ''}`}>
                <div className={`w-8 text-center font-black ${i === 0 ? 'text-amber-400 text-xl' : i === 1 ? 'text-slate-300 text-lg' : i === 2 ? 'text-amber-700 text-lg' : 'text-slate-500'}`}>
                  {i + 1}
                </div>
                <img src={userRow.avatar} alt="avatar" className="w-10 h-10 rounded-full border-2 border-slate-800 ml-4 mr-4" />
                <div className="flex-1">
                  <p className={`font-bold ${userRow.isUser ? 'text-[#CCFF00]' : 'text-white'}`}>
                    {userRow.name} {userRow.isUser && '(Tú)'}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500">{userRow.exact} aciertos exactos</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-white">{userRow.points}</p>
                  <p className="text-[10px] font-mono text-slate-500">PTS</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component for individual prediction inputs
function PredictionInput({ 
  matchId, 
  home, 
  away, 
  existingPrediction, 
  onSave 
}: { 
  matchId: string, 
  home: Club | undefined, 
  away: Club | undefined, 
  existingPrediction?: Prediction,
  onSave: (id: string, h: number, a: number) => void 
}) {
  const [hScore, setHScore] = useState<string>(existingPrediction?.homeScore.toString() ?? '');
  const [aScore, setAScore] = useState<string>(existingPrediction?.awayScore.toString() ?? '');
  const [saved, setSaved] = useState(!!existingPrediction);

  // Sync state when predictions are loaded asynchronously from localStorage
  useEffect(() => {
    if (existingPrediction) {
      setHScore(existingPrediction.homeScore.toString());
      setAScore(existingPrediction.awayScore.toString());
      setSaved(true);
    }
  }, [existingPrediction]);

  const handleSave = () => {
    if (hScore === '' || aScore === '') return;
    onSave(matchId, parseInt(hScore), parseInt(aScore));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        {/* Home */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center p-2 mb-2">
            {home?.logo}
          </div>
          <p className="text-white font-bold text-xs text-center leading-tight mb-2">{home?.shortName}</p>
          <input 
            type="number" 
            min="0" 
            max="99"
            value={hScore}
            onChange={(e) => setHScore(e.target.value)}
            className="w-14 h-14 bg-slate-950 border-2 border-slate-800 rounded-xl text-center text-2xl font-black text-white focus:outline-none focus:border-[#CCFF00] transition-colors"
            placeholder="-"
          />
        </div>

        <div className="text-slate-500 font-black text-xl pt-10">VS</div>

        {/* Away */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center p-2 mb-2">
            {away?.logo}
          </div>
          <p className="text-white font-bold text-xs text-center leading-tight mb-2">{away?.shortName}</p>
          <input 
            type="number" 
            min="0" 
            max="99"
            value={aScore}
            onChange={(e) => setAScore(e.target.value)}
            className="w-14 h-14 bg-slate-950 border-2 border-slate-800 rounded-xl text-center text-2xl font-black text-white focus:outline-none focus:border-[#CCFF00] transition-colors"
            placeholder="-"
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={hScore === '' || aScore === ''}
        className={`w-full py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
          saved 
            ? 'bg-emerald-500 text-slate-900' 
            : hScore !== '' && aScore !== ''
              ? 'bg-[#CCFF00] text-slate-950 hover:bg-[#b5e000] active:scale-[0.98]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        {saved ? (
          <><CheckCircle2 size={16} /> Pronóstico Guardado</>
        ) : (
          'Guardar Pronóstico'
        )}
      </button>
    </div>
  );
}
