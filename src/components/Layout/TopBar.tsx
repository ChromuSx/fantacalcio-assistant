// src/components/Layout/TopBar.tsx
import { Settings, Upload, RefreshCw } from 'lucide-react';
import { useAuctionStore } from '@/stores/auctionStore';
import { Role } from '@/types';
import clsx from 'clsx';

interface TopBarProps {
  onImportClick: () => void;
}

export function TopBar({ onImportClick }: TopBarProps) {
  const { budgetRemaining, getSlotsInfo, resetAuction } = useAuctionStore();
  const slotsInfo = getSlotsInfo();
  
  const handleReset = () => {
    if (window.confirm('Sei sicuro di voler resettare l\'asta? Perderai tutti i dati.')) {
      resetAuction();
    }
  };
  
  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Budget e Slots */}
          <div className="flex items-center space-x-8">
            {/* Budget */}
            <div className="bg-white/10 backdrop-blur rounded-lg px-4 py-2">
              <div className="text-3xl font-bold">💰 {budgetRemaining}</div>
              <div className="text-sm opacity-90">Crediti rimanenti</div>
            </div>
            
            {/* Slots per ruolo */}
            <div className="flex space-x-4">
              {(Object.entries(slotsInfo) as [Role, typeof slotsInfo[Role]][]).map(([ruolo, info]) => (
                <div 
                  key={ruolo} 
                  className={clsx(
                    "text-center px-3 py-1 rounded-lg",
                    info.remaining === 0 && "bg-green-500/20",
                    info.remaining > 0 && info.taken > 0 && "bg-yellow-500/20",
                    info.taken === 0 && "bg-white/10"
                  )}
                >
                  <div className="text-lg font-semibold">
                    {ruolo}: {info.taken}/{info.total}
                  </div>
                  <div className="text-xs opacity-75">
                    {info.remaining === 0 ? '✓ Completo' : `${info.remaining} mancanti`}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Azioni */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onImportClick}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
            >
              <Upload size={18} />
              <span>Importa</span>
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg transition"
            >
              <RefreshCw size={18} />
              <span>Reset</span>
            </button>
          </div>
        </div>
        
        {/* Alert se budget basso */}
        {budgetRemaining < 50 && budgetRemaining > 0 && (
          <div className="mt-3 bg-yellow-500/20 border border-yellow-400/50 rounded-lg px-4 py-2">
            ⚠️ Budget quasi esaurito! Fai attenzione ai prezzi.
          </div>
        )}
      </div>
    </div>
  );
}