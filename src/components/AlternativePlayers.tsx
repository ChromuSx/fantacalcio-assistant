
// ===== src/components/AlternativePlayers.tsx =====
import { useMemo } from 'react';
import { Player } from '@/types';
import { useAuctionStore } from '@/stores/auctionStore';
import { RefreshCw } from 'lucide-react';

interface AlternativePlayersProps {
  currentPlayer: Player;
}

export function AlternativePlayers({ currentPlayer }: AlternativePlayersProps) {
  const { players, selectPlayer } = useAuctionStore();
  
  const alternatives = useMemo(() => {
    return players
      .filter(p => 
        p.ruolo === currentPlayer.ruolo && 
        p.status === 'available' && 
        p.id !== currentPlayer.id
      )
      .sort((a, b) => b.convenienzaPotenziale - a.convenienzaPotenziale)
      .slice(0, 6);
  }, [players, currentPlayer]);
  
  if (alternatives.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-4">
        <RefreshCw size={20} />
        Alternative migliori disponibili
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        {alternatives.map(player => (
          <div
            key={player.id}
            onClick={() => selectPlayer(player)}
            className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-purple-50 hover:shadow-md transition-all"
          >
            <p className="font-semibold text-sm">{player.nome}</p>
            <p className="text-xs text-gray-600">{player.squadra}</p>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">Conv.</span>
              <span className="font-bold text-purple-600">
                {player.convenienzaPotenziale.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}