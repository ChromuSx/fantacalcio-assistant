// src/App.tsx
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { TopBar } from '@/components/Layout/TopBar';
import { MainPanel } from '@/components/Layout/MainPanel';
import { SidePanel } from '@/components/Layout/SidePanel';
import { ImportModal } from '@/components/Modals/ImportModal';
import { SearchBar } from '@/components/SearchBar';
import { OtherTeamsTracker } from '@/components/OtherTeams/OtherTeamsTracker';
import { AuctionStats } from '@/components/AuctionStats/AuctionStats';
import { RoleFilter } from '@/components/Filters/RoleFilter';
import { WatchlistPanel } from '@/components/Watchlist/WatchlistPanel';
import { useAuctionStore } from '@/stores/auctionStore';
import { useHotkeys } from '@/hooks/useHotkeys';
import { BarChart, Users, TrendingUp, Eye, BookOpen, Lightbulb } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

function App() {
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeView, setActiveView] = useState<'auction' | 'teams' | 'stats' | 'watchlist'>('auction');
  const [showNotesHint, setShowNotesHint] = useState(true);
  
  const { 
    players, 
    notes, 
    watchlists,
    generateAllNotes,
    generateWatchlists 
  } = useAuctionStore();
  
  // Mostra modal import se non ci sono giocatori
  useEffect(() => {
    if (players.length === 0) {
      setShowImportModal(true);
    }
  }, [players.length]);
  
  // Mostra hint per le note se ci sono giocatori ma non note
  useEffect(() => {
    if (players.length > 0 && notes.length === 0 && showNotesHint) {
      const timer = setTimeout(() => {
        toast((t) => (
          <div>
            <p className="mb-2">
              <Lightbulb className="inline mr-1" size={16} />
              <strong>Nuovo!</strong> Posso generare note intelligenti per tutti i giocatori.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  generateAllNotes();
                  generateWatchlists();
                  toast.success('Note e watchlist generate!');
                  toast.dismiss(t.id);
                  setShowNotesHint(false);
                }}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                Genera Note
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  setShowNotesHint(false);
                }}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
              >
                Più tardi
              </button>
            </div>
          </div>
        ), {
          duration: 10000,
          position: 'bottom-center',
          style: {
            maxWidth: '400px'
          }
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [players.length, notes.length, showNotesHint, generateAllNotes, generateWatchlists]);
  
  // Attiva hotkeys
  useHotkeys();
  
  // Badge con numero di watchlist/note
  const watchlistCount = watchlists.length;
  const notesCount = notes.length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      
      {showImportModal && (
        <ImportModal onClose={() => setShowImportModal(false)} />
      )}
      
      <TopBar onImportClick={() => setShowImportModal(true)} />
      
      <div className="container mx-auto px-4 py-6">
        {/* Tab Navigation con badges */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveView('auction')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition",
              activeView === 'auction'
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            <BarChart size={18} />
            Asta Live
          </button>
          
          <button
            onClick={() => setActiveView('watchlist')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition relative",
              activeView === 'watchlist'
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            <Eye size={18} />
            Watchlist
            {watchlistCount > 0 && (
              <span className={clsx(
                "ml-1 px-2 py-0.5 text-xs rounded-full",
                activeView === 'watchlist'
                  ? "bg-purple-500 text-white"
                  : "bg-purple-100 text-purple-700"
              )}>
                {watchlistCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveView('teams')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition",
              activeView === 'teams'
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            <Users size={18} />
            Squadre
          </button>
          
          <button
            onClick={() => setActiveView('stats')}
            className={clsx(
              "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition",
              activeView === 'stats'
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            )}
          >
            <TrendingUp size={18} />
            Statistiche
          </button>
          
          {/* Indicatore Note */}
          {notesCount > 0 && (
            <div className="ml-auto flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg">
              <BookOpen size={16} className="text-amber-600" />
              <span className="text-sm text-amber-700">
                <strong>{notesCount}</strong> note generate
              </span>
            </div>
          )}
        </div>
        
        <SearchBar />
        
        <div className="grid grid-cols-12 gap-6 mt-6">
          {/* Vista Asta */}
          {activeView === 'auction' && (
            <>
              <div className="col-span-8">
                <MainPanel />
              </div>
              <div className="col-span-4 space-y-6">
                <SidePanel />
                <RoleFilter />
              </div>
            </>
          )}
          
          {/* Vista Watchlist */}
          {activeView === 'watchlist' && (
            <>
              <div className="col-span-4">
                <WatchlistPanel />
              </div>
              <div className="col-span-5">
                <MainPanel />
              </div>
              <div className="col-span-3 space-y-6">
                <RoleFilter />
                <div className="bg-white rounded-xl shadow-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <Lightbulb size={18} />
                    Tips Watchlist
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>💡 Le watchlist auto-generate si aggiornano quando importi nuovi dati</p>
                    <p>📌 Puoi creare watchlist personalizzate per le tue strategie</p>
                    <p>🎯 Clicca su un giocatore per vedere le sue note dettagliate</p>
                    <p>⭐ Le note ti aiutano a ricordare perché un giocatore è interessante</p>
                  </div>
                  
                  {watchlists.length === 0 && (
                    <button
                      onClick={() => {
                        generateWatchlists();
                        toast.success('Watchlist generate!');
                      }}
                      className="mt-3 w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                    >
                      Genera Watchlist Automatiche
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
          
          {/* Vista Squadre */}
          {activeView === 'teams' && (
            <>
              <div className="col-span-8">
                <OtherTeamsTracker />
              </div>
              <div className="col-span-4 space-y-6">
                <SidePanel />
                <AuctionStats />
              </div>
            </>
          )}
          
          {/* Vista Statistiche */}
          {activeView === 'stats' && (
            <>
              <div className="col-span-8">
                <AuctionStats />
                {watchlists.length > 0 && (
                  <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      📊 Riepilogo Watchlist
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {watchlists.slice(0, 6).map(watchlist => {
                        const players = useAuctionStore.getState().getWatchlistPlayers(watchlist.id);
                        const available = players.filter(p => p.status === 'available').length;
                        const taken = players.filter(p => p.status !== 'available').length;
                        
                        return (
                          <div 
                            key={watchlist.id}
                            className="p-4 bg-gray-50 rounded-lg border-l-4"
                            style={{ borderColor: watchlist.color }}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xl">{watchlist.icon}</span>
                              <h4 className="font-semibold">{watchlist.name}</h4>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Totale: {players.length}</span>
                              <div className="flex gap-3">
                                <span className="text-green-600">✓ {available}</span>
                                {taken > 0 && <span className="text-red-600">✗ {taken}</span>}
                              </div>
                            </div>
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                                  style={{ width: `${(available / players.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="col-span-4 space-y-6">
                <SidePanel />
                <RoleFilter />
              </div>
            </>
          )}
        </div>
        
        {/* Footer info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            💡 Suggerimento: Premi <kbd className="px-2 py-1 bg-gray-200 rounded">Spazio</kbd> per acquistare rapidamente il giocatore selezionato
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;