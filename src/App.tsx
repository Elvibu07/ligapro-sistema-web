import React, { useState } from "react";
import {
  initialClubs,
  initialPlayers,
  initialMatches,
  initialReferees,
  initialStadiums,
  initialSanctions
} from "./mockData";
import type { SystemUser } from "./types";

// Supabase hooks
import { useAuth } from "./hooks/useAuth";
import { useClubs, usePlayers, useMatches, useSanctions, useStadiums, usePostponements } from "./hooks/useData";

// Auth
import LoginPage from "./components/auth/LoginPage";

// Import modules
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import DashboardView from "./components/DashboardView";
import ClubsView from "./components/ClubsView";
import SquadView from "./components/SquadView";
import DisciplinesView from "./components/DisciplinesView";
import UniformsView from "./components/UniformsView";
import MatchesView from "./components/MatchesView";
import RefereesView from "./components/RefereesView";
import VarVorView from "./components/VarVorView";
import StadiumsView from "./components/StadiumsView";
import SecuritySettingsView from "./components/SecuritySettingsView";
import PositionsView from "./components/PositionsView";
import FixtureView from "./components/FixtureView";
import PostponementsView from "./components/PostponementsView";
import MatchSheetsView from "./components/MatchSheetsView";

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#CCFF00] to-[#88bb00] shadow-lg shadow-[#CCFF00]/20 mb-4 animate-pulse">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-slate-950" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.955 11.955 0 003 12c0 6.627 5.373 12 12 12s12-5.373 12-12c0-2.11-.546-4.095-1.502-5.819" />
          </svg>
        </div>
        <p className="text-[#CCFF00] font-black text-lg tracking-tight">LIGAPRO</p>
        <p className="text-slate-500 text-xs font-mono mt-1">Verificando sesión...</p>
        <div className="flex items-center justify-center gap-1 mt-4">
          <div className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 bg-[#CCFF00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  const { user: authUser, loading: authLoading, error: authError, login, register, update: updateProfile, logout, setError: setAuthError } = useAuth();

  // ─── Navigation ───────────────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState<string>("dashboard");

  // ─── Data via Supabase hooks (with fallback to mockData) ──────────────────
  const { clubs, setClubs, add: addClub, update: updateClub, remove: removeClub } = useClubs(initialClubs);
  const { players, setPlayers, add: addPlayer, update: updatePlayer, remove: removePlayer } = usePlayers(initialPlayers);
  const { matches, setMatches, add: addMatch, update: updateMatch } = useMatches(initialMatches);
  const { sanctions, setSanctions, add: addSanction, update: updateSanction } = useSanctions(initialSanctions);
  const { stadiums, setStadiums, update: updateStadium } = useStadiums(initialStadiums);
  const { postponements, add: addPostponement, update: updatePostponement } = usePostponements([
    {
      id: "POST-102",
      matchId: "match-3",
      originalLabel: "Aucas vs El Nacional",
      reason: "Copa Libertadores - Desplazamiento Internacional",
      proposedDate: "2026-05-27",
      proposedTime: "19:00",
      fileName: "informe_oficial_conmebol_102.pdf",
      status: "Pendiente",
      dateRequested: "2026-05-21"
    }
  ]);

  // ─── Current user state (derived from Supabase auth) ─────────────────────
  const currentUser: SystemUser = authUser
    ? {
        name: authUser.name,
        role: authUser.role,
        email: authUser.email,
        avatar: authUser.avatar,
      }
    : {
        name: "Abg. Carlos Manzur",
        role: "Administrador General",
        email: "c.manzur@fef.ec",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150",
      };



  // ─── Show loading screen while checking auth ─────────────────────────────
  if (authLoading) {
    return <LoadingSkeleton />;
  }

  // ─── Show login page if not authenticated ────────────────────────────────
  if (!authUser) {
    return (
      <LoginPage
        onLogin={login}
        onRegister={register}
        loading={authLoading}
        error={authError}
        onClearError={() => setAuthError(null)}
      />
    );
  }

  const renderActiveView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <DashboardView
            clubs={clubs}
            players={players}
            matches={matches}
            stadiums={stadiums}
            onNavigate={setCurrentView}
          />
        );
      case "clubes":
        return (
          <ClubsView
            clubs={clubs}
            onClubsChange={setClubs}
            onAddClub={addClub}
            onUpdateClub={updateClub}
            onDeleteClub={removeClub}
          />
        );
      case "posiciones":
        return (
          <PositionsView
            clubs={clubs}
          />
        );
      case "fixture":
        return (
          <FixtureView
            matches={matches}
            clubs={clubs}
            stadiums={stadiums}
          />
        );
      case "postergaciones":
        return (
          <PostponementsView
            matches={matches}
            clubs={clubs}
            onMatchesChange={setMatches}
            userRole={currentUser.role}
            postponements={postponements}
            onAddPostponement={addPostponement}
            onUpdatePostponement={updatePostponement}
          />
        );
      case "planillas":
        return (
          <MatchSheetsView
            matches={matches}
            clubs={clubs}
            players={players}
          />
        );
      case "plantel":
        return (
          <SquadView
            clubs={clubs}
            players={players}
            onPlayersChange={setPlayers}
            onAddPlayer={addPlayer}
            onUpdatePlayer={updatePlayer}
            onDeletePlayer={removePlayer}
          />
        );
      case "disciplina":
        return (
          <DisciplinesView
            sanctions={sanctions}
            onSanctionsChange={setSanctions}
            onAddSanction={addSanction}
            onUpdateSanction={updateSanction}
          />
        );
      case "programacion":
        return (
          <MatchesView
            matches={matches}
            clubs={clubs}
            stadiums={stadiums}
            onMatchesChange={setMatches}
            onAddMatch={addMatch}
            onUpdateMatch={updateMatch}
          />
        );
      case "uniformes":
        return (
          <UniformsView
            clubs={clubs}
          />
        );
      case "arbitros":
        return (
          <RefereesView
            referees={initialReferees}
            matches={matches}
            clubs={clubs}
            onMatchesChange={setMatches}
          />
        );
      case "var-vor":
        return <VarVorView />;
      case "estadios":
        return (
          <StadiumsView
            stadiums={stadiums}
            onStadiumsChange={setStadiums}
            onUpdateStadium={updateStadium}
          />
        );
      case "security":
        return (
          <SecuritySettingsView
            currentUser={currentUser}
            onUpdateProfile={updateProfile}
          />
        );
      default:
        return (
          <DashboardView
            clubs={clubs}
            players={players}
            matches={matches}
            stadiums={stadiums}
            onNavigate={setCurrentView}
          />
        );
    }
  };

  return (
    <div className="h-screen bg-slate-950 font-sans flex flex-col text-slate-100 antialiased overflow-hidden">

      {/* Top Universal Header panel */}
      <Header
        currentUser={currentUser}
        onNavigate={setCurrentView}
        onLogout={logout}
      />

      {/* Main panel layout with Sidebar and Main Area */}
      <div className="flex flex-1 h-[calc(100vh-4rem)] overflow-hidden">

        {/* Navigation Sidebar Drawer */}
        <Sidebar
          currentView={currentView}
          onNavigate={setCurrentView}
          userRole={currentUser.role}
        />

        {/* Dynamic view operational layout */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900/40 relative">

          <div className="max-w-7xl mx-auto space-y-6 pb-12">
            {renderActiveView()}
          </div>

          {/* Secure watermark bottom panel */}
          <div className="absolute bottom-3 right-6 text-[9px] font-mono text-slate-700 select-none uppercase pointer-events-none">
            LIGAPRO OFICIAL • SUPABASE BACKEND • {authUser.email}
          </div>

        </main>

      </div>

    </div>
  );
}
