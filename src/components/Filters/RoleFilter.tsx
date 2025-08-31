// src/components/Filters/RoleFilter.tsx
import { useState } from 'react';
import { useAuctionStore } from '@/stores/auctionStore';
import { Role } from '@/types';
import clsx from 'clsx';
import { Filter, SortDesc } from 'lucide-react';

export function RoleFilter() {
  const [selectedRole, setSelectedRole] = useState<Role | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'scoreAffare' | 'convenienza' | 'fantamedia' | 'presenze'>('scoreAffare');
  const { players, selectPlayer } = useAuctionStore();
  
  const roles: Array<Role | 'ALL'> = ['ALL', 'P', 'D', 'C', 'A'];
  
  // Filtra e ordina giocatori
  const filteredPlayers = players
    .filter(p => p.status === 'available')
    .filter(p => selectedRole === 'ALL' || p.ruolo === selectedRole)
    .sort((a, b) => {
      switch (sortBy) {
        case 'scoreAffare':
          return (b.scoreAffare || 0) - (a.scoreAffare || 0);
        case 'convenienza':
          return b.convenienzaPotenziale - a.convenienzaPotenziale;
        case 'fantamedia':
          return b.fantamediaCorrente - a.fantamediaCorrente;
        case 'presenze':
          return b.presenzeCorrente - a.presenzeCorrente;
        default:
          return 0;
      }
    })
    .slice(0, 10);
  
  const roleEmojis = {
    ALL: '👥',
    P: '🥅',
    D: '🛡️',
    C: '⚡',
    A: '⚽'
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Filter size={20} />
        Filtri Rapidi
      </h3>
      
      {/* Filtro Ruolo */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Ruolo</label>
        <div className="flex gap-2">
          {roles.map(role => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              className={clsx(
                "flex-1 py-2 px-3 rounded-lg font-medium transition flex items-center justify-center gap-1",
                selectedRole === role
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <span>{roleEmojis[role]}</span>
              <span>{role === 'ALL' ? 'Tutti' : role}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Ordinamento */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-1">
          <SortDesc size={16} />
          Ordina per
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="convenienza">Convenienza</option>
          <option value="fantamedia">Fantamedia</option>
          <option value="presenze">Presenze</option>
        </select>
      </div>
      
      {/* Top Players Filtrati */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">
          Top {selectedRole === 'ALL' ? 'Giocatori' : `${selectedRole}`} Disponibili
        </h4>
        <div className="space-y-2">
          {filteredPlayers.map((player, idx) => (
            <div
              key={player.id}
              onClick={() => selectPlayer(player)}
              className="flex justify-between items-center p-2 bg-gray-50 rounded-lg hover:bg-purple-50 cursor-pointer transition"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-400">#{idx + 1}</span>
                <div>
                  <p className="font-semibold text-sm">{player.nome}</p>
                  <p className="text-xs text-gray-600">{player.squadra}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-600">
                  {sortBy === 'convenienza' && player.convenienzaPotenziale.toFixed(1)}
                  {sortBy === 'fantamedia' && player.fantamediaCorrente.toFixed(2)}
                  {sortBy === 'presenze' && player.presenzeCorrente}
                </p>
                <p className="text-xs text-gray-500">
                  {sortBy === 'convenienza' && 'conv.'}
                  {sortBy === 'fantamedia' && 'FM'}
                  {sortBy === 'presenze' && 'pres.'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}