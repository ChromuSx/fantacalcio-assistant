// src/components/Layout/MainPanel.tsx
import { useAuctionStore } from '@/stores/auctionStore';
import { PlayerCard } from '@/components/PlayerCard/PlayerCard';
import { AlternativePlayers } from '@/components/AlternativePlayers';
import { FileQuestion } from 'lucide-react';

export function MainPanel() {
  const selectedPlayer = useAuctionStore((state) => state.selectedPlayer);
  
  if (!selectedPlayer) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <FileQuestion size={64} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">
          Nessun giocatore selezionato
        </h2>
        <p className="text-gray-500">
          Cerca o seleziona un giocatore dalla lista per vedere i dettagli e i consigli
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <PlayerCard player={selectedPlayer} />
      <AlternativePlayers currentPlayer={selectedPlayer} />
    </div>
  );
}