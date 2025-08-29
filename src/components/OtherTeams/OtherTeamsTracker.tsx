// src/components/OtherTeams/OtherTeamsTracker.tsx
import { useState } from 'react';
import { useAuctionStore } from '@/stores/auctionStore';
import { Users, TrendingUp, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import { Role } from '@/types';

export function OtherTeamsTracker() {
  const { otherTeams, config } = useAuctionStore();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Converti Map in array per renderizzare  
  // Usa il valore direttamente dato che team ha già la proprietà name
  const teamsArray = Array.from(otherTeams.values());
  
  // Calcola statistiche per team
  const getTeamStats = (team: any) => {
    const roleCount: Record<Role, number> = { P: 0, D: 0, C: 0, A: 0 };
    team.players.forEach((p: any) => {
      if (p.ruolo) roleCount[p.ruolo as Role]++;
    });
    
    const budgetSpent = team.budgetSpent || 0;
    const budgetRemaining = config.BUDGET_TOTALE - budgetSpent;
    const avgPrice = team.players.length > 0 ? Math.round(budgetSpent / team.players.length) : 0;
    
    // Calcola completamento roster
    const totalNeeded = Object.values(config.POSTI_RUOLO).reduce((a, b) => a + b, 0);
    const completion = Math.round((team.players.length / totalNeeded) * 100);
    
    return { roleCount, budgetRemaining, avgPrice, completion };
  };
  
  // Identifica team pericolosi (quasi completi o con molto budget)
  const isDangerous = (team: any) => {
    const stats = getTeamStats(team);
    return stats.budgetRemaining > 100 && stats.completion > 60;
  };
  
  if (teamsArray.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Altre Squadre</h3>
        <p className="text-gray-500 text-center py-8">
          Nessuna squadra tracciata. Quando altri acquistano giocatori, appariranno qui.
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Users size={20} />
          Altre Squadre ({teamsArray.length})
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              "px-3 py-1 rounded",
              viewMode === 'grid' ? 'bg-purple-600 text-white' : 'bg-gray-200'
            )}
          >
            Griglia
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              "px-3 py-1 rounded",
              viewMode === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-200'
            )}
          >
            Lista
          </button>
        </div>
      </div>
      
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4">
          {teamsArray.map(team => {
            const stats = getTeamStats(team);
            const dangerous = isDangerous(team);
            
            return (
              <div
                key={team.name}
                className={clsx(
                  "border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                  dangerous && "border-orange-400 bg-orange-50",
                  expandedTeam === team.name && "ring-2 ring-purple-500"
                )}
                onClick={() => setExpandedTeam(expandedTeam === team.name ? null : team.name)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">{team.name}</h4>
                    <p className="text-sm text-gray-600">
                      {team.players.length} giocatori
                    </p>
                  </div>
                  {dangerous && (
                    <AlertCircle className="text-orange-500" size={20} />
                  )}
                </div>
                
                {/* Budget Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Spesi: {team.budgetSpent}€</span>
                    <span>Rimasti: {stats.budgetRemaining}€</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${(team.budgetSpent / config.BUDGET_TOTALE) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* Ruoli */}
                <div className="flex justify-between text-xs">
                  {Object.entries(stats.roleCount).map(([role, count]) => (
                    <div
                      key={role}
                      className={clsx(
                        "text-center px-2 py-1 rounded",
                        count >= config.POSTI_RUOLO[role as Role] 
                          ? "bg-green-100 text-green-700"
                          : count > 0 
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      <div className="font-semibold">{role}</div>
                      <div>{count}/{config.POSTI_RUOLO[role as Role]}</div>
                    </div>
                  ))}
                </div>
                
                {/* Giocatori (espandibile) */}
                {expandedTeam === team.name && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {team.players.map((player: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {player.nome} ({player.ruolo})
                          </span>
                          <span className="font-semibold text-purple-600">
                            {player.paidPrice}€
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 pt-2 border-t text-sm">
                      <div className="flex justify-between">
                        <span>Media acquisto:</span>
                        <span className="font-semibold">{stats.avgPrice}€</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {teamsArray.map(team => {
            const stats = getTeamStats(team);
            const isExpanded = expandedTeam === team.name;
            
            return (
              <div key={team.name} className="border rounded-lg">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedTeam(isExpanded ? null : team.name)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                      <div>
                        <h4 className="font-semibold">{team.name}</h4>
                        <p className="text-sm text-gray-600">
                          {team.players.length} giocatori • Spesi {team.budgetSpent}€
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {Object.entries(stats.roleCount).map(([role, count]) => (
                        <div key={role} className="text-center">
                          <div className="text-xs text-gray-500">{role}</div>
                          <div className={clsx(
                            "font-semibold",
                            count >= config.POSTI_RUOLO[role as Role] 
                              ? "text-green-600"
                              : count > 0 
                              ? "text-yellow-600"
                              : "text-gray-400"
                          )}>
                            {count}/{config.POSTI_RUOLO[role as Role]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="border-t px-4 py-3 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      {team.players.map((player: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-sm bg-white p-2 rounded">
                          <span>
                            <span className="font-semibold">{player.nome}</span>
                            <span className="text-gray-500 ml-1">({player.ruolo})</span>
                          </span>
                          <span className="text-purple-600 font-semibold">{player.paidPrice}€</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}