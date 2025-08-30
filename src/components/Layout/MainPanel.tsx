// src/components/Layout/MainPanel.tsx
import { useAuctionStore } from '@/stores/auctionStore';
import { PlayerCard } from '@/components/PlayerCard/PlayerCard';
import { PlayerNotes } from '@/components/PlayerCard/PlayerNotes';
import { AlternativePlayers } from '@/components/AlternativePlayers';
import { FileQuestion, Lightbulb } from 'lucide-react';
import toast from 'react-hot-toast';

export function MainPanel() {
  const { 
    selectedPlayer, 
    generateNotesForPlayer,
    getPlayerNotes 
  } = useAuctionStore();
  
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
        
        {/* Suggerimento per le note */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg max-w-md mx-auto">
          <Lightbulb className="mx-auto text-purple-500 mb-2" size={24} />
          <p className="text-sm text-purple-700">
            <strong>Novità!</strong> Ora ogni giocatore può avere note intelligenti 
            basate sui dati di fpedia e FSTATS. Seleziona un giocatore per vedere le sue note 
            o generarle automaticamente.
          </p>
        </div>
      </div>
    );
  }
  
  const playerNotes = getPlayerNotes(selectedPlayer.id);
  const hasNotes = playerNotes.length > 0;
  
  return (
    <div className="space-y-6">
      {/* Card principale del giocatore */}
      <PlayerCard player={selectedPlayer} />
      
      {/* Note del giocatore */}
      {hasNotes ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <PlayerNotes player={selectedPlayer} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center py-6">
            <Lightbulb size={32} className="mx-auto text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Nessuna nota per {selectedPlayer.nome}
            </h3>
            <p className="text-gray-500 mb-4">
              Posso generare automaticamente insights basati sui dati disponibili
            </p>
            <button
              onClick={() => {
                generateNotesForPlayer(selectedPlayer.id);
                toast.success('Note generate con successo!');
              }}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <Lightbulb className="inline mr-2" size={18} />
              Genera Note Intelligenti
            </button>
          </div>
        </div>
      )}
      
      {/* Giocatori alternativi */}
      <AlternativePlayers currentPlayer={selectedPlayer} />
    </div>
  );
}