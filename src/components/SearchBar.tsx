// src/components/SearchBar.tsx
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useAuctionStore } from '@/stores/auctionStore';
import { AddToWatchlist } from '@/components/Watchlist/AddToWatchlist';  // 👈 NUOVO IMPORT
import Fuse from 'fuse.js';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const { players, selectPlayer } = useAuctionStore();
  
  const fuse = useMemo(() => {
    return new Fuse(players.filter(p => p.status === 'available'), {
      keys: ['nome', 'squadra'],
      threshold: 0.3,
    });
  }, [players]);
  
  const searchResults = useMemo(() => {
    if (!query) return [];
    return fuse.search(query).slice(0, 5);
  }, [query, fuse]);
  
  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca giocatore per nome o squadra..."
          className="w-full pl-12 pr-4 py-3 text-lg border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          autoFocus
        />
      </div>
      
      {/* Risultati ricerca */}
      {searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          {searchResults.map(({ item }) => (
            <div
              key={item.id}
              className="px-4 py-3 hover:bg-purple-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex justify-between items-center">
                {/* 👇 MODIFICATO: Wrappato in div con flex-1 per lasciare spazio */}
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => {
                    selectPlayer(item);
                    setQuery('');
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{item.nome}</p>
                      <p className="text-sm text-gray-600">{item.squadra} - {item.ruolo}</p>
                    </div>
                    <div className="text-right mr-3">
                      <p className="font-bold text-purple-600">{item.convenienzaPotenziale.toFixed(1)}</p>
                      <p className="text-xs text-gray-500">Convenienza</p>
                    </div>
                  </div>
                </div>
                
                {/* 👇 NUOVO: Pulsante AddToWatchlist */}
                <div className="ml-2 border-l pl-2">
                  <AddToWatchlist 
                    player={item}
                    variant="dropdown"
                    size="sm"
                    onSuccess={() => {
                      // Opzionale: chiudi la ricerca dopo aver aggiunto
                      // setQuery('');
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}