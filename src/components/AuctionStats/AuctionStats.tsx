// src/components/AuctionStats/AuctionStats.tsx
import { useAuctionStore } from '@/stores/auctionStore';
import { TrendingUp, Users, Coins, Target } from 'lucide-react';
import { Role } from '@/types';

export function AuctionStats() {
  const { players, myTeam, otherTeams, config, budgetRemaining } = useAuctionStore();
  
  // Calcola statistiche generali
  const totalPlayers = players.length;
  const takenPlayers = players.filter(p => p.status !== 'available').length;
  const availablePlayers = totalPlayers - takenPlayers;
  const progressPercentage = Math.round((takenPlayers / totalPlayers) * 100);
  
  // Calcola spesa totale nell'asta
  const totalSpent = players
    .filter(p => p.paidPrice)
    .reduce((sum, p) => sum + (p.paidPrice || 0), 0);
  
  // Media prezzi per ruolo
  const avgPriceByRole = Object.keys(config.POSTI_RUOLO).reduce((acc, role) => {
    const rolePlayers = players.filter(p => p.ruolo === role && p.paidPrice);
    const avg = rolePlayers.length > 0
      ? Math.round(rolePlayers.reduce((sum, p) => sum + (p.paidPrice || 0), 0) / rolePlayers.length)
      : 0;
    return { ...acc, [role]: avg };
  }, {} as Record<Role, number>);
  
  // Top spese
  const topPurchases = [...players]
    .filter(p => p.paidPrice)
    .sort((a, b) => (b.paidPrice || 0) - (a.paidPrice || 0))
    .slice(0, 5);
  
  // Migliori affari (alta convenienza, basso prezzo)
  const bestDeals = [...players]
    .filter(p => p.paidPrice && p.convenienzaPotenziale > 60)
    .map(p => ({
      ...p,
      dealScore: p.convenienzaPotenziale / (p.paidPrice || 1)
    }))
    .sort((a, b) => b.dealScore - a.dealScore)
    .slice(0, 5);
  
  // Calcola posizione nella lega
  const mySpent = config.BUDGET_TOTALE - budgetRemaining;
  const teamsArray = Array.from(otherTeams.values());
  const leaguePosition = teamsArray.filter(t => t.budgetSpent < mySpent).length + 1;
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <TrendingUp size={20} />
        Statistiche Asta
      </h3>
      
      {/* Progress bar asta */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progresso Asta</span>
          <span>{takenPlayers}/{totalPlayers} giocatori ({progressPercentage}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Users size={16} />
            <span className="text-sm font-medium">Posizione Lega</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {leaguePosition}° posto
          </div>
          <p className="text-xs text-gray-600">per budget speso</p>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <Coins size={16} />
            <span className="text-sm font-medium">Spesa Media</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {totalSpent > 0 ? Math.round(totalSpent / takenPlayers) : 0}€
          </div>
          <p className="text-xs text-gray-600">per giocatore</p>
        </div>
      </div>
      
      {/* Media per ruolo */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Media Prezzi per Ruolo</h4>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(avgPriceByRole).map(([role, avg]) => (
            <div key={role} className="text-center bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500">{role}</div>
              <div className="font-bold text-gray-800">{avg}€</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Top Acquisti e Affari */}
      <div className="grid grid-cols-2 gap-4">
        {/* Top Spese */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">💸 Top Acquisti</h4>
          <div className="space-y-1">
            {topPurchases.map((p, idx) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate">
                  {idx + 1}. {p.nome}
                </span>
                <span className="font-semibold text-red-600">
                  {p.paidPrice}€
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Migliori Affari */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">💎 Migliori Affari</h4>
          <div className="space-y-1">
            {bestDeals.map((p, idx) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate">
                  {idx + 1}. {p.nome}
                </span>
                <span className="font-semibold text-green-600">
                  {p.paidPrice}€
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}