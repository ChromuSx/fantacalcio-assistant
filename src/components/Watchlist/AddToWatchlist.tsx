// src/components/Watchlist/AddToWatchlist.tsx
import { useState, useRef, useEffect } from 'react';
import { useAuctionStore } from '@/stores/auctionStore';
import { Player } from '@/types';
import { 
  Eye, Plus, Check, X, Star, StarOff, 
  ChevronDown, Search, Lightbulb 
} from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface AddToWatchlistProps {
  player: Player;
  variant?: 'button' | 'dropdown';
  size?: 'sm' | 'md' | 'lg';
  dropdownPosition?: 'auto' | 'up' | 'down';  // Nuovo prop
  onSuccess?: () => void;
}

export function AddToWatchlist({ 
  player, 
  variant = 'dropdown',
  size = 'md',
  dropdownPosition = 'auto',
  onSuccess 
}: AddToWatchlistProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownDirection, setDropdownDirection] = useState<'up' | 'down'>('down');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const {
    watchlists,
    addToWatchlist,
    removeFromWatchlist,
    createWatchlist,
    isPlayerInWatchlist
  } = useAuctionStore();
  
  // Filtra watchlist per ricerca
  const filteredWatchlists = watchlists.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Ordina: manuali prima, poi per priorità
  const sortedWatchlists = [...filteredWatchlists].sort((a, b) => {
    if (a.type === 'manual' && b.type === 'auto') return -1;
    if (a.type === 'auto' && b.type === 'manual') return 1;
    return b.priority - a.priority;
  });
  
  // Conta in quante watchlist è il giocatore
  const watchlistCount = watchlists.filter(w => 
    isPlayerInWatchlist(player.id, w.id)
  ).length;
  
  // 🔥 NUOVO: Calcola posizione del dropdown usando position fixed
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 400; // Altezza stimata del dropdown
      const viewportHeight = window.innerHeight;
      const spaceBelow = viewportHeight - buttonRect.bottom;
      const spaceAbove = buttonRect.top;
      
      let direction: 'up' | 'down' = 'down';
      let top = buttonRect.bottom + 8;
      
      // Determina direzione basata su spazio disponibile
      if (dropdownPosition === 'auto') {
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          direction = 'up';
          top = buttonRect.top - dropdownHeight - 8;
        }
      } else if (dropdownPosition === 'up') {
        direction = 'up';
        top = buttonRect.top - dropdownHeight - 8;
      }
      
      // Calcola posizione orizzontale
      let left = buttonRect.left;
      const dropdownWidth = 320; // Larghezza del dropdown (w-80 = 20rem = 320px)
      
      // Aggiusta se esce dallo schermo a destra
      if (left + dropdownWidth > window.innerWidth) {
        left = buttonRect.right - dropdownWidth;
      }
      
      // Aggiusta se esce dallo schermo a sinistra
      if (left < 10) {
        left = 10;
      }
      
      setDropdownDirection(direction);
      setDropdownStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999,
        width: '320px'
      });
    }
  }, [isOpen, dropdownPosition]);
  
  // Chiudi dropdown cliccando fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current && 
        !buttonRef.current.contains(event.target as Node) &&
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowCreateForm(false);
      }
    };
    
    // Chiudi con ESC
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setShowCreateForm(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);
  
  const handleToggleWatchlist = (watchlistId: string, watchlistName: string) => {
    if (isPlayerInWatchlist(player.id, watchlistId)) {
      removeFromWatchlist(watchlistId, player.id);
      toast.success(`Rimosso da "${watchlistName}"`);
    } else {
      addToWatchlist(watchlistId, player.id);
      toast.success(`Aggiunto a "${watchlistName}"`);
    }
    onSuccess?.();
  };
  
  const handleCreateAndAdd = () => {
    if (newName.trim()) {
      createWatchlist(
        newName,
        newDescription || 'Lista personalizzata',
        [player.id]
      );
      toast.success(`Creata watchlist "${newName}" con ${player.nome}`);
      setNewName('');
      setNewDescription('');
      setShowCreateForm(false);
      setIsOpen(false);
      onSuccess?.();
    }
  };
  
  // Stili basati sulla size
  const sizeClasses = {
    sm: {
      button: 'p-1.5',
      icon: 16,
      badge: 'text-xs px-1'
    },
    md: {
      button: 'p-2',
      icon: 20,
      badge: 'text-xs px-1.5'
    },
    lg: {
      button: 'p-3',
      icon: 24,
      badge: 'text-sm px-2'
    }
  };
  
  const currentSize = sizeClasses[size];
  
  // Dropdown Component - Ora usa Portal-like rendering
  const WatchlistDropdown = () => {
    // 🔥 IMPORTANTE: Ora usiamo style calcolato dinamicamente
    return (
      <div 
        ref={dropdownRef}
        style={dropdownStyle}
        className={clsx(
          "bg-white rounded-xl shadow-2xl border border-gray-200",
          "animate-in fade-in-0 zoom-in-95",
          dropdownDirection === 'up' ? 'slide-in-from-bottom-2' : 'slide-in-from-top-2'
        )}
      >
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-800">
              Gestisci Watchlist
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            {player.nome} - {player.squadra}
          </p>
          
          {/* Search */}
          {watchlists.length > 5 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cerca watchlist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}
        </div>
        
        {/* Lista Watchlist */}
        <div className="max-h-72 overflow-y-auto">
          {sortedWatchlists.length > 0 ? (
            <div className="p-2">
              {/* Watchlist Manuali */}
              {sortedWatchlists.filter(w => w.type === 'manual').length > 0 && (
                <>
                  <p className="text-xs text-gray-500 uppercase tracking-wider px-3 py-1">
                    Le tue watchlist
                  </p>
                  {sortedWatchlists
                    .filter(w => w.type === 'manual')
                    .map(watchlist => {
                      const isInList = isPlayerInWatchlist(player.id, watchlist.id);
                      
                      return (
                        <button
                          key={watchlist.id}
                          onClick={() => handleToggleWatchlist(watchlist.id, watchlist.name)}
                          className={clsx(
                            "w-full text-left p-3 rounded-lg transition flex items-center justify-between group",
                            isInList ? 'bg-purple-50 hover:bg-purple-100' : 'hover:bg-gray-50'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{watchlist.icon}</span>
                            <div>
                              <p className="font-medium text-gray-800">{watchlist.name}</p>
                              <p className="text-xs text-gray-500">
                                {watchlist.playerIds.length} giocatori
                              </p>
                            </div>
                          </div>
                          
                          {isInList ? (
                            <Check className="text-green-600" size={20} />
                          ) : (
                            <Plus className="text-gray-400 group-hover:text-purple-600" size={20} />
                          )}
                        </button>
                      );
                    })}
                </>
              )}
              
              {/* Watchlist Automatiche */}
              {sortedWatchlists.filter(w => w.type === 'auto').length > 0 && (
                <>
                  <p className="text-xs text-gray-500 uppercase tracking-wider px-3 py-1 mt-2">
                    Watchlist automatiche
                  </p>
                  {sortedWatchlists
                    .filter(w => w.type === 'auto')
                    .map(watchlist => {
                      const isInList = isPlayerInWatchlist(player.id, watchlist.id);
                      
                      return (
                        <button
                          key={watchlist.id}
                          onClick={() => handleToggleWatchlist(watchlist.id, watchlist.name)}
                          className={clsx(
                            "w-full text-left p-3 rounded-lg transition flex items-center justify-between group",
                            isInList ? 'bg-purple-50 hover:bg-purple-100' : 'hover:bg-gray-50'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{watchlist.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-gray-800">{watchlist.name}</p>
                                <Lightbulb size={12} className="text-blue-500" />
                              </div>
                              <p className="text-xs text-gray-500">
                                {watchlist.playerIds.length} giocatori
                              </p>
                            </div>
                          </div>
                          
                          {isInList ? (
                            <Check className="text-green-600" size={20} />
                          ) : (
                            <Plus className="text-gray-400 group-hover:text-purple-600" size={20} />
                          )}
                        </button>
                      );
                    })}
                </>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <Eye size={24} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nessuna watchlist trovata</p>
            </div>
          )}
        </div>
        
        {/* Crea nuova watchlist */}
        <div className="border-t p-3">
          {!showCreateForm ? (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
            >
              <Plus size={18} />
              Crea nuova watchlist
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Nome watchlist..."
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <input
                type="text"
                placeholder="Descrizione (opzionale)..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateAndAdd}
                  disabled={!newName.trim()}
                  className={clsx(
                    "flex-1 px-3 py-1.5 rounded-lg text-sm transition",
                    newName.trim()
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  )}
                >
                  Crea e aggiungi
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewName('');
                    setNewDescription('');
                  }}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Variante Button
  if (variant === 'button') {
    return (
      <>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <Eye size={18} />
          Watchlist
          {watchlistCount > 0 && (
            <span className="px-2 py-0.5 bg-purple-500 rounded-full text-xs">
              {watchlistCount}
            </span>
          )}
          <ChevronDown size={16} className={clsx(
            "transition-transform",
            isOpen && 'rotate-180'
          )} />
        </button>
        
        {isOpen && <WatchlistDropdown />}
      </>
    );
  }
  
  // Variante Dropdown (default - icona)
  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "rounded-lg transition relative",
          currentSize.button,
          watchlistCount > 0 
            ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        )}
        title={`Gestisci watchlist (${watchlistCount} liste)`}
      >
        {watchlistCount > 0 ? (
          <Star size={currentSize.icon} className="fill-current" />
        ) : (
          <StarOff size={currentSize.icon} />
        )}
        {watchlistCount > 0 && (
          <span className={clsx(
            "absolute -top-1 -right-1 bg-purple-600 text-white rounded-full",
            currentSize.badge
          )}>
            {watchlistCount}
          </span>
        )}
      </button>
      
      {/* 🔥 IMPORTANTE: Il dropdown ora è renderizzato fuori dal contenitore */}
      {isOpen && <WatchlistDropdown />}
    </>
  );
}