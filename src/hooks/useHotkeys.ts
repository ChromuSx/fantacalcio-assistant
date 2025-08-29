
// ===== src/hooks/useHotkeys.ts =====
import { useEffect } from 'react';
import { useAuctionStore } from '@/stores/auctionStore';
import toast from 'react-hot-toast';

export function useHotkeys() {
  const { selectedPlayer, purchasePlayer } = useAuctionStore();
  
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignora se stiamo scrivendo in un input
      if (e.target instanceof HTMLInputElement) return;
      
      // Shortcuts
      switch(e.key) {
        case ' ': // Spacebar
          e.preventDefault();
          if (selectedPlayer) {
            const price = prompt(`Prezzo per ${selectedPlayer.nome}:`);
            if (price) {
              purchasePlayer(selectedPlayer, parseInt(price), 'me');
              toast.success('Giocatore acquistato!');
            }
          }
          break;
          
        case 'Escape':
          useAuctionStore.getState().selectPlayer(null);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedPlayer, purchasePlayer]);
}
