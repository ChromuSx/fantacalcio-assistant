// ===== src/components/Layout/SidePanel.tsx =====
import { useState } from 'react';
import { useAuctionStore } from '@/stores/auctionStore';
import { Player } from '@/types';
import { Trophy, Users } from 'lucide-react';
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
      onClick={() => selectPlayer(player)}
      className={clsx(
        "p-3 rounded-lg cursor-pointer transition-all",
        selectedPlayer?.id === player.id 
          ? "bg-purple-100 border-2 border-purple-500" 
          : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
      )}
    >
      <div className="flex justify-between items-center">
        <div className="flex-1">
          <p className="font-semibold text-gray-800">{player.nome}</p>
          <p className="text-sm text-gray-600">
            {player.squadra} - {player.ruolo}
          </p>
        </div>
        <div className="text-right">
          <p className="font-bold text-purple-600">
            {player.convenienzaPotenziale.toFixed(1)}
          </p>
          {player.paidPrice && (
            <p className="text-sm text-gray-500">💰 {player.paidPrice}</p>
          )}
        </div>
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
            availablePlayers.slice(0, 30).map(player => (
              <PlayerItem key={player.id} player={player} />
            ))
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
