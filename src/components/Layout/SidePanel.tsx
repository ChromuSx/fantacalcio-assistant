// src/components/Layout/SidePanel.tsx
import { useState } from 'react';
import { useAuctionStore } from '@/stores/auctionStore';
import { Player } from '@/types';
import { Trophy, Users } from 'lucide-react';
import { AddToWatchlist } from '@/components/Watchlist/AddToWatchlist';  // 👈 NUOVO IMPORT
import clsx from 'clsx';

export function SidePanel() {
  const [activeTab, setActiveTab] = useState<'available' | 'myteam'>('available');
  const { 
    getAvailablePlayers, 
    myTeam, 
    selectPlayer,
    selectedPlayer 
  } = useAuctionStore();
  
  const availablePlayers = getAvailablePlayers();
  
  const PlayerItem = ({ player }: { player: Player }) => (
    <div
      className={clsx(
        "p-3 rounded-lg transition-all border-2",
        selectedPlayer?.id === player.id 
          ? "bg-purple-100 border-purple-500" 
          : "bg-gray-50 hover:bg-gray-100 border-transparent"
      )}
    >
      <div className="flex items-center gap-2">
        {/* 👇 MODIFICATO: Aggiunto flex-1 e cursor-pointer solo sulla parte cliccabile */}
        <div 
          className="flex-1 cursor-pointer"
          onClick={() => selectPlayer(player)}
        >
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{player.nome}</p>
              <p className="text-sm text-gray-600">
                {player.squadra} - {player.ruolo}
              </p>
            </div>
            <div className="text-right mr-2">
              <p className="font-bold text-purple-600">
                {player.convenienzaPotenziale.toFixed(1)}
              </p>
              {player.paidPrice && (
                <p className="text-sm text-gray-500">💰 {player.paidPrice}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* 👇 NUOVO: AddToWatchlist button per giocatori disponibili */}
        {player.status === 'available' && (
          <div className="border-l pl-2">
            <AddToWatchlist
              player={player}
              variant="dropdown"
              size="sm"
            />
          </div>
        )}
        
        {/* 👇 Per i giocatori già presi, mostra il proprietario */}
        {player.status !== 'available' && player.owner && (
          <div className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-600">
            {player.owner === 'me' ? '✓ Mio' : player.owner}
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[600px] flex flex-col">
      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('available')}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all",
            activeTab === 'available' 
              ? "bg-purple-600 text-white" 
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          )}
        >
          <Users size={18} />
          <span>Disponibili ({availablePlayers.length})</span>
        </button>
        
        <button
          onClick={() => setActiveTab('myteam')}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-all",
            activeTab === 'myteam' 
              ? "bg-purple-600 text-white" 
              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
          )}
        >
          <Trophy size={18} />
          <span>Mia Rosa ({myTeam.length})</span>
        </button>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        <div className="space-y-2">
          {activeTab === 'available' ? (
            <>
              {/* 👇 OPZIONALE: Header con azioni bulk */}
              {availablePlayers.length > 0 && (
                <div className="mb-3 pb-3 border-b text-xs text-gray-500">
                  <p>💡 Clicca sulla stella per aggiungere a watchlist</p>
                </div>
              )}
              
              {availablePlayers.slice(0, 30).map(player => (
                <PlayerItem key={player.id} player={player} />
              ))}
            </>
          ) : (
            myTeam.map(player => (
              <PlayerItem key={player.id} player={player} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}