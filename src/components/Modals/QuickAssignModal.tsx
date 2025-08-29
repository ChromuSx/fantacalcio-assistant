// src/components/Modals/QuickAssignModal.tsx
import { useState, useEffect } from 'react';
import { X, Users, Plus } from 'lucide-react';
import { Player } from '@/types';
import { useAuctionStore } from '@/stores/auctionStore';
import toast from 'react-hot-toast';
import clsx from 'clsx';

interface QuickAssignModalProps {
  player: Player;
  onClose: () => void;
}

export function QuickAssignModal({ player, onClose }: QuickAssignModalProps) {
  const { purchasePlayer, otherTeams, budgetRemaining } = useAuctionStore();
  const [price, setPrice] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [newTeamName, setNewTeamName] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // Lista delle squadre esistenti
  const existingTeams = Array.from(otherTeams.keys());
  
  // Suggerimenti nomi squadre
  const teamSuggestions = [
    'Squadra Rossi', 'Team Marco', 'FC Giovanni', 'Real Fantacalcio',
    'Inter Asta', 'Juventus Fantasy', 'Milan Dreams', 'Roma Legends'
  ].filter(name => !existingTeams.includes(name));
  
  const handleAssign = () => {
    const priceNum = parseInt(price);
    
    if (!priceNum || priceNum <= 0) {
      toast.error('Inserisci un prezzo valido');
      return;
    }
    
    const teamName = isCreatingNew ? newTeamName : selectedTeam;
    
    if (!teamName) {
      toast.error('Seleziona o crea una squadra');
      return;
    }
    
    if (teamName === 'me') {
      if (priceNum > budgetRemaining) {
        toast.error('Budget insufficiente!');
        return;
      }
    }
    
    purchasePlayer(player, priceNum, teamName);
    toast.success(`${player.nome} assegnato a ${teamName === 'me' ? 'La Mia Squadra' : teamName}`);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold">Assegna Giocatore</h2>
            <p className="text-gray-600 mt-1">
              {player.nome} - {player.squadra} ({player.ruolo})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Input Prezzo */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prezzo di acquisto
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Inserisci prezzo..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            autoFocus
          />
        </div>
        
        {/* Selezione Squadra */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assegna a:
          </label>
          
          {/* La Mia Squadra */}
          <div className="mb-3">
            <button
              onClick={() => {
                setSelectedTeam('me');
                setIsCreatingNew(false);
              }}
              className={clsx(
                "w-full text-left px-4 py-3 rounded-lg border-2 transition",
                selectedTeam === 'me'
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <div>
                  <p className="font-semibold">La Mia Squadra</p>
                  <p className="text-sm text-gray-600">
                    Budget rimanente: {budgetRemaining}€
                  </p>
                </div>
              </div>
            </button>
          </div>
          
          {/* Squadre Esistenti */}
          {existingTeams.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">Squadre esistenti:</p>
              <div className="grid grid-cols-2 gap-2">
                {existingTeams.map(team => (
                  <button
                    key={team}
                    onClick={() => {
                      setSelectedTeam(team);
                      setIsCreatingNew(false);
                    }}
                    className={clsx(
                      "px-3 py-2 rounded-lg border text-sm transition",
                      selectedTeam === team
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <Users size={14} className="inline mr-1" />
                    {team}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Nuova Squadra */}
          <div>
            {!isCreatingNew ? (
              <button
                onClick={() => setIsCreatingNew(true)}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-400 hover:text-purple-600 transition flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                Crea Nuova Squadra
              </button>
            ) : (
              <div>
                <input
                  type="text"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Nome della squadra..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsCreatingNew(false);
                      setNewTeamName('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Annulla
                  </button>
                  {teamSuggestions.length > 0 && (
                    <button
                      onClick={() => setNewTeamName(teamSuggestions[0])}
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      Suggerisci: {teamSuggestions[0]}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Azioni */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Annulla
          </button>
          <button
            onClick={handleAssign}
            disabled={!price || (!selectedTeam && !newTeamName)}
            className={clsx(
              "flex-1 py-2 px-4 rounded-lg font-semibold transition",
              price && (selectedTeam || newTeamName)
                ? "bg-purple-600 text-white hover:bg-purple-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            Assegna
          </button>
        </div>
      </div>
    </div>
  );
}