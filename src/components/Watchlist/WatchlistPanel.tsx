// src/components/Watchlist/WatchlistPanel.tsx
import { useState, useMemo } from 'react';
import { useAuctionStore } from '@/stores/auctionStore';
import { 
  Eye, Plus, X, Star, StarOff, Search, 
  Filter, ChevronDown, ChevronUp, Trash2,
  Lightbulb, BookmarkPlus, Users
} from 'lucide-react';
import clsx from 'clsx';
import { Watchlist } from '@/types';

export function WatchlistPanel() {
  const { 
    watchlists, 
    getWatchlistPlayers, 
    createWatchlist, 
    deleteWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    selectPlayer,
    players
  } = useAuctionStore();
  
  const [selectedWatchlist, setSelectedWatchlist] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [newWatchlistDescription, setNewWatchlistDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedWatchlists, setExpandedWatchlists] = useState<Set<string>>(new Set());
  
  // Ordina watchlist per priorità
  const sortedWatchlists = useMemo(() => {
    return [...watchlists].sort((a, b) => b.priority - a.priority);
  }, [watchlists]);
  
  // Giocatori della watchlist selezionata
  const watchlistPlayers = useMemo(() => {
    if (!selectedWatchlist) return [];
    const players = getWatchlistPlayers(selectedWatchlist);
    
    if (!searchQuery) return players;
    
    return players.filter(p => 
      p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.squadra.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectedWatchlist, getWatchlistPlayers, searchQuery]);
  
  const handleCreateWatchlist = () => {
    if (newWatchlistName.trim()) {
      createWatchlist(
        newWatchlistName,
        newWatchlistDescription || 'Lista personalizzata',
        []
      );
      setNewWatchlistName('');
      setNewWatchlistDescription('');
      setShowCreateForm(false);
    }
  };
  
  const handleDeleteWatchlist = (id: string) => {
    if (confirm('Sei sicuro di voler eliminare questa watchlist?')) {
      deleteWatchlist(id);
      if (selectedWatchlist === id) {
        setSelectedWatchlist(null);
      }
    }
  };
  
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedWatchlists);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedWatchlists(newExpanded);
  };
  
  const getWatchlistStats = (watchlist: Watchlist) => {
    const players = getWatchlistPlayers(watchlist.id);
    const avgConvenienza = players.length > 0
      ? players.reduce((sum, p) => sum + p.convenienzaPotenziale, 0) / players.length
      : 0;
    
    const available = players.filter(p => p.status === 'available').length;
    const taken = players.filter(p => p.status !== 'available').length;
    
    return { 
      total: players.length, 
      available, 
      taken, 
      avgConvenienza: avgConvenienza.toFixed(1) 
    };
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Eye size={20} />
            Watchlist
          </h2>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm flex items-center gap-1"
          >
            <Plus size={16} />
            Nuova
          </button>
        </div>
        
        {/* Ricerca */}
        {selectedWatchlist && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Cerca in watchlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        )}
      </div>
      
      {/* Lista Watchlist */}
      <div className="flex-1 overflow-y-auto p-4">
        {showCreateForm && (
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <h3 className="font-semibold mb-2">Crea nuova watchlist</h3>
            <input
              type="text"
              placeholder="Nome watchlist..."
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
              className="w-full px-3 py-2 mb-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              autoFocus
            />
            <input
              type="text"
              placeholder="Descrizione (opzionale)..."
              value={newWatchlistDescription}
              onChange={(e) => setNewWatchlistDescription(e.target.value)}
              className="w-full px-3 py-2 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateWatchlist}
                disabled={!newWatchlistName.trim()}
                className={clsx(
                  "px-3 py-1 rounded text-sm transition",
                  newWatchlistName.trim()
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                )}
              >
                Crea
              </button>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewWatchlistName('');
                  setNewWatchlistDescription('');
                }}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Annulla
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-2">
          {sortedWatchlists.map(watchlist => {
            const stats = getWatchlistStats(watchlist);
            const isExpanded = expandedWatchlists.has(watchlist.id);
            const isSelected = selectedWatchlist === watchlist.id;
            
            return (
              <div
                key={watchlist.id}
                className={clsx(
                  "rounded-lg border transition-all",
                  isSelected ? 'ring-2 ring-purple-500' : '',
                  isExpanded ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                )}
                style={{ borderColor: watchlist.color }}
              >
                <div
                  className="p-3 cursor-pointer"
                  onClick={() => {
                    setSelectedWatchlist(isSelected ? null : watchlist.id);
                    toggleExpanded(watchlist.id);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">{watchlist.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{watchlist.name}</h3>
                          {watchlist.type === 'auto' && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                              <Lightbulb size={10} className="inline mr-1" />
                              Auto
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {watchlist.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {watchlist.type === 'manual' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteWatchlist(watchlist.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <button className="p-1">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-gray-600">
                      <Users size={12} className="inline mr-1" />
                      {stats.total} giocatori
                    </span>
                    <span className="text-green-600">
                      ✓ {stats.available} disponibili
                    </span>
                    {stats.taken > 0 && (
                      <span className="text-red-600">
                        ✗ {stats.taken} presi
                      </span>
                    )}
                    <span className="text-purple-600">
                      Conv: {stats.avgConvenienza}
                    </span>
                  </div>
                </div>
                
                {/* Giocatori espansi */}
                {isExpanded && watchlistPlayers.length > 0 && (
                  <div className="border-t px-3 py-2 max-h-60 overflow-y-auto">
                    <div className="space-y-1">
                      {watchlistPlayers.slice(0, 10).map(player => (
                        <div
                          key={player.id}
                          onClick={() => selectPlayer(player)}
                          className={clsx(
                            "flex justify-between items-center p-2 rounded cursor-pointer transition",
                            player.status === 'available' 
                              ? 'hover:bg-purple-100' 
                              : 'opacity-50'
                          )}
                        >
                          <div>
                            <p className="text-sm font-medium">{player.nome}</p>
                            <p className="text-xs text-gray-600">
                              {player.squadra} - {player.ruolo}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-purple-600">
                              {player.convenienzaPotenziale.toFixed(1)}
                            </p>
                            {player.status !== 'available' && (
                              <p className="text-xs text-red-600">Preso</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {watchlistPlayers.length > 10 && (
                      <p className="text-center text-xs text-gray-500 mt-2">
                        +{watchlistPlayers.length - 10} altri giocatori
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {watchlists.length === 0 && !showCreateForm && (
          <div className="text-center py-8">
            <Eye size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-gray-500 mb-3">Nessuna watchlist</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
            >
              Crea la tua prima watchlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}